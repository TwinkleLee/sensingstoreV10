import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';


import { UserFeedbackServiceProxy, UserAppointmentServiceProxy } from '@shared/service-proxies/service-proxies-pager';

import { Router, ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './appointment.component.html',
  animations: [appModuleAnimation()]
})
export class AppointmentComponent extends AppComponentBase {

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
  ) {
    super(injector);
    
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


  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }

}
