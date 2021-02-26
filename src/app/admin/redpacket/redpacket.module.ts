import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { CountoModule } from 'angular2-counto';
import { ModalModule } from '@node_modules/ngx-bootstrap/modal';
import { TabsModule } from '@node_modules/ngx-bootstrap/tabs';
import { TooltipModule } from '@node_modules/ngx-bootstrap/tooltip';
import { BsDropdownModule } from '@node_modules/ngx-bootstrap/dropdown';
import { PopoverModule } from '@node_modules/ngx-bootstrap/popover';
import { RedpacketRoutingModule } from './redpacket-routing.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { BsDatepickerModule, BsDatepickerConfig, BsDaterangepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { NgxBootstrapDatePickerConfigService } from 'assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service';

NgxBootstrapDatePickerConfigService.registerNgxBootstrapDatePickerLocales();

import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TreeModule } from 'primeng/tree';

import { AutoCompleteModule } from 'primeng/autocomplete';
import { from } from 'rxjs';
import { CreateOrEditCouponModalComponent } from '@app/admin/redpacket/red-packet/create-or-edit-coupon-modal.component';
import { RedPacketComponent } from '@app/admin/redpacket/red-packet/red-packet.component';
import { CouponDetailModalComponent } from '@app/admin/redpacket/coupon-review/detail/coupon-detail-modal.component'
import { CouponReviewComponent } from '@app/admin/redpacket/coupon-review/coupon-review.component'

//优惠券
import { TicketComponent } from '@app/admin/redpacket/ticket/ticket.component';
import { CreateOrEditTicketModalComponent } from '@app/admin/redpacket/ticket/create-or-edit-ticket-modal.component';
import { PublishTicketModalComponent } from '@app/admin/redpacket/ticket/publish-ticket-modal.component'
import { TicketMemberComponent } from '@app/admin/redpacket/ticket/member/ticket-member.component';


import {AdminSharedModule} from '@app/admin/shared/admin-shared.module';
import {AppSharedModule} from '@app/shared/app-shared.module';


@NgModule({
    imports: [
        AdminSharedModule,
        AppSharedModule,


        CommonModule,
        FormsModule,
        ModalModule,
        TabsModule,
        TooltipModule,
        AppCommonModule,
        UtilsModule,
        RedpacketRoutingModule,
        CountoModule,
        NgxChartsModule,
        BsDatepickerModule.forRoot(),
        BsDropdownModule.forRoot(),
        PopoverModule.forRoot(),
        PaginatorModule,
        TableModule,
        TreeModule,
        AutoCompleteModule,
    ],
    declarations: [
        CreateOrEditCouponModalComponent,
        RedPacketComponent,
        CouponDetailModalComponent,
        CouponReviewComponent,
        //优惠券
        TicketComponent,
        CreateOrEditTicketModalComponent,
        PublishTicketModalComponent,
        TicketMemberComponent,
    ],
    providers: [
        { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
        { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
        { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale }
    ]
})
export class RedpacketModule { }
