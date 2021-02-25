import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

//支付中心
import { PayCenterComponent } from '@app/admin/paycenter/pay-center/payCenter.component';
import { PayRecordComponent } from '@app/admin/paycenter/pay-center/payRecord.component';



@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    //支付中心
                    { path: 'payCenter', component: PayCenterComponent },
                    { path: 'payRecord', component: PayRecordComponent },
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class PayCenterRoutingModule { }
