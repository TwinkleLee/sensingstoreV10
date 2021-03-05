import { Component, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { CreateOrEditDashboardTemplateModalComponent } from '@app/main/dashboard-template/create-or-edit-dashboard-template-modal.component';
import { Router, ActivatedRoute } from '@angular/router';

import { ReportServiceProxy } from '@shared/service-proxies/service-proxies-cargo';

@Component({
  templateUrl: './dashboard-template.component.html',
  animations: [appModuleAnimation()]
})
export class DashboardTemplateComponent extends AppComponentBase {

  @ViewChild('dashboardTemplateModal',{static:true}) dashboardTemplateModal: CreateOrEditDashboardTemplateModalComponent;
  @ViewChild('dataTable',{static:true}) dataTable: Table;
  @ViewChild('paginator',{static:true}) paginator: Paginator;

  filterText = "";
  constructor(injector: Injector,
    private _ReportServiceProxy: ReportServiceProxy,
    private router: Router,
  ) {
    super(injector);

  }

  goBack(){
    this.router.navigate(['app', 'main', 'dashboardManage']);
  }

  //创建
  createItem() {
    this.dashboardTemplateModal.show();
  }

  //获取列表
  getList(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }

    this.primengTableHelper.showLoadingIndicator();
    this._ReportServiceProxy.getReportTemplates(
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
  //修改
  editItem(record) {
    this.dashboardTemplateModal.show(Object.assign({}, record))
  }


  //删除
  deleteItem(record) {
    this.message.confirm(this.l('deletethisselected'),this.l('AreYouSure'), (r) => {
      if (r) {
        this._ReportServiceProxy.deleteReportTemplateByIds([record.id]).subscribe(result => {
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
