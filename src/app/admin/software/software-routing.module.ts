import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// import { TagsComponent } from '@app/tags/tags/tags.component';

import { SoftwareComponent } from '@app/admin/software/software/software.component';
// import { SoftwareEditComponent } from '@app/admin/software/software/operation/software-edit.component';
// import { SoftwareAuthComponent } from '@app/admin/software/software/auth/software-auth.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: 'software', component: SoftwareComponent, data: { permission: 'Pages.Softwares' } },
                    // { path: 'software/operation/:id', component: SoftwareEditComponent, data: { permission: 'Pages.Softwares.Edit' } },
                    // { path: 'software/auth', component: SoftwareAuthComponent, data: { permission: 'Pages.Softwares.Publish' } },
                    // { path: 'software/auth/:id', component: SoftwareAuthComponent, data: { permission: 'Pages.Softwares.Publish' } },
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class SoftwareRoutingModule { }
