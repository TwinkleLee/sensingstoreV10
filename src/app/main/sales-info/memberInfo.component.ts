import { Component, Injector, ViewChild, ElementRef, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { CommonServiceProxy, ReportServiceProxy, MemberCostInput } from '@shared/service-proxies/service-proxies2';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { MemberInfoModalComponent } from '@app/main/sales-info/memberInfo-modal.component';


@Component({
  selector: 'app-members-info',
  templateUrl: './memberInfo.component.html',
  animations: [appModuleAnimation()]
})

export class MemberInfoComponent extends AppComponentBase implements OnInit {
  @ViewChild('MemberInfoModalComponent', { static: true }) MemberInfoModalComponent: MemberInfoModalComponent;

  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;
  @ViewChild('highTree', { static: false }) highTree;


  filterText: string;
  memberShipType = "";
  startTime: any = moment().utc().subtract(29, 'days').startOf('day');
  endTime: any = moment().utc().endOf('day');
  belongStore;
  //下拉
  // stores: any[] = [];
  memberTypes: any[] = [];
  storeFilter: string = '';


  constructor(injector: Injector,
    private router: Router,
    private _ReportServiceProxy: ReportServiceProxy,
    private _commonService: CommonServiceProxy,
  ) {
    super(injector);
    _commonService.memberType().subscribe((result) => {
      this.memberTypes = result;
    })
  }

  ngOnInit() {
    this.dataTable.sortField = "amount"
    this.dataTable.sortOrder = -1;
  }

  changePage() {
    this.router.navigate(['app', 'main', 'salesinfo']);
  }

  getSalesInfo(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.primengTableHelper.showLoadingIndicator();
    this.startTime = this.startTime ? moment(this.startTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h') : undefined;
    this.endTime = this.endTime ? moment(this.endTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h') : undefined;

    var input = new MemberCostInput({
      filter: undefined,
      memberName: this.filterText,
      type: this.memberShipType,
      storeId: this.belongStore,
      orderDateTimeStart: this.startTime ? moment(this.startTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h') : undefined,
      orderDateTimeEnd: this.endTime ? moment(this.endTime.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's') : undefined,
      sorting: this.primengTableHelper.getSorting(this.dataTable) || "amount DESC",
      maxResultCount: this.primengTableHelper.getMaxResultCount(this.paginator, event),
      skipCount: this.primengTableHelper.getSkipCount(this.paginator, event)
    })
    this._ReportServiceProxy.memberCostList(input)
      .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
      .subscribe(result => {
        console.log(result)
        this.primengTableHelper.totalRecordsCount = result.totalCount;
        this.primengTableHelper.records = result.items;
        // this.primengTableHelper.hideLoadingIndicator();
      })
  }


  showDetail(record) {
    this.MemberInfoModalComponent.show(record, this.startTime, this.endTime)
  }


  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }

  onTreeUpdate(originalArr) {
    var arr = originalArr.filter(item => {
      return item.type == 'store'
    })
    if (arr.length) {
      this.belongStore = arr[0].id;
    } else {
      this.belongStore = undefined;
    }
  }
  clickContainer() {
    if (this.highTree && this.highTree.showStore) {
      this.highTree.clickInput()
    }
  }
}
