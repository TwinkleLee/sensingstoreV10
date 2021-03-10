import { Component, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Router } from '@angular/router';
import { CreateOrEditBuildingModalComponent } from './building-modal.component';

import { BuildingServiceProxy } from '@shared/service-proxies/service-proxies-floor';

@Component({
  templateUrl: './building.component.html',
  animations: [appModuleAnimation()]
})
export class BuildingComponent extends AppComponentBase {

  @ViewChild('buildingModal', { static: true }) buildingModal: CreateOrEditBuildingModalComponent;
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;


  filterText = "";
  selectedList = [];

  constructor(injector: Injector,
    private router: Router,
    private _BuildingServiceProxy: BuildingServiceProxy,
  ) {
    super(injector);
  }


  //获取列表
  getList(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.selectedList = [];
    this.primengTableHelper.showLoadingIndicator();
    this._BuildingServiceProxy.getBuildings(
      this.filterText,
      this.primengTableHelper.getSorting(this.dataTable),
      this.primengTableHelper.getMaxResultCount(this.paginator, event),
      this.primengTableHelper.getSkipCount(this.paginator, event)
    )
      .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
      .subscribe(result => {
        this.primengTableHelper.totalRecordsCount = result.totalCount;
        this.primengTableHelper.records = result.items;
      })
  }
  //创建
  createItem() {
    this.buildingModal.show();
  }
  //修改
  editItem(record) {
    this.buildingModal.show(Object.assign({}, record))
  }

  //删除
  deleteItem(record) {
    this.message.confirm(this.l('deletethisselected'), this.l('AreYouSure'), (r) => {
      if (r) {
        this.primengTableHelper.showLoadingIndicator();
        this._BuildingServiceProxy.deleteBuilding(record.id)
          .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
          .subscribe(result => {
            this.selectedList = [];
            this.notify.info(this.l('success'));
            this.getList();
          })
      }
    })
  }

  deleteBatch() {
    var ids = this.selectedList.map(({ id }) => id);
    this.message.confirm(this.l('deletethisselected'), this.l('AreYouSure'), (r) => {
      if (r) {
        this.primengTableHelper.showLoadingIndicator();

        this._BuildingServiceProxy.batchDeleteBuildings(ids)
          .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
          .subscribe(result => {
            this.selectedList = [];
            this.notify.info(this.l('success'));
            this.getList();
          })
      }
    })
  }

  goFloor(record) {
    this.router.navigate(['app', 'admin','floor', 'floor'], { queryParams: { buildingId: record.id } });
  }


  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }

}
