import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PageStatisticsComponent } from './page-statistics/pageStatistics.component'
import { PageListComponent } from './page-statistics/pageList.component'
import { MessageRecordComponent } from './messageRecord/messageRecord.component'
import { AppointmentComponent } from './appointment/appointment.component'



@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: 'application', component: PageStatisticsComponent },
                    { path: 'application/pagelist/:id', component: PageListComponent },
                    { path: 'feedback', component: MessageRecordComponent },
                    { path: 'appointment', component: AppointmentComponent },
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class UserRoutingModule { }
