import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ResourceManagementComponent } from '@app/admin/resource/resource/resource.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: 'resource', component: ResourceManagementComponent, data: { permission: 'Pages.Tenant.Resources' } },
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class ResourceRoutingModule { }
