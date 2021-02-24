import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ImportComponent } from '@app/admin/import/import/import.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: 'import/:action', component: ImportComponent },
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class ImportRoutingModule { }
