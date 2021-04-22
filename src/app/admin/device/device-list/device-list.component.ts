import { Component, OnInit, Injector, ViewChild } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Injectable } from '@angular/core'
import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TenantServiceProxy } from '@shared/service-proxies/service-proxies';
import { DeviceServiceProxy as NewDeviceServiceProxy, DeviceMirrorPublishInput, PublishDeviceInput, StoreServiceProxy } from '@shared/service-proxies/service-proxies-devicecenter';

import { ApplyServiceProxy, ApplyWanted as CreateApplyFormInputWanted, AuditStatus as AuditStatus2, ApplyFormType as CreateApplyFormInputApplyType, CreateApplyFormInput } from '@shared/service-proxies/service-proxies-devicecenter';

@Injectable()
export class YourInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req);
  }
}
import { Paginator } from 'primeng/paginator';
import { CreateOrEditDeviceModalComponent } from '@app/admin/device/device-list/create-or-edit-device-modal.component';
import { Router, ActivatedRoute } from '@angular/router';
import { ConnectorService } from '@app/shared/services/connector.service';
import { MyTreeComponent } from '@app/shared/common/my-tree/my-tree.component';
import { Table } from 'primeng/table';
import { finalize } from 'rxjs/operators';
import { CounterDeviceServiceProxy } from '@shared/service-proxies/service-proxies-smartdevice';
import { AppConsts } from '@shared/AppConsts';
import { TokenService } from 'abp-ng2-module';

@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.component.html',
  styleUrls: ['./device-list.component.css'],
  animations: [appModuleAnimation()]
})
export class DeviceListComponent extends AppComponentBase implements OnInit {

  @ViewChild('createOrEditDeviceModal', { static: true }) createOrEditDeviceModal: CreateOrEditDeviceModalComponent;
  // @ViewChild('editUserPermissionsModal') editPerPermissionsModal: EditPerPermissionsModalComponent;
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;
  @ViewChild('myTree', { static: false }) myTree: MyTreeComponent;
  // @ViewChild('StoreCombobox') storeComboboxElement: ElementRef;
  @ViewChild('typeTree', { static: false }) typeTree: MyTreeComponent;

  @ViewChild('highTree1', { static: false }) highTree1;
  @ViewChild('highTree2', { static: false }) highTree2;

  customTheme = AppConsts.customTheme;

  treeFilter: string = "";
  filterText: string;
  tenantId: any = "";
  status: any = "";
  operationType: any = "";
  editions = [{}];
  tenants: any = [];
  auditStatus: any = "";
  toPublish;
  deviceTree: any[] = [];
  devicePublishList = [];
  publishType;
  operateAll;
  busy = false;
  config: any = {
    'singleSelect': true,
    'showOuterId': true
  };
  config2: any = {
    'singleSelect': false,
    'showOuterId': true
  };
  ifMirror = false;
  mirrorList: any = [
    { name: 'Advertisement', selected: false, key: "ads" },
    { name: 'product', selected: false, key: "product" },
    { name: 'software', selected: false, key: "Software" },
    { name: 'Activities', selected: false, key: "activity" },
    { name: 'coupon', selected: false, key: "Coupon" },
  ];
  stores: any[] = [];
  belongStore: any = "";
  storeFilter: string = '';
  deviceTypeId: any = '';
  deviceTypeList = [];
  //枚举
  AuditStatus2 = AuditStatus2;
  CreateApplyFormInputWanted = CreateApplyFormInputWanted;
  //审核
  apply: CreateApplyFormInput = new CreateApplyFormInput();


  exportLoading = false;

  //类型筛选
  typeFilter = '';
  deviceTypeIds = [];
  // showType = false;
  TypeText = '';

  chosenItem = [];

  // storeText = '';
  // showStore = false;
  chosenItem2 = [];
  // storeList = [];
  // @ViewChild('storeTree',{static:false}) storeTree: MyTreeComponent;

  constructor(injector: Injector,
    private _tenantService: TenantServiceProxy,
    private router: Router,
    private connector: ConnectorService,
    private applyService: ApplyServiceProxy,
    private _StoreServiceProxy: StoreServiceProxy,
    private _tokenService: TokenService,
    private route: ActivatedRoute,
    private _CounterDeviceServiceProxy: CounterDeviceServiceProxy,
    private _NewDeviceServiceProxy: NewDeviceServiceProxy

  ) {
    super(injector);
    this.apply.applyType = CreateApplyFormInputApplyType.Device;
    this.apply.itemids = [];
    this.apply.options = 'all';
    if (!this.appSession.tenant) {

      this._tenantService.getTenants("", void 0, void 0, void 0, void 0, 0, false, void 0, 1000, 0).subscribe(result => {
        this.tenants = result.items;
      })
    }
  }


