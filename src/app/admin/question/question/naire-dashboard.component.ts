import { Component, OnInit, AfterViewInit, Injector, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import { finalize } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { UserPaperServiceProxy } from '@shared/service-proxies/service-proxies5';
import { ChartsComponent } from '@app/shared/charts/charts.component';
import { NaireDetailComponent } from './operation/naire-detail.component'


@Component({
  templateUrl: './naire-dashboard.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})
export class NaireDashboardComponent extends AppComponentBase {
  //查询
  StartTime: any = moment().utc().subtract(365, 'days').startOf('day');
  EndTime: any = moment().utc().endOf('day');
  tenantId = abp.session.tenantId;
  filter: string;
  filter2: string;
  UserCheckedList: any = [];
  VoteCheckedList: any = [];
  ComCheckedList: any = [];

  paperUsageType: any;


  naireId: any;
  naireName: any;
  exportLoading = false;

  @ViewChild('naireDetail', { static: true }) naireDetail: NaireDetailComponent;

  @ViewChild('UserDataTable', { static: false }) UserDataTable: Table;
  @ViewChild('UserPaginator', { static: false }) UserPaginator: Paginator;
  UserPrimeng: PrimengTableHelper = new PrimengTableHelper();

  @ViewChild("columnChart", { static: false }) columnChart: ChartsComponent;
  @ViewChild('VoteDataTable', { static: false }) VoteDataTable: Table;
  @ViewChild('VotePaginator', { static: false }) VotePaginator: Paginator;
  VotePrimeng: PrimengTableHelper = new PrimengTableHelper();

  @ViewChild('ComDataTable', { static: false }) ComDataTable: Table;
  @ViewChild('ComPaginator', { static: false }) ComPaginator: Paginator;
  ComPrimeng: PrimengTableHelper = new PrimengTableHelper();


  constructor(injector: Injector,
    private router: Router,
    private _activatedRoute: ActivatedRoute,
    private _UserPaperServiceProxy: UserPaperServiceProxy
  ) {
    super(injector);

    this._activatedRoute.queryParams.subscribe(queryParams => {
      this.naireId = queryParams.id;
      this.naireName = queryParams.name;
      this.paperUsageType = queryParams.paperUsageType;
    })
    console.log(this.paperUsageType)
  }


  ngAfterViewInit() {

  }


  goBack() {
    this.router.navigate(['app', 'admin','question', 'naire']);
  }

  GetUserPaperListToExcel() {
    this.UserPrimeng.showLoadingIndicator();

    this._UserPaperServiceProxy.getUserPaperListToExcel(
      this.StartTime ? moment(this.StartTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h') : void 0,
      this.EndTime ? moment(this.EndTime.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's') : void 0
    ).subscribe(r => {
      console.log("GetUserPaperListToExcel", r);
      this.UserPrimeng.hideLoadingIndicator();
      var href = `https://g5.api.troncell.com/api/File/DownloadTempFile?FileName=` + r.fileName + `&FileType=` + r.fileType + `&FileToken=` + r.fileToken;
      var link = document.getElementById('bbb');
      $(link).attr("href", href);
      link.click();
    })
  }

  /**
   * tab
   */

  export() {
    this.exportLoading = true;
    var StartTime = this.StartTime ? moment(this.StartTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h') : void 0;
    var EndTime = this.EndTime ? moment(this.EndTime.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's') : void 0;
    this._UserPaperServiceProxy.getPaperAnswerReportToExcel(
      this.naireId,
      void 0,
      void 0,
      StartTime,
      EndTime,
      this.filter,
      this.VotePrimeng.getSorting(this.VoteDataTable),
      999,
      0
    ).subscribe(r => {
      setTimeout(() => {
        this.exportLoading = false;
      }, 2000)
      var href = r;
      var link = document.getElementById('aaa');
      $(link).attr("href", href);
      link.click();
    })
  }

  getPaperAnswerReport(event?: LazyLoadEvent) {
    setTimeout(() => {
      if (this.VotePrimeng.shouldResetPaging(event)) {
        this.VotePaginator.changePage(0);
        return;
      }
      this.VoteCheckedList = [];
      var StartTime = this.StartTime ? moment(this.StartTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h') : void 0;
      var EndTime = this.EndTime ? moment(this.EndTime.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's') : void 0;
      this.VotePrimeng.showLoadingIndicator();
      this._UserPaperServiceProxy.getPaperAnswerReport(
        this.naireId,
        void 0,
        void 0,
        StartTime,
        EndTime,
        this.filter,
        this.VotePrimeng.getSorting(this.VoteDataTable),
        this.VotePrimeng.getMaxResultCount(this.VotePaginator, event),
        this.VotePrimeng.getSkipCount(this.VotePaginator, event)
      ).pipe(finalize(() => {
        this.VotePrimeng.hideLoadingIndicator();
      })).subscribe(result => {
        this.VotePrimeng.totalRecordsCount = result.totalCount;
        this.VotePrimeng.records = result.items;
        var data = [{
          chartItems: result.items.map(item => ({
            date: item.questionItemName,
            value: item.count
          }))
        }];

        this.columnChart.draw(data);

      });
    });
  }

  getUserPapers(event?: LazyLoadEvent) {
    setTimeout(() => {
      if (this.UserPrimeng.shouldResetPaging(event)) {
        this.UserPaginator.changePage(0);
        return;
      }
      this.UserCheckedList = [];

      var StartTime = this.StartTime ? moment(this.StartTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h') : void 0;
      var EndTime = this.EndTime ? moment(this.EndTime.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's') : void 0;
      this.UserPrimeng.showLoadingIndicator();

      this._UserPaperServiceProxy.getUserPapers(
        StartTime,
        EndTime,
        this.naireId,
        this.filter2,
        this.UserPrimeng.getSorting(this.UserDataTable),
        this.UserPrimeng.getMaxResultCount(this.UserPaginator, event) || 10,
        this.UserPrimeng.getSkipCount(this.UserPaginator, event)
      ).pipe(finalize(() => {
        this.UserPrimeng.hideLoadingIndicator();
      })).subscribe(result => {
        this.UserPrimeng.totalRecordsCount = result.totalCount;
        this.UserPrimeng.records = result.items;
      });
    })

  }


  getPaperAnswerCompetitionReport(event?: LazyLoadEvent) {
    setTimeout(() => {
      if (this.ComPrimeng.shouldResetPaging(event)) {
        this.ComPaginator.changePage(0);
        return;
      }
      this.ComCheckedList = [];

      var StartTime = this.StartTime ? moment(this.StartTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h') : void 0;
      var EndTime = this.EndTime ? moment(this.EndTime.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's') : void 0;
      this.ComPrimeng.showLoadingIndicator();
      this._UserPaperServiceProxy.getPaperAnswerCompetitionReport(
        this.naireId,
        void 0,
        void 0,
        StartTime,
        EndTime,
        this.filter2,
        this.ComPrimeng.getSorting(this.ComDataTable),
        this.ComPrimeng.getMaxResultCount(this.ComPaginator, event) || 10,
        this.ComPrimeng.getSkipCount(this.ComPaginator, event)
      ).pipe(finalize(() => {
        this.ComPrimeng.hideLoadingIndicator();
      })).subscribe(result => {
        this.ComPrimeng.totalRecordsCount = result.totalCount;
        this.ComPrimeng.records = result.items;
      });
    });
  }

  //转换序列
  transIndex(i, p, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(p, event);
  }

  goDetail(record) {
    this.naireDetail.show(record.id);
  }

}
