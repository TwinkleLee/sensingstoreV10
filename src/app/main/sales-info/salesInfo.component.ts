import { Component, Injector, ViewChild, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { ReportServiceProxy, SkuSaleListInput } from '@shared/service-proxies/service-proxies2';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { SalesInfoModalComponent } from '@app/main/sales-info/salesInfo-modal.component';
import { AppConsts } from '@shared/AppConsts';


@Component({
  selector: 'app-sales-info',
  templateUrl: './salesInfo.component.html',
  animations: [appModuleAnimation()]
})

export class SalesInfoComponent extends AppComponentBase implements OnInit {

  @ViewChild('SalesInfoModalComponent',{static:true}) SalesInfoModalComponent: SalesInfoModalComponent;
  @ViewChild('dataTable',{static:false}) dataTable: Table;
  @ViewChild('paginator',{static:false}) paginator: Paginator;
  filterText: string;
  skuId;
  totalSale;

  startTime: any = moment().utc().subtract(29, 'days').startOf('day');
  endTime: any = moment().utc().endOf('day');
  exportLoading;

  constructor(injector: Injector,
    private router: Router,
    private _ReportServiceProxy: ReportServiceProxy
  ) {
    super(injector);
  }

  ngOnInit() {
    setTimeout(() => {
      // this.dataTable.sortField = "number"
      // this.dataTable.sortOrder = -1;
    })

    setTimeout(() => {
      this.getSalesInfo()
    }, 100)
  }

  changePage() {
    console.log(123);
    this.router.navigate(['app', 'main', 'salesinfo', 'member']);
  }
  goExport() {
    this.exportLoading = true;

    this._ReportServiceProxy.getSkuSaleListToExcel(
      this.filterText,
      undefined,
      undefined,
      [],
      this.startTime ? moment(this.startTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h') : undefined,
      this.endTime ? moment(this.endTime.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's') : undefined,
      this.primengTableHelper.getSorting(this.dataTable) || 'number DESC',
      this.primengTableHelper.getMaxResultCount(this.paginator, undefined),
      this.primengTableHelper.getSkipCount(this.paginator, undefined)
    ).subscribe(r => {
      setTimeout(() => {
        this.exportLoading = false;
      }, 2000)
      var href = `https://o.api.troncell.com/api/File/DownloadTempFile?FileName=` + r.fileName + `&FileType=` + r.fileType + `&FileToken=` + r.fileToken;
      var link = document.getElementById('aaa');
      $(link).attr("href", href);
      link.click();
    })
  }
  getSalesInfo(event?: LazyLoadEvent) {
    console.log('abcd tttt')
    // if (this.primengTableHelper.shouldResetPaging(event)) {
    //   this.paginator.changePage(0);
    //   return;
    // }
    this.primengTableHelper.showLoadingIndicator();

    var input = new SkuSaleListInput({
      filter: this.filterText,
      skuName: undefined,
      skuId: undefined,
      startTime: this.startTime ? moment(this.startTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h') : undefined,
      endTime: this.endTime ? moment(this.endTime.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's') : undefined,
      storeIds: [],
      sorting: this.primengTableHelper.getSorting(this.dataTable) || 'number DESC',
      maxResultCount: this.primengTableHelper.getMaxResultCount(this.paginator, event),
      skipCount: this.primengTableHelper.getSkipCount(this.paginator, event)
    })

    this._ReportServiceProxy.skuSaleList(input)
    .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
    .subscribe(result => {
      this.primengTableHelper.totalRecordsCount = result.totalCount;
      this.totalSale = result.totalSale;
      this.primengTableHelper.records = result.items;
      // this.primengTableHelper.hideLoadingIndicator();
    })

  }


  showDetail(record) {
    this.SalesInfoModalComponent.show(record, this.startTime, this.endTime)
  }

  //显示图片加载失败的占位图
  showEmpty(e) {
    var target = $(e.target);
    target.attr("src", AppConsts.appBaseUrl + "/assets/common/images/holderimg.png")
  }
  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }

}
