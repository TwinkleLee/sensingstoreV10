import { Component, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';

import { OutputinDetailModalComponent } from '@app/admin/product/outputin/operation/outputin-detail-modal.component';
import { AddOutputinComponent } from '@app/admin/product/outputin/operation/add-outputin-modal.component';
import { Router, ActivatedRoute } from '@angular/router';

import { OutPutInStorageServiceProxy, GetOutPutInStorageBillInput } from '@shared/service-proxies/service-proxies';
import * as moment from 'moment';
import * as _ from 'lodash';


import { StoreServiceProxy as NewStoreServiceProxy} from '@shared/service-proxies/service-proxies-devicecenter';

@Component({
  templateUrl: './outputin.component.html',
  animations: [appModuleAnimation()]
})
export class OutPutInComponent extends AppComponentBase {

  @ViewChild('outputinDetailModal',{static:true}) outputinDetailModal: OutputinDetailModalComponent;
  @ViewChild('addOutputinModal',{static:true}) addOutputinModal: AddOutputinComponent;


  @ViewChild('dataTable',{static:true}) dataTable: Table;
  @ViewChild('paginator',{static:true}) paginator: Paginator;
  @ViewChild('highTree',{static:false}) highTree;

  startTime: any = moment().utc().subtract(29, 'days').startOf('day');
  endTime: any = moment().utc().endOf('day');
  filter: any = '';

  OutPutInStorageType: any = '';
  storeList: any = [];
  treeList: any = [];

  isTenant = false;
  ignoreStore = true;
  constructor(injector: Injector,
    private router: Router, private route: ActivatedRoute,
    private _OutPutInStorageServiceProxy: OutPutInStorageServiceProxy,
    private _NewStoreServiceProxy: NewStoreServiceProxy
  ) {
    super(injector);
    this._NewStoreServiceProxy.getCurrentTenantOrganizationUnitsAndStoresTree(false).subscribe((result) => {
      this.treeList = [result];
      if (this.treeList[0].type == 'tenant') {
        this.isTenant = true;
      }
    })
  }

  clickContainer() {
    if (this.highTree && this.highTree.showStore) {
      this.highTree.clickInput()
    }
  }

  onTreeUpdate(originalArr) {
    this.storeList = originalArr.filter(item => {
      return item.type == 'store'
    }).map(item => {
      return item.id
    })
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
    this._OutPutInStorageServiceProxy.getOutPutInStorageBills({
      storeId: this.storeList,
      ignoreStore: this.ignoreStore,
      startTime: StartTime ? StartTime : this.startTime,
      endTime: EndTime ? EndTime : this.endTime,
      outPutInStorageType: this.OutPutInStorageType,
      filter: this.filter,
      sorting: this.primengTableHelper.getSorting(this.dataTable),
      maxResultCount: this.primengTableHelper.getMaxResultCount(this.paginator, event),
      skipCount: this.primengTableHelper.getSkipCount(this.paginator, event)
    } as GetOutPutInStorageBillInput)
    .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
    .subscribe(result => {
      this.primengTableHelper.totalRecordsCount = result.totalCount;
      this.primengTableHelper.records = result.items;
      // this.primengTableHelper.hideLoadingIndicator();
    })
  }





  showDetail(record?) {
    if (record) {
      this.outputinDetailModal.show(record.id);
    } else {
      this.outputinDetailModal.show(undefined, undefined, this.storeList);
    }
  }

  OutQuantity() {
    this.addOutputinModal.show(0, _.cloneDeep(this.treeList));
  }
  InQuantity() {
    this.addOutputinModal.show(1, _.cloneDeep(this.treeList));
  }
  checkQuantity(){
    this.addOutputinModal.show(2, _.cloneDeep(this.treeList));
  }
  importQuantity(){
    this.router.navigate(['app', 'import', 'import', 'storagecheck']);
  }

  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }

}
