import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

//商品
import { ProductComponent } from '@app/admin/product/product/product.component'
import { ProductInfoComponent } from '@app/admin/product/product-info/product-info.component';
import { ProductEditComponent } from '@app/admin/product/product/operation/product-edit.component';
import { PropertyEditComponent } from '@app/admin/product/product-info/operation/property-edit.component';
import { ProductReviewComponent } from '@app/admin/product/product-review/product-review.component';
import { ProductSkuEditComponent } from '@app/admin/product/product/sku/product-sku-edit.component';
import { MatchComponent } from '@app/admin/product/match/match.component';
import { MatchAddOrEditComponent } from '@app/admin/product/match/operation/match-add-or-edit.component';
import { LikesComponent } from '@app/admin/product/likes/likes.component';
import { LikeAddOrEditComponent } from '@app/admin/product/likes/operation/like-add-or-edit.component';
import { OutPutInComponent } from '@app/admin/product/outputin/outputin.component';
import { SkuListComponent } from '@app/admin/product/outputin/sku-list.component';
import { PromotionManage } from '@app/admin/product/promotion-manage/promotion-manage.component';
import { PromotionManageProductListComponent } from '@app/admin/product/promotion-manage/promotion-manage-product.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    // 商品
                    { path: 'product', component: ProductComponent, data: { permission: 'Pages.Tenant.Products' } },
                    { path: 'reviewProduct', component: ProductReviewComponent, data: { permission: 'Pages.Tenant.Products.Audit' } },
                    { path: 'prodInfo', component: ProductInfoComponent, data: { permission: 'Pages.Tenant.Products' } },
                    { path: 'prodInfo/operation/:id', component: PropertyEditComponent, data: { permission: 'Pages.Tenant.Products' } },
                    { path: 'like', component: LikesComponent, data: { permission: 'Pages.Tenant.Products.Like' } },
                    { path: 'like/operation', component: LikeAddOrEditComponent, data: { permission: 'Pages.Tenant.Products.Like.Create' } },
                    { path: 'like/operation/:id', component: LikeAddOrEditComponent, data: { permission: 'Pages.Tenant.Products.Like.Edit' } },
                    { path: 'match', component: MatchComponent, data: { permission: 'Pages.Tenant.Products.Match' } },
                    { path: 'match/operation', component: MatchAddOrEditComponent, data: { permission: 'Pages.Tenant.Products.Match.Create' } },
                    { path: 'match/operation/:id', component: MatchAddOrEditComponent, data: { permission: 'Pages.Tenant.Products.Match.Edit' } },
                    { path: 'product/operation', component: ProductEditComponent, data: { permission: 'Pages.Tenant.Products.Create' } },
                    { path: 'product/operation/:id', component: ProductEditComponent, data: { permission: 'Pages.Tenant.Products.Edit' } },
                    { path: 'product/operation/:id/sku/:skuid', component: ProductSkuEditComponent, data: { permission: 'Pages.Tenant.Products.Edit' } },


                    { path: 'outputin', component: OutPutInComponent, data: { permission: 'Pages.Tenant.Products' } },
                    { path: 'skuList', component: SkuListComponent, data: { permission: 'Pages.Tenant.Products' } },
                    { path: 'promotionManage', component: PromotionManage, data: { permission: 'Pages.Tenant.Products' } },
                    { path: 'promotionManage/productList', component: PromotionManageProductListComponent, data: { permission: 'Pages.Tenant.Products' } },

                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class ProductRoutingModule { }
