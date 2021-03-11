import { Component, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { TenantServiceProxy } from '@shared/service-proxies/service-proxies';
import { DeviceOperationsServiceProxy, GetDeviceOptInput, OperationKnowledgeServiceProxy } from '@shared/service-proxies/service-proxies3';

import * as moment from 'moment';
import { CreateOrEditDeviceRecordComponent } from '@app/admin/device/device-list/operation/create-or-edit-deviceRecord-modal.component'
import { ElementRef } from '@angular/core';

@Component({
  selector: 'app-maintain-info',
  templateUrl: './maintainInfo.component.html',
  animations: [appModuleAnimation()]
})
export class MaintainInfoComponent extends AppComponentBase {
  moment = moment;

  @ViewChild('dataTable',{static:true}) dataTable: Table;
  @ViewChild('paginator',{static:true}) paginator: Paginator;
  @ViewChild('createOrEditDeviceRecordModal',{static:true}) createOrEditDeviceRecordModal: CreateOrEditDeviceRecordComponent;


  filterText: string;
  selectedList: any = [];

  tenants: any = [];
  tenantId: any = "";
  questionTypeList: any = [];
  questionTypeId: any = "";

  statusSelect: any = "";
  StartTime: moment.Moment;
  EndTime: moment.Moment;

  exportLoading = false;
  constructor(injector: Injector,
    private _OperationsServiceProxy: DeviceOperationsServiceProxy,
    private _tenantService: TenantServiceProxy,
    private _QuestionCategoryServiceProxy: OperationKnowledgeServiceProxy,
  ) {
    super(injector);
    if (!this.appSession.tenant) {
      this._tenantService.getTenants("", undefined, undefined, undefined, undefined, 0, false, undefined, 1000, 0).subscribe(result => {
        this.tenants = result.items;
      })
      this.getCategories();
    }
  }

  getCategories() {
    this.questionTypeId = undefined;
    this._QuestionCategoryServiceProxy.getQuestionCategories(this.tenantId, undefined, undefined, 999, 0).subscribe(result => {
      this.questionTypeList = result.items;
    })
  }

  goImport() {
    this.exportLoading = true;
    this._OperationsServiceProxy.getOperationRecordsToExcel(
      undefined,
      this.StartTime,
      this.EndTime,
      this.statusSelect,
      this.tenantId,
      this.questionTypeId,
      undefined,
      this.filterText,
      this.primengTableHelper.getSorting(this.dataTable),
      undefined,
      0
    ).subscribe((result) => {
      console.log(result)
      setTimeout(() => {
        this.exportLoading = false;
      }, 2000)
      if(result){
        var link = document.getElementById('aaa');
        $(link).attr("href", result.excelDataUrl);
        link.click();
      }
    });
  }

  deleteRecordList() {
    var ids = this.selectedList.map((item) => {
      return item.id;
    });
    if (ids.length == 0) {
      return this.notify.info(this.l('atLeastChoseOneItem'));
    }
    this.message.confirm(this.l('DeleteThisDeviceRecord'),this.l('AreYouSure'), (r) => {
      if (r) {
        this._OperationsServiceProxy.deleteOperationRecords(ids).subscribe(() => {
          this.notify.success(this.l('success'));
          this.selectedList = [];
          this.getOperationsRecord();
        })
      }
    })
  }
  createRecord() {
    this.createOrEditDeviceRecordModal.tenants = this.tenants;
    this.createOrEditDeviceRecordModal.show();
  }

  editRecord(record) {
    this.createOrEditDeviceRecordModal.tenants = this.tenants;
    this.createOrEditDeviceRecordModal.show(record);
  }

  deleteRecord(record) {
    this.message.confirm(this.l("DeleteThisDeviceRecord"),this.l('AreYouSure'), (r) => {
      if (r) {
        this._OperationsServiceProxy.deleteOperationRecord(record.id).subscribe(() => {
          this.notify.info(this.l('success'));
          this.getOperationsRecord();
        })
      }
    })
  }
  getOperationsRecord(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.selectedList = [];


    this.primengTableHelper.showLoadingIndicator();
    console.log(this.primengTableHelper.getSorting(this.dataTable))
    this._OperationsServiceProxy.getOperationRecords(
      new GetDeviceOptInput({
        deviceId: undefined,
        startTime: this.StartTime,
        endTime: this.EndTime,
        optStatus:  this.statusSelect,
        tenantId:this.tenantId,
        categoryId:this.questionTypeId,
        optKnowledgeId:undefined,
        filter:this.filterText,
        sorting:this.primengTableHelper.getSorting(this.dataTable),
        maxResultCount:this.primengTableHelper.getMaxResultCount(this.paginator, event),
        skipCount:this.primengTableHelper.getSkipCount(this.paginator, event)
      }
      
      )
    )
    .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
    .subscribe((result) => {
      console.log(result.items)
      this.primengTableHelper.totalRecordsCount = result.totalCount;
      this.primengTableHelper.records = result.items;
      // this.primengTableHelper.hideLoadingIndicator();
    });
  }


  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }

}
