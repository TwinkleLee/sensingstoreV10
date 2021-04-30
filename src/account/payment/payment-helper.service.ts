import { Injectable } from '@angular/core';
import {
    EditionPaymentType,
    SubscriptionPaymentGatewayType,
    EditionSelectDto,
    PaymentPeriodType
} from '@shared/service-proxies/service-proxies';

@Injectable()
export class PaymentHelperService {
    // enum ???
    getPaymentGatewayType(gatewayType) {
        if (gatewayType == SubscriptionPaymentGatewayType.Paypal) {
            return 'Paypal';
        }

        return 'Stripe';
    }

    getEditionPaymentType(editionPaymentType) {
        if (editionPaymentType == EditionPaymentType.BuyNow) {
            return 'BuyNow';
        } else if (editionPaymentType == EditionPaymentType.Extend) {
            return 'Extend';
        } else if (editionPaymentType == EditionPaymentType.NewRegistration) {
            return 'NewRegistration';
        }

        return 'Upgrade';
    }

    getInitialSelectedPaymentPeriodType(edition: EditionSelectDto) {
        if (edition.dailyPrice > 0) {
            return PaymentPeriodType.Daily;
        } else if (edition.weeklyPrice > 0) {
            return PaymentPeriodType.Weekly;
        } else if (edition.monthlyPrice > 0) {
            return PaymentPeriodType.Monthly;
        } else if (edition.annualPrice > 0) {
            return PaymentPeriodType.Annual;
        }

        return void 0;
    }
}
