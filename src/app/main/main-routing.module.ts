import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardComponent2 } from './dashboard/dashboard2.component';

//报表
import { MyDashboardComponent } from './my-dashboard/my-dashboard.component';
import { DashboardTemplateComponent } from './dashboard-template/dashboard-template.component'
import { DashboardManageComponent } from './dashboard-manage/dashboard-manage.component'
import { StoreInfoComponent } from './dashboard/store-info.component'
import { SalesInfoComponent } from './sales-info/salesInfo.component';
import { MemberInfoComponent } from './sales-info/memberInfo.component';
import { SalesChartComponent } from './sales-chart/saleschart.component';
import { ProductRankComponent } from './dashboard/product-rank.component'
import { HaierDashboardComponent } from './haier-dashboard/haier-dashboard.component'
import { ItemSaleDashboardComponent } from './itemSale-dashboard/itemSale-dashboard.component'


@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: 'dashboard', component: DashboardComponent, data: { permission: 'Pages.Tenant.Dashboard' } },
                    { path: 'dashboard2', component: DashboardComponent2, data: { permission: 'Pages.Tenant.Dashboard' } },
                    { path: 'myDashboard', component: MyDashboardComponent, data: { permission: 'Pages.Tenant.Dashboard' } },
                    { path: 'dashboardManage/dashboardTemplate', component: DashboardTemplateComponent },
                    { path: 'dashboardManage', component: DashboardManageComponent },
                    { path: 'salesinfo', component: SalesInfoComponent, data: { permission: 'Pages.Tenant.Dashboard' } },
                    { path: 'saleschart', component: SalesChartComponent, data: { permission: 'Pages.Tenant.Dashboard' } },
                    { path: 'salesinfo/member', component: MemberInfoComponent, data: { permission: 'Pages.Tenant.Dashboard' } },
                    { path: 'storeinfo', component: StoreInfoComponent, data: { permission: 'Pages.Tenant.Dashboard' } },
                    { path: 'product-rank', component: ProductRankComponent },
                    { path: 'haierDashboard', component: HaierDashboardComponent },
                    { path: 'itemSaleDashboard', component: ItemSaleDashboardComponent },
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class MainRoutingModule { }
