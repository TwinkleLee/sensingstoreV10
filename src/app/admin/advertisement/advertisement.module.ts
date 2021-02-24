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
import { AdvertisementRoutingModule } from './advertisement-routing.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { BsDatepickerModule, BsDatepickerConfig, BsDaterangepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { NgxBootstrapDatePickerConfigService } from 'assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service';

NgxBootstrapDatePickerConfigService.registerNgxBootstrapDatePickerLocales();

import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TreeModule } from 'primeng/tree';

import { AutoCompleteModule } from 'primeng/autocomplete';

// 广告
import { AdvertisementComponent } from '@app/admin/advertisement/advertisement/advertisement.component';
import { CreateOrEditAdModalComponent } from '@app/admin/advertisement/advertisement/create-or-edit-ad-modal.component'
// //ads-package
import { AdsPackageComponent } from '@app/admin/advertisement/ads-package/ads-package.component';
import { CreateOrEditAdsPackageModalComponent } from '@app/admin/advertisement/ads-package/create-or-edit-ads-package-modal.component'
import { AdsReviewComponent } from '@app/admin/advertisement/ads-review/ads-review.component';
import { AdsDetailModalComponent } from '@app/admin/advertisement/ads-review/detail/ads-detail-modal.component';
import { CreateOrEditAdResourceModalComponent } from '@app/admin/advertisement/advertisement/create-or-edit-ad-resource-modal.component';
// import { Schedule } from '@app/advertisement/schedule/schedule.component';
// import { ScheduleModalComponent } from '@app/advertisement/schedule/operation/create-or-edit-schedule-modal.component';
// import { ScheduleProgram } from '@app/advertisement/schedule/schedule-program.component';
// import { ProgramModalComponent } from '@app/advertisement/schedule/operation/program-modal.component';
// import { CalendarModalComponent } from '@app/advertisement/schedule/operation/calendar-modal.component';

// import { ProductAlertModalComponent } from '@app/device/device-list/tabAlert/product-selection-modal.component';


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
        AdvertisementRoutingModule,
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
        AdvertisementComponent,
        CreateOrEditAdModalComponent,
        AdsPackageComponent,
        CreateOrEditAdsPackageModalComponent,
        AdsReviewComponent,
        AdsDetailModalComponent,
        CreateOrEditAdResourceModalComponent,
        // Schedule,
        // ScheduleModalComponent,
        // ScheduleProgram,
        // ProgramModalComponent,
        // CalendarModalComponent,



        // ProductAlertModalComponent,

    ],
    exports:[
        // CalendarModalComponent,
        // ProductAlertModalComponent,

    ],
    providers: [
        { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
        { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
        { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale }
    ]
})
export class AdvertisementModule { }
