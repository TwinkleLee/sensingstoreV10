import { Component, OnInit, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/components/common/lazyloadevent';
import { Table } from 'primeng/components/table/table';
import { Paginator } from 'primeng/components/paginator/paginator';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppConsts } from '@shared/AppConsts';
import { Router, ActivatedRoute } from '@angular/router';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import { DateRangePickerComponent } from '@app/shared/common/timing/date-range-picker.component';
import { ChartsComponent } from '@app/shared/charts/charts.component';
import * as moment from 'moment';
import { ActivityServiceProxy, ClearActivityUserDataInput, DoClearActivityDataInput, ReportServiceProxy as ActivityReportServiceProxy, UserActionServiceProxy } from '@shared/service-proxies/service-proxies5';
import { PlayerDataDetailComponent } from '@app/activity/player-data/detail/player-data-detail.component';
import { ChangeWhiteListModalComponent } from '@app/activity/activity/data/operation/change-white-list.component';
import { ExpressDetailModalComponent } from '@app/activity/activity/data/operation/express-detail.component';


@Component({
  selector: 'activity-data',
  templateUrl: './activity-data.component.html',
  styleUrls: ['./activity-data.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})
export class ActivityDataComponent extends AppComponentBase {

  @ViewChild("dataChartDiv", { static: true }) dataChart: ChartsComponent;

  @ViewChild("chart3", { static: true }) activityChart: ChartsComponent;



  @ViewChild("statisticDateranger", { static: true }) statisticDateranger: DateRangePickerComponent;
  @ViewChild("playerDateranger", { static: true }) playerDateranger: DateRangePickerComponent;
  @ViewChild("userDateranger", { static: true }) userDateranger: DateRangePickerComponent;


  @ViewChild('whitelistDataTable', { static: true }) dataTable2: Table;//活动数据
  @ViewChild('whitelistPaginator', { static: true }) paginator2: Paginator;
  WhitelistPrimeng: PrimengTableHelper = new PrimengTableHelper();
  @ViewChild('playerDataDetailModal', { static: true }) playerDataDetailModal: PlayerDataDetailComponent;

  @ViewChild('changeWhiteListModal', { static: true }) ChangeWhiteListModalComponent: ChangeWhiteListModalComponent;
  @ViewChild('expressDetailModal', { static: true }) ExpressDetailModalComponent: ExpressDetailModalComponent;




  @ViewChild('winnerDataTable', { static: true }) dataTable3: Table;
  @ViewChild('winnerPaginator', { static: true }) paginator3: Paginator;
  WinnerPrimeng: PrimengTableHelper = new PrimengTableHelper();


  @ViewChild('userDataTable', { static: true }) dataTable: Table;
  @ViewChild('userPaginator', { static: true }) paginator: Paginator;
  UserPrimeng: PrimengTableHelper = new PrimengTableHelper();

  @ViewChild('registerDataTable', { static: true }) dataTable4: Table;
  @ViewChild('registerPaginator', { static: true }) paginator4: Paginator;
  RegisterPrimeng: PrimengTableHelper = new PrimengTableHelper();


  //数据统计
  dataChartLoading = false;
  activityData: any = {};



  activityGameId: any = "";
  activityGameList = [];

  changeViewType(a) {

  }
  getChartData() {
    this.dataChartLoading = true;

    this.dataChartLoading = false;
    if (!this.dataChart.dataSets || this.dataChart.dataSets.length == 0) {
      var data = [{
        'title': this.l('deviceProductClick'),
        'chartItems': [{
          "date": moment(new Date()).format("yyyy/MM/DD").toString(),
          "value": 0
        }]
      }, {
        'title': this.l('productClickTopTen'),
        'chartItems': [{
          "date": moment(new Date()).format("yyyy/MM/DD").toString(),
          "value": 0
        }]
      }];

      this.dataChart.draw(data);
    }

  }

  filterText;
  startTime = moment().utc().subtract(30, 'days').startOf('day');
  endTime = moment().utc().endOf('day');

  selectList = [];

  startDate3: moment.Moment = moment().utc().subtract(30, 'days').startOf('day');
  endDate3: moment.Moment = moment().utc().endOf('day');
  activityLoading = false;
  activityId;
  deviceId;
  test = true;

  saving = false;
  StartTime = moment().utc().subtract(30, 'days').startOf('day');
  EndTime = moment().utc().endOf('day');
  treeFilter: string = "";
  toPublish;
  operateAll;
  auditStatus: any = '';
  publishType = 'add';
  deviceTree: any[] = [];
  Personality: any = {};
  activityName;
  busy = false;
  showRestore = false;
  RestoreSet: any = {
    isClearAction: false,
    isClearUserData: false,
    isClearAward: false
  }
  restoreBusy = false;

  StartTime2 = moment().utc().subtract(30, 'days').startOf('day');
  EndTime2 = moment().utc().endOf('day');
  constructor(injector: Injector,
    private router: Router,
    private _activatedRoute: ActivatedRoute,

    private _ActivityReportServiceProxy: ActivityReportServiceProxy,
    private _ActivityServiceProxy: ActivityServiceProxy,
    private _UserActionServiceProxy: UserActionServiceProxy
  ) {
    super(injector);
    this._activatedRoute.queryParams.subscribe(queryParams => {
      this.activityId = queryParams.id;
      this.activityName = queryParams.name;
      this.deviceId = queryParams.deviceId;
      console.log(this.activityId)
      console.log(this.deviceId)
    })
    this._ActivityServiceProxy.getActivityGameForSelectByActivityId(
      this.activityId,
      undefined,
      undefined,
      999,
      0
    ).subscribe(r => {
      console.log(r);
      this.activityGameList = r;

    })

  }


  ngAfterViewChecked(): void {
    $('tabset ul.nav').addClass('m-tabs-line');
    $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
  }

  ngOnInit() {
    this.drawActivityChart();
    this.getUserData()
    $(document).on("click", this.showRestoreBind);

  }

  ngOnDestroy() {
    $(document).off("click", this.showRestoreBind);
  }

  showRestoreBind = function (e) {
    var target = e.target;
    if (!$(target).hasClass("belongToRestore")) {
      this.showRestore = false;
    }
  }.bind(this);


  clearData() {
    if (this.RestoreSet.isClearAction || this.RestoreSet.isClearUserData || this.RestoreSet.isClearAward) {
      this.showRestore = false;
      this.message.confirm(this.l("ClearData"), this.l('AreYouSure'), (r) => {
        this.restoreBusy = true;
        this.RestoreSet.activityId = this.activityId;
        this._ActivityServiceProxy.clearActivityData(new DoClearActivityDataInput(this.RestoreSet)).subscribe(r => {
          this.notify.info(this.l('success'));
          this.restoreBusy = false;
          this.getPlayerData();
          this.getRegisterUser();
          this.drawActivityChart();
          this.getActivityAwardUser();
        })
      })
    } else {
      this.message.warn(this.l('atLeastChoseOneItem'));
      return
    }

  }

  expressDetail(record) {
    this.ExpressDetailModalComponent.show(record);
  }
  addToWhiteList(record) {
    this.ChangeWhiteListModalComponent.show(record, 0);
  }

  addToBlackList(record) {
    this.ChangeWhiteListModalComponent.show(record, 1);
  }

  goDetail(record) {
    this.playerDataDetailModal.show(record);
  }

  getPlayerData(event?) {
    console.log("互动记录的skipCount", this.WhitelistPrimeng.getSkipCount(this.paginator2, event))
    this.WhitelistPrimeng.showLoadingIndicator();
    this._UserActionServiceProxy.getUserActions(
      undefined,
      this.activityId,
      undefined,
      this.deviceId,
      this.activityGameId,
      this.StartTime,
      this.EndTime,
      undefined,
      this.filterText,
      this.WhitelistPrimeng.getSorting(this.dataTable2),
      this.WhitelistPrimeng.getMaxResultCount(this.paginator2, event),
      this.WhitelistPrimeng.getSkipCount(this.paginator2, event)
    )
      .pipe(this.myFinalize(() => { this.WhitelistPrimeng.hideLoadingIndicator(); }))
      .subscribe(result => {
        console.log(result)
        this.WhitelistPrimeng.totalRecordsCount = result.totalCount;
        this.WhitelistPrimeng.records = result.items;
      })
  }

  ClearUserActivityData(record) {
    this.message.confirm(this.l("ClearData"), this.l('AreYouSure'), (r) => {
      if (r) {
        this.UserPrimeng.showLoadingIndicator();
        this._ActivityServiceProxy.clearUserActivityData(new ClearActivityUserDataInput({
          "activityId": this.activityId,
          "snsUserInfoId": record.id
        })).subscribe(r => {
          this.notify.info(this.l('success'));
          this.getUserData(undefined);
        })
      }
    })
  }
  ClearUserAwardData(record) {
    this.message.confirm(this.l("ClearData"), this.l('AreYouSure'), (r) => {
      if (r) {
        this.UserPrimeng.showLoadingIndicator();
        this._ActivityServiceProxy.deleteActivityAward([record.id]).subscribe(r => {
          this.notify.info(this.l('success'));
          this.getActivityAwardUser(undefined);
        })
      }
    })
  }
  getUserData(event?) {
    this.UserPrimeng.showLoadingIndicator();
    this._UserActionServiceProxy.getUsersAndActionsSum(
      undefined,
      this.activityId,
      undefined,
      this.deviceId,
      this.activityGameId,
      this.StartTime2,
      this.EndTime2,
      undefined,
      this.filterText,
      this.UserPrimeng.getSorting(this.dataTable),
      this.UserPrimeng.getMaxResultCount(this.paginator, event) || 10,
      this.UserPrimeng.getSkipCount(this.paginator, event)
    )
      .pipe(this.myFinalize(() => { this.UserPrimeng.hideLoadingIndicator(); }))
      .subscribe(r => {
        console.log(r)
        this.UserPrimeng.totalRecordsCount = r.totalCount;
        this.UserPrimeng.records = r.items;
      })
  }

  getRegisterUser() {
    this.RegisterPrimeng.showLoadingIndicator();
    this._ActivityServiceProxy.getActivityUserDatas(
      this.activityId,
      this.deviceId,
      this.filterText,
      this.RegisterPrimeng.getSorting(this.dataTable4),
      this.RegisterPrimeng.getMaxResultCount(this.paginator4, undefined),
      this.RegisterPrimeng.getSkipCount(this.paginator4, undefined)
    )
      .pipe(this.myFinalize(() => { this.RegisterPrimeng.hideLoadingIndicator(); }))
      .subscribe(r => {
        console.log(r)
        this.RegisterPrimeng.totalRecordsCount = r.totalCount;
        this.RegisterPrimeng.records = r.items;
      })
  }

  goValidate(record) {
    console.log(record.id)
    this._ActivityServiceProxy.validateActivityUserDatas(
      [record.id],
      true
    ).subscribe(r => {
      this.notify.info(this.l('success'));
      this.getRegisterUser()
    })
  }
  cancelValidate(record) {
    this._ActivityServiceProxy.validateActivityUserDatas(
      [record.id],
      false
    ).subscribe(r => {
      this.notify.info(this.l('success'));
      this.getRegisterUser()
    })
  }
  drawActivityChart() {
    this._ActivityReportServiceProxy.getTotal(
      this.startDate3,
      this.endDate3,
      this.activityId,
      this.deviceId,
      undefined,
      this.activityGameId,
      undefined
    ).subscribe(r => {
      this.activityData = r;
    })
    this.activityLoading = true;
    this._ActivityReportServiceProxy.getActivityLabelChartReport(
      'fans,like,view,share,Interactive',
      'dd',
      this.startDate3,
      this.endDate3,
      this.activityId,
      this.deviceId,
      undefined,
      this.activityGameId,
      undefined
    ).subscribe(r => {
      this.activityLoading = false;
      console.log(r)
      this.activityChart.draw(r);
    })
  }

  getActivityAwardUser(event?: LazyLoadEvent) {
    this.WinnerPrimeng.showLoadingIndicator();
    this._ActivityServiceProxy.getActivityAwardUser(
      this.activityId,
      this.deviceId,
      this.activityGameId,
      undefined,
      this.WinnerPrimeng.getSorting(this.dataTable3) || 'name',
      this.WinnerPrimeng.getMaxResultCount(this.paginator3, event),
      this.WinnerPrimeng.getSkipCount(this.paginator3, event)
    )
      .pipe(this.myFinalize(() => { this.WinnerPrimeng.hideLoadingIndicator(); }))
      .subscribe(r => {
        this.WinnerPrimeng.totalRecordsCount = r.totalCount;
        this.WinnerPrimeng.records = r.items;
        this.WinnerPrimeng.hideLoadingIndicator();
      })
  }

  //返回
  goBack() {
    if (this.deviceId) {
      this.router.navigate(['app', 'device', 'deviceList', 'operation', this.deviceId], { queryParams: { initTab: 'activity' } });
    } else {
      this.router.navigate(['app', 'activity', 'activity']);
    }
  }
  changeSetup(e) {
    this.router.navigate(['app', 'activity', 'activity', e]);
  }

  imageOnUpload(result): void {
    this.Personality.picUrl = result.fileUri;
  }

  save(): void {
    this.saving = true;

  }

  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.UserPrimeng.getSkipCount(this.paginator, event);
  }
  transIndex2(i, event?: LazyLoadEvent) {
    return i + 1 + this.WhitelistPrimeng.getSkipCount(this.paginator2, event);
  }

  transIndex3(i, event?: LazyLoadEvent) {
    return i + 1 + this.WinnerPrimeng.getSkipCount(this.paginator3, event);
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


}


