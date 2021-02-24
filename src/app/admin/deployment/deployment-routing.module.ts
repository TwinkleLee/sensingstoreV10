import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DeploymentComponent } from './deployment/deployment.component'
import { SiteComponent } from './site/site.component'
import { TenancyComponent } from './tenancy/tenancy.component';



@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    // { path: 'application', component: PageStatisticsComponent },
                    // { path: 'application/pagelist/:id', component: PageListComponent },
                    { path: 'deployment', component: DeploymentComponent },
                    { path: 'site/:id/tenancy/:sId', component: TenancyComponent },
                    { path: 'site/:id', component: SiteComponent },
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class DeploymentRoutingModule { }
