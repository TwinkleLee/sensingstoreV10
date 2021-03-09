import { Component, OnInit, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppConsts } from '@shared/AppConsts';
import { MyTreeComponent } from '@app/shared/common/my-tree/my-tree.component';
import { Router } from '@angular/router';
import { AdServiceProxy, PublishAdScheduliingInput } from '@shared/service-proxies/service-proxies';
import { ScheduleModalComponent } from '@app/admin/advertisement/schedule/operation/create-or-edit-schedule-modal.component';
import { CalendarModalComponent } from '@app/admin/advertisement/schedule/operation/calendar-modal.component';
import { DeviceServiceProxy as NewDeviceServiceProxy} from '@shared/service-proxies/service-proxies-devicecenter';

@Component({
  templateUrl: './schedule.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})
export class Schedule extends AppComponentBase {

  @ViewChild('scheduleModal', { static: true }) ScheduleModalComponent: ScheduleModalComponent;
  @ViewChild('calendarModal', { static: true }) CalendarModalComponent: CalendarModalComponent;
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;
  @ViewChild('myTree', { static: false }) myTree: MyTreeComponent;


  filterText: string = "";
  treeFilter: string = "";
  toPublish;
  operateAll;
  publishType = 'add';
  deviceTree: any[] = [];
  schedulePublishList = null;
  busy = false;
  informDevice = false;

  constructor(injector: Injector,
    private router: Router,
    private _NewDeviceServiceProxy: NewDeviceServiceProxy,
    private _AdServiceProxy: AdServiceProxy) {
    super(injector);
    this._NewDeviceServiceProxy.getOuStoreDeviceTree([]).subscribe((result) => {
      this.deviceTree = [result];
    })
  }

  getSchedule(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.schedulePublishList = null;

    this.primengTableHelper.showLoadingIndicator();
    this._AdServiceProxy.getSchedulings(
      this.filterText,
      this.primengTableHelper.getSorting(this.dataTable),
      this.primengTableHelper.getMaxResultCount(this.paginator, event),
      this.primengTableHelper.getSkipCount(this.paginator, event)
    )
      .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
      .subscribe(result => {
        console.log(result);
        this.primengTableHelper.totalRecordsCount = result.totalCount;
        this.primengTableHelper.records = result.items;
      })
  }
  createSchedule() {
    this.ScheduleModalComponent.show();
  }
  edit(record) {
    this._AdServiceProxy.getSingleProgramScheduling(record.id).subscribe(scheduleDetail => {
      this.ScheduleModalComponent.show(scheduleDetail);
    })
  }
  goDetail(record) {
    this.CalendarModalComponent.show(record);
  }

  //删除
  deleteSchedule(record) {
    this.message.confirm(this.l('deletethisselected'), this.l('AreYouSure'), (r) => {
      if (r) {
        this._AdServiceProxy.deleteSchedulings([record.id]).subscribe(result => {
          this.schedulePublishList = null;
          this.notify.info(this.l('success'));
          this.getSchedule();
        })
      }
    })
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




  // 显示发布侧栏
  goPublish() {
    this.toPublish = true;
  }

  doPublishSchedule() {
    var deviceIds = this.myTree.getchosen()
      .filter(item => {
        return item.type == 'device'
      }).map(item => {
        return item.id
      })

    if (deviceIds.length == 0) {
      this.notify.info(this.l('noselectdevice'));
      return
    }
    console.log(this.schedulePublishList)
    var adSchedulingIds = [this.schedulePublishList.id];
    // .map(item => {
    //   return item.id
    // });
    var publishType = this.publishType;

    var input = new PublishAdScheduliingInput({
      deviceIds,
      adSchedulingIds,
      action: publishType,
      informDevice: this.informDevice
    })


    if (this.operateAll) {
      this.schedulePublishList = null;
      this.message.confirm(this.publishType == 'delete' ? this.l('isWithdrewAll') : this.l('isPublishAll'), this.l('AreYouSure'), (r) => {
        if (r) {
          this._AdServiceProxy.publishSchedulingToDevice(input).subscribe(r => {
            this.notify.info(this.l('success'));
            this.toPublish = false;
            this.operateAll = false;
          })
        }
      })
    } else {
      this.message.confirm(this.publishType == 'delete' ? this.l('isWithdrewChosen') : this.l('isPublishChosen'), this.l('AreYouSure'), (r) => {
        if (r) {
          this._AdServiceProxy.publishSchedulingToDevice(input).subscribe(r => {
            this.notify.info(this.l('success'));
            this.schedulePublishList = null;
            this.toPublish = false;
            this.operateAll = false;
          })
        }
      })
    }
  }

  //发布所有
  publishAll() {
    this.toPublish = true;
    this.publishType = 'add';
    this.operateAll = true;
  }
  //撤回所有
  withdrawAll() {
    this.toPublish = true;
    this.publishType = 'delete';
    this.operateAll = true;
  }

  //筛选树
  filterTree(e?: Event) {
    e && e.preventDefault();
    this.myTree.filterTree(this.treeFilter);
  }
}