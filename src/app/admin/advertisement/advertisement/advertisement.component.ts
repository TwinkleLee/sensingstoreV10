import { Component, OnInit, Injector, ViewChild, ElementRef } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { AdServiceProxy, ApplyServiceProxy, CreateApplyFormInput, ApplyFormType as CreateApplyFormInputApplyType, ApplyWanted as CreateApplyFormInputWanted, PublishEntitiesInput, AuditStatus, IdTypeDto, TagServiceProxy, TagType as Type } from '@shared/service-proxies/service-proxies-ads';
import { CreateOrEditAdModalComponent } from './create-or-edit-ad-modal.component'
import { MyTreeComponent } from '@app/shared/common/my-tree/my-tree.component';
import { Router } from '@angular/router';
import { Table, TableCheckbox } from 'primeng/table';
import { finalize } from 'rxjs/operators';
import { RobotServiceProxy } from '@shared/service-proxies/service-proxies-floor'
import {DeviceServiceProxy as NewDeviceServiceProxy} from '@shared/service-proxies/service-proxies-devicecenter';



@Component({
  selector: 'app-advertisement',
  templateUrl: './advertisement.component.html',
  styleUrls: ['./advertisement.component.css'],
  animations: [appModuleAnimation()]
})
export class AdvertisementComponent extends AppComponentBase {

  @ViewChild('dataTable' ,{static:true}) dataTable: Table;
  @ViewChild('paginator' ,{static:true}) paginator: Paginator;
  @ViewChild('myTree' ,{static:false}) myTree: MyTreeComponent;
  @ViewChild('createOrEditAdModal' ,{static:true}) createOrEditAdModal: CreateOrEditAdModalComponent;
  @ViewChild('TableCheckbox' ,{static:true}) TableCheckbox: TableCheckbox;

  imgView: number = 0;
  filterText: string = "";
  treeFilter: string = "";
  adsTag: any = '';
  auditStatus: any = "";
  AdsPublishList: any[] = [];
  deviceTree = [];
  busy = false;
  //控制显示的标志
  toPublish = false;
  publishType = 'add';
  AuditStatus = AuditStatus;
  displayType = true;
  operateAll = false;
  //审核
  apply: CreateApplyFormInput = new CreateApplyFormInput;
  CreateApplyFormInputWanted = CreateApplyFormInputWanted;
  //tag
  tags: any[] = [];
  exportLoading = false;
  mapList: any = [];


  deviceTypeList: any = [];
  deviceTypeId: any = "";
  showImage = false;

  onlyPublishToDevice = false;
  isCreateDefaultSchedule = false;
  informDevice = false;

  constructor(injector: Injector, 
    private _adsService: AdServiceProxy,
    private _NewDeviceServiceProxy: NewDeviceServiceProxy,
    private router: Router,
    private applyService: ApplyServiceProxy,
    private tagService: TagServiceProxy,
    private _RobotServiceProxy: RobotServiceProxy
  ) {
    super(injector);
    this.apply.applyType = CreateApplyFormInputApplyType.Ads;
    this.apply.itemids = [];
    this.apply.options = 'all';
    this.getTags();
    this.getDeviceType();
    this._NewDeviceServiceProxy.getOuStoreDeviceTree([]).subscribe((result) => {
      this.deviceTree = [result];
    })
    this.getMapList();
  }
  getTags() {
    this.tagService.getTagsByType('', undefined, 1000, 0, Type.Ads).subscribe((r) => {
      this.tags = r.items;
    })
  }



  getDeviceType() {
    this._NewDeviceServiceProxy.getDeviceTypes(
      undefined,
      undefined,
      99,
      0
    ).subscribe(result => {
      this.deviceTypeList = result.items;
    });
  }

  //获取广告列表
  getAds(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.AdsPublishList = [];


    this.primengTableHelper.showLoadingIndicator();
    this._adsService.getAds(
      this.auditStatus,
      this.adsTag || undefined,
      undefined,
      undefined,
      this.filterText,
      this.primengTableHelper.getSorting(this.dataTable),
      this.primengTableHelper.getMaxResultCount(this.paginator, event),
      this.primengTableHelper.getSkipCount(this.paginator, event)
    )
    .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
    .subscribe(result => {
      this.primengTableHelper.totalRecordsCount = result.totalCount;
      this.primengTableHelper.records = result.items;
    });
  }

