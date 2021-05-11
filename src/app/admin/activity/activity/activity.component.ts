import { Component, OnInit, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { appModuleAnimation } from '@shared/animations/routerTransition';

import { ApplyWanted as CreateApplyFormInputWanted, CreateApplyFormInput, ApplyFormType as CreateApplyFormInputApplyType, ApplyServiceProxy, IdTypeDto } from '@shared/service-proxies/service-proxies-product';
import { AppConsts } from '@shared/AppConsts';
import { MyTreeComponent } from '@app/shared/common/my-tree/my-tree.component';
import { Router } from '@angular/router';
import { CreateActivityModalComponent } from '@app/admin/activity/activity/create-activity-modal.component';
import { ActivityServiceProxy, PublishEntitiesInput, ActivityAuditInput, AuditStatus as ActivityAuditStatus, AuditStatus, ActivityFromTemplateInput } from '@shared/service-proxies/service-proxies5';

import { DeviceServiceProxy as NewDeviceServiceProxy } from '@shared/service-proxies/service-proxies-devicecenter';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})
export class ActivityComponent extends AppComponentBase {

  @ViewChild('createActivityModal', { static: true }) CreateActivityModalComponent: CreateActivityModalComponent;
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;
  @ViewChild('myTree', { static: false }) myTree: MyTreeComponent;

  filterText: string = "";
  treeFilter: string = "";
  toPublish;
  operateAll;
  auditStatus: any = '';
  publishType = 'add';
  deviceTree: any[] = [];
  activityPublishList = [];

  isTemplate: any = 'false';

  //枚举
  CreateApplyFormInputWanted = CreateApplyFormInputWanted;
  //审核
  apply: CreateApplyFormInput = new CreateApplyFormInput();
  busy = false;

  onlyPublishToDevice = false;

  constructor(injector: Injector,
    private router: Router,

    private _acitvityService: ActivityServiceProxy,

    private applyService: ApplyServiceProxy,
    private _NewDeviceServiceProxy: NewDeviceServiceProxy) {
    super(injector);
    this.apply.applyType = CreateApplyFormInputApplyType.Coupon;
    this.apply.itemids = [];
    this.apply.options = 'all';

    this._NewDeviceServiceProxy.getOuStoreDeviceTree([]).subscribe((result) => {
      this.deviceTree = [result];
    })
  }

