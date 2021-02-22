import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { CountoModule } from 'angular2-counto';
// import { ModalModule, TabsModule, TooltipModule, BsDropdownModule, PopoverModule } from 'ngx-bootstrap';
import {ModalModule} from '@node_modules/ngx-bootstrap/modal';
import {TabsModule} from '@node_modules/ngx-bootstrap/tabs';
import {TooltipModule} from '@node_modules/ngx-bootstrap/tooltip';
import {PopoverModule} from '@node_modules/ngx-bootstrap/popover';
import {BsDropdownModule} from '@node_modules/ngx-bootstrap/dropdown';

import { BrandcenterRoutingModule } from './brandcenter-routing.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { BsDatepickerModule, BsDatepickerConfig, BsDaterangepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { NgxBootstrapDatePickerConfigService } from 'assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service';

NgxBootstrapDatePickerConfigService.registerNgxBootstrapDatePickerLocales();

import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TreeModule } from 'primeng/tree';

import { AutoCompleteModule } from 'primeng/autocomplete';
import { from } from 'rxjs';


//推荐
import { BrandCenterComponent } from './brand-center/brand-center.component';
import { BrandOperationComponent } from './brand-center/operation/brand-center-operation.component';
import { BrandResourceModalComponent } from './brand-center/operation/brand-res-modal.component';

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
        BrandcenterRoutingModule,
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
        BrandCenterComponent,
        BrandOperationComponent,
        BrandResourceModalComponent,
    ],
    providers: [
        { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
        { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
        { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale }
    ]
})
export class BrandcenterModule { }
