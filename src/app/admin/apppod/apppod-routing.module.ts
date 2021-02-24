import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// 软件
import { AppPodComponent } from '@app/admin/apppod/apppod/apppod.component';



@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: 'apppod', component: AppPodComponent, data: { permission: 'Pages.Administration.Host.AppPod' } },
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class ApppodRoutingModule { }
