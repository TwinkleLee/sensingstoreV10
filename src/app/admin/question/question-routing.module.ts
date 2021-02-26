import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

//答题
import { QuestionComponent } from './question/question.component'
import { NaireComponent } from './question/naire.component'
import { NaireDashboardComponent } from './question/naire-dashboard.component'



@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    //答题
                    { path: 'question', component: QuestionComponent },
                    { path: 'naire', component: NaireComponent },
                    { path: 'naire/dashboard', component: NaireDashboardComponent },
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class QuestionRoutingModule { }
