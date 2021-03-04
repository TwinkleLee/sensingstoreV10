import { Component, OnInit, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppConsts } from '@shared/AppConsts';
import { ActivatedRoute, Router } from '@angular/router';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';

import { DeviceActivityServiceProxy, ActivityServiceProxy, AwardServiceProxy, AwardSettingsDto, HtmlTemplateServiceProxy, TemplateEnum } from '@shared/service-proxies/service-proxies5';
import { CreateOrEditGameModalComponent } from '@app/admin/activity/activity/game/operation/create-or-edit-game.component'

@Component({
  selector: 'app-device-game-category',
  templateUrl: './game.component.html',
  animations: [appModuleAnimation()]
})
export class DeviceGameComponent extends AppComponentBase {

  @ViewChild('createOrEditGameModalComponent', { static: true }) createOrEditGameModalComponent: CreateOrEditGameModalComponent;
  @ViewChild('prizeDataTable', { static: true }) dataTable: Table;
  @ViewChild('prizePaginator', { static: true }) paginator: Paginator;
  PrizePrimeng: PrimengTableHelper = new PrimengTableHelper();


  gameList = [];
  saving = false;
  StartTime;
  EndTime;
  filterText: string = "";
  AwardSetting = new AwardSettingsDto();
  activityId;
  activityName;
  templateList = [];
  Message: any = {};
  messageBusy = false;
  deviceId;


  constructor(injector: Injector,
    private router: Router,
    private _activatedRoute: ActivatedRoute,
    private _HtmlTemplateServiceProxy: HtmlTemplateServiceProxy,
    private _ActivityServiceProxy: ActivityServiceProxy,
    private _DeviceActivityServiceProxy: DeviceActivityServiceProxy,
    private _AwardServiceProxy: AwardServiceProxy) {
    super(injector);
    this._activatedRoute.queryParams.subscribe(queryParams => {
      this.activityId = queryParams.id;
      this.activityName = queryParams.name;
      this.deviceId = queryParams.deviceId;
    })
  }

  ngAfterViewChecked(): void {
    //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
    $('tabset ul.nav').addClass('m-tabs-line');
    $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
  }

  //返回
  goBack() {
    this.router.navigate(['app', 'admin','device', 'deviceList', 'operation', this.deviceId], { queryParams: { initTab: 'activity' } });
  }

  getGame(event?: LazyLoadEvent) {
    if (this.PrizePrimeng.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.PrizePrimeng.showLoadingIndicator();

    this._DeviceActivityServiceProxy.getActivityGamesByIdAndDeviceId(
      this.deviceId,
      this.activityId,
      this.filterText,
      this.PrizePrimeng.getSorting(this.dataTable),
      this.PrizePrimeng.getMaxResultCount(this.paginator, event),
      this.PrizePrimeng.getSkipCount(this.paginator, event)
    )
      .pipe(this.myFinalize(() => { this.PrizePrimeng.hideLoadingIndicator(); }))
      .subscribe(result => {
        console.log(result)
        this.PrizePrimeng.totalRecordsCount = result.totalCount;
        this.PrizePrimeng.records = result.items;
        this.PrizePrimeng.hideLoadingIndicator();
      })
  }

  createGame() {
    this.createOrEditGameModalComponent.show()
  }

  editGame(record) {
    this.createOrEditGameModalComponent.show(record)
  }

  deleteGame(record) {
    this.message.confirm(this.l('deletethisGame'), this.l('AreYouSure'), (r) => {
      if (r) {
        this._DeviceActivityServiceProxy.deleteDeviceActivityGame(record.id).subscribe(result => {
          // this._ActivityServiceProxy.deleteActivityGame(undefined, [record.id]).subscribe(result => {
          this.notify.info(this.l('success'));
          this.getGame();
        })
      }
    })
  }

  changeSetup(e) {
    if (e == 'game' && this.deviceId) {
      this.router.navigate(['app', 'device', 'deviceList', 'game'], { queryParams: { id: this.activityId, deviceId: this.deviceId, name: this.activityName } });
    } else if (this.deviceId) {
      this.router.navigate(['app', 'activity', 'activity', e], { queryParams: { id: this.activityId, deviceId: this.deviceId, name: this.activityName } });
    } else {
      this.router.navigate(['app', 'activity', 'activity', e], { queryParams: { id: this.activityId, name: this.activityName } });
    }
  }


  // deleteGameList() {
  //   if (this.gameList.length === 0) {
  //     this.message.warn(this.l('selectOneWarn'));
  //   } else {
  //     this.message.confirm(this.l('deleteGameQuestion'),this.l('AreYouSure'), (r) => {
  //       if (r) {
  //         this.primengTableHelper.showLoadingIndicator();
  //         console.log(this.gameList);
  //         var gameCheckedIdList = [];
  //         for (var value of this.gameList) {
  //           gameCheckedIdList.push(value.id);
  //         }
  //         console.log(gameCheckedIdList);
  //         this._ActivityServiceProxy.deleteActivityGame(undefined, gameCheckedIdList).subscribe(result => {
  // this.notify.info(this.l('success'));
  //           this.gameList = [];
  //           this.getGame();
  //         })
  //         this.primengTableHelper.hideLoadingIndicator();
  //       }

  //     })

  //   }
  // }


  // getPageTemplate() {
  //   this.messageBusy = true;
  //   this._HtmlTemplateServiceProxy.getHtmlTemplates(TemplateEnum.Action, undefined, undefined, 99, 0).subscribe(r => {
  //     console.log(r)
  //     this.templateList = r.items;
  //     this._ActivityServiceProxy.getAwardMessageSettings(this.activityId).subscribe(r => {
  //       this.messageBusy = false;
  //       console.log(r)
  //       this.Message = r
  //     })
  //   })
  // }


  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.PrizePrimeng.getSkipCount(this.paginator, event);
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
