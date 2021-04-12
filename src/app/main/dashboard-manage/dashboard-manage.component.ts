import { Component, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { CreateOrEditDashboardManageModalComponent } from '@app/main/dashboard-manage/create-or-edit-dashboard-manage-modal.component';
import { Router, ActivatedRoute } from '@angular/router';

import { CustomizeReportServiceProxy } from '@shared/service-proxies/service-proxies-smartdevice';
import { TenantServiceProxy } from '@shared/service-proxies/service-proxies';
import * as _ from 'lodash';

@Component({
  templateUrl: './dashboard-manage.component.html',
  animations: [appModuleAnimation()]
})
export class DashboardManageComponent extends AppComponentBase {

  @ViewChild('dashboardManageModal',{static:true}) dashboardManageModal: CreateOrEditDashboardManageModalComponent;
  @ViewChild('dataTable',{static:true}) dataTable: Table;
  @ViewChild('paginator',{static:true}) paginator: Paginator;

  filterText = "";
  tenantId: any = "";
  templateId: any = "";
  tenantList: any = [];
  templateList: any = [];
  reportType: any = "";
  constructor(injector: Injector,
    private _CustomizeReportServiceProxy: CustomizeReportServiceProxy,
    private router: Router,
    private _TenantServiceProxy: TenantServiceProxy
  ) {
    super(injector);
    this._TenantServiceProxy.getTenants(
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      999,
      0
    ).subscribe(result => {
      this.tenantList = result.items;
      this.dashboardManageModal.tenantList = this.tenantList;
      this.getDashboardTanant();
    });

    this._CustomizeReportServiceProxy.getReportTemplates(
      void 0,
      void 0,
      999,
      0
    ).subscribe(result => {
      this.templateList = result.items;
      this.dashboardManageModal.templateList = this.templateList;
    })


  }

  goTemplate() {
    this.router.navigate(['app', 'main', 'dashboardManage', 'dashboardTemplate']);
  }

  //创建
  createItem() {
    this.dashboardManageModal.show();
  }

  //获取列表
  getList(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }

    this.primengTableHelper.showLoadingIndicator();
    this._CustomizeReportServiceProxy.getReports(
      this.tenantId,
      this.templateId,
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
      this.getDashboardTanant();
    })
  }

  getDashboardTanant() {
    if (!this.primengTableHelper.records) return
    this.primengTableHelper.records.forEach(record => {
      this.tenantList.forEach(tenant => {
        if (record.tenantId == tenant.id) {
          record.tenantName = tenant.name;
        }
      })
    })
  }

  //修改
  editItem(record) {
    this._CustomizeReportServiceProxy.getReportDetailById(record.id).subscribe(r => {
      this.dashboardManageModal.show(_.cloneDeep(r));
    })
  }


  //删除
  deleteItem(record) {
    this.message.confirm(this.l('deletethisselected'),this.l('AreYouSure'), (r) => {
      if (r) {
        this._CustomizeReportServiceProxy.deleteReportByIds([record.id]).subscribe(result => {
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
