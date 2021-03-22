import { Component, ViewChild, Injector, OnInit, } from '@angular/core';
import { DeviceServiceProxy, ProductServiceProxy, AdServiceProxy, SoftwareServiceProxy, CouponServiceProxy, PeripheralServiceProxy, DeviceActionServiceProxy, SoftwareType, GroupKPIServiceProxy, StoreKPIServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Router, ActivatedRoute } from '@angular/router';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import { Table } from 'primeng/table';
import * as moment from 'moment';
import { finalize } from 'rxjs/operators';
import { DateRangePickerComponent } from '@app/shared/common/timing/date-range-picker.component';
import { ActivityServiceProxy, StoreActivityServiceProxy } from '@shared/service-proxies/service-proxies5';
import { UserServiceProxy, AuditStatus } from '@shared/service-proxies/service-proxies';
import { OrganizationUnitServiceProxy, StoreServiceProxy, StoreAdsServiceProxy, GetStorseListInput, StoreSoftwareServiceProxy, StoreCouponsServiceProxy, StoreProductServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppConsts } from '@shared/AppConsts';
import { KPIModalComponent } from '@app/admin/organization-units/organization-detail/kpi-modal.component';


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


    storeId;




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

    KPITypeList = [];

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
        private _organizationUnitService: OrganizationUnitServiceProxy,
        private _GroupKPIServiceProxy: GroupKPIServiceProxy,
        private _StoreServiceProxy: StoreServiceProxy,
        private _StoreActivityServiceProxy: StoreActivityServiceProxy,
        private _StoreAdsServiceProxy: StoreAdsServiceProxy,
        private _StoreCouponsServiceProxy: StoreCouponsServiceProxy,
        private _StoreProductServiceProxy: StoreProductServiceProxy,
        private _StoreSoftwareServiceProxy: StoreSoftwareServiceProxy,
        private _StoreKPIServiceProxy: StoreKPIServiceProxy
    ) {
        super(injector);
        this.initMessage();
    }

    ngAfterViewInit() {
        $('date-range-picker input').val('');
    }

    ngOnInit() {

    }


    //初始化
    initMessage() {
        var urls = location.pathname.split('\/');
        // abp.ui.setBusy();
        this.route.queryParams.subscribe(queryParams => {
            if (queryParams.isStore) {
                this.storeId = urls[urls.length - 1];
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

    //kpi
    initKPITab() {
        this.getKPIByOUId();
        setTimeout(() => {
            this.dateRangerKPI.refresh();
        })
    }
    goImportKPI() {

    }

    createKPI() {
        this.kpiModal.show(true, { id: this.OUId ? this.OUId : this.storeId, name: this.OUName });
    }

    getKPIByOUId(event?: LazyLoadEvent) {
        this.pKPI.showLoadingIndicator();
        if (this.OUId) {
            this._GroupKPIServiceProxy.getKpiNames(this.OUId).subscribe(r => {
                console.log(r, 'kpinames')
                this.KPITypeList = r;
            })
            this._GroupKPIServiceProxy.getGroupKPIs(
                this.OUId,
                undefined,// this.storeId,
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
            this._StoreKPIServiceProxy.getKpiNames(this.storeId).subscribe(r => {
                console.log(r, 'kpinames')
                this.KPITypeList = r;
            })
            this._StoreKPIServiceProxy.getStoreKPIs(
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
    deleteKPI(record) {
        this.message.confirm(this.l("DeleteThisKPI"), this.l('AreYouSure'), (r) => {
            if (r) {
                this.pKPI.showLoadingIndicator();
                if (this.OUId) {
                    this._GroupKPIServiceProxy.deleteSingleGroupKPI(record.id)
                        .pipe(this.myFinalize(() => { this.pKPI.hideLoadingIndicator(); }))
                        .subscribe(result => {
                            // this.pKPI.hideLoadingIndicator();
                            this.notify.info(this.l('success'));
                            this.getKPIByOUId();
                            this.KPISelectionList = [];
                        })
                } else {
                    this._StoreKPIServiceProxy.deleteSingleGroupKPI(record.id)
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
                    console.log(KPISelectionList);
                    if (this.OUId) {
                        this._GroupKPIServiceProxy.deleteGroupKPIs(KPISelectionList)
                            .pipe(this.myFinalize(() => { this.pKPI.hideLoadingIndicator(); }))
                            .subscribe(result => {
                                this.notify.info(this.l('success'));
                                this.getKPIByOUId();
                                this.KPISelectionList = [];
                                // this.pKPI.hideLoadingIndicator();
                            })
                    } else {
                        this._StoreKPIServiceProxy.deleteGroupKPIs(KPISelectionList)
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
                this.deviceStatus,
                this.deviceOperationType,
                this.deviceAuditStatus,
                undefined,
                undefined,
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
                undefined,
                undefined,
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
                    // console.log(this.SoftwareType)
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
                    console.log(this.SoftwareType)
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
                undefined,
                undefined,
                undefined,
                this.productAuditStatus,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                this.OUId,
                undefined,
                undefined,
                undefined,
                undefined,
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
                undefined,
                undefined,
                undefined,
                this.productAuditStatus,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                this.storeId,
                undefined,
                undefined,
                undefined,
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
        this._userServiceProxy.getUsers(
            this.UserFilterText,
            // undefined,
            // undefined,
            // undefined,
            // this.OUId,
            // this.pUser.getSorting(this.dataTableFace),
            // this.pUser.getMaxResultCount(this.paginatorFace, event),
            // this.pUser.getSkipCount(this.paginatorFace, event)
        )
            .pipe(this.myFinalize(() => { this.pUser.hideLoadingIndicator(); }))
            .subscribe(result => {
                console.log(result, '用户');
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
        // this._StoreServiceProxy.getStoresList(
        //     [this.OUId],
        //     undefined,
        //     undefined,
        //     this.primengTableHelper.getSorting(this.dataTable),
        //     this.primengTableHelper.getMaxResultCount(this.paginator, event),
        //     this.primengTableHelper.getSkipCount(this.paginator, event)
        // )
        this._StoreServiceProxy.getStoresList(new GetStorseListInput({
            storeStatus: null,
            organizationUnitId: [this.OUId],
            areas: undefined,
            filter: undefined,
            sorting: this.primengTableHelper.getSorting(this.dataTable),
            maxResultCount: this.primengTableHelper.getMaxResultCount(this.paginator, event),
            skipCount: this.primengTableHelper.getSkipCount(this.paginator, event)
        }))
            .pipe(finalize(() => {
                this.primengTableHelper.hideLoadingIndicator();
            })).subscribe(result => {
                this.primengTableHelper.totalRecordsCount = result.totalCount;
                this.primengTableHelper.records = result.items;
                console.log(this.primengTableHelper.records);
            })

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
                undefined,
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
            this._StoreCouponsServiceProxy.getCouponsByStoreId(
                this.couponAuditStatus,
                this.storeId,
                this.couponFilterText,
                undefined,
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
                undefined,
                undefined,
                this.OUId,
                this.activityFilterText,
                this.pActivity.getSorting(this.dataTableActivity),
                this.pActivity.getMaxResultCount(this.paginatorActivity, event),
                this.pActivity.getSkipCount(this.paginatorActivity, event)
            )
            .pipe(this.myFinalize(() => { this.pActivity.hideLoadingIndicator(); }))
            .subscribe(result => {
                console.log(result);
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
                console.log(result);
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
                this.router.navigate(['app', 'admin','entityStore', 'entityStore']);
            } else {
                this.router.navigate(['app', 'admin', 'organization-units']);
            }
        })
    }

}