  goExport() {
    this.exportLoading = true;
    this._adsService.getAdsToExcel(
      this.auditStatus,
      this.adsTag || undefined,
      undefined,
      undefined,
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
  //删除广告
  deleteAds(record) {
    this.message.confirm(this.l("DeleteAdsQuestion"),this.l('AreYouSure'), (r) => {
      if (r) {
        this._adsService.deleteAd(record.id).subscribe(r => {
          this.AdsPublishList = [];
          this.notify.info(this.l('success'));
          this.getAds();
        })
      }
    })
  }
  //批量删除广告
  deleteBatch() {
    this.checkSelection(true, (ary) => {
      this.message.confirm(this.l('batchDeleteAdsQuestion'), this.l('AreYouSure'),(r) => {
        if (r) {
          this._adsService.deleteAdByIds(ary).subscribe((result) => {
            this.notify.info(this.l('success'));
            this.getAds();
          })
        }
      })
    })
  }
  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }

  //新增广告
  createAds() {
    this.createOrEditAdModal.show();
  }
  //编辑广告
  editAds(record) {
    this.createOrEditAdModal.show(Object.assign({}, record));
  }
  //图片操作
  onOperate(event) {
    if (event.action == "info") {
      this.editAds(event.image);
    } else {
      this.deleteAds(event.image);
    }
  }

  // //切换显示模式
  // toggle(f) {
  //   // if (f) {
  //   //   $("#tableShow").show();
  //   //   $("#gridShow").hide();
  //   //   this.showImage = false;
  //   // } else {
  //   //   $("#tableShow").hide();
  //   //   $("#gridShow").show();
  //   //   this.showImage = true;
  //   // }
  //   this.showImage = f;
  //   this.TableCheckbox.tableService.onSelectionChange();
  // }

    //切换显示模式
    toggle(f) {
      if (f) {
        $("#tableShow").show();
        $("#gridShow").hide();
        this.showImage = false;
      } else {
        $("#tableShow").hide();
        $("#gridShow").show();
        this.showImage = true;
      }
    }



  //筛选广告上下线
  filterAds() {
    var upNum = [], upNumIds = [], downNum = [], downNumIds = [];
    this.AdsPublishList.forEach((v, index, array) => {
      if (v.auditStatus == "0") {
        downNum.push(v);
        downNumIds.push(v.id);
      } else {
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
  //检测选中广告上下线情况
  // f -> bool  代表上下线操作  true表示需要上线  则筛去已上线
  //all ->bool 表示是否操作全部
  checkSelection(f, callback, all?) {
    var upNum = this.filterAds().upNum, downNum = this.filterAds().downNum,
      upNumIds = this.filterAds().upNumIds, downNumIds = this.filterAds().downNumIds;
    if (all) {
      return callback && callback([]);
    }
    if (f) {
      if (downNum.length == 0) {
        return this.notify.info(this.l('noneOfflineGotten'));
      }
      if (upNum.length != 0) {
        this.message.confirm(this.l("nowChooseTip0") + upNum.length + this.l("nowChooseTip1"), this.l('AreYouSure'),(r) => {
          if (r) {
            this.AdsPublishList = downNum;
          }
        })
      }
    } else {
      if (upNum.length == 0) {
        return this.notify.warn(this.l('noneOnlineGotten'));
      }
      if (downNum.length != 0) {
        this.message.confirm(this.l("nowChooseTip0") + downNum.length + this.l("nowChooseTip2"), this.l('AreYouSure'),(r) => {
          if (r) {
            this.AdsPublishList = upNum;
          }
        })
      }
    }
    callback && callback(f ? downNumIds : upNumIds);
  }
  getOuTree(cb?) {
      cb && cb();
  }
  //展开发布广告
  goPublishAds() {
    this.checkSelection(false, (ary) => {
      this.getOuTree(() => {
        this.toPublish = true;
        this.publishType = 'add';
      })
    })
  }
  //取消
  no() {
    $("#review").hide();
  }



  //确定
  ok() {
    this.busy = true;
    this.applyService.createApplyForm(this.apply)
      .pipe(finalize(() => {
        this.AdsPublishList = [];
        this.busy = false;
        $("#review").hide();
      }))
      .subscribe((result) => {
        // this.AdsPublishList = [];
        this.getAds();
        // $("#review").modal('hide');
        // this.busy = false;
      })
  }
  //确认发布广告
  doPublishAds() {
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
        'isCreateDefaultSchedule':this.isCreateDefaultSchedule,
        'informDevice':this.informDevice,
        'type':'publish'
      });
      if (this.operateAll) {
        this.AdsPublishList = [];
        this.message.confirm(this.publishType == 'delete' ? this.l('isWithdrewAll') : this.l('isPublishAll'), this.l('AreYouSure'),(r) => {
          if (r) {
            this._adsService.publishAllAdsToOrganizationOrDevicesOrStore(input).subscribe((result) => {
              this.notify.info(this.l('success'));
              this.toPublish = false;
              this.operateAll = false;
            });
          }
        });
      } else {
        this.message.confirm(this.publishType == 'delete' ? this.l('isWithdrewChosen') : this.l('isPublishChosen'),this.l('AreYouSure'), (r) => {
          if (r) {
            this._adsService.publishAdsToOrganizationOrDevicesOrStore(input).subscribe((result) => {
              this.AdsPublishList = [];
              this.notify.info(this.l('success'));
              this.toPublish = false;
              this.operateAll = false;
            });
          }
        });
      }
    }, this.operateAll)
  }
  //审核
  review(f, ary?) {
    this.apply.itemids = ary ? ary : [];
    this.apply.reason = '';
    this.apply.wanted = f ? CreateApplyFormInputWanted.Online : CreateApplyFormInputWanted.Offline;
    $("#review").show();
  }

  //下线所有广告
  offlineAll() {
    this.review(false);
  }
  //下线广告
  offline() {
    this.checkSelection(false, (ary) => {
      this.review(false, ary);
    })
  }
  //上线广告
  online() {
    this.checkSelection(true, (ary) => {
      this.review(true, ary);
    })
  }
  //上线所有广告
  onlineAll() {
    this.review(true);
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
  //发布所有
  publishAll() {
    this.getOuTree(() => {
      this.toPublish = true;
      this.publishType = 'add';
      this.operateAll = true;
    })
  }
  //撤回所有
  withdrawAll() {
    this.getOuTree(() => {
      this.toPublish = true;
      this.publishType = 'delete';
      this.operateAll = true;
    })
  }
  //广告导入
  import() {
    this.router.navigate(['app', 'admin','import', 'import', 'ads']);
  }
  //筛选树
  filterTree(e?: Event) {
    e && e.preventDefault();
    this.myTree.filterTree(this.treeFilter, this.deviceTypeId);
  }

  getMapList () {
    this._RobotServiceProxy.getMaps()
      .subscribe(r => {
        this.mapList = (r || []).map(i => {
          return {
            'id': i.id,
            'value': i.name
          }
        })
      })
  }

}
