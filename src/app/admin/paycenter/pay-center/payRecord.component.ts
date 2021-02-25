import { Component, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import * as moment from 'moment';

import { PayCenterServiceProxy } from '@shared/service-proxies/service-proxies2';

@Component({
  templateUrl: './payRecord.component.html',
  animations: [appModuleAnimation()]
})
export class PayRecordComponent extends AppComponentBase {

  @ViewChild('dataTable',{static:true}) dataTable: Table;
  @ViewChild('paginator',{static:true}) paginator: Paginator;

  startTime: any = moment().utc().subtract(29, 'days').startOf('day');
  endTime: any = moment().utc().endOf('day');
  payType: any = "";

  constructor(injector: Injector,
    private _PayCenterServiceProxy: PayCenterServiceProxy,
  ) {
    super(injector);
  }


  //获取列表
  getList(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }

    if (this.startTime) {
      var StartTime = moment(this.startTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h')
    }
    if (this.endTime) {
      var EndTime = moment(this.endTime.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's')
    }
    this.primengTableHelper.showLoadingIndicator();
    this._PayCenterServiceProxy.getPayRecords(
      StartTime ? StartTime : this.startTime,
      EndTime ? EndTime : this.endTime,
      undefined,
      undefined,
      this.payType,
      undefined,
      this.primengTableHelper.getSorting(this.dataTable),
      this.primengTableHelper.getMaxResultCount(this.paginator, event),
      this.primengTableHelper.getSkipCount(this.paginator, event)
    )
    .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
    .subscribe(result => {
      this.primengTableHelper.totalRecordsCount = result.totalCount;
      this.primengTableHelper.records = result.items;
      // this.primengTableHelper.hideLoadingIndicator();
    })
  }


  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }

}
