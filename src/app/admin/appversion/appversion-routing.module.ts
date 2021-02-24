import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppVersionComponent } from './app-version/appVersion.component'

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: 'appVersion', component: AppVersionComponent },
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class AppVersionRoutingModule { }