  clickContainer() {
    if (this.highTree1 && this.highTree1.showStore) {
      this.highTree1.clickInput()
    }
    if (this.highTree2 && this.highTree2.showStore) {
      this.highTree2.clickInput()
    }
  }

  onTreeUpdate(e) {
    this.chosenItem = e.map(item => {
      return item.id
    })
  }

  onTreeUpdate2(e) {
    this.chosenItem2 = e.filter(item => {
      return item.type == 'store'
    }).map(item => {
      return item.id
    })
  }

  ngOnInit() {
    console.log(this.appSession)

    if (window.location.search != '') {
      var deviceQuery = this.connector.getCache('deviceQuery');
      this.status = deviceQuery.status;
      this.operationType = deviceQuery.operationType;
      this.auditStatus = deviceQuery.auditStatus;
      this.filterText = deviceQuery.filterText;
      this.dataTable.sortField = deviceQuery.sort ? deviceQuery.sort.split(' ')[0] : void 0;
      this.dataTable.sortOrder = deviceQuery.sort ? deviceQuery.sort.split(' ')[1].indexOf('ASC') > -1 ? 1 : -1 : void 0;
      this.paginator.rows = deviceQuery.maxResultCount;
      this.paginator.first = deviceQuery.skipCount;
      this.primengTableHelper.defaultRecordsCountPerPage = deviceQuery.maxResultCount;
      setTimeout(() => {
        this.paginator.updatePaginatorState();
      }, 0);
    }


    // ????
    if (this.appSession.tenantId) {
      // this._NewDeviceServiceProxy.getOuStoreDeviceTree([]).subscribe((result) => {
      //   this.deviceTree = [result];
      // })
      this._StoreServiceProxy.getCurrentTenantOrganizationUnitsAndStoresTree([],false).subscribe((result) => {
        this.deviceTree = [result];
      })
    }


    this._NewDeviceServiceProxy.getDeviceTypes(
      void 0,
      'id ASC',
      99,
      0
    ).subscribe(result => {
      this.deviceTypeList = result.items;
    });
  }

  // ngOnDestroy() {
  // $(document).off("click", this.dropDownBind2);
  // $(document).off("click", this.dropDownBind3);
  // }

  // updateStoreSelected() {
  //   if (this.showStore) {
  //     var arr = this.storeTree.getchosen().map(item => {
  //       return item.text
  //     })
  //     this.storeText = '';
  //     for (var i = 0; i < arr.length; i++) {
  //       this.storeText = this.storeText + arr[i] + ' '
  //     }
  //   }
  // }
  // dropDownBind2 = function (e) {
  //   var target = e.target;
  //   if (!$(target).hasClass("belongToTree")) {
  //     this.showType = false;
  //     this.updateTypeSelected();
  //   }
  // }.bind(this);
  // dropDownBind3 = function (e) {
  //   var target = e.target;
  //   if (!$(target).hasClass("belongToTree")) {
  //     this.showStore = false;
  //     this.updateStoreSelected();
  //   }
  // }.bind(this);
  //筛选树
  typeFilterTree(e?: Event) {
    e && e.preventDefault();
    if (this.typeTree) {
      this.typeTree.filterTree(this.typeFilter);
    }
  }
  // //筛选树
  // storeFilterTree(e?: Event) {
  //   e && e.preventDefault();
  //   if (this.storeTree) {
  //     this.storeTree.filterTree(this.storeFilter);
  //   }
  // }


  // getStores() {
  //   if (this.appSession.tenant) {
  //     this._StoreServiceProxy.getCurrentTenantOrganizationUnitsAndStoresTree().subscribe((result) => {
  //       this.storeList = [result];
  //     })
  //   }
  // }


  // updateTypeSelected() {

  //   if (this.showType) {
  //     var arr = this.typeTree.getchosen().map(item => {
  //       return item.name
  //     })
  //     this.TypeText = '';
  //     for (var i = 0; i < arr.length; i++) {
  //       this.TypeText = this.TypeText + arr[i] + ' '
  //     }
  //   }

  // }

