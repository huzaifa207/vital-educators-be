import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma-module/prisma.service';
import { Alert, Prisma } from '@prisma/client';
import { MailService } from 'src/mail-service/mail.service';
import { emailAlert } from 'src/mail-service/templates/email-alert';
import { ENV } from 'src/settings';
import Stripe from 'stripe';
interface PaginationOptions {
  offset: number;
  limit: number;
}

@Injectable()
export class StripeService {
  private stripe: Stripe;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
  ) {
    this.stripe = new Stripe(
      'sk_test_51M3JuAFR1WytI4FHjIfG8EhajgbqOvzqbozELZPybHpFWsPeMW7FrJs2WMvfkA7mTMsG37F0UzX2HP03bd7HdpmT006SRpz9YT',
      {
        apiVersion: '2022-08-01',
      },
    );
  }
  getStripe() {
    return this.stripe;
  }
  async createSubscription(customerId: string) {
    // const customerId = 'cus_MnmJ5PEdMfapAz';
    const priceId = 'price_1M4AZAFR1WytI4FHLmDFOwCz';

    const sub = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: priceId,
        },
      ],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    return {
      id: sub.id,
      secret: ((sub.latest_invoice as Stripe.Invoice).payment_intent as Stripe.PaymentIntent)
        .client_secret,
    };
  }
  async createTutorPurchaseToken(customerId: string, studentId: number, tutorId: number) {
    // const customerId = 'cus_MnmJ5PEdMfapAz';
    const productId = 'prod_MsHv5euaangn7o';

    const product = (await this.stripe.products.retrieve(productId, {
      expand: ['default_price'],
    })) as Stripe.Product & { default_price: Stripe.Price };

    const price = product.default_price;

    if (!price?.id) throw new Error('default price not set');

    const intent = await this.stripe.paymentIntents.create({
      amount: price.unit_amount,
      currency: price.currency,
      automatic_payment_methods: { enabled: true },
      customer: customerId,
      metadata: { tutorId, productId, studentId, priceId: price.id },
    });

    return intent;
  }
}
