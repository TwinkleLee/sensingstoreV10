import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CustomComponentComponent } from '@app/admin/customComponent/custom-component/custom-component.component';


@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: 'customComponent', component: CustomComponentComponent },
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class CustomComponentRoutingModule { }
