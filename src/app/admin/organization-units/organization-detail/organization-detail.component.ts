import { Component, ViewChild, Injector, OnInit, Input, } from '@angular/core';
import { DeviceServiceProxy } from '@shared/service-proxies/service-proxies-devicecenter';

import { CouponServiceProxy, ProductServiceProxy, StoreServiceProxy as StoreProductServiceProxy, OutPutInStorageServiceProxy, GetOutPutInStorageRecordDto, OutPutInStorageType, GetOutPutInStorageBillInput, GetOutPutInStorageRecordInput } from '@shared/service-proxies/service-proxies-product'
import { AdServiceProxy, SoftwareServiceProxy, SoftwareType, StoreAdsServiceProxy, StoreSoftwareServiceProxy, FileType } from '@shared/service-proxies/service-proxies-ads'

import { AppComponentBase } from '@shared/common/app-component-base';
import { RoomServiceProxy, UpdateRoomListInput, UpdateRoomDto, UpdateRoomInput } from '@shared/service-proxies/service-proxies-floor'
import { Router, ActivatedRoute } from '@angular/router';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import { Table } from 'primeng/table';
import * as moment from 'moment';
import { finalize } from 'rxjs/operators';
import { DateRangePickerComponent } from '@app/shared/common/timing/date-range-picker.component';
import { ActivityServiceProxy, StoreActivityServiceProxy } from '@shared/service-proxies/service-proxies5';
import { UserServiceProxy, GetUsersInput } from '@shared/service-proxies/service-proxies';
import { AppConsts } from '@shared/AppConsts';
import { KPIModalComponent } from '@app/admin/organization-units/organization-detail/kpi-modal.component';
import { StoreServiceProxy, OrganizationUnitServiceProxy, GetStorseListInput, AuditStatus } from '@shared/service-proxies/service-proxies-devicecenter';
import { event } from 'jquery';
import { BuildingServiceProxy, FloorServiceProxy } from '@shared/service-proxies/service-proxies-floor';
import { BillModalComponent } from '@app/admin/organization-units/organization-detail/bill-modal.component'
import { BindModalComponent } from '@app/admin/organization-units/organization-detail/operation/operation.component'
import { RfidListModalComponent } from '@app/admin/organization-units/organization-detail/rfid-list-modal.component'
import { BrandServiceProxy } from '@shared/service-proxies/service-proxies-devicecenter';
import { StoreServiceProxy as NewStoreServiceProxy, CreateStoreInput, UpdateStoreInput, PositionDto } from '@shared/service-proxies/service-proxies-devicecenter';

import * as _ from 'lodash'
import { result } from 'lodash-es';

@Component({
    selector: 'OUDetail',
    templateUrl: './organization-detail.component.html',
    styleUrls: ['./organization-detail.component.css']
})

export class OUDetailComponent extends AppComponentBase implements OnInit {


    OUId;
    OUName;
    moment = moment;
    AuditStatus = AuditStatus;

    buildingId: any = '';
    singleBrand: any = {};
    rooms: any = [];
    lastRooms: any = [];
    roomSuggestions: any = [];
    brandSuggestions: any = [];
    showBusy = false;
    onShowBool = false;
    active = false;

    storeId;
    FileType = FileType;

    //用户分页
    @ViewChild('dataTableFace', { static: false }) dataTableFace: Table;
    @ViewChild('paginatorFace', { static: false }) paginatorFace: Paginator;
    FaceSelectionList: any[] = [];
    pUser: PrimengTableHelper = new PrimengTableHelper();
    UserFilterText;

    //店铺
    notHost = abp.session.tenantId;
    questionFilter: '';
    @ViewChild('dataTable', { static: false }) dataTable: Table;
    @ViewChild('paginator', { static: false }) paginator: Paginator;
    recordCheckedList: any[] = [];


    //红包分页
    @ViewChild('dataTableCoupon', { static: false }) dataTableCoupon: Table;
    @ViewChild('paginatorCoupon', { static: false }) paginatorCoupon: Paginator;
    CouponSelectionList: any[] = [];
    couponFilterText;
    pCoupon = new PrimengTableHelper();
    couponAuditStatus: any = '';

