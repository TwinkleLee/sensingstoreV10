import { Component, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import {  OrganizationUnitServiceProxy} from '@shared/service-proxies/service-proxies';
import { CreateOrEditStoreModalComponent } from './operation/create-or-edit-store-modal.component';
import { MyTreeComponent } from '@app/shared/common/my-tree/my-tree.component';
import { Router } from '@angular/router';
import { BuildingServiceProxy, Room } from '@shared/service-proxies/service-proxies-floor'
import { StoreServiceProxy as NewStoreServiceProxy, PublishStoresInput, GetStorseListInput, StoreAuditInput,OrganizationUnitServiceProxy as DeviceOrganizationUnitServiceProxy, IdTypeDto, StoreStatus } from '@shared/service-proxies/service-proxies-devicecenter';

import { BrandServiceProxy } from '@shared/service-proxies/service-proxies-devicecenter';



import { SensingTicketServiceProxy } from '@shared/service-proxies/service-proxies2'

@Component({
  selector: 'app-entity-store-category',
  templateUrl: './entity-store.component.html',
  animations: [appModuleAnimation()]
})
export class EntityStoreComponent extends AppComponentBase {

  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;
  @ViewChild('createOrEditStoreModal', { static: true }) createOrEditStoreModal: CreateOrEditStoreModalComponent;
  @ViewChild('myTree', { static: false }) myTree: MyTreeComponent;
  @ViewChild('highTree', { static: false }) highTree;


  buildingList: any = [];
  StoreStatus = StoreStatus;




  filterText: string;
  storeCheckedList: any = [];

  areaList = [];
  areaFilter = "";
  ouList = [];
  ouFilter = "";
  chosenItem = [];

  treeFilter: string = "";
  toPublish;
  operateAll;
  publishType = 'add';
  ouTree: any[] = [];
  exportLoading = false;

  storeStatus: any = "";
 

  // brand&&room
  brandList: any = [];

  frozenCols: any = [{ field: 'name', header: 'Action' }];

  constructor(injector: Injector,
    private _organizationUnitService: OrganizationUnitServiceProxy,
    private _NewStoreServiceProxy: NewStoreServiceProxy,
    private _router: Router,
    private _buildingServiceProxy: BuildingServiceProxy,
    private _BrandServiceProxy: BrandServiceProxy,
    private _SensingTicketServiceProxy: SensingTicketServiceProxy,
    private _DeviceOrganizationUnitServiceProxy:DeviceOrganizationUnitServiceProxy
  ) {
    super(injector);
    this._DeviceOrganizationUnitServiceProxy.getAreas().subscribe(r => {
      this.areaList = r;
    })
    this._organizationUnitService.getOrganizationUnits().subscribe(r => {
      this.ouList = r.items;
    })
    this._organizationUnitService.getCurrentTenantOrganizationUnitsTree().subscribe((result) => {
      this.ouTree = [result];
    })
    this.floorFilter();
  }

  floorFilter() {
    this._buildingServiceProxy.getBuildingsForSelect().subscribe((result) => {
      this.buildingList = (result || []).map((item) => {
        return {
          'id': item.id,
          'value': item.name
        }
      })
    })
    if (this.isGranted("Pages.Tenant.Products")) {
      this._BrandServiceProxy.getBrands(
        void 0,
        void 0,
        void 0,
        void 0,
        999, 0
      )
        .subscribe(result => {
          this.brandList = result.items;
        });
    }

  }

  getBrandName(record) {
    if (!record.brandId) {
      return
    }
    var brand = this.brandList.find(brand => brand.id == record.brandId);
    if (brand) return brand.name
    return "";
  }
  onTreeUpdate(originalArr) {
    this.chosenItem = originalArr.map(item => {
      return item.id
    });
  }

  clickContainer() {
    if (this.highTree && this.highTree.showStore) {
      this.highTree.clickInput()
    }
  }

  getStoreList(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.storeCheckedList = [];
    this.primengTableHelper.showLoadingIndicator();

    this._NewStoreServiceProxy.getStoresList(new GetStorseListInput({
      storeStatus: this.storeStatus,
      // roomstatus: this.roomstatus,
      organizationUnitId: this.chosenItem,
      areas: this.areaFilter ? [this.areaFilter] : void 0,
      filter: this.filterText,
      sorting: this.primengTableHelper.getSorting(this.dataTable) || 'displayName',
      maxResultCount: this.primengTableHelper.getMaxResultCount(this.paginator, event),
      skipCount: this.primengTableHelper.getSkipCount(this.paginator, event)
    })
    )
      .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
      .subscribe((result) => {
        this.primengTableHelper.totalRecordsCount = result.totalCount;
        this.primengTableHelper.records = result.items;
        console.log("result.totalCount:",result.totalCount)
        console.log("result.items:",result.items)
      });
      
  }

  goImportSulwhasoo() {
    this._router.navigate(['app', 'admin', 'import', 'import', 'sulwhasoo']);
  }
  goExportSulwhasoo() {
    this.exportLoading = true;
    this._SensingTicketServiceProxy.getTakeTicketListToExcel();
  }

  goImport () {
    this._router.navigate(['app', 'admin', 'import', 'import', 'store']);
  }

  goExport() {
    this.exportLoading = true;
    this._NewStoreServiceProxy.getStoresToExcel(
      new GetStorseListInput({

        storeStatus: this.storeStatus,
        organizationUnitId: this.chosenItem,
        areas: this.areaFilter ? [this.areaFilter] : void 0,
        filter: this.filterText,
        sorting: this.primengTableHelper.getSorting(this.dataTable) || 'displayName',
        maxResultCount: 10,
        skipCount: 0
      })
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


  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }

  editStore(record) {
    this.createOrEditStoreModal.show(record)
  }
  deleteStore(record) {
    this.message.confirm(
      this.l('deleteThisStore'),
      this.l('AreYouSure'),
      isConfirmed => {
        if (isConfirmed) {
          this.primengTableHelper.showLoadingIndicator();
          this._NewStoreServiceProxy
            .deleteStore(record.storeId)
            .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
            .subscribe(() => {
              // this.primengTableHelper.hideLoadingIndicator();
              this.notify.success(this.l('SuccessfullyRemoved'));
              this.getStoreList();
            });
        }
      }
    );
  }
  addStore() {
    this.createOrEditStoreModal.show()
  }


  deleteBatch() {
    if (this.storeCheckedList.length == 0) {
      return this.message.warn(this.l('atLeastChoseOneItem'));
    }
    if (this.filterStore().downNum.length == 0) {
      return this.message.warn(this.l('noneOfflineGotten'));
    }


    var input = this.filterStore().downNum.map(item => {
      return item.storeId
    })
    console.log(input)
    this.message.confirm(
      this.l('deleteThisStore'),
      this.l('AreYouSure'),
      isConfirmed => {
        if (isConfirmed) {
          this.primengTableHelper.showLoadingIndicator();
          this._NewStoreServiceProxy
            .deleteStores(input)
            .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
            .subscribe(() => {
              // this.primengTableHelper.hideLoadingIndicator();
              this.notify.success(this.l('SuccessfullyRemoved'));
              this.getStoreList();
            });
        }
      }
    );
  }


  //筛选上下线
  filterStore() {
    var upNum = [], upNumIds = [], downNum = [], downNumIds = [];
    this.storeCheckedList.forEach((v, index, array) => {
      if (v.storeStatus == 'Stopped') {
        downNum.push(v);
        downNumIds.push(v.storeId);
      } else if (v.storeStatus == 'Running') {
        upNum.push(v);
        upNumIds.push(v.storeId);
      }
    })
    return {
      upNum: upNum,
      upNumIds: upNumIds,
      downNum: downNum,
      downNumIds: downNumIds
    }
  }

  checkSelection(f, callback, all?) {
    var upNum = this.filterStore().upNum, downNum = this.filterStore().downNum,
      upNumIds = this.filterStore().upNumIds, downNumIds = this.filterStore().downNumIds;
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
            this.storeCheckedList = downNum;
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
            this.storeCheckedList = upNum;
          }
          callback && callback(f ? downNumIds : upNumIds);
        })
      } else {
        callback && callback(f ? downNumIds : upNumIds);
      }
    }
  }


  //下线所有
  offlineAll() {
    // if (this.filterStore().upNum.length == 0) {
    //   return this.message.warn(this.l('noneOnlineGotten'));
    // }
    this.message.confirm(this.l('offlineAll'), this.l('AreYouSure'), (r) => {
      if (r) {
        this._NewStoreServiceProxy.auditStore(new StoreAuditInput({
          storeIds: [],
          currentAuditStatus: StoreStatus["Running"],
          targetAuditStatus: StoreStatus["Stopped"]
        })).subscribe(r => {
          this.getStoreList()
        })
      }
    })
  }
  //下线
  offline() {
    this.checkSelection(false, (ary) => {
      this.message.confirm(this.l('offlineBatch'), this.l('AreYouSure'), (r) => {
        if (r) {
          this._NewStoreServiceProxy.auditStore(new StoreAuditInput({
            storeIds: ary,
            currentAuditStatus: StoreStatus["Running"],
            targetAuditStatus: StoreStatus["Stopped"]
          })).subscribe(r => {
            this.getStoreList()
          })
        }
      })
    })
  }
  //上线
  online() {
    this.checkSelection(true, (ary) => {
      this.message.confirm(this.l('onlineBatch'), this.l('AreYouSure'), (r) => {
        if (r) {
          this._NewStoreServiceProxy.auditStore(new StoreAuditInput({
            storeIds: ary,
            currentAuditStatus: StoreStatus["Stopped"],
            targetAuditStatus: StoreStatus["Running"]
          })).subscribe(r => {
            this.getStoreList()
          })
        }
      })
    })
  }
  //上线所有
  onlineAll() {
    // if (this.filterStore().downNum.length == 0) {
    //   return this.message.warn(this.l('noneOfflineGotten'));
    // }
    
    this.message.confirm(this.l('onlineAll'), this.l('AreYouSure'), (r) => {
      if (r) {
        this._NewStoreServiceProxy.auditStore(new StoreAuditInput({
          storeIds: [],
          currentAuditStatus: StoreStatus["Stopped"],
          targetAuditStatus: StoreStatus["Running"]
        })).subscribe(r => {
          this.getStoreList()
        })
      }
    })
  }



  goPublishStore() {
    if (this.storeCheckedList.length == 0) {
      return this.message.warn(this.l('atLeastChoseOneItem'));
    }
    this.toPublish = true;
  }
  publishAll() {
    this.toPublish = true;
    this.publishType = 'add';
    this.operateAll = true;
  }
  withdrawAll() {
    this.toPublish = true;
    this.publishType = 'delete';
    this.operateAll = true;
  }


  //发布
  doPublishStore() {
    var ouOrDeviceList = [];
    ouOrDeviceList = this.myTree.getchosen().map((item) => {
      return new IdTypeDto({
        'id': item.id,
        'type': item.type
      });
    });
    if (ouOrDeviceList.length == 0) {
      return this.message.warn(this.l('atLeastChoseOneItem'));
    }
    var input = new PublishStoresInput({
      'entityIds': this.storeCheckedList.map(item => {
        return item.storeId
      }),
      'ouList': ouOrDeviceList,
      'action': this.publishType
    });
    if (this.operateAll) {
      this.storeCheckedList = [];
      this.message.confirm(this.publishType == 'delete' ? this.l('isWithdrewAll') : this.l('isPublishAll'), this.l('AreYouSure'), (r) => {
        if (r) {
          this.primengTableHelper.showLoadingIndicator();
          this._NewStoreServiceProxy.publishAllStoreToOrganization(input)
            .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
            .subscribe(() => {
              // this.primengTableHelper.hideLoadingIndicator();
              this.notify.info(this.l('success'));
              this.toPublish = false;
              this.operateAll = false;
              this.getStoreList();
            });
        }
      });
    } else {
      this.message.confirm(this.publishType == 'delete' ? this.l('isWithdrewChosen') : this.l('isPublishChosen'), this.l('AreYouSure'), (r) => {
        if (r) {
          this.primengTableHelper.showLoadingIndicator();
          this._NewStoreServiceProxy.publishStoreToOrganization(input)
            .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
            .subscribe(() => {
              // this.primengTableHelper.hideLoadingIndicator();
              this.notify.info(this.l('success'));
              this.storeCheckedList = [];
              this.toPublish = false;
              this.operateAll = false;
              this.getStoreList();
            });
        }
      });
    }
  }

  //筛选树
  filterTree(e?: Event) {
    e && e.preventDefault();
    this.myTree.filterTree(this.treeFilter);
  }

  goDetail(record) {
    this._router.navigate(['app', 'admin', 'organization-units', 'OUDetail', record.storeId], { queryParams: { name: record.displayName, isStore: true, from: 'entityStore' } });
  }

}
