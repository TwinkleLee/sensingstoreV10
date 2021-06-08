import { Component, OnInit, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Router } from '@angular/router';
import { PlatformModalComponent } from '@app/admin/platformManage/platformManage/operation/platform-modal.component';
import { finalize } from 'rxjs/operators';
import { External3rdPlatformServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppConsts } from '@shared/AppConsts';


@Component({
  templateUrl: './platform-manage.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})
export class PlatformManageComponent extends AppComponentBase {

  @ViewChild('platformModal', { static: true }) PlatformModalComponent: PlatformModalComponent;
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  filterText: string = "";
  platformPublishList = [];
  busy = false;

  constructor(injector: Injector,
    private _External3rdPlatformServiceProxy: External3rdPlatformServiceProxy
  ) {
    super(injector);
  }

  showEmpty(e) {
    var target = $(e.target);
    target.attr("src", AppConsts.appBaseUrl + "/assets/common/images/holderimg.png")
  }

  getPlatformList(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.platformPublishList = [];

    this.primengTableHelper.showLoadingIndicator();
    this._External3rdPlatformServiceProxy.getPlatformList(
      void 0,
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
  createPlatform() {
    this.PlatformModalComponent.show();
  }
  editPlatform(item) {
    this.PlatformModalComponent.show(item);
  }
  //删除活动
  deletePlatform(id) {
    this.message.confirm(this.l('deletethisplatform'), this.l('AreYouSure'), (r) => {
      if (r) {
        this._External3rdPlatformServiceProxy.deletePlatform(id).subscribe(result => {
          this.notify.info(this.l('success'));
          this.getPlatformList();
        })
      }
    })
  }


  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }
}


