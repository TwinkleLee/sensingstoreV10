import { Component, OnInit, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppConsts } from '@shared/AppConsts';
import { MyTreeComponent } from '@app/shared/common/my-tree/my-tree.component';
import { Router } from '@angular/router';
import { PromotionServiceProxy } from '@shared/service-proxies/service-proxies';
import * as moment from 'moment';
import { PromotionManageModalComponent } from '@app/admin/product/promotion-manage/operation/promotion-manage-modal.component';


@Component({
  templateUrl: './promotion-manage.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})
export class PromotionManage extends AppComponentBase {

  @ViewChild('promotionManageModal',{static:true}) promotionManageModal: PromotionManageModalComponent;
  @ViewChild('dataTable',{static:true}) dataTable: Table;
  @ViewChild('paginator',{static:true}) paginator: Paginator;
  @ViewChild('myTree',{static:false}) myTree: MyTreeComponent;

  PromotionType: any = "";
  filterText: string = "";
  operateAll;
  schedulePublishList = [];
  busy = false;

  constructor(injector: Injector,
    private router: Router,
    private _PromotionServiceProxy: PromotionServiceProxy) {
    super(injector);
  }

  getSchedule(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.schedulePublishList = [];

    this.primengTableHelper.showLoadingIndicator();
    this._PromotionServiceProxy.getPromotions(
      this.PromotionType,
      this.filterText,
      this.primengTableHelper.getSorting(this.dataTable),
      this.primengTableHelper.getMaxResultCount(this.paginator, event),
      this.primengTableHelper.getSkipCount(this.paginator, event)
    )
    .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
    .subscribe(result => {
      console.log(result);
      this.primengTableHelper.totalRecordsCount = result.totalCount;
      this.primengTableHelper.records = result.items;
      // this.primengTableHelper.hideLoadingIndicator();
    })
  }
  createPromotion() {
    this.promotionManageModal.show();
  }

  edit(record) {
    this.promotionManageModal.show(record);
  }
  godetail(record) {
    this.router.navigate(['app', 'admin','product', 'promotionManage', 'productList'], { queryParams: { promotionId: record.id, name: record.name } });
  }

  //删除
  deleteSchedule(record) {
    this.message.confirm(this.l('deletethisselected'),this.l('AreYouSure'), (r) => {
      if (r) {
        this._PromotionServiceProxy.deletePromotions([record.id]).subscribe(result => {
          this.schedulePublishList = [];
          this.notify.info(this.l('success'));
          this.getSchedule();
        })
      }
    })
  }

  //显示图片加载失败的占位图
  showEmpty(e) {
    var target = $(e.target);
    target.attr("src", AppConsts.appBaseUrl + "/assets/common/images/holderimg.png")
  }

  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }

}


