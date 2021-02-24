import { Component, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Router, ActivatedRoute } from '@angular/router';
import { IndependentDeploymentServiceProxy } from '@shared/service-proxies/service-proxies';

import { CreateOrEditSiteModalComponent } from './site-modal.component'


@Component({
  templateUrl: './site.component.html',
  animations: [appModuleAnimation()]

})
export class SiteComponent extends AppComponentBase {

  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;
  @ViewChild('aSiteModal', { static: true }) aSiteModal: CreateOrEditSiteModalComponent;


  filterText = "";
  id: any = "";
  selectedList = [];

  constructor(injector: Injector,
    private router: Router,
    private _activatedRoute: ActivatedRoute,
    private _IndependentDeploymentService: IndependentDeploymentServiceProxy
  ) { 
    super(injector);
    this._activatedRoute.params.subscribe(data => this.id = data.id)
  }

  getList(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.selectedList = [];

    this.primengTableHelper.showLoadingIndicator();
    this._IndependentDeploymentService.getSingleIndependentDeployment(
      this.id,
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

  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }

  //删除
  deleteItem(record) {
    this.message.confirm(this.l('deletethisselected'), this.l('AreYouSure'), (r) => {
      if (r) {
        this.primengTableHelper.showLoadingIndicator();
        this._IndependentDeploymentService.deleteIndependentDeploymentInfo(record.id)
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

        this._IndependentDeploymentService.batchDeleteIndependentDeploymentInfos(ids)
          .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
          .subscribe(result => {
            this.selectedList = [];
            this.notify.info(this.l('success'));
            this.getList();
          })
      }
    })
  }

  // 查看租户列表
  goTenancy(record) {
    this.router.navigate(['app', 'deployment', 'site', this.id, 'tenancy', record.id])
  }

  goBack() {
    this.router.navigate(['app', 'deployment', 'deployment'])
  }

  // 添加
  createItem() {
    this.aSiteModal.show()
  }

  // 编辑
  editItem(record) {
    this.aSiteModal.show(Object.assign({}, record))
  }

}
