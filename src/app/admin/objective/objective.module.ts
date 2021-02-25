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
import { ObjectiveRoutingModule } from './objective-routing.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AutoCompleteModule } from 'primeng/autocomplete';

import { BsDatepickerModule, BsDatepickerConfig, BsDaterangepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { NgxBootstrapDatePickerConfigService } from 'assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service';

NgxBootstrapDatePickerConfigService.registerNgxBootstrapDatePickerLocales();

import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TreeModule } from 'primeng/tree';

import { ObjectiveComponent } from './objective/objective-list.component'
import { KeyResultComponent } from './keyresult/key-result.component'
import { CreateOrEditObjectiveModalComponent } from './objective/objective-modal.component'
import { CreateOrEditKeyResultModalComponent } from './keyresult/keyresult-modal.component'
import { ExecuteComponent } from './execute/execute.component'
import { CreateOrEditExecuteModalComponent } from './execute/execute-modal.component'

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
        ObjectiveRoutingModule,
        CountoModule,
        NgxChartsModule,
        BsDatepickerModule.forRoot(),
        BsDropdownModule.forRoot(),
        PopoverModule.forRoot(),
        PaginatorModule,
        TableModule,
        TreeModule,
        AutoCompleteModule
    ],
    declarations: [
        ObjectiveComponent,
        CreateOrEditObjectiveModalComponent,
        KeyResultComponent,
        CreateOrEditKeyResultModalComponent,
        ExecuteComponent,
        CreateOrEditExecuteModalComponent
    ],
    providers: [
        { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
        { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
        { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale }
    ]
})
export class ObjectiveModule { }
