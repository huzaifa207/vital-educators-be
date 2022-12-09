import { Controller, Post, RawBodyRequest, Req, Res } from '@nestjs/common';
import { PurchaseMethod, PurchaseStatus } from '@prisma/client';
import { Request, Response } from 'express';
import { AlertsService } from 'src/alerts/alerts.service';
import { PrismaService } from 'src/prisma-module/prisma.service';
import { StudentsService } from 'src/students/students.service';
import { TutorsService } from 'src/tutors/tutors.service';
import { UsersService } from 'src/users/users.service';
import Stripe from 'stripe';
import { StripeService } from './stripe.service';
import { ENV } from 'src/settings';
import { MailService } from 'src/mail-service/mail.service';
import { emailSubscriptionActivated } from 'src/mail-service/templates/email-subscription-activated';
import { emailFeePaid } from 'src/mail-service/templates/email-fee-paid';
import { emailPurchase } from 'src/mail-service/templates/email-purchase';
export const webhook_hosted_secret = 'whsec_APgLI5l355D9Po54pRW7CNG7vYUxJ0Cb';
export const webhook_local_secret =
  'whsec_374059379c53dcebd242e9963b4c1cd34a0b1e85bf655d936ff49e9252988b81';

export const webhook_secret = webhook_local_secret;

@Controller('payments')
export class StripeController {
  constructor(
    private alertsService: AlertsService,
    private prismaService: PrismaService,
    private stripeService: StripeService,
    private tutorService: TutorsService,
    private mailService: MailService,
  ) {}

