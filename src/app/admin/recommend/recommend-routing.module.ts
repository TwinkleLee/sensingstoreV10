import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';


//推荐
import { PersonalRecommendComponent } from '@app/admin/recommend/personal-recommend/personal-recommend.component';
import { PersonalCategoryComponent } from '@app/admin/recommend/personal-category/personal-category.component';
import { FaceRecommendComponent } from '@app/admin/recommend/face-recommend/face-recommend.component';


@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    //推荐
                    { path: 'recommend', component: PersonalRecommendComponent, data: { permission: 'Pages.Tenant.Recommends' } },
                    { path: 'personalCategory', component: PersonalCategoryComponent, data: { permission: 'Pages.Tenant.Recommends' } },
                    { path: 'faceRecommend', component: FaceRecommendComponent },
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class RecommendRoutingModule { }
