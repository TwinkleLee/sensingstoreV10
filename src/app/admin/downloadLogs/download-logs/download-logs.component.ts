import { Component, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { BackendDownloadTaskServiceProxy } from '@shared/service-proxies/service-proxies';

@Component({
  templateUrl: './download-logs.component.html',
  animations: [appModuleAnimation()]
})
export class DownloadLogsComponent extends AppComponentBase {

  @ViewChild('dataTable',{static:true}) dataTable: Table;
  @ViewChild('paginator',{static:true}) paginator: Paginator;
  filterText: string;
  TaskCheckedList: any = [];
  disableExcel = false;
  constructor(injector: Injector,
    private _BackendDownloadTaskServiceProxy: BackendDownloadTaskServiceProxy
  ) {
    super(injector);

  }

  downloadTask(record) {
    console.log(record)
    var link = document.getElementById('aaa');
    $(link).attr("href", record.downloadUrl);
    link.click();
    setTimeout(() => {
      this.disableExcel = false;
    }, 2500)
  }
  //获取
  getTaskList(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.TaskCheckedList = [];

    this.primengTableHelper.showLoadingIndicator();
    this._BackendDownloadTaskServiceProxy.getExportTask(
      undefined,
      this.filterText,
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


  //删除
  deleteTask(record) {
    this.message.confirm(this.l('DeletingResources'),this.l('AreYouSure'), (r) => {
      if (r) {
        this._BackendDownloadTaskServiceProxy.deleteExportTask([record.id]).subscribe(result => {
          this.notify.info(this.l('success'));
          this.getTaskList();
        })
      }
    })
  }


  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }

}
