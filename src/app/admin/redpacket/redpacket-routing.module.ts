import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { RedPacketComponent } from '@app/admin/redpacket/red-packet/red-packet.component';
import { CouponReviewComponent } from '@app/admin/redpacket/coupon-review/coupon-review.component'

//优惠券
import { TicketComponent } from '@app/admin/redpacket/ticket/ticket.component';
import { TicketMemberComponent } from '@app/admin/redpacket/ticket/member/ticket-member.component';


@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: 'coupon', component: RedPacketComponent, data: { permission: 'Pages.Tenant.Coupons' } },
                    { path: 'reviewCoupon', component: CouponReviewComponent, data: { permission: 'Pages.Tenant.Coupons.Audit' } },
                    //优惠券
                    { path: 'ticket', component: TicketComponent },
                    { path: 'ticketMember', component: TicketMemberComponent },
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class RedpacketRoutingModule { }