  //获取设备列表
  getDevices(event?: LazyLoadEvent) {
    // if (this.showType) {
    //   this.chosenItem = this.typeTree.getchosen().map(item => {
    //     return item.id
    //   })
    // }
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.devicePublishList = [];

    this.primengTableHelper.showLoadingIndicator();
    if (!this.appSession.tenant) {
      this._NewDeviceServiceProxy.getDevicesForHost(
        this.tenantId,
        this.chosenItem,
        this.status,
        this.operationType,
        this.auditStatus,
        this.filterText,
        this.primengTableHelper.getSorting(this.dataTable),
        this.primengTableHelper.getMaxResultCount(this.paginator, event),
        this.primengTableHelper.getSkipCount(this.paginator, event)).pipe(finalize(() => {
          this.primengTableHelper.hideLoadingIndicator();
          // this.showType = false;
        })).subscribe(result => {
          this.primengTableHelper.totalRecordsCount = result.totalCount;
          this.primengTableHelper.records = result.items;
        });
    } else {
      // if (this.showStore) {
      //   this.chosenItem2 = this.storeTree.getchosen().map(item => {
      //     return item.id
      //   })
      //   console.log(this.storeTree.getchosen())
      // }

      this._NewDeviceServiceProxy.getDevices(
        [],
        this.status,
        this.operationType,
        this.auditStatus,
        void 0,
        this.chosenItem,
        this.chosenItem2,
        this.filterText,
        this.primengTableHelper.getSorting(this.dataTable) || 'name',
        this.primengTableHelper.getMaxResultCount(this.paginator, event),
        this.primengTableHelper.getSkipCount(this.paginator, event)
      ).pipe(finalize(() => {
        this.primengTableHelper.hideLoadingIndicator();
        // this.showType = false;
      })).subscribe(result => {
        this.primengTableHelper.totalRecordsCount = result.totalCount;
        this.primengTableHelper.records = result.items;
      });
    }
  }
  //删除设备
  deleteDevice(record) {
    this.message.confirm(this.l("DeleteDeviceQuestion"), this.l('AreYouSure'), (r) => {
      if (r) {

        if (AppConsts.customTheme == 'kewosi') {
          this._NewDeviceServiceProxy.deleteDevice(record.id)
            .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
            .subscribe(() => {
              // this.primengTableHelper.hideLoadingIndicator();
              this.notify.info(this.l('success'));
              this.getDevices();
            })
        } else {
          this.primengTableHelper.showLoadingIndicator();
          this._CounterDeviceServiceProxy.cancelBindAfterDeletingDevices([record.id]).pipe(finalize(() => {
            this.primengTableHelper.hideLoadingIndicator();
          }))
            .subscribe(() => {
              this.primengTableHelper.showLoadingIndicator();
              this._NewDeviceServiceProxy.deleteDevice(record.id)
                .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
                .subscribe(() => {
                  // this.primengTableHelper.hideLoadingIndicator();
                  this.notify.info(this.l('success'));
                  this.getDevices();
                })
            })
        }

      }
    })
  }
  deleteBatch() {
    this.checkSelection(true, (ary) => {
      this.message.confirm(this.l("DeleteDeviceQuestion"), this.l('AreYouSure'), (r) => {
        if (r) {
          if (AppConsts.customTheme == 'kewosi') {
            this._NewDeviceServiceProxy.deleteDevices(ary)
              .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
              .subscribe(() => {
                // this.primengTableHelper.hideLoadingIndicator();
                this.notify.info(this.l('success'));
                this.getDevices();
              })
          } else {
            this.primengTableHelper.showLoadingIndicator();
            this._CounterDeviceServiceProxy.cancelBindAfterDeletingDevices(ary).pipe(finalize(() => {
              this.primengTableHelper.hideLoadingIndicator();
            })).subscribe(() => {
              this.primengTableHelper.showLoadingIndicator();
              this._NewDeviceServiceProxy.deleteDevices(ary)
                .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
                .subscribe(() => {
                  // this.primengTableHelper.hideLoadingIndicator();
                  this.notify.info(this.l('success'));
                  this.getDevices();
                })
            })
          }

        }
      })
    })
  }
  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }
  //弹出框  创建与修改
  createDevice() {
    //  V3 for ecovacs
    if (AppConsts.customTheme == 'kewosi') {
      var url = AppConsts.remoteServiceBaseUrl + '/api/services/app/IndependentDeployment/CheckIndependentDeployment';
      var token = this._tokenService.getToken();
      var _that = this;
      var host = AppConsts.deploymentList.ecovacs.host;
      var customer = AppConsts.deploymentList.ecovacs.customer;
      $.ajax({
        'type': 'GET',
        'url': url + `?customer=${customer}&checkaction=adddevice&host=${host}&tenantId=${abp.session.tenantId}`,
        'contentType': false,
        'beforeSend': function (request) {
          request.setRequestHeader("Authorization", "Bearer " + token)
        },
        'success': function (res) {
          if (!res.result.success) return _that.message.error(_that.l(res.result.errorMessage));
          _that.createOrEditDeviceModal.show();
        }
      })
    } else {
      this.createOrEditDeviceModal.show();
    }
  }
  editDevice(record) {
    this.connector.setCache('deviceQuery', {
      'status': this.status,
      'operationType': this.operationType,
      'auditStatus': this.auditStatus,
      'filterText': this.filterText,
      'sort': this.primengTableHelper.getSorting(this.dataTable),
      'maxResultCount': this.primengTableHelper.getMaxResultCount(this.paginator, null),
      'skipCount': this.primengTableHelper.getSkipCount(this.paginator, null)
    });
    //此处 在跳页之前 在浏览器历史里将当前页面路径替换成带query的
    //这样直接点浏览器返回时  返回到的页面就是下面指定的url
    window.history.pushState('', null, window.location.href + '?useQuery=true');
    this.router.navigate(['operation', record.id], { relativeTo: this.route });
  }
  //筛选设备上下线
  filterDevice() {
    var upNum = [], upNumIds = [], downNum = [], downNumIds = [];
    this.devicePublishList.forEach((v, index, array) => {
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
    var upNum = this.filterDevice().upNum, downNum = this.filterDevice().downNum,
      upNumIds = this.filterDevice().upNumIds, downNumIds = this.filterDevice().downNumIds;
    if (all) {
      return callback && callback([]);
    }
    if (f == 'mirror') {//镜像发布
      console.log('mirror')
      callback && callback(downNumIds[0] ? downNumIds : upNumIds);

    } else {//普通发布

      if (f) {
        if (downNum.length == 0) {
          return this.notify.info(this.l('noneOfflineGotten'));
        }
        if (upNum.length != 0) {
          this.message.confirm(this.l("nowChooseTip0") + upNum.length + this.l("nowChooseTip1"), this.l('AreYouSure'), (r) => {
            if (r) {
              this.devicePublishList = downNum;
            }
          })
        }
      } else {
        if (upNum.length == 0) {
          return this.notify.info(this.l('noneOnlineGotten'));
        }
        if (downNum.length != 0) {
          this.message.confirm(this.l("nowChooseTip0") + downNum.length + this.l("nowChooseTip2"), this.l('AreYouSure'), (r) => {
            if (r) {
              this.devicePublishList = upNum;
            }
          })
        }
      }


      callback && callback(f ? downNumIds : upNumIds);
    }

  }

  //显示发布设备侧栏
  goPublishDevice() {
    this.ifMirror = false;

    // this._StoreServiceProxy.getCurrentTenantOrganizationUnitsAndStoresTree().subscribe((result) => {
    //   this.deviceTree = [result];
      this.checkSelection(false, (ary) => {
        this.toPublish = true;
      })
    // })

  }

  //显示镜像发布侧栏
  goPublishMirror() {
    this.ifMirror = true;
    this._NewDeviceServiceProxy.getOuStoreDeviceTree([]).subscribe((result) => {
      this.deviceTree = [result];
      console.log(this.devicePublishList, 1)
      console.log(this.deviceTree, 2)

      if (this.devicePublishList.length != 1) {
        this.notify.warn(this.l('mirrorPublishTip'));
      } else {
        this.checkSelection('mirror', (ary) => {
          this.toPublish = true;
        })
      }
    })


  }
  //发布
  doPublishDevice() {
    if (this.ifMirror) {

      var feature = [];
      for (var i = 0; i < this.mirrorList.length; i++) {
        if (this.mirrorList[i].selected) {
          feature.push(this.mirrorList[i].key)
        }
      }
      if (feature.length == 0) {
        this.message.info(this.l('atLeastChooseOneFeature'));
        return
      }

      console.log(this.myTree.getchosenIds(), this.devicePublishList[0].id)
      for (var i = 0; i < this.myTree.getchosenIds().length; i++) {
        if (this.myTree.getchosenIds()[i] == this.devicePublishList[0].id) {//不能发给自己
          this.message.info(this.l('notPublishToSelf'));
          return
        }
      }


      this.checkSelection('mirror', (ary) => {
        var ouOrDeviceList0 = this.myTree.getchosen();
        var ouOrDeviceList = [];
        for (var i = 0; i < ouOrDeviceList0.length; i++) {
          if (ouOrDeviceList0[i].type == 'device') {
            ouOrDeviceList.push(ouOrDeviceList0[i].id)
          }
        }

        if (ouOrDeviceList.length == 0) {
          return this.notify.warn(this.l('noselectou'));
        }
        var input = new DeviceMirrorPublishInput({
          'sourceId': ary[0],
          'targetIds': ouOrDeviceList,
          'features': feature
        });
        console.log(input)
        this.message.confirm(this.l('isPublishChosen'), this.l('AreYouSure'), (r) => {
          if (r) {
            this._NewDeviceServiceProxy.publishDeviceMirror(input).subscribe((result) => {
              this.notify.info(this.l('success'));
              this.toPublish = false;
              this.operateAll = false;
              this.devicePublishList = [];
              this.getDevices(<LazyLoadEvent>{});

              this.mirrorList = [
                { name: 'Advertisement', selected: false, key: "ads" },
                { name: 'product', selected: false, key: "product" },
                { name: 'software', selected: false, key: "Software" },
                { name: 'Activities', selected: false, key: "activity" },
                { name: 'coupon', selected: false, key: "Coupon" },
              ];
            });
          }
        });
      }, this.operateAll)

    } else {
      this.checkSelection(false, (ary) => {
        // var ouOrDeviceList = this.myTree.getchosenIds();
        var ouOrDeviceList = this.myTree.getchosen().filter(item => {
          return item.type == 'store'
        }).map(item => {
          return item.id
        });
        // var ouOrDeviceList = this.myTree.getchosen();
        if (ouOrDeviceList.length == 0) {
          return this.notify.warn(this.l('noselectou'));
        }
        var input = new PublishDeviceInput({
          'deviceIds': ary,
          'storeId': ouOrDeviceList[0]
        });
        this.message.confirm(this.l('isPublishChosen'), this.l('AreYouSure'), (r) => {
          if (r) {
            this._NewDeviceServiceProxy.publishDeviceToStore(input).subscribe((result) => {
              this.notify.info(this.l('success'));
              this.toPublish = false;
              this.operateAll = false;
              this.devicePublishList = [];
              this.getDevices(<LazyLoadEvent>{});
            });
          }
        });
      }, this.operateAll)
    }

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
        this.devicePublishList = [];
        $("#review").hide();
        this.busy = false;
      }))
      .subscribe((result) => {
        this.getDevices();
      })
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
      console.log(ary);
      this.review(true, ary);
    })
  }
  //上线所有设备
  onlineAll() {
    this.review(true);
  }
  //撤回设备
  withdrawDevice() {
    this.checkSelection(false, (ary) => {
      this.message.confirm(this.l('withdrawDeviceQuestion'), this.l('AreYouSure'), (r) => {
        if (r) {
          var input = new PublishDeviceInput({
            'deviceIds': ary,
            'storeId': null
          });
          this._NewDeviceServiceProxy.recycleDeviceFromStore(input).subscribe((result) => {
            this.notify.info(this.l('success'));
            this.toPublish = false;
            this.operateAll = false;
            this.devicePublishList = [];
            this.getDevices(<LazyLoadEvent>{});
          });
        }
      })
    })
  }
  //撤回所有
  withdrawAll() {
    this.message.confirm(this.l('withdrawAllDeviceQuestion'), this.l('AreYouSure'), (r) => {
      if (r) {
        var input = new PublishDeviceInput({
          'deviceIds': [],
          'storeId': null
        });
        this._NewDeviceServiceProxy.recycleDeviceFromStore(input).subscribe((result) => {
          this.notify.info(this.l('success'));
          this.toPublish = false;
          this.operateAll = false;
          this.devicePublishList = [];
          this.getDevices(<LazyLoadEvent>{});
        });
      }
    })
  }
  //前往导入页面
  goImport() {
    this.router.navigate(['app', 'admin', 'import', 'import', 'device']);
  }

  goExport() {
    this.exportLoading = true;
    // if (this.showType) {
    //   this.chosenItem = this.typeTree.getchosen().map(item => {
    //     return item.id
    //   })
    // }
    this._NewDeviceServiceProxy.getDeviceToExcel(
      [],
      this.status,
      this.operationType,
      this.auditStatus,
      void 0,
      this.chosenItem,
      this.chosenItem2,
      this.filterText,
      this.primengTableHelper.getSorting(this.dataTable),
      void 0,
      0
    ).subscribe(r => {
      setTimeout(() => {
        this.exportLoading = false;
      }, 2000)
      var href = AppConsts.remoteServiceBaseUrl + `/api/File/DownloadTempFile?FileName=` + r.fileName + `&FileType=` + r.fileType + `&FileToken=` + r.fileToken;
      console.log(href)

      var link = document.getElementById('aaa');
      $(link).attr("href", href);

      link.click();
    })
  }
  //筛选树
  filterTree(e?: Event) {
    e && e.preventDefault();
    this.myTree.filterTree(this.treeFilter);
  }
}

