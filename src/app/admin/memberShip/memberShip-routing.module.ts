import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MemberShipComponent } from '@app/admin/memberShip/member-ship/member-ship.component';


@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: 'memberShip', component: MemberShipComponent, data: { permission: 'Pages.Tenant.Member' } },//host线上店
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class MemberShipRoutingModule { }
