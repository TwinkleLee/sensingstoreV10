import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';


//设备
import { DeviceTypeComponent } from '@app/admin/device/device-type/device-type.component';
import { DeviceListComponent } from '@app/admin/device/device-list/device-list.component';
import { DeviceGameComponent } from '@app/admin/device/device-list/game.component'
import { DeviceEditComponent } from '@app/admin/device/device-list/operation/device-edit.component';
import { DeviceReviewComponent } from '@app/admin/device/device-review/device-review.component';
import { DeviceProductSkuComponent } from '@app/admin/device/device-list/operation/device-product-skus.component';
import { PeripheralComponent } from '@app/admin/device/peripheral/peripheral.component';



@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    //设备
                    { path: 'deviceType', component: DeviceTypeComponent },
                    { path: 'deviceReview', component: DeviceReviewComponent, data: { permission: 'Pages.Tenant.Devices.Audit' } },
                    { path: 'peripheral', component: PeripheralComponent },
                    { path: 'deviceList', component: DeviceListComponent, data: { permission: 'Pages.Tenant.Devices' } },
                    { path: 'deviceList/operation/:id', component: DeviceEditComponent, data: { permission: 'Pages.Tenant.Devices.Edit' } },
                    { path: 'deviceList/operation/:id/product/:proId', component: DeviceProductSkuComponent, data: { permission: 'Pages.Tenant.Products.Publish' } },
                    { path: 'deviceList/game', component: DeviceGameComponent, data: { permission: 'Pages.Tenant.Activities' } },


                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class DeviceRoutingModule { }