    //活动分页
    @ViewChild('dataTableActivity', { static: false }) dataTableActivity: Table;
    @ViewChild('paginatorActivity', { static: false }) paginatorActivity: Paginator;
    ActivitySelectionList: any[] = [];
    activityFilterText;
    pActivity = new PrimengTableHelper();
    activityAuditStatus: any = '';

    //广告分页
    @ViewChild('dataTableAds', { static: false }) dataTableAds: Table;
    @ViewChild('paginatorAds', { static: false }) paginatorAds: Paginator;
    AdsSelectionList: any[] = [];
    adsFilterText;
    pAds = new PrimengTableHelper();
    adsAuditStatus: any = '';

    //商品分页
    @ViewChild('dataTableProduct', { static: false }) dataTableProduct: Table;
    @ViewChild('paginatorProduct', { static: false }) paginatorProduct: Paginator;
    ProductSelectionList: any[] = [];
    productFilterText;
    pProduct = new PrimengTableHelper();
    productAuditStatus: any = '';

    //软件分页
    @ViewChild('dataTableApp', { static: false }) dataTableApp: Table;
    @ViewChild('paginatorApp', { static: false }) paginatorApp: Paginator;
    AppSelectionList: any[] = [];
    appFilterText;
    pApp = new PrimengTableHelper();
    appType: any = "";
    SoftwareType = SoftwareType;


    //设备分页
    @ViewChild('dataTableDevice', { static: false }) dataTableDevice: Table;
    @ViewChild('paginatorDevice', { static: false }) paginatorDevice: Paginator;
    DeviceSelectionList: any[] = [];
    deviceFilterText;
    pDevice = new PrimengTableHelper();

    deviceStatus: any = "";
    deviceOperationType: any = "";
    deviceAuditStatus: any = "";
    deviceTypeId: any = '';
    deviceTypeList = [];


    //KPI分页
    @ViewChild('dataTableKPI', { static: false }) dataTableKPI: Table;
    @ViewChild('paginatorKPI', { static: false }) paginatorKPI: Paginator;
    pKPI = new PrimengTableHelper();
    KPISelectionList: any[] = [];
    KPIFilterText;
    checkScale: any = "";
    checkType: any = "";
    StartTimeKPI: any = moment().utc().subtract(365, 'days').startOf('day');
    EndTimeKPI: any = moment().utc().subtract(-365, 'days').endOf('day');
    @ViewChild("dateRangerKPI", { static: false }) dateRangerKPI: DateRangePickerComponent;
    @ViewChild('kpiModal', { static: false }) kpiModal: KPIModalComponent;


    //库存分页
    @ViewChild('dataTableKPI', { static: false }) dataTablekc: Table;
    @ViewChild('paginatorKPI', { static: false }) paginatorkc: Paginator;
    outPutInStoragePrimengTableHelper = new PrimengTableHelper();
    @ViewChild("dateRangerKPI", { static: false }) dateRangerFill: DateRangePickerComponent;

    @ViewChild('billModal', { static: false }) billModal: BillModalComponent;
    @ViewChild('rfidListModal', { static: false }) rfidListModal: RfidListModalComponent;


    //房间分页
    @ViewChild('dataTableRoom', { static: false }) dataTableRoom: Table;
    @ViewChild('paginatorRoom', { static: false }) paginatorRoom: Paginator;
    @ViewChild('bindModal', { static: false }) bindModal: BindModalComponent;
    
    @Input() brandList: any;
    roomlist: any[] = [];

    organizationUnit: any = {
        'position': {},
        'storeId': ''
    };
    outPutInStorageFilter: any = '';
    outPutInStorageSelectionList: any = [];
    outPutInStorageType: any = '';

    // sku
    @ViewChild('dataTableSku', { static: false }) dataTableSku: Table;
    @ViewChild('paginatorSku', { static: false }) paginatorSku: Paginator;
    @ViewChild('highTree', { static: false }) highTree;
    filterSku: any = '';
    rfid: any = '';
    skuPrimeg = new PrimengTableHelper();

