import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PageStatisticsComponent } from './page-statistics/pageStatistics.component'
import { PageListComponent } from './page-statistics/pageList.component'
import { MessageRecordComponent } from './messageRecord/messageRecord.component'



@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: 'application', component: PageStatisticsComponent },
                    { path: 'application/pagelist/:id', component: PageListComponent },
                    { path: 'messageRecord', component: MessageRecordComponent },
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
