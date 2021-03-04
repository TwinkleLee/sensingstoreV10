import { Component, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Router, ActivatedRoute } from '@angular/router';
import { IndependentDeploymentServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditTenancyModalComponent } from './tenancy-modal.component';



@Component({
  templateUrl: './tenancy.component.html',
  animations: [appModuleAnimation()]

})
export class TenancyComponent extends AppComponentBase {

  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;
  @ViewChild('tenancyModal', { static: true }) tenancyModal: CreateOrEditTenancyModalComponent;


  filterText = "";
  id: any = ""; // 部署id
  selectedList = [];
  // 域名id
  sId: any = '';

  constructor(injector: Injector,
    private router: Router,
    private _activatedRoute: ActivatedRoute,
    private _IndependentDeploymentService: IndependentDeploymentServiceProxy
  ) { 
    super(injector);
    this._activatedRoute.params.subscribe(data => {
      this.id = data.id
      this.sId = data.sId
    })
  }

  getList(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.selectedList = [];

    this.primengTableHelper.showLoadingIndicator();
    this._IndependentDeploymentService.getSingleIndependentDeploymentInfo(
      this.sId,
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
  // deleteItem(record) {
  //   this.message.confirm(this.l('deletethisselected'), this.l('AreYouSure'), (r) => {
  //     if (r) {
  //       this.primengTableHelper.showLoadingIndicator();
  //       this._IndependentDeploymentService.deleteIndependentDeploymentInfo(record.id)
  //         .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
  //         .subscribe(result => {
  //           this.selectedList = [];
  //           this.notify.info(this.l('success'));
  //           this.getList();
  //         })
  //     }
  //   })
  // }

  deleteBatch() {
    var ids = this.selectedList.map(({ id }) => id);
    this.message.confirm(this.l('deletethisselected'), this.l('AreYouSure'), (r) => {
      if (r) {
        this.primengTableHelper.showLoadingIndicator();

        this._IndependentDeploymentService.batchDeleteDeployedTenant(ids)
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
  // goTenancy(record) {
  //   this.router.navigate(['app', 'deployment', 'tenancy', record.id])
  // }

  // 添加
  createItem() {
    this.tenancyModal.show()
  }

  // 编辑
  editItem(record) {
    this.tenancyModal.show(Object.assign({}, record))
  }

  goBack () {
    this.router.navigate(['app', 'admin','deployment', 'site', this.id])
  }

}