    StartTimeFill = moment().utc().subtract(31, 'days').startOf('day');
    EndTimeFill = moment().utc().endOf('day');

    KPITypeList = [];
    treeList: any = '';

    constructor(
        injector: Injector,
        private router: Router,
        private route: ActivatedRoute,
        private _deviceService: DeviceServiceProxy,
        private _productService: ProductServiceProxy,
        private _adsService: AdServiceProxy,
        private _appService: SoftwareServiceProxy,
        private _couponService: CouponServiceProxy,
        private _acitvityService: ActivityServiceProxy,
        private _userServiceProxy: UserServiceProxy,
        private _StoreServiceProxy: StoreServiceProxy,
        private _StoreActivityServiceProxy: StoreActivityServiceProxy,
        private _StoreAdsServiceProxy: StoreAdsServiceProxy,
        // private _StoreCouponsServiceProxy: StoreCouponsServiceProxy,
        // private _StoreProductServiceProxy: StoreProductServiceProxy,
        private _StoreSoftwareServiceProxy: StoreSoftwareServiceProxy,
        private _OrganizationUnitServiceProxy: OrganizationUnitServiceProxy,
        private _StoreProductServiceProxy: StoreProductServiceProxy,
        private _OutPutInStorageServiceProxy: OutPutInStorageServiceProxy,
        private _roomServiceProxy: RoomServiceProxy,
        private _RoomServiceProxy: RoomServiceProxy,
        private _BrandServiceProxy: BrandServiceProxy,
        private _NewStoreServiceProxy: NewStoreServiceProxy,
        private _BuildingServiceProxy: BuildingServiceProxy,
    ) {
        super(injector);
        this.initMessage();
        this._StoreServiceProxy.getCurrentTenantOrganizationUnitsAndStoresTree([], false).subscribe((result) => {
            this.treeList = [result];
        })
        //     this._BuildingServiceProxy.getBuildingsForSelect()
        //   .subscribe(result => {
        //     this.buildingList1 = result;
        //   })
        //   console.log("this.buildingList1:",this.buildingList1)
    }
    ngAfterViewInit() {
        $('date-range-picker input').val('');
    }

    ngOnInit() {
        this.getroomdata()
    }

    goSku (record) {
        console.log(record)
    }

    //初始化
    initMessage() {
        var urls = location.pathname.split('\/');
        // abp.ui.setBusy();
        this.route.queryParams.subscribe(queryParams => {

            if (queryParams.isStore) {
                this.storeId = urls[urls.length - 1];
                this.organizationUnit.storeId = this.storeId
                setTimeout(() => {
                    this.getDeviceByOUId()
                }, 500)
            } else {
                this.OUId = urls[urls.length - 1];
                setTimeout(() => {
                    this.getUsers();
                }, 500)
            }
            this.OUName = queryParams.name;
        })

    }

    //获取列表
  getSkuList(event?: LazyLoadEvent) {
    // if (this.skuPrimeg.shouldResetPaging(event)) {
    //   this.paginatorSku.changePage(0);
    //   return;
    // }

    this.skuPrimeg.showLoadingIndicator();
    this._OutPutInStorageServiceProxy.getSkusByStoreId(
      void 0,
      void 0,
      [this.storeId],
      void 0,
      this.rfid,
      this.filterSku,
      void 0,
      this.skuPrimeg.getMaxResultCount(this.paginatorSku, event),
      this.skuPrimeg.getSkipCount(this.paginatorSku, event)
    )
    .pipe(this.myFinalize(() => { this.skuPrimeg.hideLoadingIndicator(); }))
    .subscribe(result => {
      this.skuPrimeg.totalRecordsCount = result.totalCount;
      this.skuPrimeg.records = result.items;
      // this.primengTableHelper.hideLoadingIndicator();
    })
  }

    //kpi
    initKPITab() {
        this.getKPIByOUId();
    }

    deleteBatchBill() {
    }

    createBill() {
        this.billModal.show(this.storeId);
    }

