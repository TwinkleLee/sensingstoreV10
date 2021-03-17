import { Component, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { ToolBoxServiceProxy } from '@shared/service-proxies/service-proxies-pager';
import { CreateOrEditCustomComponentModalComponent } from '@app/admin/customComponent/custom-component/create-or-edit-customComponent-modal.component';

@Component({
  templateUrl: './custom-component.component.html',
  animations: [appModuleAnimation()]
})
export class CustomComponentComponent extends AppComponentBase {

  @ViewChild('createOrEditCustomComponentModal',{static:true}) CreateOrEditCustomComponentModal: CreateOrEditCustomComponentModalComponent;
  @ViewChild('dataTable',{static:true}) dataTable: Table;
  @ViewChild('paginator',{static:true}) paginator: Paginator;
  filterText: string;
  TaskCheckedList: any = [];
  disableExcel = false;
  constructor(injector: Injector,
    private _ToolBoxServiceProxy: ToolBoxServiceProxy
  ) {
    super(injector);
  }


  //获取
  getTaskList(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.TaskCheckedList = [];

    this.primengTableHelper.showLoadingIndicator();
    this._ToolBoxServiceProxy.getToolBoxs(
      undefined,
      this.filterText,
      // this.primengTableHelper.getSorting(this.dataTable),
      'orderNumber ASC',
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

  add() {
    this.CreateOrEditCustomComponentModal.show();
  }

  edit(record) {
    this.CreateOrEditCustomComponentModal.show(record);
  }
  //删除
  deleteTask(record) {
    this.message.confirm(this.l('DeletingResources'),this.l('AreYouSure'), (r) => {
      if (r) {
        this._ToolBoxServiceProxy.deleteToolBox([record.id]).subscribe(result => {
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
