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
import { OnlineStoreRoutingModule } from './onlineStore-routing.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { BsDatepickerModule, BsDatepickerConfig, BsDaterangepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { NgxBootstrapDatePickerConfigService } from 'assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service';

NgxBootstrapDatePickerConfigService.registerNgxBootstrapDatePickerLocales();

import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TreeModule } from 'primeng/tree';

import { AutoCompleteModule } from 'primeng/autocomplete';
import { from } from 'rxjs';

import { OnlineStoreComponent } from '@app/admin/onlineStore/online-store/online-store.component';
import { OnlineStoreHistoryComponent } from '@app/admin/onlineStore/online-store/online-store-history.component';
import { PlanHistoryModalComponent } from '@app/admin/onlineStore/online-store/operation/plan-history-modal.component';
import { ChooseTaobaoModalComponent } from '@app/admin/onlineStore/online-store/choose-taobao-modal.component';
import { CreateOrEditExternalAccessModalComponent } from '@app/admin/onlineStore/online-store/create-or-edit-online-modal.component';
import { CreateOrEditPlanModalComponent } from '@app/admin/onlineStore/online-store/create-or-edit-plan-modal';


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
        OnlineStoreRoutingModule,
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
        OnlineStoreComponent,
        OnlineStoreHistoryComponent,
        PlanHistoryModalComponent,
        ChooseTaobaoModalComponent,
        CreateOrEditExternalAccessModalComponent,
        CreateOrEditPlanModalComponent,
    ],
    providers: [
        { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
        { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
        { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale }
    ]
})
export class OnlineStoreModule { }
