import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';


//推荐
import { BrandCenterComponent } from './brand-center/brand-center.component';
import { BrandOperationComponent } from './brand-center/operation/brand-center-operation.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: '', component: BrandCenterComponent },
                    { path: 'operation', component: BrandOperationComponent },
                    { path: 'operation/:id', component: BrandOperationComponent },
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class BrandcenterRoutingModule { }
