import { Component, OnInit, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppConsts } from '@shared/AppConsts';
import { ActivatedRoute, Router } from '@angular/router';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';

import { ActivityServiceProxy, AwardServiceProxy, AwardSettingsDto, HtmlTemplateServiceProxy, TemplateEnum } from '@shared/service-proxies/service-proxies5';
import { CreateOrEditGameModalComponent } from '@app/admin/activity/activity/game/operation/create-or-edit-game.component'


@Component({
  selector: 'app-game-category',
  templateUrl: './game.component.html',
  animations: [appModuleAnimation()]
})
export class GameComponent extends AppComponentBase {

  @ViewChild('createOrEditGameModalComponent',{static:true}) createOrEditGameModalComponent: CreateOrEditGameModalComponent;
  @ViewChild('prizeDataTable',{static:true}) dataTable: Table;
  @ViewChild('prizePaginator',{static:true}) paginator: Paginator;
  PrizePrimeng: PrimengTableHelper = new PrimengTableHelper();


  gameList = [];
  saving = false;
  StartTime;
  EndTime;
  filterText: string = "";
  AwardSetting = new AwardSettingsDto();
  activityId;
  templateList = [];
  Message: any = {};
  messageBusy = false;
  activityName;

  constructor(injector: Injector,
    private router: Router,
    private _activatedRoute: ActivatedRoute,
    private _HtmlTemplateServiceProxy: HtmlTemplateServiceProxy,
    private _ActivityServiceProxy: ActivityServiceProxy,
    private _AwardServiceProxy: AwardServiceProxy) {
    super(injector);
    this._activatedRoute.queryParams.subscribe(queryParams => {
      this.activityId = queryParams.id;
      this.activityName = queryParams.name;

    })


  }


  ngAfterViewChecked(): void {
    //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
    $('tabset ul.nav').addClass('m-tabs-line');
    $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
  }


  //返回
  goBack() {
    this.router.navigate(['app', 'activity', 'activity']);
  }
  changeSetup(e) {
    this.router.navigate(['app', 'activity', 'activity', e], { queryParams: { id: this.activityId, name: this.activityName } });
  }

  getGame(event?: LazyLoadEvent) {
    if (this.PrizePrimeng.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.PrizePrimeng.showLoadingIndicator();

    this._ActivityServiceProxy.getActivityGamesByActivityId(
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
    })
  }

  createGame() {
    this.createOrEditGameModalComponent.show()
  }

  editGame(record) {
    this.createOrEditGameModalComponent.show(record)
  }

  deleteGame(record) {
    this.message.confirm(this.l('deletethisGame'),this.l('AreYouSure'), (r) => {
      if (r) {
        this._ActivityServiceProxy.deleteActivityGame(undefined, [record.id]).subscribe(result => {
          this.notify.info(this.l('success'));
          this.getGame();
        })
      }
    })
  }


  deleteGameList() {
    if (this.gameList.length === 0) {
      this.message.warn(this.l('selectOneWarn'));
    } else {
      this.message.confirm(this.l('deleteGameQuestion'),this.l('AreYouSure'), (r) => {
        if (r) {
          this.primengTableHelper.showLoadingIndicator();
          console.log(this.gameList);
          var gameCheckedIdList = [];
          for (var value of this.gameList) {
            gameCheckedIdList.push(value.id);
          }
          console.log(gameCheckedIdList);
          this._ActivityServiceProxy.deleteActivityGame(undefined, gameCheckedIdList).subscribe(result => {
            this.notify.info(this.l('success'));
            this.gameList = [];
            this.getGame();
          })
          this.primengTableHelper.hideLoadingIndicator();
        }

      })

    }
  }

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
