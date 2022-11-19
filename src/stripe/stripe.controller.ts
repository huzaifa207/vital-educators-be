import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from 'src/prisma-module/prisma.service';
import { TutorsService } from 'src/tutors/tutors.service';
import { UsersService } from 'src/users/users.service';
import Stripe from 'stripe';
import { StripeService } from './stripe.service';

// export const webhook_hosted_secret = '';
export const webhook_local_secret =
  'whsec_374059379c53dcebd242e9963b4c1cd34a0b1e85bf655d936ff49e9252988b81';

export const webhook_secret = webhook_local_secret;

@Controller('payments')
export class StripeController {
  constructor(
    private prismaService: PrismaService,
    private stripeService: StripeService,
    private tutorService: TutorsService,
  ) {}

  @Post('/webhook')
  async handleWebhook(@Req() req: Request, @Res({ passthrough: false }) res: Response) {
    let event;

    try {
      event = this.stripeService
        .getStripe()
        .webhooks.constructEvent(req.body, req.headers['stripe-signature'] as any, webhook_secret);
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
      case 'customer.subscription.updated':
        try {
          const subId = dataObject.id;
          const customerId = dataObject.customer;
          const start = dataObject.current_period_start;
          const end = dataObject.current_period_end;
          // const planId = dataObject.plan.id;
          const price = dataObject.items.data[0].price;
          const subStatus: Stripe.Subscription['status'] = dataObject.status;
          const cancelled = dataObject.cancel_at_period_end;

          console.log('SUB ID:' + subId, 'customerId:' + customerId);

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
        } catch (er) {
          console.warn('Failed to update subscription record');
          console.warn(er);
        }

        break;

      case 'customer.subscription.deleted':
        const subId = dataObject.id;
        const productId = dataObject.items.data[0].price.product;
        const customerId = dataObject.customer;

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
    }

    res.status(200).json({ ok: true });
  }
}
