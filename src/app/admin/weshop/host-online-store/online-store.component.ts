import { Component, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { HostOnlineStoreModalComponent } from './create-or-edit-onlineStore-modal.component';
import { ExternalAccessServiceProxy } from '@shared/service-proxies/service-proxies';

@Component({
  templateUrl: './online-store.component.html',
  animations: [appModuleAnimation()]
})
export class HostOnlineStoreComponent extends AppComponentBase {

  @ViewChild('hostOnlineStoreModal',{static:true}) hostOnlineStoreModal: HostOnlineStoreModalComponent;
  @ViewChild('dataTable',{static:true}) dataTable: Table;
  @ViewChild('paginator',{static:true}) paginator: Paginator;
  filterText: string;
  constructor(injector: Injector,
    private _ExternalAccessServiceProxy:ExternalAccessServiceProxy
  ) {
    super(injector);

  }
  //创建
  create() {
    this.hostOnlineStoreModal.show();
  }

  //获取
  getShopsForHost(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.primengTableHelper.showLoadingIndicator();
    this._ExternalAccessServiceProxy.getShopsForHost(
      this.filterText,
      this.primengTableHelper.getSorting(this.dataTable),
      this.primengTableHelper.getMaxResultCount(this.paginator, event),
      this.primengTableHelper.getSkipCount(this.paginator, event)
    )
    .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
    .subscribe(result => {
      console.log(result.items);
      this.primengTableHelper.totalRecordsCount = result.totalCount;
      this.primengTableHelper.records = result.items;
      // this.primengTableHelper.hideLoadingIndicator();
    })
  }
  //修改
  editShop(record) {
    this.hostOnlineStoreModal.show(Object.assign({}, record))
  }


  //删除
  deleteShop(record) {
    this.message.confirm(this.l('confirmDelete'),this.l('AreYouSure'), (r) => {
      console.log(record)
      if (r) {
        this._ExternalAccessServiceProxy.deleteShopForHost(record.tenantId, record.id).subscribe(result => {
          this.notify.info(this.l('success'));
          this.getShopsForHost();
        })
      }
    })
  }




  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }

}
