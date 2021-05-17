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

import { SoftwareRoutingModule } from './software-routing.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { BsDatepickerModule, BsDatepickerConfig, BsDaterangepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { NgxBootstrapDatePickerConfigService } from 'assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service';

NgxBootstrapDatePickerConfigService.registerNgxBootstrapDatePickerLocales();

import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TreeModule } from 'primeng/tree';

import { AutoCompleteModule } from 'primeng/autocomplete';

import { from } from 'rxjs';
// 软件
import { CreateAppModalComponent } from '@app/admin/software/software/create-app-modal.component';
import { SoftwareComponent } from '@app/admin/software/software/software.component';
import { SoftwareEditComponent } from '@app/admin/software/software/operation/software-edit.component';
import { SoftwareSettingModalComponent } from '@app/admin/software/software/operation/software-setting-modal.component';
import { SoftwareAuthComponent } from '@app/admin/software/software/auth/software-auth.component';

import { ConnectorService } from '@app/shared/services/connector.service';

import {AdminSharedModule} from '@app/admin/shared/admin-shared.module';
import {AppSharedModule} from '@app/shared/app-shared.module';

import { SoftwareListComponent } from '@app/admin/software/software/list/softwarelist.component'


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
        SoftwareRoutingModule,
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
        SoftwareComponent,
        CreateAppModalComponent,
        
        SoftwareEditComponent,
        SoftwareSettingModalComponent,
        SoftwareAuthComponent,
        SoftwareListComponent
    ],
    providers: [
        { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
        { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
        { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale },
        ConnectorService
    ]
})
export class SoftwareModule { }
