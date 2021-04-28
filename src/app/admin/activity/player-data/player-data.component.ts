import { Component, Injector, ViewChild, ElementRef } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { PlayerDataDetailComponent } from '@app/admin/activity/player-data/detail/player-data-detail.component';
import { UserActionServiceProxy, ActivityServiceProxy, _definitions_EnumSnsType } from '@shared/service-proxies/service-proxies5';
import * as moment from 'moment';


@Component({
  selector: 'player-data-category',
  templateUrl: './player-data.component.html',
  styleUrls: ['./player-data.component.css'],
  animations: [appModuleAnimation()]
})
export class PlayerDataComponent extends AppComponentBase {
  @ViewChild('playerDataDetailModal', { static: true }) playerDataDetailModal: PlayerDataDetailComponent;
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;
  filterText: string;
  StartTime: any = moment().utc().subtract(31, 'days').startOf('day');
  EndTime: any = moment().utc().endOf('day');

  ActivityId;
  SoftwareId;
  ActivityList;
  exportLoading = false;

  deviceId;
  activityGameId;
  _definitions_EnumSnsType = _definitions_EnumSnsType;

  constructor(injector: Injector,
    private _UserActionServiceProxy: UserActionServiceProxy,
    private _acitvityService: ActivityServiceProxy,

  ) {
    super(injector);
    this._acitvityService.getActivities(
      void 0,
      void 0,
      false,
      void 0,
      // void 0,
      void 0,
      void 0,
      999,
      0
    ).subscribe(result => {
      this.ActivityList = result.items;
    })
  }

  goExport() {
    this.exportLoading = true;
    this._UserActionServiceProxy.getUserActionsToExcel(
      void 0,
      this.ActivityId,
      void 0,
      this.deviceId,
      this.activityGameId,
      this.StartTime,
      this.EndTime,
      void 0,
      this.filterText,
      this.primengTableHelper.getSorting(this.dataTable),
      10,
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

  goDetail(record) {
    this.playerDataDetailModal.show(record);
  }


  getPlayerDataList(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.primengTableHelper.showLoadingIndicator();
    this._UserActionServiceProxy.getUserActions(
      void 0,
      this.ActivityId,
      void 0,
      this.deviceId,
      this.activityGameId,
      this.StartTime,
      this.EndTime,
      void 0,
      this.filterText,
      this.primengTableHelper.getSorting(this.dataTable),
      this.primengTableHelper.getMaxResultCount(this.paginator, event),
      this.primengTableHelper.getSkipCount(this.paginator, event)
    )
      .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
      .subscribe(result => {
        console.log(result)
        this.primengTableHelper.totalRecordsCount = result.totalCount;
        this.primengTableHelper.records = result.items;
        // this.primengTableHelper.hideLoadingIndicator();
      })
  }



  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }

}