    goImportRfid() {
        this.router.navigate(['app', 'admin', 'import', 'import', 'rfid']);
    }

    getInOrOutFill(event?: LazyLoadEvent) {
        
        this.outPutInStoragePrimengTableHelper.showLoadingIndicator();
        this._OutPutInStorageServiceProxy.getOutPutInStorageBills(new GetOutPutInStorageBillInput({
            storeId: [this.storeId],
            startTime: this.StartTimeFill,
            endTime: this.EndTimeFill,
            ignoreStore: false,
            outPutInStorageType: this.outPutInStorageType,
            filter: this.outPutInStorageFilter,
            sorting: this.outPutInStoragePrimengTableHelper.getSorting(this.dataTablekc),
            maxResultCount: this.outPutInStoragePrimengTableHelper.getMaxResultCount(this.paginatorkc, event),
            skipCount: this.outPutInStoragePrimengTableHelper.getSkipCount(this.paginatorkc, event),
        })).pipe(this.myFinalize(() => { this.outPutInStoragePrimengTableHelper.hideLoadingIndicator(); }))
            .subscribe(result => {
                this.outPutInStoragePrimengTableHelper.totalRecordsCount = result.totalCount;
                this.outPutInStoragePrimengTableHelper.records = result.items;
            });
    }

    //num
    initNumTab() {
        setTimeout(() => {
            this.getSkuList();
        }, 500)
    }
    goImportKPI() {
    }

    createKPI() {
        this.kpiModal.show(true, { id: this.OUId ? this.OUId : this.storeId, name: this.OUName });
    }

    getKPIByOUId(event?: LazyLoadEvent) {
        this.pKPI.showLoadingIndicator();
        if (this.OUId) {
            this._OrganizationUnitServiceProxy.getOrganizationUintKpiNames(this.OUId).subscribe(r => {
                this.KPITypeList = r;
            })
            this._OrganizationUnitServiceProxy.getOrganizationUnitKPIs(
                this.OUId,
                void 0,// this.storeId,
                this.StartTimeKPI,
                this.EndTimeKPI,
                this.checkScale,
                this.checkType,
                this.KPIFilterText,
                this.pKPI.getSorting(this.dataTableKPI),
                this.pKPI.getMaxResultCount(this.paginatorKPI, event),
                this.pKPI.getSkipCount(this.paginatorKPI, event)
            )
                .pipe(this.myFinalize(() => { this.pKPI.hideLoadingIndicator(); }))
                .subscribe(result => {
                    this.pKPI.totalRecordsCount = result.totalCount;
                    this.pKPI.records = result.items;
                    // this.pKPI.hideLoadingIndicator();
                });
        } else {
            this._StoreServiceProxy.getKpiNames(this.storeId).subscribe(r => {
                this.KPITypeList = r;
            })
            this._StoreServiceProxy.getStoreKPIs(
                this.storeId,
                this.StartTimeKPI,
                this.EndTimeKPI,
                this.checkScale,
                this.checkType,
                this.KPIFilterText,
                this.pKPI.getSorting(this.dataTableKPI),
                this.pKPI.getMaxResultCount(this.paginatorKPI, event),
                this.pKPI.getSkipCount(this.paginatorKPI, event)
            )
                .pipe(this.myFinalize(() => { this.pKPI.hideLoadingIndicator(); }))
                .subscribe(result => {
                    this.pKPI.totalRecordsCount = result.totalCount;
                    this.pKPI.records = result.items;
                    // this.pKPI.hideLoadingIndicator();
                });
        }

    }
    transKPIIndex(i, event?: LazyLoadEvent) {
        return i + 1 + this.pKPI.getSkipCount(this.paginatorKPI, event);
    }

    editKPI(record) {
        this.kpiModal.show(false, record);
    }

    goDetail(record) {


        this.billModal.show(this.storeId, _.cloneDeep(record));
    }

    showRfid() {
        this.rfidListModal.show(this.storeId);
    }

