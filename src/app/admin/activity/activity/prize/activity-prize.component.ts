import { Component, OnInit, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppConsts } from '@shared/AppConsts';
import { ActivatedRoute, Router } from '@angular/router';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';

import { AwardType,ActivityServiceProxy,AwardMessageSettingsInput, AwardServiceProxy, SpecialUserServiceProxy, AwardSettingsDto, HtmlTemplateServiceProxy, AwardMessageSettingsDto, TemplateEnum, SpecialType } from '@shared/service-proxies/service-proxies5';
import { CreateOrEditPrizeModalComponent } from '@app/admin/activity/activity/prize/operation/create-or-edit-prize.component'
import { CreateOrEditWhiteListModalComponent } from '@app/admin/activity/activity/prize/operation/create-or-edit-white-list.component'
import { finalize } from 'rxjs/operators';


@Component({
  selector: 'activity-prize',
  templateUrl: './activity-prize.component.html',
  styleUrls: ['./activity-prize.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})
export class ActivityPrizeComponent extends AppComponentBase {

  @ViewChild('createOrEditPrizeModal', { static: true }) createOrEditPrizeModal: CreateOrEditPrizeModalComponent;
  @ViewChild('prizeDataTable', { static: true }) dataTable: Table;
  @ViewChild('prizePaginator', { static: true }) paginator: Paginator;
  PrizePrimeng: PrimengTableHelper = new PrimengTableHelper();

  @ViewChild('createOrEditWhiteListModal', { static: true }) createOrEditWhiteListModal: CreateOrEditWhiteListModalComponent;
  @ViewChild('whitelistDataTable', { static: true }) dataTable2: Table;
  @ViewChild('whitelistPaginator', { static: true }) paginator2: Paginator;
  WhitelistPrimeng: PrimengTableHelper = new PrimengTableHelper();

  prizeList = [];
  whitelistList = [];
  couponPublishList = [];
  saving = false;
  StartTime;
  EndTime;
  filterText: string = "";
  AwardSetting = new AwardSettingsDto();
  activityId;
  templateList = [];
  Message: any = {};
  messageBusy = false;
  AwardType = AwardType;
  SpecialType = SpecialType;

  deviceId;
  activityName;
  savingSet = true;

  constructor(injector: Injector,
    private router: Router,
    private _activatedRoute: ActivatedRoute,
    private _HtmlTemplateServiceProxy: HtmlTemplateServiceProxy,
    private _ActivityServiceProxy: ActivityServiceProxy,
    private _AwardServiceProxy: AwardServiceProxy,
    private _WhiteUserServiceProxy: SpecialUserServiceProxy) {
    super(injector);
    this._activatedRoute.queryParams.subscribe(queryParams => {
      this.activityId = queryParams.id;
      this.deviceId = queryParams.deviceId;
      this.activityName = queryParams.name;

    })
    this.getAwardSettings()
    this.getPageTemplate()
  }


  ngAfterViewChecked(): void {
    //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
    $('tabset ul.nav').addClass('m-tabs-line');
    $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
  }


  getAwardSettings() {
    this.savingSet = true;
    this._ActivityServiceProxy.getAwardSettings(this.activityId)
      .pipe(finalize(() => {
        this.savingSet = false;
      }))
      .subscribe(r => {
        console.log(r)
        this.AwardSetting = r;
      })
  }

  AwardSettings() {
    this.savingSet = true;
    this._ActivityServiceProxy.awardSettings(this.AwardSetting)
      .pipe(finalize(() => {
        this.savingSet = false;
        this.getAwardSettings()
      }))
      .subscribe(r => {
        this.notify.info(this.l('success'));
      })
  }


  clearPrize() {
    this.message.confirm(this.l('deleteAllPrize'), this.l('AreYouSure'), (r) => {
      if (r) {
        this._AwardServiceProxy.deleteAward(this.activityId, []).subscribe(result => {
          this.notify.info(this.l('success'));
          this.getPrize();
        })
      }
    })
  }



  getWhitelist(event?: LazyLoadEvent) {
    if (this.WhitelistPrimeng.shouldResetPaging(event)) {
      this.paginator2.changePage(0);
    }
    this._WhiteUserServiceProxy.getUsers(
      this.activityId,
      void 0,
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

  //返回
  goBack() {
    if (this.deviceId) {
      this.router.navigate(['app', 'admin','device', 'deviceList', 'operation', this.deviceId], { queryParams: { initTab: 'activity' } });
    } else {
      this.router.navigate(['app', 'admin','activity', 'activity']);
    }
  }
  changeSetup(e) {
    if (e == 'game' && this.deviceId) {
      this.router.navigate(['app', 'admin','device', 'deviceList', 'game'], { queryParams: { id: this.activityId, deviceId: this.deviceId, name: this.activityName } });
    } else if (this.deviceId) {
      this.router.navigate(['app', 'admin','activity', 'activity', e], { queryParams: { id: this.activityId, deviceId: this.deviceId, name: this.activityName } });
    } else {
      this.router.navigate(['app', 'admin','activity', 'activity', e], { queryParams: { id: this.activityId, name: this.activityName } });
    }
  }


  imageOnUpload(result): void {
    this.Message.picUrl = result.fileUri;
  }

  save(): void {
    this.saving = true;
    console.log(this.Message)
    console.log(this.activityId)
    this.Message = new AwardMessageSettingsInput(this.Message)

    this.Message.activityId = Number(this.activityId);
    console.log(this.Message)

    this._ActivityServiceProxy.awardMessageSettings(this.Message).subscribe(r => {
      this.notify.info(this.l('SavedSuccessfully'));
      this.saving = false;
    })
  }
  getPrize(event?: LazyLoadEvent) {
    if (this.PrizePrimeng.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.PrizePrimeng.showLoadingIndicator();
    this._AwardServiceProxy.getAwards(
      this.activityId,
      void 0,
      this.filterText,
      this.PrizePrimeng.getSorting(this.dataTable) || 'awardSeq ASC',
      this.PrizePrimeng.getMaxResultCount(this.paginator, event),
      this.PrizePrimeng.getSkipCount(this.paginator, event)
    )
      .pipe(this.myFinalize(() => { this.PrizePrimeng.hideLoadingIndicator(); }))
      .subscribe(result => {
        this.PrizePrimeng.totalRecordsCount = result.totalCount;
        this.PrizePrimeng.records = result.items;
      });
  }

  createPrize() {
    this.createOrEditPrizeModal.show()
  }

  editPrize(record) {
    this.createOrEditPrizeModal.show(record)
  }

  deletePrize(record) {
    console.log(record)
    this.message.confirm(this.l('deletethisPrize'), this.l('AreYouSure'), (r) => {
      if (r) {
        this._AwardServiceProxy.deleteAward(void 0, [record.id]).subscribe(result => {
          this.notify.info(this.l('success'));
          this.getPrize();
        })
      }
    })
  }

  deletePrizeList() {
    if (this.prizeList.length === 0) {
      this.message.warn(this.l('selectOneWarn'));
    } else {
      this.message.confirm(this.l('deletePrizeQuestion'), this.l('AreYouSure'), (r) => {
        if (r) {
          this.primengTableHelper.showLoadingIndicator();
          var gameCheckedIdList = [];
          for (var value of this.prizeList) {
            gameCheckedIdList.push(value.id);
          }
          console.log(gameCheckedIdList);
          this._AwardServiceProxy.deleteAward(void 0, gameCheckedIdList)
            .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
            .subscribe(result => {
              this.notify.info(this.l('success'));
              this.prizeList = [];
              this.getPrize();
            })
        }
      })
    }
  }
  deleteWhitelistList() {
    if (this.whitelistList.length === 0) {
      this.message.warn(this.l('selectOneWarn'));
    } else {
      this.message.confirm(this.l('deleteWhitelistQuestion'), this.l('AreYouSure'), (r) => {
        if (r) {
          this.primengTableHelper.showLoadingIndicator();
          var whiteCheckedIdList = [];
          for (var value of this.whitelistList) {
            whiteCheckedIdList.push(value.id);
          }
          console.log(whiteCheckedIdList)
          this._WhiteUserServiceProxy.deleteWhiteUser(void 0, whiteCheckedIdList)
          .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
          .subscribe(result => {
            this.notify.info(this.l('success'));
            this.whitelistList = [];
            this.getWhitelist();
          })
        }
      })
    }
  }

  getPageTemplate() {
    this.messageBusy = true;
    this._HtmlTemplateServiceProxy.getHtmlTemplates(TemplateEnum.Award, void 0, void 0, 99, 0).subscribe(r => {
      console.log(r)
      this.templateList = r.items;
      this._ActivityServiceProxy.getAwardMessageSettings(this.activityId).subscribe(r => {
        this.messageBusy = false;
        console.log(r)
        this.Message = r
      })
    })
  }

  goImport() {
    this.router.navigate(['app', 'admin','import', 'import', 'whiteuser']);
  }
  createWhitelist() {
    this.createOrEditWhiteListModal.show()
  }
  editWhiteList(record) {
    this.createOrEditWhiteListModal.show(record)
  }
  deleteWhiteList(record) {
    this.message.confirm(this.l('deletethisWhiteList'), this.l('AreYouSure'), (r) => {
      if (r) {
        this._WhiteUserServiceProxy.deleteWhiteUser(void 0, [record.id]).subscribe(result => {
          this.notify.info(this.l('success'));
          this.getWhitelist();
        })
      }
    })
  }
  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.PrizePrimeng.getSkipCount(this.paginator, event);
  }
  transIndex2(i, event?: LazyLoadEvent) {
    return i + 1 + this.WhitelistPrimeng.getSkipCount(this.paginator2, event);
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


