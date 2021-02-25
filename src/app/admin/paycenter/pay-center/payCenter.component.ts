import { Component, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';

import { CreateOrEditPayCenterModalComponent } from '@app/admin/paycenter/pay-center/create-or-edit-payCenter-modal.component';

import { PayCenterServiceProxy } from '@shared/service-proxies/service-proxies2';

@Component({
  templateUrl: './payCenter.component.html',
  animations: [appModuleAnimation()]
})
export class PayCenterComponent extends AppComponentBase {

  @ViewChild('payCenterModal',{static:true}) payCenterModal: CreateOrEditPayCenterModalComponent;
  @ViewChild('dataTable',{static:true}) dataTable: Table;
  @ViewChild('paginator',{static:true}) paginator: Paginator;
  constructor(injector: Injector,
    private _PayCenterServiceProxy: PayCenterServiceProxy,
  ) {
    super(injector);

  }

  //创建
  createItem() {
    this.payCenterModal.show();
  }

  //获取列表
  getList(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }

    this.primengTableHelper.showLoadingIndicator();
    this._PayCenterServiceProxy.getPayAccounts(
      undefined,
      undefined,
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
  //修改
  editItem(record) {
    this.payCenterModal.show(Object.assign({}, record))
  }


  //删除
  deleteItem(record) {
    this.message.confirm(this.l('deletethisselected'),this.l('AreYouSure'), (r) => {
      if (r) {
        this._PayCenterServiceProxy.deletePayAccount([record.id]).subscribe(result => {
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
