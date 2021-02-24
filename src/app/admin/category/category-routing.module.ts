import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';


import { CategoryComponent } from '@app/admin/category/category/category.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: 'maintain/questionType', component: CategoryComponent },
                    { path: 'maintain/transfer', component: CategoryComponent },
                    { path: 'brandCate', component: CategoryComponent },
                    { path: 'category', component: CategoryComponent, data: { permission: 'Pages.Tenant.Products' } },
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class CategoryRoutingModule { }