    deleteKPI(record) {
        this.message.confirm(this.l("DeleteThisKPI"), this.l('AreYouSure'), (r) => {
            if (r) {
                this.pKPI.showLoadingIndicator();
                if (this.OUId) {
                    this._OrganizationUnitServiceProxy.deleteSingleOrganizationUnitKPI(record.id)
                        .pipe(this.myFinalize(() => { this.pKPI.hideLoadingIndicator(); }))
                        .subscribe(result => {
                            // this.pKPI.hideLoadingIndicator();
                            this.notify.info(this.l('success'));
                            this.getKPIByOUId();
                            this.KPISelectionList = [];
                        })
                } else {
                    this._StoreServiceProxy.deleteSingleGroupKPI(record.id)
                        .pipe(this.myFinalize(() => { this.pKPI.hideLoadingIndicator(); }))
                        .subscribe(result => {
                            // this.pKPI.hideLoadingIndicator();
                            this.notify.info(this.l('success'));
                            this.getKPIByOUId();
                            this.KPISelectionList = [];
                        })
                }
            }
        })
    }
    deleteBatchKPI() {
        if (this.KPISelectionList.length === 0) {
            this.message.warn(this.l('selectOneWarn'));
        } else {
            this.message.confirm(this.l('DeleteThisKPI'), this.l('AreYouSure'), (r) => {
                if (r) {
                    this.pKPI.showLoadingIndicator();
                    var KPISelectionList = [];
                    for (var value of this.KPISelectionList) {
                        KPISelectionList.push(value.id);
                    }

                    if (this.OUId) {
                        this._OrganizationUnitServiceProxy.deleteOrganizationUnitKPIs(KPISelectionList)
                            .pipe(this.myFinalize(() => { this.pKPI.hideLoadingIndicator(); }))
                            .subscribe(result => {
                                this.notify.info(this.l('success'));
                                this.getKPIByOUId();
                                this.KPISelectionList = [];
                                // this.pKPI.hideLoadingIndicator();
                            })
                    } else {
                        this._StoreServiceProxy.deleteGroupKPIs(KPISelectionList)
                            .pipe(this.myFinalize(() => { this.pKPI.hideLoadingIndicator(); }))
                            .subscribe(result => {
                                this.notify.info(this.l('success'));
                                this.getKPIByOUId();
                                this.KPISelectionList = [];
                                // this.pKPI.hideLoadingIndicator();
                            })
                    }

                }
            })
        }
    }
    //设备
    getDeviceByOUId(event?: LazyLoadEvent) {
        if (this.storeId) {
            this.pDevice.showLoadingIndicator();
            this._deviceService.getDevices(
                void 0,
                this.deviceStatus,
                this.deviceOperationType,
                this.deviceAuditStatus,
                void 0,
                void 0,
                [this.storeId],
                this.deviceFilterText,
                this.pDevice.getSorting(this.dataTableDevice),
                this.pDevice.getMaxResultCount(this.paginatorDevice, event),
                this.pDevice.getSkipCount(this.paginatorDevice, event)
            )
                .pipe(this.myFinalize(() => { this.pDevice.hideLoadingIndicator(); }))
                .subscribe(result => {
                    this.pDevice.totalRecordsCount = result.totalCount;
                    this.pDevice.records = result.items;
                    // this.pDevice.hideLoadingIndicator();
                });
        }
    }

