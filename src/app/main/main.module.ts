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
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardComponent2 } from './dashboard/dashboard2.component';
import { MainRoutingModule } from './main-routing.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { BsDatepickerModule, BsDatepickerConfig, BsDaterangepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { NgxBootstrapDatePickerConfigService } from 'assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service';

NgxBootstrapDatePickerConfigService.registerNgxBootstrapDatePickerLocales();

import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TreeModule } from 'primeng/tree';



import { StoreInfoComponent } from './dashboard/store-info.component'
import { SalesInfoComponent } from './sales-info/salesInfo.component';
import { MemberInfoComponent } from './sales-info/memberInfo.component';
import { SalesInfoModalComponent } from './sales-info/salesInfo-modal.component';
import { MemberInfoModalComponent } from './sales-info/memberInfo-modal.component';
import { SalesChartComponent } from './sales-chart/saleschart.component';

import { OrderInfoModalComponent } from './dashboard/order-information-modal.component';
import { ProductRankComponent } from './dashboard/product-rank.component'
import { HaierDashboardComponent } from './haier-dashboard/haier-dashboard.component'
import { ItemSaleDashboardComponent } from './itemSale-dashboard/itemSale-dashboard.component'

import { MyDashboardComponent } from './my-dashboard/my-dashboard.component'
import { DashboardTemplateComponent } from './dashboard-template/dashboard-template.component'
import { CreateOrEditDashboardTemplateModalComponent } from './dashboard-template/create-or-edit-dashboard-template-modal.component'

import { DashboardManageComponent } from './dashboard-manage/dashboard-manage.component'
import { CreateOrEditDashboardManageModalComponent } from './dashboard-manage/create-or-edit-dashboard-manage-modal.component'



@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ModalModule,
        TabsModule,
        TooltipModule,
        AppCommonModule,
        UtilsModule,
        MainRoutingModule,
        CountoModule,
        NgxChartsModule,
        BsDatepickerModule.forRoot(),
        BsDropdownModule.forRoot(),
        PopoverModule.forRoot(),
        PaginatorModule,
        TableModule,
        TreeModule,
    ],
    declarations: [
        DashboardComponent,
        DashboardComponent2,

        //报表
        MyDashboardComponent,
        StoreInfoComponent,
        SalesInfoComponent,
        MemberInfoComponent,
        SalesInfoModalComponent,
        MemberInfoModalComponent,
        SalesChartComponent,
        OrderInfoModalComponent,
        ProductRankComponent,
        DashboardTemplateComponent,
        CreateOrEditDashboardTemplateModalComponent,
        DashboardManageComponent,
        CreateOrEditDashboardManageModalComponent,
        HaierDashboardComponent,
        ItemSaleDashboardComponent,
    ],
    providers: [
        { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
        { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
        { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale }
    ]
})
export class MainModule { }
