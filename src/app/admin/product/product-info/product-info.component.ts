import { Component, OnInit, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { appModuleAnimation } from '@shared/animations/routerTransition';
// import { CreateOrEditProInfoModalComponent } from '@app/product/product-info/';
import { PropertyServiceProxy } from '@shared/service-proxies/service-proxies';
import { PropertyAddComponent } from '@app/admin/product/product-info/property-add-modal.component';
import { Router, ActivatedRoute } from '@angular/router';
import { ConnectorService } from '@app/shared/services/connector.service';

@Component({
  selector: 'app-product-info',
  templateUrl: './product-info.component.html',
  styleUrls: ['./product-info.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})
export class ProductInfoComponent extends AppComponentBase {

  @ViewChild('propertyAddModal', { static: true }) propertyAddModal: PropertyAddComponent;
  // @ViewChild('editUserPermissionsModal') editPerPermissionsModal: EditPerPermissionsModalComponent;
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  filterText: string;

  constructor(injector: Injector,
    private router: Router,
    private route: ActivatedRoute,
    private connector: ConnectorService,
    private _propertyService: PropertyServiceProxy) {
    super(injector);
  }

  //获取商品属性列表
  getProductInfos(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.primengTableHelper.showLoadingIndicator();
    this._propertyService.gets(
      this.filterText,
      this.primengTableHelper.getSorting(this.dataTable) || 'name',
      this.primengTableHelper.getMaxResultCount(this.paginator, event),
      this.primengTableHelper.getSkipCount(this.paginator, event)
    )
      .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
      .subscribe(result => {
        this.primengTableHelper.totalRecordsCount = result.totalCount;
        this.primengTableHelper.records = result.items;
        // this.primengTableHelper.hideLoadingIndicator();
      });
  }
  //新增商品属性
  createProductInfo() {
    this.propertyAddModal.show();
  }
  //修改商品属性
  editProductInfo(record) {
    this.connector.setCache('property', Object.assign({}, record));
    this.router.navigate(['operation', record.id], { relativeTo: this.route });
  }
  //删除商品属性
  deleteProductInfo(record) {
    this.message.confirm(this.l("DeleteThisPropertyQuestion"), this.l('AreYouSure'), (r) => {
      if (r) {
        this._propertyService.delete(record.id).subscribe(result => {
          this.notify.info(this.l('success'));
          this.getProductInfos();
        })
      }
    })
  }
  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }
}
