import { Component, OnInit, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppConsts } from '@shared/AppConsts';
import { Router, ActivatedRoute } from '@angular/router';
import { PromotionServiceProxy, AddOrUpdateProductsToPromotionInput } from '@shared/service-proxies/service-proxies';
import * as moment from 'moment';
import { PromotionGridModalComponent } from '@app/admin/product/promotion-manage/operation/promotion-grid-modal.component';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';


@Component({
  templateUrl: './promotion-manage-product.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()],
  styles: [`tbody {

}`
  ]
})
export class PromotionManageProductListComponent extends AppComponentBase {
  @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;

  @ViewChild('promotionGridModal',{static:true}) promotionGridModal: PromotionGridModalComponent;
  @ViewChild('dataTable',{static:true}) dataTable: Table;
  @ViewChild('paginator',{static:true}) paginator: Paginator;

  filterText: string = "";
  selectedList = [];
  busy = false;
  promotionId: any;
  name: any = "";

  productList: any = [];
  saving = false;


  batchDiscountType = 0;
  batchDiscountValue = "";



  constructor(injector: Injector,
    private router: Router,
    private _PromotionServiceProxy: PromotionServiceProxy,
    private _ActivatedRoute: ActivatedRoute) {
    super(injector);
    this._ActivatedRoute.queryParams.subscribe(params => {
      this.promotionId = params.promotionId;
      this.name = params.name;
    })
    console.log($('.m-body').css('background-color'), 111)
  }

  goBack() {
    this.router.navigate(['app', 'product', 'promotionManage']);
  }

  search() {
    this.primengTableHelper.records = this.productList.filter(item => {
      return item.product.title.indexOf(this.filterText) > -1
    });
    this.primengTableHelper.totalRecordsCount = this.primengTableHelper.records.length;
    this.selectedList = [];
  }
  getProductPromotions(event?: LazyLoadEvent) {
    this.selectedList = [];
    this.primengTableHelper.showLoadingIndicator();
    this._PromotionServiceProxy.getProductPromotions(
      this.promotionId,
      undefined,
      this.primengTableHelper.getSorting(this.dataTable),
      999,
      0
    )
    .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
    .subscribe(result => {
      console.log(result);
      this.primengTableHelper.totalRecordsCount = result.totalCount;
      this.productList = result.items;
      this.primengTableHelper.records = this.productList;
      this.productList.push()
      this.primengTableHelper.hideLoadingIndicator();
    })
  }
  addProduct() {
    this.promotionGridModal.show();
  }


  delete(record, i) {
    this.productList.forEach((item, index) => {
      if (item.product.id == record.product.id) {
        this.productList.splice(index, 1);
      }
    });

    this.primengTableHelper.records.forEach((item, index) => {
      if (item.product.id == record.product.id) {
        this.primengTableHelper.records.splice(index, 1);
      }
    });
    this.primengTableHelper.totalRecordsCount = this.primengTableHelper.records.length;
  }

  //显示图片加载失败的占位图
  showEmpty(e) {
    var target = $(e.target);
    target.attr("src", AppConsts.appBaseUrl + "/assets/common/images/holderimg.png")
  }

  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1;
  }


  selectProduct(e) {
    console.log('e', e.selection);
    if (this.productList.some(item => {
      return item.product.id == e.selection.id
    })) {
      this.notify.warn(this.l('ExistRepeatedCargoThing'));
    } else {
      this.productList.push({ product: e.selection });
      this.search();
    }

  }

  changeType(record) {
    console.log('changeType');
    record.discountValue = undefined;
  }
  changeValue(record) {
    if (record.discountType == 0) {
      if (record.product.price < record.discountValue) {
        this.notify.warn(this.l('discountOverPrice'));
        record.discountValue = undefined;
        record.price = record.product.price;
      } else {
        record.price = record.product.price - record.discountValue;
      }
    } else {
      if (record.discountValue < 0 || record.discountValue > 10) {
        this.notify.warn(this.l('discountOverPrice'));
        record.discountValue = undefined;
        record.price = record.product.price;
      } else {
        record.price = record.product.price * record.discountValue / 10;
      }
    }
  }

  batchOperation() {
    if (this.selectedList.length) {
      this.modal.show();
    } else {
      this.message.warn(this.l('atLeastChoseOneItem'));
    }
  }
  onShown() {

  }
  batchSave() {
    console.log(this.batchDiscountType, this.batchDiscountValue);

    this.selectedList.forEach(item => {
      item.discountType = this.batchDiscountType;
      item.discountValue = this.batchDiscountValue;
      this.changeValue(item);
    })


    console.log(this.selectedList)
    console.log(this.productList)
    this.modal.hide();
    this.selectedList = [];
  }

  save() {
    console.log(this.productList)
    this.primengTableHelper.showLoadingIndicator();

    this._PromotionServiceProxy.addOrUpdateProductsToPromotion({
      "promotionId": this.promotionId,
      "productPromotionInputs": this.productList.map(item => {
        return {
          "productId": item.product.id,
          "discountType": item.discountType,
          "discountValue": item.discountValue
        }
      })
    } as AddOrUpdateProductsToPromotionInput)
    .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
    .subscribe(r => {
      // this.primengTableHelper.hideLoadingIndicator();
      this.notify.info(this.l('success'));
      this.goBack();
    })
  }

  close(){
    this.modal.hide();
  }
}


