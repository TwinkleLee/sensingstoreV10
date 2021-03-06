import { Component, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { AppConsts } from '@shared/AppConsts';

import { TenantServiceProxy } from '@shared/service-proxies/service-proxies';
import { MyTreeComponent } from '@app/shared/common/my-tree/my-tree.component';

import { AppPodServiceProxy } from '@shared/service-proxies/service-proxies-devicecenter';
import { ApppodHistoryModalComponent } from '@app/admin/apppod/apppod/operation/apppod-history-modal.component';

@Component({
  selector: 'app-apppod',
  templateUrl: './apppod.component.html'
})
export class AppPodComponent extends AppComponentBase {

  @ViewChild('apppodHistoryModal', { static: true }) apppodHistoryModal: ApppodHistoryModalComponent;

  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  @ViewChild('myTree', { static: false }) myTree: MyTreeComponent;

  filterText: string;
  MetaCheckedList: any = [];
  tenants: any = [];
  toPublish = false;
  config: any = {
    'singleSelect': false,
    'showId': true,
    'name': 'name'
  };
  treeFilter;
  constructor(injector: Injector,
    private _tenantService: TenantServiceProxy,
    private _AppPodServiceProxy: AppPodServiceProxy
  ) {
    super(injector);
  }

  updateAll(record) {
    this.message.confirm(this.l('ifupdateAll'),this.l('AreYouSure'), (r) => {
      if (r) {
        console.log(record.id)
      }
    });
  }

  updateSome(record) {
    this.message.confirm(this.l('ifupdateSome'),this.l('AreYouSure'), (r) => {
      if (r) {
        console.log(record.id)
        if (!this.appSession.tenant) {
          this._tenantService.getTenants("", void 0, void 0, void 0, void 0, 0, false, void 0, 1000, 0).subscribe(result => {
            this.tenants = result.items;
            this.toPublish = true;

            console.log(this.tenants)
          })
        }

      }

    });
  }

  //筛选树
  filterTree(e?: Event) {
    e && e.preventDefault();
    this.myTree.filterTree(this.treeFilter);
  }

  doPublish() {

  }


  //获取
  getMetaPhysicsTypeList(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.MetaCheckedList = [];

    this.primengTableHelper.showLoadingIndicator();
    this._AppPodServiceProxy.getAppPods(
      this.filterText,
      this.primengTableHelper.getSorting(this.dataTable),
      this.primengTableHelper.getMaxResultCount(this.paginator, event),
      this.primengTableHelper.getSkipCount(this.paginator, event)
    )
    .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
    .subscribe(result => {
      console.log(result.items)
      this.primengTableHelper.totalRecordsCount = result.totalCount;
      this.primengTableHelper.records = result.items;
      // this.primengTableHelper.hideLoadingIndicator();
    })
  }
  //修改
  showDetail(record) {
    // this.createOrEditApppodModal.show(Object.assign({}, record))
    this.apppodHistoryModal.show(Object.assign({}, record))
  }


  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }

}