  @Post('/webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res({ passthrough: false }) res: Response,
  ) {
    let event;

    try {
      event = this.stripeService
        .getStripe()
        .webhooks.constructEvent(
          req.rawBody,
          req.headers['stripe-signature'] as any,
          webhook_secret,
        );
    } catch (er) {
      console.warn(er);
      res.status(400).json({ oK: false });
      return;
    }

    const dataObject: any = event.data.object;
    const hookType = event.type;

    console.log('Hook Type:', hookType);

    switch (hookType) {
      case 'customer.subscription.created':
        try {
          const customerId = dataObject.customer;
          const tutor = await this.tutorService.getSubscriptionByCustomerId(customerId);
          const user = await this.prismaService.user.findFirst({ where: { id: tutor.userId } });
          this.alertsService.create({
            actionURL: `${ENV['FRONTEND_URL']}/admin/tutor-detail/` + tutor.userId,
            description: 'A Tutor has activated monthly subscription.',
          });

          this.mailService.sendMailSimple({
            email: user.email,
            emailContent: emailSubscriptionActivated(ENV.FRONTEND_URL + '/tutor/login'),
            subject: 'Subscription activated',
            text: 'Monthly subscription has been activated.',
          });
        } catch (er) {
          console.warn(er);
        }
      case 'customer.subscription.updated':
        try {
          console.log(dataObject);
          const subId = dataObject.id;
          const customerId = dataObject.customer;
          const pmId = dataObject.default_payment_method;
          const start = dataObject.current_period_start;
          const end = dataObject.current_period_end;
          // const planId = dataObject.plan.id;
          const price = dataObject.items.data[0].price;
          const subStatus: Stripe.Subscription['status'] = dataObject.status;
          const cancelled = dataObject.cancel_at_period_end;

          console.log(
            'SUB ID:' + subId,
            'customerId:' + customerId,
            'status: ' + subStatus,
            'cancel at end:',
            cancelled,
          );

          const sub = await this.tutorService.getSubscriptionByCustomerId(customerId);
          if (!sub) {
            console.warn('ignoring create sub – No sub record for customer id:', customerId);
            break;
          }

          await this.prismaService.subscription.update({
            where: { customerId: customerId },
            data: {
              started: start,
              end: end,
              plan: 'BASE',
              status: subStatus === 'active' ? 'ACTIVE' : 'INACTIVE',
              cancelled: cancelled,
              last_attempt_success: subStatus === 'active',
              subscriptionId: subId,
            },
          });

          if (pmId) {
            try {
              const pm = await this.stripeService.getStripe().paymentMethods.retrieve(pmId);
              const card = pm.card;
              if (card) {
                await this.prismaService.subscription.update({
                  where: { customerId: customerId },
                  data: {
                    paymentMethodId: pm.id,
                    brand: card.brand,
                    last4: card.last4,
                    exp_month: card.exp_month,
                    exp_year: card.exp_year,
                  },
                });
                console.log('Updated pmId:', pm.id);
              }
            } catch (er) {
              console.warn(er);
            }
          }
        } catch (er) {
          console.warn('Failed to update subscription record');
          console.warn(er);
        }

        break;

      case 'customer.subscription.deleted':
        const subId = dataObject.id;
        const productId = dataObject.items.data[0].price.product;
        const customerId = dataObject.customer;

        try {
          const tutor = await this.tutorService.getSubscriptionByCustomerId(customerId);

          this.alertsService.create({
            actionURL: `${ENV['FRONTEND_URL']}/admin/tutor-detail/` + tutor.userId,
            description: 'A Tutor subscription has been cancelled.',
          });
        } catch (er) {
          console.warn(er);
        }

        await this.prismaService.subscription.update({
          where: { customerId: customerId },
          data: {
            subscriptionId: '',
            status: 'INACTIVE',
            plan: 'NONE',
          },
        });
        break;
      case 'customer.updated':
        try {
          console.log(dataObject);

          const customerId = dataObject.id;
          const paymentMethodId = dataObject.invoice_settings.default_payment_method;

          if (paymentMethodId) {
            try {
              const pm = await this.stripeService
                .getStripe()
                .paymentMethods.retrieve(paymentMethodId);
              const card = pm.card;
              if (card) {
                this.prismaService.subscription.update({
                  where: { customerId: customerId },
                  data: {
                    paymentMethodId: pm.id,
                    brand: card.brand,
                    last4: card.last4,
                    exp_month: card.exp_month,
                    exp_year: card.exp_year,
                  },
                });
              }
            } catch (er) {
              console.warn(er);
            }
          }
        } catch (er) {
          console.warn(er);
        }
        break;
      case 'payment_intent.succeeded':
        try {
          const intent = dataObject as Stripe.PaymentIntent;

          const metadata = intent.metadata as unknown as {
            tutorId: string;
            studentId: string;
            productId: string;
            priceId: string;
          };
          if (typeof intent.customer != 'string') throw new Error('customer is invalid');

          const record = await this.prismaService.studentPayment.findFirst({
            where: { customerId: intent.customer },
          });

          await this.prismaService.studentPurchase.create({
            data: {
              user: { connect: { userId: Number(record.userId) } },
              method: PurchaseMethod.Stripe,
              status: PurchaseStatus.Active,
              tutor: { connect: { id: Number(metadata.tutorId) } },
            },
          });

          try {
            const student = await this.prismaService.user.findFirst({
              where: { id: Number(metadata.studentId) },
            });
            const tutor = await this.prismaService.user.findFirst({
              where: { id: Number(metadata.tutorId) },
            });
            if (!student || !tutor) throw new Error('invalid ids');
            this.mailService.sendMailSimple({
              email: student.email,
              emailContent: emailPurchase(
                tutor.first_name + ' ' + tutor.last_name,
                ENV['FRONTEND_URL'] + '/student/login',
              ),
              subject: 'Tutor Fee Paid',
              text: 'Tutor fee has been paid.',
            });
            this.mailService.sendMailSimple({
              email: tutor.email,
              emailContent: emailFeePaid(
                student.first_name + ' ' + student.last_name,
                ENV['FRONTEND_URL'] + '/tutor/login',
              ),
              subject: 'Student paid tutor fee',
              text: 'A student has paid tutor fee.',
            });
          } catch (er) {
            console.warn(er);
          }

          try {
            this.alertsService.create({
              actionURL: `${ENV['FRONTEND_URL']}/admin/student-detail/` + metadata.studentId,
              description: 'A student has paid fee for the tutor through stripe.',
            });
          } catch (er) {
            console.warn(er);
          }

          console.log('Purchase ' + metadata.studentId + ' -> ' + metadata.tutorId);
        } catch (er) {
          console.warn(er);
        }
    }

    res.status(200).json({ ok: true });
  }
}
