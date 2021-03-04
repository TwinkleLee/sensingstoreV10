import { Component, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';

import { CreateOrEditPageModalComponent } from './create-or-edit-page-modal.component';

import { ApplicationServiceProxy } from '@shared/service-proxies/service-proxies-user';
import { OrganizationUnitServiceProxy } from '@shared/service-proxies/service-proxies';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './pageList.component.html',
  animations: [appModuleAnimation()]
})
export class PageListComponent extends AppComponentBase {

  @ViewChild('pageModal', { static: true }) pageModal: CreateOrEditPageModalComponent;
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;


  filterText = "";
  applicationName = "";
  applicationId;
  salespersonList = [];

  constructor(injector: Injector,
    private router: Router,
    private route: ActivatedRoute,
    private _ApplicationServiceProxy: ApplicationServiceProxy,
    private _OrganizationUnitServiceProxy:OrganizationUnitServiceProxy
  ) {
    super(injector);
    this.route.queryParams.subscribe(queryParams => {
      this.applicationName = queryParams.applicationName;
    })
    var urls = location.pathname.split('\/');
    this.applicationId = urls[urls.length - 1].split('?')[0];
    // console.log(this.applicationId)
    this.getSalespersonList();
  }

  goBack() {
    this.router.navigate(['app', 'admin','user', 'application']);
  }

  //创建
  createItem() {
    this.pageModal.show();
  }
  getSalespersonList(){
    this._OrganizationUnitServiceProxy.getOrganizationUnitUsersForSelect("销售组")
    .subscribe(result => {
      this.salespersonList = result;
    })
  }

  //获取列表
  getList(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }

    this.primengTableHelper.showLoadingIndicator();
    this._ApplicationServiceProxy.getApplicationPages(
      this.applicationId,
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
  //修改
  editItem(record) {
    this.pageModal.show(Object.assign({}, record))
  }


  //删除
  deleteItem(record) {
    this.message.confirm(this.l('deletethisselected'), this.l('AreYouSure'), (r) => {
      if (r) {
        this._ApplicationServiceProxy.batchDeletePages([record.id]).subscribe(result => {
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
