import { Component, OnInit, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { CreateOrEditCouponModalComponent } from '@app/admin/redpacket/red-packet/create-or-edit-coupon-modal.component';
import { CouponDto, CouponServiceProxy, AuditStatus, ApplyWanted as CreateApplyFormInputWanted, CreateApplyFormInput, ApplyFormType as CreateApplyFormInputApplyType, ApplyServiceProxy, PublishEntitiesInput, IdTypeDto } from '@shared/service-proxies/service-proxies-product';
import { AppConsts } from '@shared/AppConsts';
import { MyTreeComponent } from '@app/shared/common/my-tree/my-tree.component';

import { DeviceServiceProxy as NewDeviceServiceProxy} from '@shared/service-proxies/service-proxies-devicecenter';

@Component({
  selector: 'app-red-packet',
  templateUrl: './red-packet.component.html',
  styleUrls: ['./red-packet.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})
export class RedPacketComponent extends AppComponentBase {

  @ViewChild('createOrEditCouponModal',{static:true}) createOrEditCouponModal: CreateOrEditCouponModalComponent;
  @ViewChild('dataTable',{static:true}) dataTable: Table;
  @ViewChild('paginator',{static:true}) paginator: Paginator;
  @ViewChild('myTree',{static:false}) myTree: MyTreeComponent;

  filterText: string = "";
  treeFilter: string = "";
  toPublish;
  operateAll;
  auditStatus: any = '';
  publishType = 'add';
  deviceTree: any[] = [];
  couponPublishList = [];


  //枚举
  AuditStatus = AuditStatus;
  CreateApplyFormInputWanted = CreateApplyFormInputWanted;
  //审核
  apply: CreateApplyFormInput = new CreateApplyFormInput();
  busy = false;


  deviceTypeList: any = [];
  deviceTypeId: any = "";

  onlyPublishToDevice = false;
  informDevice = false;

  constructor(injector: Injector,
    private applyService: ApplyServiceProxy,
    private _NewDeviceServiceProxy: NewDeviceServiceProxy,
    private _couponService: CouponServiceProxy,
  ) {
    super(injector);
    this.apply.applyType = CreateApplyFormInputApplyType.Coupon;
    this.apply.itemids = [];
    this.apply.options = 'all';
    this.getDeviceType();
    this._NewDeviceServiceProxy.getOuStoreDeviceTree([]).subscribe((result) => {
      this.deviceTree = [result];
      console.log('this.deviceTree',this.deviceTree)
    })
  }


  getDeviceType() {
    this._NewDeviceServiceProxy.getDeviceTypes(
      void 0,
      void 0,
      99,
      0
    ).subscribe(result => {
      this.deviceTypeList = result.items;
    });
  }

  //获取红包列表
  getCoupons(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.couponPublishList = [];

    this.primengTableHelper.showLoadingIndicator();
    this._couponService.getCoupons(
      this.auditStatus,
      void 0,
      this.filterText,
      this.primengTableHelper.getSorting(this.dataTable) || 'title',
      this.primengTableHelper.getMaxResultCount(this.paginator, event),
      this.primengTableHelper.getSkipCount(this.paginator, event)
    )
    .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
    .subscribe(result => {
      this.primengTableHelper.totalRecordsCount = result.totalCount;
      this.primengTableHelper.records = result.items;
      // this.primengTableHelper.hideLoadingIndicator();
    });
  }
  //新增红包
  createCoupon() {
    this.createOrEditCouponModal.show();
  }
  //修改红包
  editCoupon(record) {
    this.createOrEditCouponModal.show(Object.assign({}, record));
  }
  //删除红包
  deleteCoupon(record: CouponDto) {
    this.message.confirm(this.l('deletethiscoupon'),this.l('AreYouSure'), (r) => {
      if (r) {
        this._couponService.deleteCoupon(record.id).subscribe(result => {
          this.couponPublishList = [];
          this.notify.info(this.l('success'));
          this.getCoupons();
        })
      }
    })
  }
  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
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

  //筛选设备上下线
  filterCoupon() {
    var upNum = [], upNumIds = [], downNum = [], downNumIds = [];
    this.couponPublishList.forEach((v, index, array) => {
      if (v.auditStatus == 0) {
        downNum.push(v);
        downNumIds.push(v.id);
      } else if (v.auditStatus == 1) {
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
  //检测选中设备上下线情况
  // f -> bool  代表上下线操作  true表示需要上线  则筛去已上线
  //all ->bool 表示是否操作全部
  checkSelection(f, callback, all?) {
    var upNum = this.filterCoupon().upNum, downNum = this.filterCoupon().downNum,
      upNumIds = this.filterCoupon().upNumIds, downNumIds = this.filterCoupon().downNumIds;
    if (all) {
      return callback && callback([]);
    }
    if (f) {
      if (downNum.length == 0) {
        return this.notify.info(this.l('noneOfflineGotten'));
      }
      if (upNum.length != 0) {
        this.message.confirm(this.l("nowChooseTip0") + upNum.length + this.l("nowChooseTip1"),this.l('AreYouSure'), (r) => {
          if (r) {
            this.couponPublishList = downNum;
          }
        })
      }
    } else {
      if (upNum.length == 0) {
        return this.notify.info(this.l('noneOnlineGotten'));
      }
      if (downNum.length != 0) {
        this.message.confirm(this.l("nowChooseTip0") + downNum.length + this.l("nowChooseTip2"),this.l('AreYouSure'), (r) => {
          if (r) {
            this.couponPublishList = upNum;
          }
        })
      }
    }
    callback && callback(f ? downNumIds : upNumIds);
  }
  getOuTree(cb?) {
    //获取组织树
    // this.deviceService.getTreeDevices().subscribe((result) => {
    //   this.deviceTree = [result];
    cb && cb();
    // })
  }
  //显示发布设备侧栏
  goPublishCoupon() {
    this.checkSelection(false, (ary) => {
      this.getOuTree(() => {
        this.toPublish = true;
      });
    })
  }
  //发布
  doPublishCoupon() {
    this.checkSelection(false, (ary) => {
      var ouOrDeviceList: IdTypeDto[];
      ouOrDeviceList = this.myTree.getchosen().map((item) => {
        return new IdTypeDto({
          'id': item.id,
          'type': item.type
        });
      });
      if (this.onlyPublishToDevice) {
        ouOrDeviceList = ouOrDeviceList.filter(item => {
          return item.type == 'device'
        })
      }
      if (ouOrDeviceList.length == 0) {
        return this.notify.warn(this.l('noselectouordevice'));
      }
      var input = new PublishEntitiesInput({
        'entityIds': ary,
        'ouOrDeviceOrStoreList': ouOrDeviceList,
        'action': this.publishType,
        'includeSku': false,
        'isCreateDefaultSchedule': false,
        'informDevice': this.informDevice,
        'type':'publish'
      });
      if (this.operateAll) {
        this.couponPublishList = [];
        this.message.confirm(this.publishType == 'delete' ? this.l('isWithdrewAll') : this.l('isPublishAll'),this.l('AreYouSure'), (r) => {
          if (r) {
            this._couponService.publishAllCouponToOrganizationOrDevicesOrStore(input).subscribe((result) => {
              this.notify.info(this.l('success'));
              this.toPublish = false;
              this.operateAll = false;
            });
          }
        });
      } else {
        this.message.confirm(this.publishType == 'delete' ? this.l('isWithdrewChosen') : this.l('isPublishChosen'),this.l('AreYouSure'), (r) => {
          if (r) {
            this._couponService.publishCouponToOrganizationOrDevicesOrStore(input).subscribe((result) => {
              this.notify.info(this.l('success'));
              this.couponPublishList = [];
              this.toPublish = false;
              this.operateAll = false;
            });
          }
        });
      }
    }, this.operateAll)
  }

  //取消
  no() {
    $("#review").hide();
  }
  //确定
  ok() {
    this.busy = true;
    this.applyService.createApplyForm(this.apply).subscribe((result) => {
        this.couponPublishList = [];
        this.getCoupons();
        $("#review").hide();
        this.busy = false;
      },
      (error: any) => {
        // this.couponPublishList = [];
        // $("#review").hide();
        this.busy = false;
      }
    )

  }

  //审核
  review(f, ary?) {
    this.apply.itemids = ary ? ary : [];
    this.apply.reason = '';
    this.apply.wanted = f ? CreateApplyFormInputWanted.Online : CreateApplyFormInputWanted.Offline;
    $("#review").show();
  }

  //下线所有设备
  offlineAll() {
    this.review(false);
  }
  //下线设备
  offline() {
    this.checkSelection(false, (ary) => {
      this.review(false, ary);
    })
  }
  //上线设备
  online() {
    this.checkSelection(true, (ary) => {
      this.review(true, ary);
    })
  }
  //上线所有设备
  onlineAll() {
    this.review(true);
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

  //选中所有
  chooseAll(items) {
    items.forEach((item) => {
      item.isSelected = true;
      if (item.children instanceof Array) {
        this.chooseAll(item.children);
      }
    })
  }
  //筛选树
  filterTree(e?: Event) {
    e && e.preventDefault();
    this.myTree.filterTree(this.treeFilter, this.deviceTypeId);
  }

  onTreeUpdate(data) {
    console.log(data)
  }
}


