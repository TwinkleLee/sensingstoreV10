import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TagsComponent } from '@app/admin/tags/tags/tags.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: 'tags', component: TagsComponent, data: { permission: 'Pages.Tenant.Tags' } },
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class TagsRoutingModule { }
