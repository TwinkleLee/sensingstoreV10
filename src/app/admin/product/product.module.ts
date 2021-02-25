import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { CountoModule } from 'angular2-counto';
import { ModalModule } from '@node_modules/ngx-bootstrap/modal';
import { TabsModule } from '@node_modules/ngx-bootstrap/tabs';
import { TooltipModule } from '@node_modules/ngx-bootstrap/tooltip';
import { BsDropdownModule } from '@node_modules/ngx-bootstrap/dropdown';
import { PopoverModule } from '@node_modules/ngx-bootstrap/popover';
import { ProductRoutingModule } from './product-routing.module'
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { BsDatepickerModule, BsDatepickerConfig, BsDaterangepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { NgxBootstrapDatePickerConfigService } from 'assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service';

NgxBootstrapDatePickerConfigService.registerNgxBootstrapDatePickerLocales();

import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TreeModule } from 'primeng/tree';

import { AutoCompleteModule } from 'primeng/autocomplete';
import { from } from 'rxjs';

//商品
import { ProductComponent } from '@app/admin/product/product/product.component'
import { CreateOrEditProModalComponent } from '@app/admin/product/product/create-or-edit-prod-modal.component';
import { ProductEditComponent } from '@app/admin/product/product/operation/product-edit.component'
import { ProductInfoComponent } from '@app/admin/product/product-info/product-info.component';
import { PropertyAddComponent } from '@app/admin/product/product-info/property-add-modal.component';
import { PropertyEditComponent } from '@app/admin/product/product-info/operation/property-edit.component';
import { PropertyValueAlertModalComponent } from '@app/admin/product/product-info/operation/selection-modal.component';
import { ProductReviewComponent } from '@app/admin/product/product-review/product-review.component';
import { ProductSkuEditComponent } from '@app/admin/product/product/sku/product-sku-edit.component';
import { CreateOrEditOnlineModalComponent } from '@app/admin/product/product/operation/create-or-edit-online-modal.component';
import { CreateOrEditCommentsModalComponent } from '@app/admin/product/product/operation/create-or-edit-comments-modal.component';
import { CreateOrEditProductResourceModalComponent } from '@app/admin/product/product/operation/create-or-edit-resource-modal.component';
import { ProductDetailModalComponent } from '@app/admin/product/product-review/detail/product-detail-modal.component';
import { CreateOrEditSkuOnlineModalComponent } from '@app/admin/product/product/sku/create-or-edit-sku-online-modal.component';
import { CreateOrEditSkuResourceModalComponent } from '@app/admin/product/product/sku/create-or-edit-sku-resource-modal.component';
import { LikesComponent } from '@app/admin/product/likes/likes.component';
import { CreateOrEditLikeModalComponent } from '@app/admin/product/likes/operation/create-or-edit-like-modal.component';
import { LikeAddOrEditComponent } from '@app/admin/product/likes/operation/like-add-or-edit.component';
import { MatchComponent } from '@app/admin/product/match/match.component';
import { CreateOrEditMatchModalComponent } from '@app/admin/product/match/operation/create-or-edit-match-modal.component';
import { MatchAddOrEditComponent } from '@app/admin/product/match/operation/match-add-or-edit.component';
import { CreateOrEditSkuModalComponent } from '@app/admin/product/product/operation/create-or-edit-sku-modal.component';

import { OutPutInComponent } from '@app/admin/product/outputin/outputin.component';
import { SkuListComponent } from '@app/admin/product/outputin/sku-list.component';
import { SkuGridModalComponent } from '@app/admin/product/outputin/operation/sku-grid-modal.component';
import { OutputinDetailModalComponent } from '@app/admin/product/outputin/operation/outputin-detail-modal.component';
import { AddOutputinComponent } from '@app/admin/product/outputin/operation/add-outputin-modal.component';
import { RfidListModalComponent } from '@app/admin/product/outputin/operation/rfid-list-modal.component';
import { PromotionManage } from '@app/admin/product/promotion-manage/promotion-manage.component';
import { PromotionManageModalComponent } from '@app/admin/product/promotion-manage/operation/promotion-manage-modal.component';
import { PromotionManageProductListComponent } from '@app/admin/product/promotion-manage/promotion-manage-product.component';
import { PromotionGridModalComponent } from '@app/admin/product/promotion-manage/operation/promotion-grid-modal.component';
import { CreateOrEditSkuRfidModalComponent } from '@app/admin/product/outputin/create-or-edit-skurfid-modal.component';

// ?
import { ConnectorService } from '@app/shared/services/connector.service';

import {AdminSharedModule} from '@app/admin/shared/admin-shared.module';
import {AppSharedModule} from '@app/shared/app-shared.module';


@NgModule({
    imports: [
        AdminSharedModule,
        AppSharedModule,


        CommonModule,
        FormsModule,
        ModalModule,
        TabsModule,
        TooltipModule,
        AppCommonModule,
        UtilsModule,
        ProductRoutingModule,
        CountoModule,
        NgxChartsModule,
        BsDatepickerModule.forRoot(),
        BsDropdownModule.forRoot(),
        PopoverModule.forRoot(),
        PaginatorModule,
        TableModule,
        TreeModule,
        AutoCompleteModule,
    ],
    declarations: [
        //商品
        ProductComponent,
        CreateOrEditProModalComponent,
        ProductEditComponent,
        ProductInfoComponent,
        PropertyAddComponent,
        PropertyEditComponent,
        PropertyValueAlertModalComponent,
        ProductReviewComponent,
        ProductSkuEditComponent,
        CreateOrEditOnlineModalComponent,
        CreateOrEditCommentsModalComponent,
        CreateOrEditProductResourceModalComponent,
        ProductDetailModalComponent,
        CreateOrEditSkuOnlineModalComponent,
        CreateOrEditSkuResourceModalComponent,
        LikesComponent,
        CreateOrEditLikeModalComponent,
        LikeAddOrEditComponent,
        MatchComponent,
        CreateOrEditMatchModalComponent,
        MatchAddOrEditComponent,
        CreateOrEditSkuModalComponent,
        

        OutPutInComponent,
        SkuListComponent,
        SkuGridModalComponent,
        OutputinDetailModalComponent,
        AddOutputinComponent,
        RfidListModalComponent,
        PromotionManage,
        PromotionManageModalComponent,
        PromotionManageProductListComponent,
        PromotionGridModalComponent,
        CreateOrEditSkuRfidModalComponent,
    ],
    providers: [
        { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
        { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
        { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale },
        ConnectorService
    ]
})
export class ProductModule { }
