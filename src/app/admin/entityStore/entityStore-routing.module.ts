import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { EntityStoreComponent } from '@app/admin/entityStore/entity-store/entity-store.component';


@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: 'entityStore', component: EntityStoreComponent },

                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class EntityStoreRoutingModule { }
