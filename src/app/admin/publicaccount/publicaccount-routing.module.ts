import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';


//公众号管理
import { PublicAccountComponent } from '@app/admin/publicaccount/public-account/public-account.component'
import { PublicAccountManageComponent } from '@app/admin/publicaccount/public-account/operation/public-account-manage.component'
@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: 'publicaccount', component: PublicAccountComponent },
                    { path: 'publicaccount/manage', component: PublicAccountManageComponent },
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class PublicaccountRoutingModule { }
