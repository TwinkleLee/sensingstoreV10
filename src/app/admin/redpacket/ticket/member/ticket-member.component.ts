import { Component, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table, TableCheckbox } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { CommonServiceProxy, TicketServiceProxy, TicketStatus, TicketType, TakeType, SetTicketStatusInput } from '@shared/service-proxies/service-proxies2';
import * as _ from 'lodash';
import { finalize } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './ticket-member.component.html',
  animations: [appModuleAnimation()]
})
export class TicketMemberComponent extends AppComponentBase {

  @ViewChild('dataTable',{static:true}) dataTable: Table;
  @ViewChild('paginator',{static:true}) paginator: Paginator;

  filter: any = '';
  publishList: any = [];

  ticketId: any;
  constructor(injector: Injector,
    private _TicketServiceProxy: TicketServiceProxy,
    private router: Router, private _activeRouter: ActivatedRoute,
  ) {
    super(injector);
    this._activeRouter.queryParams.subscribe(params => {
      this.ticketId = params.ticketId;
    })
  }


  //获取列表
  getList(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }

    this.primengTableHelper.showLoadingIndicator();
    this._TicketServiceProxy.getTicketMembers(
      this.ticketId,
      this.filter,
      this.primengTableHelper.getSorting(this.dataTable),
      this.primengTableHelper.getMaxResultCount(this.paginator, event),
      this.primengTableHelper.getSkipCount(this.paginator, event)
    ).pipe(finalize(() => { this.primengTableHelper.hideLoadingIndicator() }))
      .subscribe(result => {
        this.primengTableHelper.totalRecordsCount = result.totalCount;
        this.primengTableHelper.records = result.items;
      })
  }

  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }

  goBack() {
    this.router.navigate(['app', 'redpacket', 'ticket']);
  }

}
