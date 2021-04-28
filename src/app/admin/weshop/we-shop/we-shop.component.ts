import { Component, OnInit, AfterViewInit, Injector, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { ShopServiceProxy, UpdateShopSettingInput, PayPointRule, PointDeductionRule, DeductionRule, PayCashPointRule } from '@shared/service-proxies/service-proxies-product';
import { SwiperModalComponent } from '@app/admin/weshop/we-shop/operation/set-swiper-modal.component';
import { SetTagModalComponent } from './operation/set-tags-modal.component';
import { SetCategoryModalComponent } from './operation/set-category-modal.component';
import { SetFreightModalComponent } from './operation/set-freight-modal.component';
import { SensingShopManageServiceProxy, PayCenterServiceProxy, SetShopPayInput } from '@shared/service-proxies/service-proxies2';
import { WeixinMpServiceProxy } from '@shared/service-proxies/service-proxies5';
import { ShopFreightType } from '@shared/service-proxies/service-proxies-product';

@Component({
  templateUrl: './we-shop.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})
export class WeShopComponent extends AppComponentBase {

  basic: any = {};
  showFreezeUi = false;
  publicAccountList: any = [];

  ShopFreightType = ShopFreightType;

  //轮播图
  @ViewChild('SwiperModal', { static: true }) SwiperModal: SwiperModalComponent;
  @ViewChild('SwiperTable', { static: true }) SwiperTable: Table;
  @ViewChild('SwiperPaginator', { static: true }) SwiperPaginator: Paginator;
  SwiperPrimeng: PrimengTableHelper = new PrimengTableHelper();
  swiperFilter: string;

  //商品分类
  @ViewChild('setCategoryModal', { static: true }) setCategoryModal: SetCategoryModalComponent;
  @ViewChild('categoryTable', { static: true }) categoryTable: Table;
  @ViewChild('categoryPaginator', { static: true }) categoryPaginator: Paginator;
  categoryPrimeng: PrimengTableHelper = new PrimengTableHelper();
  categoryFilter: string;
  categoryCheckedList: any = [];

  //标签管理
  @ViewChild('setTagModal', { static: true }) setTagModal: SetTagModalComponent;
  @ViewChild('tagTable', { static: true }) tagTable: Table;
  @ViewChild('tagPaginator', { static: true }) tagPaginator: Paginator;
  tagPrimeng: PrimengTableHelper = new PrimengTableHelper();
  tagFilter: string;
  tagCheckedList: any = [];

  //运费管理
  @ViewChild('setFreightModal', { static: true }) setFreightModal: SetFreightModalComponent;
  @ViewChild('freightTable', { static: true }) freightTable: Table;
  @ViewChild('freightPaginator', { static: true }) freightPaginator: Paginator;
  freightPrimeng: PrimengTableHelper = new PrimengTableHelper();
  freightFilter: string;
  freightCheckedList: any = [];

  //物流设置
  track: any = {};

  //支付设置
  payTypeList: any = {
    'weixin': []
  };
  paySetting: any = {
    'weixin': { id: "" }
  };

  constructor(injector: Injector,
    private router: Router,
    private _ShopServiceProxy: ShopServiceProxy,
    private _SensingShopManageServiceProxy: SensingShopManageServiceProxy,
    private _WeixinMpServiceProxy: WeixinMpServiceProxy,
    private _PayCenterServiceProxy: PayCenterServiceProxy) {
    super(injector);
  }


  ngAfterViewInit() {
    this.getBasic();
  }


  onUpload(result): void {
    this.basic.logoUrl = result.fileUri;
  }


  //返回
  goBack() {
    this.router.navigate(['app', 'admin','onlineStore', 'onlineStore']);
  }
  save() {
    this.showFreezeUi = true;
    // this.basic.payPointRule = new PayPointRule(this.basic.payPointRule);
    // this.basic.pointDeductionRule = this.basic.pointDeductionRule as PointDeductionRule;
    console.log(this.basic);
    this._ShopServiceProxy.updateShopSetting(
      this.basic as UpdateShopSettingInput
    ).pipe(finalize(() => {
      this.showFreezeUi = false;
    })).subscribe(r => {
      console.log(r)
      this.showFreezeUi = false;
      this.notify.info(this.l('success'));
      this.basic = r;
    })
  }

  getBasic() {
    this.showFreezeUi = true;
    this._ShopServiceProxy.getShopSettings()
      .pipe(finalize(() => {
        this.showFreezeUi = false;
      })).subscribe(r => {
        console.log(r)
        if (!r.pointDeductionRule) {
          r.pointDeductionRule = new PointDeductionRule({
            "shopDeductionRule": new DeductionRule({
              "deductionPointAmount": 0,
              "payCashAmount": 0
            }),
            "deviceDeductionRule": new DeductionRule({
              "deductionPointAmount": 0,
              "payCashAmount": 0
            })
          })
        }
        if (!r.payPointRule) {
          r.payPointRule = new PayPointRule({
            "shopPointRule": new PayCashPointRule({
              "payCashAmount": 0,
              "awardPointAmount": 0
            }),
            "devicePointRule": new PayCashPointRule({
              "payCashAmount": 0,
              "awardPointAmount": 0
            })
          })
        }
        this.basic = r;
        this.showFreezeUi = false;
      })

    this._WeixinMpServiceProxy.getWeixinMps(
      void 0,
      void 0,
      999,
      0
    ).subscribe(result => {
      console.log(result);
      this.publicAccountList = result.items;
    })
  }


  getShopSliders(event?: LazyLoadEvent) {
    if (this.SwiperPrimeng.shouldResetPaging(event)) {
      this.SwiperPaginator.changePage(0);
      return;
    }
    this.SwiperPrimeng.showLoadingIndicator();
    this._ShopServiceProxy.getShopSliders(
      this.swiperFilter,
      // this.SwiperPrimeng.getSorting(this.SwiperTable),
      'orderNumber ASC',
      this.SwiperPrimeng.getMaxResultCount(this.SwiperPaginator, event),
      this.SwiperPrimeng.getSkipCount(this.SwiperPaginator, event)
    ).pipe(finalize(() => {
      this.SwiperPrimeng.hideLoadingIndicator();
    })).subscribe(result => {
      this.SwiperPrimeng.totalRecordsCount = result.totalCount;
      this.SwiperPrimeng.records = result.items;
    });
  }

  createSwiper() {
    this.SwiperModal.show();
  }
  editSwiper(record) {
    this.SwiperModal.show(record);
  }

  deleteSwiper(record) {
    this.message.confirm(this.l("deletethisselected"),this.l('AreYouSure'), (r) => {
      if (r) {
        this._ShopServiceProxy.deleteShopSlider(record.id).subscribe(result => {
          this.notify.info(this.l('success'));
          this.getShopSliders();
        })
      }
    })
  }

  getProductCategory(event?: LazyLoadEvent) {
    if (this.categoryPrimeng.shouldResetPaging(event)) {
      this.categoryPaginator.changePage(0);
      return;
    }
    this.categoryCheckedList = [];

    this.categoryPrimeng.showLoadingIndicator();
    this._ShopServiceProxy.getShopCategories(
      this.categoryFilter,
      // this.categoryPrimeng.getSorting(this.categoryTable),
      'orderNumber ASC',
      this.categoryPrimeng.getMaxResultCount(this.categoryPaginator, event) || 10,
      this.categoryPrimeng.getSkipCount(this.categoryPaginator, event)
    ).pipe(finalize(() => {
      this.categoryPrimeng.hideLoadingIndicator();
    })).subscribe(result => {
      this.categoryPrimeng.totalRecordsCount = result.totalCount;
      this.categoryPrimeng.records = result.items;
    });
  }

  createCategory() {
    this.setCategoryModal.show();
  }


  editCategory(record) {
    this.setCategoryModal.show(record);
  }

  deleteCategory(record) {
    this.message.confirm(this.l("deletethisselected"), this.l('AreYouSure'),(r) => {
      if (r) {
        this._ShopServiceProxy.deleteShopCategory(record.id).subscribe(result => {
          this.notify.info(this.l('success'));
          this.getProductCategory();
          this.categoryCheckedList = []
        })
      }
    })
  }




  getTags(event?: LazyLoadEvent) {
    if (this.tagPrimeng.shouldResetPaging(event)) {
      this.tagPaginator.changePage(0);
      return;
    }
    this.tagCheckedList = [];

    this.tagPrimeng.showLoadingIndicator();
    this._ShopServiceProxy.getShopTags(
      this.tagFilter,
      this.tagPrimeng.getSorting(this.tagTable),
      this.tagPrimeng.getMaxResultCount(this.tagPaginator, event) || 10,
      this.tagPrimeng.getSkipCount(this.tagPaginator, event)
    ).pipe(finalize(() => {
      this.tagPrimeng.hideLoadingIndicator();
    })).subscribe(result => {
      this.tagPrimeng.totalRecordsCount = result.totalCount;
      this.tagPrimeng.records = result.items;
    });
  }

  createTag() {
    this.setTagModal.show();
  }


  editTag(record) {
    this.setTagModal.show(record);
  }

  deleteTag(record) {
    this.message.confirm(this.l("deletethisselected"),this.l('AreYouSure'), (r) => {
      if (r) {
        this._ShopServiceProxy.deleteShopTag(record.id).subscribe(result => {
          this.notify.info(this.l('success'));
          this.getTags();
          this.tagCheckedList = []
        })
      }
    })
  }

  // deleteCategoryList() {
  //   if (this.categoryCheckedList.length === 0) {
  //     this.message.warn(this.l('selectOneWarn'));
  //   } else {
  //     this.message.confirm(this.l('deletethisselected'), this.l('AreYouSure'),(r) => {
  //       if (r) {
  //         this.categoryPrimeng.showLoadingIndicator();
  //         console.log(this.categoryCheckedList);
  //         var checkedIdList = [];
  //         for (var value of this.categoryCheckedList) {
  //           checkedIdList.push(value.id);
  //         }
  //         this._dateMetaService.deleteDateMetaphysicsList(checkedIdList).subscribe(result => {
  //           this.notify.info(this.l('success'));
  //           this.getProductCategory();
  //           this.categoryCheckedList = [];
  //         })
  //         this.categoryPrimeng.hideLoadingIndicator();
  //       }

  //     })

  //   }
  // }

  getShopFreights(event?: LazyLoadEvent) {
    if (this.freightPrimeng.shouldResetPaging(event)) {
      this.freightPaginator.changePage(0);
      return;
    }
    this.freightCheckedList = [];

    this.freightPrimeng.showLoadingIndicator();
    this._ShopServiceProxy.getShopFreights(
      void 0,
      this.freightFilter,
      this.freightPrimeng.getSorting(this.freightTable),
      this.freightPrimeng.getMaxResultCount(this.freightPaginator, event) || 10,
      this.freightPrimeng.getSkipCount(this.freightPaginator, event)
    ).pipe(finalize(() => {
      this.freightPrimeng.hideLoadingIndicator();
    })).subscribe(result => {
      console.log(result.items)
      this.freightPrimeng.totalRecordsCount = result.totalCount;
      this.freightPrimeng.records = result.items;
    });
  }



  createFreight() {
    this.setFreightModal.show();
  }

  deleteFreightList() {

  }
  editFreight(record) {
    this.setFreightModal.show(Object.assign({}, record));
  }
  deleteFreight(record) {
    this.message.confirm(this.l("deletethisselected"),this.l('AreYouSure'), (r) => {
      if (r) {
        this._ShopServiceProxy.deleteShopFreight(record.id).subscribe(result => {
          this.notify.info(this.l('success'));
          this.getShopFreights();
        })
      }
    })
  }

  //转换序列
  transIndex(i, p, t, event?: LazyLoadEvent) {
    return i + 1 + t.getSkipCount(p, event);
  }




  getTrackKeyInfo() {
    this.showFreezeUi = true;
    this._SensingShopManageServiceProxy.getTrackKeyInfo(void 0).subscribe(r => {
      console.log(r, 'rrrrrrrrrr')
      this.track = r;
      this.showFreezeUi = false;
    })
  }

  saveTrack() {
    this.showFreezeUi = true;

    this._SensingShopManageServiceProxy.setTrackKeyInfo(this.track).subscribe(r => {
      this.showFreezeUi = false;
      this.notify.info(this.l('success'));
    })
  }


  payWayInit() {
    this._SensingShopManageServiceProxy.getShopPaySettings(
      void 0,
      void 0,
      void 0,
      999,
      0
    ).subscribe(r => {
      var weixin = r.items.filter(item => {
        return item.from == 'weixin'
      })[0]
      this.paySetting = {
        weixin: weixin ? weixin : { id: "" }
      }
      console.log(this.paySetting, 'paySetting')
    })
    this._PayCenterServiceProxy.getPayAccounts(//获取支付方式
      void 0,
      void 0,
      void 0,
      void 0,
      999,
      0
    ).subscribe(r => {
      this.payTypeList = {
        weixin: r.items.filter(item => {
          return item.from == 'weixin'
        })
      }
      console.log(this.payTypeList, 'payTypeList')
    })
  }
  savePayWay() {
    var input = { payAccountId: [this.paySetting.weixin.id] }
    this.showFreezeUi = true;
    this._SensingShopManageServiceProxy.setShopPaySetting(input as SetShopPayInput).pipe(finalize(() => {
      this.showFreezeUi = false;
    })).subscribe(r => {
      this.notify.info(this.l('success'));
    })
  }

}