    transDeviceIndex(i, event?: LazyLoadEvent) {
        return i + 1 + this.pDevice.getSkipCount(this.paginatorDevice, event);
    }
    //广告
    getAdsByOUId(event?: LazyLoadEvent) {
        if (this.OUId) {
            this.pAds.showLoadingIndicator();
            this._adsService.getAds(
                this.adsAuditStatus,
                void 0,
                void 0,
                this.OUId,
                this.adsFilterText,
                this.pAds.getSorting(this.dataTableAds),
                this.pAds.getMaxResultCount(this.paginatorAds, event),
                this.pAds.getSkipCount(this.paginatorAds, event)
            )
                .pipe(this.myFinalize(() => { this.pAds.hideLoadingIndicator(); }))
                .subscribe(result => {
                    this.pAds.totalRecordsCount = result.totalCount;
                    this.pAds.records = result.items;
                    // this.pAds.hideLoadingIndicator();
                });
        } else if (this.storeId) {
            this.pAds.showLoadingIndicator();
            this._StoreAdsServiceProxy.getAdsByStoreId(
                this.adsAuditStatus,
                this.storeId,
                this.adsFilterText,
                this.pAds.getSorting(this.dataTableAds),
                this.pAds.getMaxResultCount(this.paginatorAds, event),
                this.pAds.getSkipCount(this.paginatorAds, event)
            )
                .pipe(this.myFinalize(() => { this.pAds.hideLoadingIndicator(); }))
                .subscribe(result => {
                    this.pAds.totalRecordsCount = result.totalCount;
                    this.pAds.records = result.items;
                    // this.pAds.hideLoadingIndicator();
                });
        }

    }
    transAdsIndex(i, event?: LazyLoadEvent) {
        return i + 1 + this.pAds.getSkipCount(this.paginatorAds, event);
    }

    //App
    getAppByOUId(event?: LazyLoadEvent) {
        if (this.OUId) {
            this.pApp.showLoadingIndicator();
            this._appService.getAuthorizedSoftwares(
                this.OUId,
                this.appType,
                this.appFilterText,
                this.pApp.getSorting(this.dataTableApp),
                this.pApp.getMaxResultCount(this.paginatorApp, event),
                this.pApp.getSkipCount(this.paginatorApp, event)
            )
                .pipe(this.myFinalize(() => { this.pApp.hideLoadingIndicator(); }))
                .subscribe(result => {
                    this.pApp.totalRecordsCount = result.totalCount;
                    this.pApp.records = result.items;
                    // this.pApp.hideLoadingIndicator();

                });
        } else if (this.storeId) {
            this.pApp.showLoadingIndicator();
            this._StoreSoftwareServiceProxy.getSoftwaresByStoreId(
                this.appType,
                this.storeId,
                this.appFilterText,
                this.pApp.getSorting(this.dataTableApp),
                this.pApp.getMaxResultCount(this.paginatorApp, event),
                this.pApp.getSkipCount(this.paginatorApp, event)
            )
                .pipe(this.myFinalize(() => { this.pApp.hideLoadingIndicator(); }))
                .subscribe(result => {
                    this.pApp.totalRecordsCount = result.totalCount;
                    this.pApp.records = result.items;
                    // this.pApp.hideLoadingIndicator();

                });
        }

    }
    transAppIndex(i, event?: LazyLoadEvent) {
        return i + 1 + this.pApp.getSkipCount(this.paginatorApp, event);
    }

    //商品
    getProductByOUId(event?: LazyLoadEvent) {
        if (this.OUId) {
            this.pProduct.showLoadingIndicator();
            this._productService.getProducts(
                void 0,
                void 0,
                void 0,
                this.productAuditStatus,
                void 0,
                void 0,
                void 0,
                void 0,
                void 0,
                void 0,
                void 0,
                void 0,
                this.OUId,
                void 0,
                void 0,
                void 0,
                void 0,
                this.productFilterText,
                this.pProduct.getSorting(this.dataTableProduct),
                this.pProduct.getMaxResultCount(this.paginatorProduct, event),
                this.pProduct.getSkipCount(this.paginatorProduct, event)
            )
                .pipe(this.myFinalize(() => { this.pProduct.hideLoadingIndicator(); }))
                .subscribe(result => {
                    this.pProduct.totalRecordsCount = result.totalCount;
                    this.pProduct.records = result.items;
                    // this.pProduct.hideLoadingIndicator();
                });
        } else if (this.storeId) {
            this.pProduct.showLoadingIndicator();
            this._StoreProductServiceProxy.getProductsByStoreId(
                void 0,
                void 0,
                void 0,
                this.productAuditStatus,
                void 0,
                void 0,
                void 0,
                void 0,
                void 0,
                void 0,
                void 0,
                void 0,
                this.storeId,
                void 0,
                void 0,
                void 0,
                this.productFilterText,
                this.pProduct.getSorting(this.dataTableProduct),
                this.pProduct.getMaxResultCount(this.paginatorProduct, event),
                this.pProduct.getSkipCount(this.paginatorProduct, event)
            )
                .pipe(this.myFinalize(() => { this.pProduct.hideLoadingIndicator(); }))
                .subscribe(result => {
                    this.pProduct.totalRecordsCount = result.totalCount;
                    this.pProduct.records = result.items;
                    // this.pProduct.hideLoadingIndicator();
                });
        }

    }
    transProductIndex(i, event?: LazyLoadEvent) {
        return i + 1 + this.pProduct.getSkipCount(this.paginatorProduct, event);
    }

