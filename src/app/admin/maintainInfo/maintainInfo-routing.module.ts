import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaintainInfoComponent } from '@app/admin/maintainInfo/maintainInfo/maintainInfo.component'


@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: 'maintainInfo', component: MaintainInfoComponent },
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class MaintainInfoRoutingModule { }
