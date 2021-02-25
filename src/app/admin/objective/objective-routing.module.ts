import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ObjectiveComponent } from './objective/objective-list.component'
import { KeyResultComponent } from './keyresult/key-result.component'
import { ExecuteComponent } from './execute/execute.component'



@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: 'objective', component: ObjectiveComponent, data: {} },
                    { path: 'keyresult/:id', component: KeyResultComponent, data: {} },
                    { path: 'execute/:id', component: ExecuteComponent, data: {} }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class ObjectiveRoutingModule { }
