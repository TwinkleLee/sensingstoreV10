import { Component, OnInit, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { ApplyServiceProxy, AuditApplyFormInput, ApplyStatus as AuditApplyFormInputApplyStatus } from '@shared/service-proxies/service-proxies';
import { AppConsts } from '@shared/AppConsts';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import { ProductDetailModalComponent } from '@app/admin/product/product-review/detail/product-detail-modal.component';

@Component({
  selector: 'app-product-review',
  templateUrl: './product-review.component.html',
  styleUrls: ['./product-review.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})
export class ProductReviewComponent extends AppComponentBase {
  @ViewChild('dataTable1', { static: true }) dataTable1: Table;
  @ViewChild('paginator1', { static: true }) paginator1: Paginator;
  @ViewChild('dataTable2', { static: true }) dataTable2: Table;
  @ViewChild('paginator2', { static: true }) paginator2: Paginator;
  @ViewChild('productDetailModal', { static: true }) productDetailModal: ProductDetailModalComponent;

  primengTableHelper2 = new PrimengTableHelper();

  //审核
  apply: AuditApplyFormInput = new AuditApplyFormInput();
  AuditApplyFormInputApplyStatus = AuditApplyFormInputApplyStatus;

  startTime;
  endTime;
  filterText1: string;
  filterText2: string;
  constructor(injector: Injector,
    private _applyService: ApplyServiceProxy) {
    super(injector);
  }

  //获取授权列表
  getApplyForms(event?: LazyLoadEvent, f?) {
    var dataTable = f ? this.dataTable1 : this.dataTable2,
      paginator = f ? this.paginator1 : this.paginator2,
      filterText = f ? this.filterText1 : this.filterText2,
      applyStatus = f ? 'Applied' : 'Cancel,Accepted,Rejected',
      primengTableHelper = f ? this.primengTableHelper : this.primengTableHelper2;
    if (primengTableHelper.shouldResetPaging(event)) {
      paginator.changePage(0);
      return;
    }
    primengTableHelper.showLoadingIndicator();
    this._applyService.getApplyForms(
      'Product',
      applyStatus,
      this.startTime,
      this.endTime,
      filterText,
      primengTableHelper.getSorting(dataTable) || 'creationTime',
      primengTableHelper.getMaxResultCount(paginator, event),
      primengTableHelper.getSkipCount(paginator, event)
    )
      .pipe(this.myFinalize(() => { primengTableHelper.hideLoadingIndicator(); }))
      .subscribe(result => {
        primengTableHelper.totalRecordsCount = result.totalCount;
        primengTableHelper.records = result.items;
        // primengTableHelper.hideLoadingIndicator();
      });
  }
  //转换序列
  transIndex(i, event?: LazyLoadEvent, f?) {
    var paginator = f ? this.paginator1 : this.paginator2,
      primengTableHelper = f ? this.primengTableHelper : this.primengTableHelper2;
    return i + 1 + primengTableHelper.getSkipCount(paginator, event);
  }
  //转换图片路径
  transfileUrl(fileUrl) {
    var url;
    if (!fileUrl) {
      url = './assets/common/images/holderimg.png';
    } else if (fileUrl.indexOf('http:') > -1 || fileUrl.indexOf('https:') > -1 || fileUrl.indexOf('data:') > -1) {
      url = fileUrl;
    } else {
      url = AppConsts.remoteServiceBaseUrl + '\\' + fileUrl;
    }
    return url;
  }
  //回复审核
  //取消
  no() {
    $("#review").hide();
  }
  //确定
  ok() {
    var input = new AuditApplyFormInput(this.apply);
    this._applyService.audit(input).subscribe((result) => {
      this.notify.info(this.l('success'));
      this.getApplyForms(null, true);
      this.getApplyForms(null, false);
      $("#review").hide();
    })
  }
  //查看详情
  goDetail(record) {
    this.productDetailModal.show(record.id);
  }
  //通过
  agree(record) {
    var input = new AuditApplyFormInput({
      'applyFormId': record.id,
      'applyStatus': this.AuditApplyFormInputApplyStatus.Accepted,
      'resultMessage': ''
    });
    this._applyService.audit(input).subscribe((result) => {
      this.notify.info(this.l('success'));
      this.getApplyForms(null, true);
    })
  }
  //拒绝
  disagree(record) {
    $("#review").show();
    this.apply = new AuditApplyFormInput({
      'applyFormId': record.id,
      'applyStatus': this.AuditApplyFormInputApplyStatus.Rejected,
      'resultMessage': ''
    });
  }
  //撤回
  withdraw(record) {
    var input = new AuditApplyFormInput({
      'applyFormId': record.id,
      'applyStatus': this.AuditApplyFormInputApplyStatus.Cancel,
      'resultMessage': ''
    });
    this._applyService.audit(input).subscribe((result) => {
      this.notify.info(this.l('success'));
      this.getApplyForms(null, true);
    })
  }
}

