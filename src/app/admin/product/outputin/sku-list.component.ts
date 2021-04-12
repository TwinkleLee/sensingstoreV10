import { Component, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { OutputinDetailModalComponent } from '@app/admin/product/outputin/operation/outputin-detail-modal.component';
import { OutPutInStorageServiceProxy } from '@shared/service-proxies/service-proxies-product';
import * as moment from 'moment';
import { Router, ActivatedRoute } from '@angular/router';
import { RfidListModalComponent } from '@app/admin/product/outputin/operation/rfid-list-modal.component';
import { CreateOrEditSkuRfidModalComponent } from '@app/admin/product/outputin/create-or-edit-skurfid-modal.component';



@Component({
  templateUrl: './sku-list.component.html',
  animations: [appModuleAnimation()]
})
export class SkuListComponent extends AppComponentBase {

  @ViewChild('outputinDetailModal', { static: true }) outputinDetailModal: OutputinDetailModalComponent;
  @ViewChild('rfidListModal', { static: true }) rfidListModal: RfidListModalComponent;
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;
  @ViewChild('highTree', { static: false }) highTree;
  @ViewChild('createOrEditSkuRfidModal',{static:true}) createOrEditSkuRfidModal: CreateOrEditSkuRfidModalComponent;

  filter: any = '';
  rfid: any = '';
  selectedStoreList: any = [];
  constructor(injector: Injector,
    private _OutPutInStorageServiceProxy: OutPutInStorageServiceProxy,
    private router: Router
  ) {
    super(injector);
    console.log('appSession', this.appSession);
  }

  clickContainer() {
    if (this.highTree && this.highTree.showStore) {
      this.highTree.clickInput()
    }
  }

  onTreeUpdate(originalArr) {
    this.selectedStoreList = originalArr.filter(item => {
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

    this.primengTableHelper.showLoadingIndicator();
    this._OutPutInStorageServiceProxy.getSkus(
      void 0,
      void 0,
      this.selectedStoreList,
      void 0,
      this.rfid,
      this.filter,
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


  showDetail(record) {
    this.outputinDetailModal.show(void 0, record.id);
  }

  showRfid(skuId?) {
    this.rfidListModal.show(skuId);
  }

  creteSkuRfid()
  {
    this.createOrEditSkuRfidModal.show();
  }

  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }


  goImport() {
    this.router.navigate(['app', 'admin','import', 'import', 'rfid']);
  }

}
