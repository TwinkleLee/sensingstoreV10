import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
//订单
import { OrderComponent } from '@app/admin/order/order/order.component';


@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: 'order', component: OrderComponent, data: { permission: 'Pages.Tenant.Order' } },
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class OrderRoutingModule { }