    //用户
    getUsers(event?: LazyLoadEvent) {
        this.pUser.showLoadingIndicator();
        this._userServiceProxy.getUsers(new GetUsersInput({
            filter: this.UserFilterText,
            permissions: void 0,
            role: void 0,
            onlyLockedUsers: void 0,
            organizationUnitId: this.OUId,
            sorting: this.pUser.getSorting(this.dataTableFace),
            maxResultCount: this.pUser.getMaxResultCount(this.paginatorFace, event),
            skipCount: this.pUser.getSkipCount(this.paginatorFace, event)
        }))
            .pipe(this.myFinalize(() => { this.pUser.hideLoadingIndicator(); }))
            .subscribe(result => {

                this.pUser.totalRecordsCount = result.totalCount;
                this.pUser.records = result.items;
                // this.pUser.hideLoadingIndicator();
            })
    }
    transUserIndex(i, event?: LazyLoadEvent) {
        return i + 1 + this.pUser.getSkipCount(this.paginatorFace, event);
    }
    getRolesAsString(roles): string {
        let roleNames = '';
        for (let j = 0; j < roles.length; j++) {
            if (roleNames.length) {
                roleNames = roleNames + ', ';
            }
            roleNames = roleNames + roles[j].roleName;
        }
        return roleNames;
    }


