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
import { WeshopRoutingModule } from './weshop-routing.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { BsDatepickerModule, BsDatepickerConfig, BsDaterangepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { NgxBootstrapDatePickerConfigService } from 'assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service';

NgxBootstrapDatePickerConfigService.registerNgxBootstrapDatePickerLocales();

import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TreeModule } from 'primeng/tree';

import { AutoCompleteModule } from 'primeng/autocomplete';

import { from } from 'rxjs';
import { WeShopComponent } from '@app/admin/weshop/we-shop/we-shop.component';
import { SwiperModalComponent } from '@app/admin/weshop/we-shop/operation/set-swiper-modal.component';
import { SetTagModalComponent } from '@app/admin/weshop/we-shop/operation/set-tags-modal.component';
import { SetCategoryModalComponent } from '@app/admin/weshop/we-shop/operation/set-category-modal.component';
import { SetFreightModalComponent } from '@app/admin/weshop/we-shop/operation/set-freight-modal.component';


//host线上店
import { HostOnlineStoreComponent } from '@app/admin/weshop/host-online-store/online-store.component';
import { HostOnlineStoreModalComponent } from '@app/admin/weshop/host-online-store/create-or-edit-onlineStore-modal.component';

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
        WeshopRoutingModule,
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
        WeShopComponent,
        SwiperModalComponent,
        SetTagModalComponent,
        SetCategoryModalComponent,
        SetFreightModalComponent,
        HostOnlineStoreComponent,
        HostOnlineStoreModalComponent,
    ],
    providers: [
        { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
        { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
        { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale },
    ]
})
export class WeshopModule { }
