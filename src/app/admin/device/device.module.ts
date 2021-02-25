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
import { DeviceRoutingModule } from './device-routing.module'
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { BsDatepickerModule, BsDatepickerConfig, BsDaterangepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { NgxBootstrapDatePickerConfigService } from 'assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service';

NgxBootstrapDatePickerConfigService.registerNgxBootstrapDatePickerLocales();

import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TreeModule } from 'primeng/tree';

import { AutoCompleteModule } from 'primeng/autocomplete';

//设备
// import { DeviceTypeComponent } from '@app/device/device-type/device-type.component';
// import { CreateOrEditDevModalComponent } from '@app/device/device-type/create-or-edit-deviceType-modal.component';
import { DeviceListComponent } from '@app/admin/device/device-list/device-list.component';
import { CreateOrEditDeviceModalComponent } from '@app/admin/device/device-list/create-or-edit-device-modal.component';
// import { DeviceEditComponent } from '@app/admin/device/device-list/operation/device-edit.component';
import { CreateOrEditDeviceRecordComponent } from '@app/admin/device/device-list/operation/create-or-edit-deviceRecord-modal.component';
import { DeviceReviewComponent } from '@app/admin/device/device-review/device-review.component';
// import { AdsAlertModalComponent } from '@app/device/device-list/tabAlert/ads-selection-modal.component';
// import { CouponAlertModalComponent } from '@app/device/device-list/tabAlert/coupon-selection-modal.component';
// import { AppAlertModalComponent } from '@app/device/device-list/tabAlert/app-selection-modal.component';
// import { AppSettingModalComponent } from '@app/device/device-list/tabAlert/app-setting-modal.component';
import { DeviceDetailModalComponent } from '@app/admin/device/device-review/detail/device-detail-modal.component';
// import { SkusSelectionModalComponent } from '@app/device/device-list/tabAlert/skus-selection-modal.component';
// import { DeviceProductSkuComponent } from '@app/device/device-list/operation/device-product-skus.component';
// import { DeviceGameComponent } from '@app/device/device-list/game.component'
// import { PeripheralComponent } from '@app/device/peripheral/peripheral.component';
// import { CreateOrEditPerModalComponent } from '@app/device/peripheral/create-or-edit-peri-modal.component'
// import { CargoModalComponent } from '@app/device/cargo-lane/cargo-modal.component';

// import {AdvertisementModule} from '@app/advertisement/advertisement.module'
// import {ActivityModule} from '@app/activity/activity.module'



import { ConnectorService } from '@app/shared/services/connector.service';

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
        DeviceRoutingModule,
        CountoModule,
        NgxChartsModule,
        BsDatepickerModule.forRoot(),
        BsDropdownModule.forRoot(),
        PopoverModule.forRoot(),
        PaginatorModule,
        TableModule,
        TreeModule,
        AutoCompleteModule,

        // AdvertisementModule,
        // ActivityModule
    ],
    declarations: [
        //设备
        // DeviceTypeComponent,
        // CreateOrEditDevModalComponent,
        DeviceListComponent,
        CreateOrEditDeviceModalComponent,
        // DeviceEditComponent,
        CreateOrEditDeviceRecordComponent,
        DeviceReviewComponent,
        // AdsAlertModalComponent,
        // CouponAlertModalComponent,
        // AppAlertModalComponent,
        // AppSettingModalComponent,
        DeviceDetailModalComponent,
        // SkusSelectionModalComponent,
        // DeviceProductSkuComponent,
        // DeviceGameComponent,
        // PeripheralComponent,
        // CreateOrEditPerModalComponent,
        // CargoModalComponent,
    ],
    exports: [
        CreateOrEditDeviceRecordComponent,
    ],
    providers: [
        { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
        { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
        { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale },
        ConnectorService
    ]
})
export class DeviceModule { }
