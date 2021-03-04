import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';


// 广告
import { AdvertisementComponent } from '@app/admin/advertisement/advertisement/advertisement.component';
//ads-package
import { AdsPackageComponent } from '@app/admin/advertisement/ads-package/ads-package.component';
import { AdsReviewComponent } from '@app/admin/advertisement/ads-review/ads-review.component';
import { Schedule } from '@app/admin/advertisement/schedule/schedule.component';
import { ScheduleProgram } from '@app/admin/advertisement/schedule/schedule-program.component';


@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    //广告
                    { path: 'adsList', component: AdvertisementComponent, data: { permission: 'Pages.Tenant.Ads' } },
                    { path: 'adsPackage', component: AdsPackageComponent, data: { permission: 'Pages.Tenant.Ads.AdsPackage' } },
                    { path: 'adsReview', component: AdsReviewComponent, data: { permission: 'Pages.Tenant.Ads.Audit' } },
                    // //排程
                    { path: 'schedule', component: Schedule, data: { permission: 'Pages.Tenant.Scheduling' } },
                    { path: '24htimeline', component: ScheduleProgram, data: { permission: 'Pages.Tenant.Scheduling' } },
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class AdvertisementRoutingModule { }
