import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { PlatformManageComponent } from '@app/admin/platformManage/platformManage/platform-manage.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    //平台管理
                    { path: 'platformManage', component: PlatformManageComponent },
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class PlatformManageRoutingModule { }
