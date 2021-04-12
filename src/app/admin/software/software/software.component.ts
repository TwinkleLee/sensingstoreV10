import { Component, OnInit, Injector, ViewChild, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { appModuleAnimation } from '@shared/animations/routerTransition';

import { SoftwareServiceProxy, SoftwareDto,ApplyServiceProxy,ApplyWanted as CreateApplyFormInputWanted, ApplyFormType as CreateApplyFormInputApplyType, CreateApplyFormInput,PublishEntitiesInput,IdTypeDto } from '@shared/service-proxies/service-proxies-ads';


import { MyTreeComponent } from '@app/shared/common/my-tree/my-tree.component';
import { Table,TableCheckbox } from 'primeng/table';

import { AppSessionService } from '@shared/common/session/app-session.service';
import { ActivatedRoute, Router } from '@angular/router';

import { CreateAppModalComponent } from '@app/admin/software/software/create-app-modal.component';
import { ConnectorService } from '@app/shared/services/connector.service';
import { SoftwareAuthComponent } from '@app/admin/software/software/auth/software-auth.component';
import { SoftwareSettingModalComponent } from '@app/admin/software/software/operation/software-setting-modal.component';
import { DeviceServiceProxy as NewDeviceServiceProxy} from '@shared/service-proxies/service-proxies-devicecenter';


@Component({
  selector: 'app-software',
  templateUrl: './software.component.html',
  styleUrls: ['./software.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})
export class SoftwareComponent extends AppComponentBase {
  @ViewChild('createAppModal', { static: true }) createAppModal: CreateAppModalComponent;
  @ViewChild('softwareSettingModal', { static: true }) softwareSettingModal: SoftwareSettingModalComponent;
  // @ViewChild('editUserPermissionsModal') editPerPermissionsModal: EditPerPermissionsModalComponent;
  //host or tenant
  @ViewChild('dataTable', { static: false }) dataTable: Table;
  @ViewChild('paginator', { static: false }) paginator: Paginator;

  @ViewChild('myTree', { static: false }) myTree: MyTreeComponent;
  @ViewChild('SoftwareAuth', { static: true }) SoftwareAuth: SoftwareAuthComponent;
  @ViewChild('TableCheckbox', { static: true }) TableCheckbox: TableCheckbox;

  filterText: string = "";
  treeFilter: string = "";
  tenants: any = [];
  softwareType: any = "";
  tenantId: any = "";
  OkToRender: boolean = false;
  AppPublishList: any = [];
  //发布控制
  toPublish = false;
  publishType = 'add';
  deviceTree: any[] = [];
  //控制显示的标志
  // AuditStatus = this.AuditStatus;
  displayType = true;
  operateAll = false;
  exportLoading = false;
  //审核
  apply: CreateApplyFormInput = new CreateApplyFormInput;
  CreateApplyFormInputWanted = CreateApplyFormInputWanted;
  showImageGrid = false;


  customHeight = document.body.clientHeight;


  AuthorizedSoftwaresList = [];
  ForTenantExpiredSoftwaresList = [];
  ForTenantSoftwaresList = [];

  onlyPublishToDevice = false;

  tenantAppPublish: any = {};

  isShowToTenant: any = "";
  informDevice = false;

  constructor(injector: Injector,
    private _softwareService: SoftwareServiceProxy,
    private _NewDeviceServiceProxy: NewDeviceServiceProxy,
    private applyService: ApplyServiceProxy,
    private router: Router,
    private route: ActivatedRoute,
    private connector: ConnectorService
  ) {
    super(injector);

    this.apply.applyType = CreateApplyFormInputApplyType.App;
    this.apply.itemids = [];
    this.apply.options = 'all';

    if (this.appSession.tenantId) {
      this._NewDeviceServiceProxy.getOuStoreDeviceTree([]).subscribe((result) => {
        this.deviceTree = [result];
      })
    }
    if (this.appSession.tenant) {
      this.getAuthedSoftwares();
    }
  }

  //tenant
  getAuthedSoftwares() {
    this.AppPublishList = [];
    this.tenantAppPublish = {};
    this._softwareService.getAuthorizedSoftwares(
      void 0,
      void 0,
      void 0,
      void 0,
      999,
      0
    ).subscribe(result => {
      this.AuthorizedSoftwaresList = result.items.filter(item => !item.isExpired);
      this.ForTenantExpiredSoftwaresList = result.items.filter(item => item.isExpired);
    });

    this._softwareService.getForTenantSoftwares(
      void 0,
      void 0,
      void 0,
      999,
      0).subscribe(r => {
        this.ForTenantSoftwaresList = r.items;
      })
  }
  showEmpty(e) {
    var target = $(e.target);
    target.attr("src", AppConsts.appBaseUrl + "/assets/common/images/holderimg.png")
  }

  initPublishList() {
    this.AppPublishList = [];
    for (var id in this.tenantAppPublish) {
      if (this.tenantAppPublish[id]) {
        this.AppPublishList.push(this.AuthorizedSoftwaresList.find(item => {
          return item.id == id
        }));
      }
      console.log(this.AppPublishList);
    }
  }

  //host获取app列表
  getSoftwares(event?: LazyLoadEvent) {
    if (this.appSession.tenant) {
      return this.getAuthedSoftwares();
    }

    setTimeout(() => {

      if (this.primengTableHelper.shouldResetPaging(event)) {
        this.paginator.changePage(0);
        return;
      }
      this.AppPublishList = [];

      this.primengTableHelper.showLoadingIndicator();
      this._softwareService.getSoftwares4Host(
        this.softwareType,
        this.isShowToTenant,
        this.filterText,
        this.primengTableHelper.getSorting(this.dataTable) || 'lastModificationTime DESC',
        this.primengTableHelper.getMaxResultCount(this.paginator, event),
        this.primengTableHelper.getSkipCount(this.paginator, event)
      )
        .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
        .subscribe(result => {
          this.primengTableHelper.totalRecordsCount = result.totalCount;
          this.primengTableHelper.records = result.items;
          // this.primengTableHelper.hideLoadingIndicator();
        });

    }, 500)

  }
  //添加软件授权
  addAppAuth() {
    this.SoftwareAuth.show();
  }
  //
  editAppSetting(record) {
    this.softwareSettingModal.show(record);
  }
  //切换显示模式
  toggle(f) {
    if (f) {
      this.showImageGrid = false;
      $("#tableShow").show();
      $("#gridShow").hide();
    } else {
      this.showImageGrid = true;
      $("#tableShow").hide();
      $("#gridShow").show();
    }
    this.TableCheckbox.tableService.onSelectionChange();
  }
  //筛选App上下线
  filterProduct() {
    var upNum = [], upNumIds = [], downNum = [], downNumIds = [];
    this.AppPublishList.forEach((v, index, array) => {
      if (v.auditStatus == 0) {
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
  //检测选中App上下线情况
  // f -> bool  
  //all ->bool 表示是否操作全部
  checkSelection(f, callback, all?) {
    var selection = [];
    if (all) {
      return callback && callback(selection);
    }
    this.AppPublishList = this.AppPublishList.filter((item) => {
      if (item.isExpired) { return false; }
      return selection.push(item.id);
    })
    if (selection.length == 0) {
      return this.notify.warn(this.l('atLeastOneAuthApp'));
    }
    callback && callback(selection);
  }
  getOuTree(cb?) {

    //获取组织树
    // this.deviceService.getTreeDevices().subscribe((result) => {
    //   this.deviceTree = [result];
    cb && cb();
    // })
  }
  //打开侧边发布栏
  goPublishApp() {
    this.checkSelection(false, (ary) => {
      this.getOuTree(() => {
        this.toPublish = true;
      })
    })
  }
  //
  doPublishApp() {
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
        this._softwareService.publishAllSoftwaresToOrganizationOrDevicesOrStore(input).subscribe((result) => {
          this.notify.info(this.l('success'));
          this.AppPublishList = [];
          this.tenantAppPublish = {};
          this.toPublish = false;
          this.operateAll = false;
        });
      } else {
        // publishToOrganizationOrDevicesOrStore
        this._softwareService.publishSoftwaresToOrganizationOrDevicesOrStore(input).subscribe((result) => {
          this.notify.info(this.l('success'));
          this.AppPublishList = [];
          this.tenantAppPublish = {};
          this.toPublish = false;
          this.operateAll = false;
        });
      }
    }, this.operateAll);
  }
  //新增软件
  createSoftware() {
    this.createAppModal.show();
  }
  //创建软件授权
  createSoftwareAuth() {
    this.router.navigate(['auth'], { relativeTo: this.route });
  }
  //编辑软件授权
  editSoftware(record) {
    this.connector.setCache('software', Object.assign({}, record));
    this.router.navigate(['operation', record.id], { relativeTo: this.route });
  }
  //删除软件
  deleteSoftware(record) {
    this.message.confirm(this.l("DeleteThisAppQuestion"), this.l('AreYouSure'), (r) => {
      if (r) {
        this._softwareService.deleteSoftware(record.id).subscribe(result => {
          this.notify.info(this.l('success'));
          this.getSoftwares();
        })
      }
    })
  }
  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }
  onOperate(event?) {
    if (event.action == 'info') {
      if (this.appSession.tenant) {
        this.editAppSetting(event.image);
      } else {
        this.editSoftware(event.image);
      }
    } else {
      this.deleteSoftware(event.image);
    }
  }

  //取消
  no() {
    $("#review").hide();
  }
  //确定
  ok() {
    this.applyService.createApplyForm(this.apply).subscribe((result) => {
      this.AppPublishList = [];
      this.getSoftwares();
      $("#review").hide();
    })
  }
  //审核
  review(f, ary?) {
    this.apply.itemids = ary ? ary : [];
    this.apply.reason = '';
    this.apply.wanted = f ? CreateApplyFormInputWanted.Online : CreateApplyFormInputWanted.Offline;
    $("#review").show();
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

  //筛选树
  filterTree(e?: Event) {
    e && e.preventDefault();
    this.myTree.filterTree(this.treeFilter);
  }
}
