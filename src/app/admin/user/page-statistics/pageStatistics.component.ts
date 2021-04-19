import { Component, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';

import { CreateOrEditApplicationModalComponent } from './create-or-edit-application-modal.component';

import { MarketingServiceProxy } from '@shared/service-proxies/service-proxies-pager';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './pageStatistics.component.html',
  animations: [appModuleAnimation()]
})
export class PageStatisticsComponent extends AppComponentBase {

  @ViewChild('applicationModal', { static: true }) applicationModal: CreateOrEditApplicationModalComponent;
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;


  filterText = "";

  constructor(injector: Injector,
    private router: Router,
    private route: ActivatedRoute,
    private _ApplicationServiceProxy: MarketingServiceProxy,
  ) {
    super(injector);
    console.log("route", this.route)
  }

  //创建
  createItem() {
    this.applicationModal.show();
  }

  goPage(record) {
    this.router.navigate(['pagelist', record.id], {
      relativeTo: this.route,
      queryParams: {
        applicationName: record.name
      }
    });
  }
  //获取列表
  getList(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }

    this.primengTableHelper.showLoadingIndicator();
    this._ApplicationServiceProxy.getApplications(
      this.filterText,
      this.primengTableHelper.getSorting(this.dataTable),
      this.primengTableHelper.getMaxResultCount(this.paginator, event),
      this.primengTableHelper.getSkipCount(this.paginator, event)
    )
      .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
      .subscribe(result => {
        this.primengTableHelper.totalRecordsCount = result.totalCount;
        this.primengTableHelper.records = result.items;
      })
  }
  //修改
  editItem(record) {
    this.applicationModal.show(Object.assign({}, record))
  }


  //删除
  deleteItem(record) {
    this.message.confirm(this.l('deletethisselected'), this.l('AreYouSure'), (r) => {
      if (r) {
        this._ApplicationServiceProxy.batchDeleteApplication([record.id]).subscribe(result => {
          this.notify.info(this.l('success'));
          this.getList();
        })
      }
    })
  }



  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }

}
