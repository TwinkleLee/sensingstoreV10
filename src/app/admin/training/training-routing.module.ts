import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {TrainingListComponent} from '@app/admin/training/training/training-list.component'
import {MyTrainingComponent} from '@app/admin/training/training/my-training.component'
import { CourseComponent } from '@app/admin/training/training/course/course.component';



@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    //培训
                    { path : 'training' ,component:TrainingListComponent,data :{permission :'Pages.Tenant.Training'}},
                    { path : 'my-training' ,component:MyTrainingComponent,data :{permission :'Pages.Tenant.Training'}},
                    { path : 'course',component:CourseComponent,data :{permission :'Pages.Tenant.Training'}},
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class TrainingRoutingModule { }