  getActivity(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.activityPublishList = [];

    this.primengTableHelper.showLoadingIndicator();
    this._acitvityService.getActivities(
      void 0,
      void 0,
      this.isTemplate,
      void (0),
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
  //新增红包
  createActivity() {
    this.CreateActivityModalComponent.show();
  }
  editActivity(record) {
    this.router.navigate(['app', 'admin', 'activity', 'activity', 'basic'], { queryParams: { id: record.id, name: record.name } });
  }
  showActivityData(record) {
    this.router.navigate(['app', 'admin', 'activity', 'activity', 'data'], { queryParams: { id: record.id, name: record.name } });
  }
  //删除活动
  deleteActivity(record) {
    this.message.confirm(this.l('deletethisactivity'), this.l('AreYouSure'), (r) => {
      if (r) {
        this._acitvityService.deleteActivity(record.id).subscribe(result => {
          this.activityPublishList = [];
          this.notify.info(this.l('success'));
          this.getActivity();
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


  //筛选上下线
  filterActivity() {
    var upNum = [], upNumIds = [], downNum = [], downNumIds = [];
    this.activityPublishList.forEach((v, index, array) => {
      if (v.auditStatus == 'Offline') {
        downNum.push(v);
        downNumIds.push(v.id);
      } else if (v.auditStatus == 'Online') {
        upNum.push(v);
        upNumIds.push(v.id);
      }
    })
    return {
      upNum: upNum,
      upNumIds: upNumIds,
      downNum: downNum,
      downNumIds: downNumIds
    }
  }
  //检测选中活动上下线情况
  // f -> bool  代表上下线操作  true表示需要上线  则筛去已上线
  //all ->bool 表示是否操作全部
  checkSelection(f, callback, all?) {
    var upNum = this.filterActivity().upNum, downNum = this.filterActivity().downNum,
      upNumIds = this.filterActivity().upNumIds, downNumIds = this.filterActivity().downNumIds;
    if (all) {
      return callback && callback([]);
    }
    if (f) {
      if (downNum.length == 0) {
        return this.notify.info(this.l('noneOfflineGotten'));
      }
      if (upNum.length != 0) {
        this.message.confirm(this.l("nowChooseTip0") + upNum.length + this.l("nowChooseTip1"), this.l('AreYouSure'), (r) => {
          if (r) {
            this.activityPublishList = downNum;
          }
          callback && callback(f ? downNumIds : upNumIds);
        })
      } else {
        callback && callback(f ? downNumIds : upNumIds);
      }
    } else {
      if (upNum.length == 0) {
        return this.notify.info(this.l('noneOnlineGotten'));
      }
      if (downNum.length != 0) {
        this.message.confirm(this.l("nowChooseTip0") + downNum.length + this.l("nowChooseTip2"), this.l('AreYouSure'), (r) => {
          if (r) {
            this.activityPublishList = upNum;
          }
          callback && callback(f ? downNumIds : upNumIds);
        })
      } else {
        callback && callback(f ? downNumIds : upNumIds);
      }
    }
  }
  getOuTree(cb?) {
    cb && cb();
  }

  // 显示发布侧栏
  goPublishActivity() {
    this.checkSelection(false, (ary) => {
      this.getOuTree(() => {
        this.toPublish = true;
      });
    })
  }

  doPublishActivity() {
    var ouOrDeviceOrStoreList = this.myTree.getchosen().map(item => {
      return new IdTypeDto({
        'id': item.id,
        'type': item.type
      })
    })
    if (this.onlyPublishToDevice) {
      ouOrDeviceOrStoreList = ouOrDeviceOrStoreList.filter(item => {
        return item.type == 'device'
      })
    }
    var entityIds = this.activityPublishList.map(item => {
      return item.id
    });
    var publishType = this.publishType;

    var input = new PublishEntitiesInput({
      ouOrStoreOrDeviceList: ouOrDeviceOrStoreList,
      entityIds,
      action: publishType
    })

    if (this.operateAll) {
      this.activityPublishList = [];
      this.message.confirm(this.publishType == 'delete' ? this.l('isWithdrewAll') : this.l('isPublishAll'), this.l('AreYouSure'), (r) => {
        if (r) {
          this._acitvityService.publishAllToOrganizationOrStoreOrDevices(input).subscribe(r => {
            this.notify.info(this.l('success'));
            this.toPublish = false;
            this.operateAll = false;
          })
        }
      })
    } else {
      this.message.confirm(this.publishType == 'delete' ? this.l('isWithdrewChosen') : this.l('isPublishChosen'), this.l('AreYouSure'), (r) => {
        if (r) {
          this._acitvityService.publishToOrganizationOrStoreOrDevices(input).subscribe(r => {
            this.notify.info(this.l('success'));
            this.activityPublishList = [];
            this.toPublish = false;
            this.operateAll = false;
          })
        }
      })
    }
  }

  //取消
  no() {
    $("#review").hide();
  }
  //确定
  ok() {
    this.busy = true;
    this.applyService.createApplyForm(this.apply).subscribe((result) => {
      this.activityPublishList = [];
      this.getActivity();
      $("#review").hide();
      this.busy = false;
    })

  }

  //审核
  review(f, ary?) {
    this.apply.itemids = ary ? ary : [];
    this.apply.reason = '';
    this.apply.wanted = f ? CreateApplyFormInputWanted.Online : CreateApplyFormInputWanted.Offline;
    $("#review").show();
  }

  //下线所有
  offlineAll() {
    // this.review(false);
    this._acitvityService.activityAudit(new ActivityAuditInput({
      activityIds: [],
      currentAuditStatus: AuditStatus["Online"],
      targetAuditStatus: AuditStatus["Offline"]
    })).subscribe(r => {
      this.getActivity()
    })
  }
  //下线
  offline() {
    this.checkSelection(false, (ary) => {
      this._acitvityService.activityAudit(new ActivityAuditInput({
        activityIds: ary,
        currentAuditStatus: AuditStatus["Online"],
        targetAuditStatus: AuditStatus["Offline"]
      })).subscribe(r => {
        this.getActivity()
      })
    })
  }
  //上线
  online() {
    this.checkSelection(true, (ary) => {
      console.log(ary)
      this._acitvityService.activityAudit(new ActivityAuditInput({
        activityIds: ary,
        currentAuditStatus: AuditStatus["Offline"],
        targetAuditStatus: AuditStatus["Online"]
      })).subscribe(r => {
        this.getActivity()
      })
    })
  }
  //上线所有
  onlineAll() {
    this._acitvityService.activityAudit(new ActivityAuditInput({
      activityIds: [],
      currentAuditStatus: AuditStatus["Offline"],
      targetAuditStatus: AuditStatus["Online"]
    })).subscribe(r => {
      this.getActivity()
    })
  }
  //发布所有
  publishAll() {
    this.getOuTree(() => {
      this.toPublish = true;
      this.publishType = 'add';
      this.operateAll = true;
    });
  }
  //撤回所有
  withdrawAll() {
    this.getOuTree(() => {
      this.toPublish = true;
      this.publishType = 'delete';
      this.operateAll = true;
    });
  }


  //筛选树
  filterTree(e?: Event) {
    e && e.preventDefault();
    this.myTree.filterTree(this.treeFilter);
  }

  saveAsTemplate(record) {
    console.log(record);

    this.message.confirm(this.l('saveAsTemplate'), this.l('AreYouSure'), (r) => {
      if (r) {
        var activityTemplate = new ActivityFromTemplateInput({
          id: record.id,
          name: record.name + ' (模板)',
          isPublic: true,
          isTemplate: true
        })
        console.log(activityTemplate)
        this._acitvityService.createActivityFromTemplate(activityTemplate)
          .pipe(finalize(() => { this.getActivity() }))
          .subscribe(result => {
            this.notify.info(this.l('SavedSuccessfully'));
            this.getActivity()
          })
      }
    })
  }
}


