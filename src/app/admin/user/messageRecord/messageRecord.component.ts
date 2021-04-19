import { Component, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';

import { CreateOrEditMessageRecordModalComponent } from './messageRecord-modal.component';

import { UserFeedbackServiceProxy, MarketingServiceProxy } from '@shared/service-proxies/service-proxies-pager';

import { Router, ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './messageRecord.component.html',
  animations: [appModuleAnimation()]
})
export class MessageRecordComponent extends AppComponentBase {

  @ViewChild('messageRecordModal', { static: true }) messageRecordModal: CreateOrEditMessageRecordModalComponent;
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;


  filterText = "";
  handled: any = "";
  applicationId: any = "";
  applicationList = [];
  constructor(injector: Injector,
    private router: Router,
    private route: ActivatedRoute,
    private _UserFeedbackServiceProxy: UserFeedbackServiceProxy,
    private _ApplicationServiceProxy: MarketingServiceProxy
  ) {
    super(injector);
    console.log("route", this.route)
    this._ApplicationServiceProxy.getApplications(
      "",
      void 0,
      999,
      0
    )
      .subscribe(result => {
        this.applicationList = result.items;
      })
  }


  //获取列表
  getList(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }

    this.primengTableHelper.showLoadingIndicator();
    this._UserFeedbackServiceProxy.getUserFeedbacks(
      this.handled,
      this.applicationId,
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
    this.messageRecordModal.show(Object.assign({}, record))
  }



  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }

}
