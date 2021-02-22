import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';


//推荐
import { BrandCenterComponent } from '@app/brandcenter/brand-center/brand-center.component';
import { BrandOperationComponent } from '@app/brandcenter/brand-center/operation/brand-center-operation.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: 'brandcenter', component: BrandCenterComponent },
                    { path: 'brandcenter/operation', component: BrandOperationComponent },
                    { path: 'brandcenter/operation/:id', component: BrandOperationComponent },
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
