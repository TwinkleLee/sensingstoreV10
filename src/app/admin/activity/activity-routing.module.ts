import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';


import { ActivityComponent } from '@app/admin/activity/activity/activity.component'
import { ActivityDataComponent } from '@app/admin/activity/activity/data/activity-data.component'
import { ActivityBasicComponent } from '@app/admin/activity/activity/basic/activity-basic.component'
import { ActivityAdvancedComponent } from '@app/admin/activity/activity/advanced/activity-advanced.component'
import { ActivityPrizeComponent } from '@app/admin/activity/activity/prize/activity-prize.component'
import { GameComponent } from '@app/admin/activity/activity/game/game.component'
import { PlayerDataComponent } from '@app/admin/activity/player-data/player-data.component'
import { PageTemplateComponent } from '@app/admin/activity/activity-template/page-template.component'

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    //活动
                    { path: 'activity', component: ActivityComponent, data: { permission: 'Pages.Tenant.Activities' } },

                    { path: 'activities/playerdata', component: PlayerDataComponent, data: { permission: 'Pages.Tenant.Activities' } },
                    { path: 'activities/pagetemplate', component: PageTemplateComponent, data: { permission: 'Pages.Tenant.Activities' } },
                    { path: 'activity/data', component: ActivityDataComponent, data: { permission: 'Pages.Tenant.Activities' } },
                    { path: 'activity/basic', component: ActivityBasicComponent, data: { permission: 'Pages.Tenant.Activities' } },
                    { path: 'activity/advanced', component: ActivityAdvancedComponent, data: { permission: 'Pages.Tenant.Activities' } },
                    { path: 'activity/prize', component: ActivityPrizeComponent, data: { permission: 'Pages.Tenant.Activities' } },
                    { path: 'activity/game', component: GameComponent, data: { permission: 'Pages.Tenant.Activities' } },
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class ActivityRoutingModule { }