    //店铺
    getStoreList(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }
        this.primengTableHelper.showLoadingIndicator();
        this._StoreServiceProxy.getStoresList(new GetStorseListInput({
            storeStatus: null,
            organizationUnitId: [this.OUId],
            areas: void 0,
            filter: void 0,
            sorting: this.primengTableHelper.getSorting(this.dataTable),
            maxResultCount: this.primengTableHelper.getMaxResultCount(this.paginator, event),
            skipCount: this.primengTableHelper.getSkipCount(this.paginator, event)
        }))
            .pipe(finalize(() => {
                this.primengTableHelper.hideLoadingIndicator();
            })).subscribe(result => {
                this.primengTableHelper.totalRecordsCount = result.totalCount;
                this.primengTableHelper.records = result.items;

            })

    }
    roomFilter(event) {

        this._roomServiceProxy.getRooms4Select(
            this.buildingId,
            void 0,
            'store',
            event.query
        ).subscribe((result) => {
            this.roomSuggestions = (result || []).map((item) => {

                return {
                    'id': item.id,
                    'value': item.name
                }
            })
        })
    }
    brandFilter(event) {
        this._BrandServiceProxy.getBrands(
            void 0,
            void 0,
            event.query,
            void 0,
            999, 0
        ).subscribe(result => {
            this.brandSuggestions = (result.items || []).map((item) => {

                return {
                    'id': item.id,
                    'value': item.name
                }
            })

        });
    }

    //转换序列
    transIndex(i, event?: LazyLoadEvent) {
        return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
    }


    //红包tab
    getCouponByOUId(event?: LazyLoadEvent) {
        if (this.OUId) {
            this.pCoupon.showLoadingIndicator();
            this._couponService.getCoupons(
                this.couponAuditStatus,
                this.OUId,
                this.couponFilterText,
                void 0,
                this.pCoupon.getMaxResultCount(this.paginatorCoupon, event),
                this.pCoupon.getSkipCount(this.paginatorCoupon, event))
                .pipe(this.myFinalize(() => { this.pCoupon.hideLoadingIndicator(); }))
                .subscribe((result) => {
                    this.pCoupon.totalRecordsCount = result.totalCount;
                    this.pCoupon.records = result.items;
                    // this.pCoupon.hideLoadingIndicator();
                })
        } else if (this.storeId) {
            this.pCoupon.showLoadingIndicator();
            this._StoreProductServiceProxy.getCouponsByStoreId(
                this.couponAuditStatus,
                this.storeId,
                this.couponFilterText,
                void 0,
                this.pCoupon.getMaxResultCount(this.paginatorCoupon, event),
                this.pCoupon.getSkipCount(this.paginatorCoupon, event))
                .pipe(this.myFinalize(() => { this.pCoupon.hideLoadingIndicator(); }))
                .subscribe((result) => {
                    this.pCoupon.totalRecordsCount = result.totalCount;
                    this.pCoupon.records = result.items;
                    // this.pCoupon.hideLoadingIndicator();
                })
        }

    }

    transCouponIndex(i, event?: LazyLoadEvent) {
        return i + 1 + this.pCoupon.getSkipCount(this.paginatorCoupon, event);
    }


    //活动
    getActivityByOUId(event?: LazyLoadEvent) {
        if (this.OUId) {
            this.pActivity.showLoadingIndicator();
            this._acitvityService.getActivities(
                this.activityAuditStatus,
                void 0,
                void 0,
                this.OUId,
                this.activityFilterText,
                this.pActivity.getSorting(this.dataTableActivity),
                this.pActivity.getMaxResultCount(this.paginatorActivity, event),
                this.pActivity.getSkipCount(this.paginatorActivity, event)
            )
                .pipe(this.myFinalize(() => { this.pActivity.hideLoadingIndicator(); }))
                .subscribe(result => {

                    this.pActivity.totalRecordsCount = result.totalCount;
                    this.pActivity.records = result.items;
                    // this.pActivity.hideLoadingIndicator();
                })
        } else {
            this.pActivity.showLoadingIndicator();
            this._StoreActivityServiceProxy.getStoreActivitiesById(
                this.storeId,
                this.activityFilterText,
                this.pActivity.getSorting(this.dataTableActivity),
                this.pActivity.getMaxResultCount(this.paginatorActivity, event),
                this.pActivity.getSkipCount(this.paginatorActivity, event)
            )
                .pipe(this.myFinalize(() => { this.pActivity.hideLoadingIndicator(); }))
                .subscribe(result => {

                    this.pActivity.totalRecordsCount = result.totalCount;
                    this.pActivity.records = result.items;
                    // this.pActivity.hideLoadingIndicator();
                })
        }

    }

    //显示图片加载失败的占位图
    showEmpty(e) {
        var target = $(e.target);
        target.attr("src", AppConsts.appBaseUrl + "/assets/common/images/holderimg.png")
    }

    transActivityIndex(i, event?: LazyLoadEvent) {
        return i + 1 + this.pActivity.getSkipCount(this.paginatorActivity, event);
    }

    //返回
    goBack() {
        this.route.queryParams.subscribe(queryParams => {
            if (queryParams.from && queryParams.from == 'entityStore') {
                this.router.navigate(['app', 'admin', 'entityStore', 'entityStore']);
            } else {
                this.router.navigate(['app', 'admin', 'organization-units']);
            }
        })
    }
    bindingroom(){
        this.bindModal.show(this.storeId);
    }
    deleteroom(record) {

        this._RoomServiceProxy.updateRoom(new UpdateRoomInput({
            id: record.id,
            floorId:record.floorId,
            name: record.name,
            no: undefined,
            description: undefined,
            areaWidth: 0,
            areaHeight: 0,
            storeId: null,
            storeName: undefined,
            brandName: undefined,
            brandLogo: undefined,
            roomType: undefined,
        })).subscribe(res => {
            this.getroomdata();
        })
    }
    //Room
    getroomdata(): void {
        
        this._RoomServiceProxy.getRoomsNew(
            void 0,
            void 0,
            void 0,
            this.storeId,
            void 0,
            void 0,
            999,
            void 0
        ).subscribe(result => {
            this.roomlist = result.items
        })
    }

}
