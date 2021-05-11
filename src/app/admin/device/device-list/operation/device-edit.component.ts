import { Component, ViewChild, Injector, OnInit, } from '@angular/core';
import { PublishEntitiesInput, AdServiceProxy, SoftwareServiceProxy, IdTypeDto, AuditStatus, DeviceAdsServiceProxy, DeviceSoftwareServiceProxy, PublishAdScheduliingInput } from '@shared/service-proxies/service-proxies-ads';

import { ProductServiceProxy, CouponServiceProxy, DeviceServiceProxy as DeviceProductServiceProxy } from '@shared/service-proxies/service-proxies-product';

import { DeviceServiceProxy as NewDeviceServiceProxy, UpdateDeviceInput, DevicesActionInput, UpdateThirdDeivceCodeInput, AddSmartStoreDeviceToExtraPlatformInput, ExternalEnum as AddSmartStoreDeviceToExtraPlatformInputPlatformType, ExternalEnum as UpdateThirdDeivceCodeInputPlatformType } from '@shared/service-proxies/service-proxies-devicecenter';


import { AppComponentBase } from '@shared/common/app-component-base';
import { Router, ActivatedRoute } from '@angular/router';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { AdsAlertModalComponent } from '@app/admin/device/device-list/tabAlert/ads-selection-modal.component';
import { AppAlertModalComponent } from '@app/admin/device/device-list/tabAlert/app-selection-modal.component';
import { ProductAlertModalComponent } from '@app/admin/device/device-list/tabAlert/product-selection-modal.component';
import { CouponAlertModalComponent } from '@app/admin/device/device-list/tabAlert/coupon-selection-modal.component';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import { AppSettingModalComponent } from '@app/admin/device/device-list/tabAlert/app-setting-modal.component';
import { Table } from 'primeng/table';
import * as moment from 'moment';
import { finalize } from 'rxjs/operators';
import { ChartsComponent } from '@app/shared/charts/charts.component';
import { ReportServiceProxy, DeviceOperationsServiceProxy, ChartReportInput, FaceRecordDto, GetFaceRecordsInput, GetDeviceOptInput } from '@shared/service-proxies/service-proxies3';
import { ConnectorService } from '@app/shared/services/connector.service';
import { CreateOrEditDeviceRecordComponent } from '@app/admin/device/device-list/operation/create-or-edit-deviceRecord-modal.component'
import { DateRangePickerComponent } from '@app/shared/common/timing/date-range-picker.component';
import { ActivityServiceProxy, DeviceActivityServiceProxy, ReportServiceProxy as ActivityReportServiceProxy, PublishEntitiesInput as PublishEntitiesInput2 } from '@shared/service-proxies/service-proxies5';

import { SensingDeviceServiceProxy, SensorAgreementServiceProxy, CargoTypeEnum } from '@shared/service-proxies/service-proxies-smartdevice';

import { CounterDeviceServiceProxy, UpdateDeviceCounterTagInput, BindChildDevicesToGatewayInput, AddOrUpdateGatewayInput, AddOrUpdateSensorInput, GatewayType } from '@shared/service-proxies/service-proxies-smartdevice';
import { CounterReportServiceProxy } from '@shared/service-proxies/service-proxies-smartdevice';
import { ShelfDeviceServiceProxy, UpdateCargoStatusInput, CargoStatus, AddOrUpdateShelfInfoInput, LayerInput, AddOrDeleteCargoRoadByLayerIdInput, ExchangeCargoRoadSkuInput, TagServiceProxy, TagType as Type } from '@shared/service-proxies/service-proxies-smartdevice';


import { ChangeDeviceAppPodVersionInput, AppPodServiceProxy } from '@shared/service-proxies/service-proxies-devicecenter';


import { CargoModalComponent } from '@app/admin/device/cargo-lane/cargo-modal.component';
import { PriceTagServiceProxy, PriceTagPriceTagIntegrationInput } from '@shared/service-proxies/service-proxies-product';

import { MyTreeComponent } from '@app/shared/common/my-tree/my-tree.component';
import { DeviceBehaviorServiceProxy, EnumOptStatus } from '@shared/service-proxies/service-proxies3';
import { ExternalAccessServiceProxy } from '@shared/service-proxies/service-proxies';
import * as _ from 'lodash';
import { AppConsts } from '@shared/AppConsts';

import { CalendarModalComponent } from '@app/admin/advertisement/schedule/operation/calendar-modal.component';
import { AuditUserAppointmentInput } from '@shared/service-proxies/service-proxies-pager';


@Component({
    selector: 'DeviceEdit',
    templateUrl: './device-edit.component.html',
    styleUrls: ['./device-edit.component.css']
})
export class DeviceEditComponent extends AppComponentBase implements OnInit {
    moment = moment;
    device: any = {};
    shutdownTime: string = '08:00';
    ouOrDeviceList: IdTypeDto[] = [];
    peripheralIds: any[] = [];
    deviceProductClickLoading: boolean = false;
    deviceRunningLoading: boolean = false;
    controlItems: any = [];
    showFreezeUi = true;

    // 传感器终端 device.deviceTypeId==18
    gatewayType: any = '';
    pollingTime: any = '';
    agreementId: any = '';
    agreementList: any = [];

    GatewayType = GatewayType;


    // 传感器 device.deviceTypeId==19
    belongGateWay2: any = '';
    gatewayList2: any = [];
    addressCode: any = '';
    command: any = '';
    fromGatewayType = null;

    // 显示屏 device.deviceTypeId==23/20
    gatewayList3: any = [];
    LayerThingId: any = "";
    LayerOrderNumber: any = "";
    LayerThingIdList: any = [];

    CargoTypeEnum = CargoTypeEnum;
    EnumOptStatus = EnumOptStatus;


    @ViewChild('AdsAlertModal', { static: true }) AdsAlertModal: AdsAlertModalComponent;
    @ViewChild('AppAlertModal', { static: true }) AppAlertModal: AppAlertModalComponent;
    @ViewChild('ProductAlertModal', { static: true }) ProductAlertModal: ProductAlertModalComponent;
    @ViewChild('CouponAlertModal', { static: true }) CouponAlertModal: CouponAlertModalComponent;
    @ViewChild('appSettingModal', { static: true }) appSettingModal: AppSettingModalComponent;

    //广告分页
    // @ViewChild('dataTableAds') dataTable_ads: Table;
    @ViewChild('paginatorAds', { static: false }) paginatorAds: Paginator;
    AdsSelectionList: any[] = [];
    adsFilterText;
    pAds = new PrimengTableHelper();
    //软件分页
    // @ViewChild('dataTableSoftware') dataTable_software: Table;
    @ViewChild('paginatorSoftware', { static: false }) paginatorSoftware: Paginator;
    SoftwareSelectionList: any[] = [];
    softwareFilterText;
    pApp = new PrimengTableHelper();
    //商品分页
    // @ViewChild('dataTableProduct') dataTable_product: Table;
    @ViewChild('paginatorProduct', { static: false }) paginatorProduct: Paginator;
    ProductSelectionList: any[] = [];
    productFilterText;
    pProduct = new PrimengTableHelper();

    belongGateWay: any = '';
    gatewayList: any = [];


    //红包分页
    @ViewChild('dataTableCoupon', { static: false }) dataTableCoupon: Table;
    @ViewChild('paginatorCoupon', { static: false }) paginatorCoupon: Paginator;
    CouponSelectionList: any[] = [];
    couponFilterText;
    pCoupon = new PrimengTableHelper();

    //活动分页
    @ViewChild('dataTableActivity', { static: false }) dataTableActivity: Table;
    @ViewChild('paginatorActivity', { static: false }) paginatorActivity: Paginator;
    ActivitySelectionList: any[] = [];
    activityFilterText;
    pActivity = new PrimengTableHelper();


    //人脸分页
    @ViewChild('dataTableFace', { static: false }) dataTableFace: Table;
    @ViewChild('paginatorFace', { static: false }) paginatorFace: Paginator;
    FaceSelectionList: any[] = [];
    pFace = new PrimengTableHelper();
    startDateFace: moment.Moment = moment().utc().subtract(30, 'days').startOf('day');
    endDateFace: moment.Moment = moment().utc().endOf('day');
    faceGender: any = '';

    //货道分页
    singleShelfData: any = {
        layers: []
    };
    ShelfInfoLoading = false;
    cargoUIList: any = [];

    cargoIsEnabled: any = '';
    cargoFilterText = '';
    cargoDetailList = [];
    @ViewChild('dataTableCargo', { static: false }) dataTableCargo: Table;
    @ViewChild('paginatorCargo', { static: false }) paginatorCargo: Paginator;
    CargoSelectionList: any[] = [];
    pCargo = new PrimengTableHelper();
    @ViewChild('cargoModal', { static: true }) cargoModal: CargoModalComponent;

    historyFilterText = '';
    HistorySelectionList: any[] = [];
    @ViewChild('dataTableHistory', { static: false }) dataTableHistory: Table;
    @ViewChild('paginatorHistory', { static: false }) paginatorHistory: Paginator;
    pHistory = new PrimengTableHelper();


    //排程分页
    @ViewChild('dataTableSchedule', { static: false }) dataTableSchedule: Table;
    @ViewChild('paginatorSchedule', { static: false }) paginatorSchedule: Paginator;
    ScheduleSelectionList: any[] = [];
    ScheduleFilterText;
    pSchedule = new PrimengTableHelper();
    @ViewChild('calendarModal', { static: true }) CalendarModalComponent: CalendarModalComponent;


    //标识符
    saving: boolean = false;
    initTab: string = "BaseMsg";
    //下拉列表
    OUList: any[] = [];
    deviceTypeList: any[] = [];
    devicePeriList: any[] = [];
    onlineStoreInfo: any[] = [];
    //报表
    startDate1: moment.Moment = moment().utc().subtract(30, 'days').startOf('day');
    endDate1: moment.Moment = moment().utc().endOf('day');
    startDate2: moment.Moment = moment().utc().subtract(30, 'days').startOf('day');
    endDate2: moment.Moment = moment().utc().endOf('day');
    activityData: any = {};
    startDate3: moment.Moment = moment().utc().subtract(30, 'days').startOf('day');
    endDate3: moment.Moment = moment().utc().endOf('day');
    activityLoading = false;



    //维护记录
    notHost = abp.session.tenantId;
    StartTime: moment.Moment;
    EndTime: moment.Moment;
    statusSelect;
    recordCheckedList;
    dateChangeCount: boolean;
    questionFilter: '';

    dashboards = [{ name: 'software', count: null }, { name: 'product', count: null }, { name: 'coupon', count: null }, { name: 'ads', count: null }, { name: 'Activities', count: null }]
    colors = ['rgb(0, 123, 255)', 'rgb(32, 201, 151)', 'rgb(232, 62, 140)', 'rgb(255, 184, 34)', 'rgb(111, 66, 193)']
    dashboardsCount = 0;

    //控制
    controlList = [];
    versionList: any = [];
    targetAppPodVersion: any = {};
    appPod: any = {};
    screenUrl;
    screenLoading = 0;


    hasCamera;
    taobaoDeviceId;
    externalAccessTokenInfoId;
    externalAccessList = [];

    //电子价签控制
    eslBindSku: any = {};

    @ViewChild('dataTable', { static: false }) dataTable: Table;
    @ViewChild('paginator', { static: false }) paginator: Paginator;
    @ViewChild('createOrEditDeviceRecordModal', { static: true }) createOrEditDeviceRecordModal: CreateOrEditDeviceRecordComponent;

    type: string = "dd";
    deviceRunningTotalTime: string = '0';
    deviceStatusDataSets: any = [];
    deviceClickDataSets: any = [];
    @ViewChild("chart1", { static: false }) deviceStatusChart: ChartsComponent;
    @ViewChild("chart2", { static: false }) deviceClickChart: ChartsComponent;
    @ViewChild("chart3", { static: false }) activityChart: ChartsComponent;
    @ViewChild("dateranger", { static: false }) dateranger: DateRangePickerComponent;

    // isSupportRemoteControl = false;

    //子设备分页

    @ViewChild('dataTableChild', { static: false }) dataTableChild: Table;
    @ViewChild('paginatorChild', { static: false }) paginatorChild: Paginator;
    ChildSelectionList: any[] = [];
    pChild = new PrimengTableHelper();

    //计数器分页
    $$ = $;

    //设置标签
    Tags = [];
    tagList: any = [];
    tagFilter: string = '';
    PersonalCheckedList: any = [];
    tagConfig = {
        'name': 'value'
    };

    get tagIds() {
        return this.tagTree ? this.tagTree.getchosenIds() : [];//null
    }

    @ViewChild('tagTree', { static: false }) tagTree: MyTreeComponent;




    @ViewChild('dataTableCounter', { static: false }) dataTableCounter: Table;
    @ViewChild('paginatorCounter', { static: false }) paginatorCounter: Paginator;
    CounterSelectionList: any[] = [];
    pCounter = new PrimengTableHelper();

    @ViewChild("dataChartDiv", { static: false }) dataChart: ChartsComponent;
    @ViewChild("daterangerCounter", { static: false }) daterangerCounter: DateRangePickerComponent;
    ouLocaltionLoading: boolean = false;
    ouFilter: string = "";

    startTime: any = moment().utc().subtract(1, 'days').startOf('day');
    endTime: any = moment().utc().endOf('day');

    typeCounter: string = "dd";
    dataChartLoading: boolean = false;
    actions: string = "click,playvideo,enter,Rfid,pickup";
    searchOuId: number[] = [];

    // 状态
    adsDeviceStatus: any = '';
    softwareDeviceStatus: any = '';
    productDeviceStatus: any = '';
    couponDeviceStatus: any = '';
    schedulingDeviceStatus: any = '';
    activityDeviceStatus: any = '';
    

    //能力
    abilities: any = [{
        name: 'BaseMsg',
        active: true
    }, {
        name: 'Advertisement',
        active: false
    }, {
        name: 'Apps',
        active: false
    }, {
        name: 'Product',
        active: false
    }, {
        name: 'Coupon',
        active: false
    }, {
        name: 'Activities',
        active: false
    }, {
        name: 'Control',
        active: false
    }, {
        name: 'thirdPartyMsg',
        active: false
    }, {
        name: 'Statistics',
        active: false
    }, {
        name: 'cargoManagement',
        active: false
    }, {
        name: 'MaintainRecord',
        active: false
    }, {
        name: 'FaceData',
        active: false
    }, {
        name: 'childDevice',
        active: false
    }, {
        name: 'counter',
        active: false
    }, {
        name: 'Scheduling',
        active: false
    }];

    realAbilities: any = [{
        name: 'BaseMsg',
        active: true
    }, {
        name: 'Advertisement',
        active: false
    }, {
        name: 'Apps',
        active: false
    }, {
        name: 'Product',
        active: false
    }, {
        name: 'Coupon',
        active: false
    }, {
        name: 'Activities',
        active: false
    }, {
        name: 'Control',
        active: false
    }, {
        name: 'thirdPartyMsg',
        active: false
    }, {
        name: 'Statistics',
        active: false
    }, {
        name: 'cargoManagement',
        active: false
    }, {
        name: 'MaintainRecord',
        active: false
    }, {
        name: 'FaceData',
        active: false
    }, {
        name: 'childDevice',
        active: false
    }, {
        name: 'counter',
        active: false
    }, {
        name: 'Scheduling',
        active: false
    }];

    informDevice = false;

    constructor(
        injector: Injector,
        private router: Router,
        private route: ActivatedRoute,
        private _deviceProductService: DeviceProductServiceProxy,
        private _NewDeviceServiceProxy: NewDeviceServiceProxy,
        private _productService: ProductServiceProxy,
        private _adsService: AdServiceProxy,
        private _appService: SoftwareServiceProxy,
        private _couponService: CouponServiceProxy,
        private _reportService: ReportServiceProxy,
        private _connector: ConnectorService,
        private _deviceOpt: DeviceOperationsServiceProxy,
        private _acitvityService: ActivityServiceProxy,
        private _deviceAcitvityService: DeviceActivityServiceProxy,
        private _ActivityReportServiceProxy: ActivityReportServiceProxy,
        private _SensingDeviceServiceProxy: SensingDeviceServiceProxy,
        private _AppPodServiceProxy: AppPodServiceProxy,
        private _SensorAgreementServiceProxy: SensorAgreementServiceProxy,
        private _PriceTagServiceProxy: PriceTagServiceProxy,
        private _TagService: TagServiceProxy,
        private _DeviceBehaviorServiceProxy: DeviceBehaviorServiceProxy,
        private _externalaccessService: ExternalAccessServiceProxy,
        private _DeviceSoftwareServiceProxy: DeviceSoftwareServiceProxy,

        private _CounterDeviceServiceProxy: CounterDeviceServiceProxy,
        private _CounterReportServiceProxy: CounterReportServiceProxy,
        private _ShelfDeviceServiceProxy: ShelfDeviceServiceProxy,
        private _DeviceAdsServiceProxy: DeviceAdsServiceProxy,

    ) {
        super(injector);
        this.initMessage();
        console.log("Statistics", this.l("Statistics"))
    }

    // 计数器标签设置

    //获取标签下拉数据
    getTags() {
        this._TagService.getTagsByType(void 0, void 0, 1000, 0, Type.Counter).subscribe((result) => {
            this.Tags = result.items;
            this.tagList = Object.assign([], this.Tags);
        });
    }
    filterTags() {
        this.tagList = this.Tags.filter(item => {
            if (item.value) {
                return item.value.indexOf(this.tagFilter) > -1
            } else {
                return false
            }
        })
    }
    //前往管理标签
    goTag(f?) {
        f !== void 0 ? this.router.navigate(['app', 'tags', 'tags'], { queryParams: { "type": f } }) : this.router.navigate(['app', 'admin', 'tags', 'tags']);
    }
    //选中或者取消选中标签
    setTag() {
        this.judgeSelection((ary) => {
            var ids = this.tagTree.getchosenIds();
            if (ids.length == 0) {
                return this.notify.warn(this.l('atleastonetag'));
            }
            this._CounterDeviceServiceProxy.updateDeviceCounterTags({
                counterIds: ary,
                tagIds: ids
            } as UpdateDeviceCounterTagInput).subscribe(r => {
                this.notify.info(this.l('success'));
                this.getDeviceCounters();
            })
        })
    }

    //判断是否选中
    judgeSelection(callback) {
        if (this.CounterSelectionList.length == 0) {
            return this.notify.info(this.l("atLeastChoseOneItem"));
        }
        var ary = [];
        this.CounterSelectionList.forEach((v, i) => {
            ary.push(v.id);
        })
        callback && callback(ary);
    }


    // 计数器热力图
    makeHeatMap(startTime, endTime) {//h337
        this._DeviceBehaviorServiceProxy.getDeviceHeatmapData(
            startTime,
            endTime,
            this.device.id
        ).subscribe(r => {
            var data = r;
            $('#heatmap').html("");
            $('#heatmap').css({ width: data[0].width + 'px', height: data[0].height + 'px' })
            var config = {
                container: document.querySelector('#heatmap'),
                maxOpacity: .55,
                minOpacity: 0,
                blur: .85,
            };
            var heatmap = h337.create(config);
            var points = [];
            var max = 0;

            $("#heatmap").css("background", "url('" + data[0].snapShotUrl + "')");

            //data.length 表示多个热力图数据源
            for (var i = 0; i < data.length; i++) {
                var yCount = data[i].heatMapValues.length;
                //data[i].HeatMapValues 其中一个热力图的值 是二维数组
                for (var j = 0; j < data[i].heatMapValues.length; j++) {
                    var xCount = data[i].heatMapValues[j].length;
                    //data[i].HeatMapValues[j] 该热力图第j行的值，是一个数组
                    for (var m = 0; m < data[i].heatMapValues[j].length; m++) {

                        var heatValue = data[i].heatMapValues[j][m];
                        if (heatValue == "" || heatValue == " " || heatValue == "0" || heatValue == " 0") continue;
                        var heatInt = parseInt(data[i].heatMapValues[j][m]);

                        var point = {
                            x: m * data[0].width / xCount,
                            y: j * data[0].height / yCount,
                            value: heatInt
                        };
                        max = Math.max(max, point.value);
                        points.push(point);
                    }
                }
            }
            if (max > 0) {
                heatmap.setData({
                    max: max,
                    data: points
                });
            }
        })
    }

    deleteGateway() {
        if (this.ChildSelectionList.length > 0) {
            this.message.confirm(this.l("DeleteDeviceQuestion"), this.l('AreYouSure'), (r) => {
                if (r) {
                    this.pChild.showLoadingIndicator();
                    this._CounterDeviceServiceProxy.bindChildDevicesToGateway(
                        new BindChildDevicesToGatewayInput({
                            gatewayId: void 0,
                            deviceIds: this.ChildSelectionList.map(item => { return item.id }),
                            type: void 0,
                            thingId: void 0,
                            orderNumber: void 0
                        }))
                        .pipe(finalize(() => {
                            this.pChild.hideLoadingIndicator();
                        })).subscribe(result => {
                            this.notify.info(this.l('success'));
                            this.GetDevicesByGatewayId()
                        })
                }
            })
        } else {
            this.message.warn(this.l('atLeastChoseOneItem'))
        }
    }

    GetDevicesByGatewayId() {
        setTimeout(() => {
            this.pChild.showLoadingIndicator();
            this._CounterDeviceServiceProxy.getChildDevicesByGatewayId(
                this.device.id,
                void 0,
                this.pChild.getSorting(this.dataTableChild),
                this.pChild.getMaxResultCount(this.paginatorChild, void 0),
                this.pChild.getSkipCount(this.paginatorChild, void 0)
            ).pipe(finalize(() => {
                this.pChild.hideLoadingIndicator();
            })).subscribe(result => {
                this.pChild.totalRecordsCount = result.totalCount;
                this.pChild.records = result.items;
            })
        })

    }

    changeViewTypeCounter(typeCounter) {
        this.typeCounter = typeCounter;
        if (typeCounter == "dd") {
            this.startTime = moment().utc().subtract(30, 'days').startOf('day');
            this.endTime = moment().utc().endOf('day');
        } else if (typeCounter == "mm") {
            this.startTime = moment().utc().subtract(12, 'month').startOf('day');
            this.endTime = moment().utc().endOf('day');
        } else if (typeCounter == "hh") {
            this.startTime = moment().utc().startOf('day');
            this.endTime = moment().utc().endOf('day');
        }
        setTimeout(() => {
            this.daterangerCounter.refresh();
        }, 0);
        this.getCountByDeviceIds();
    }

    getCounterDate() {
        this.getDeviceCounters();
        this.getTags();
    }
    setSelection() {
        if (this.device.deviceTypeId == 19 && this.CounterSelectionList.length > 1) {
            var tempCounter = this.CounterSelectionList[this.CounterSelectionList.length - 1];
            this.CounterSelectionList = [];
            this.CounterSelectionList[0] = tempCounter;
        }
        this.getCountByDeviceIds();
    }
    setAllSelect() {
        this.getCountByDeviceIds();
    }

    getCountByDeviceIds() {
        if (this.startTime.toJSON().substring(11, 19) == "00:00:00") {
            var startTime = this.startTime;
            var endTime = this.endTime;
        } else {
            var startTime = this.startTime.add(-(new Date().getTimezoneOffset() / 60), 'h');
            var endTime = this.endTime.add(-(new Date().getTimezoneOffset() / 60), 'h');
        }
        this.makeHeatMap(startTime, endTime);
        var CounterIds = [];
        if (this.CounterSelectionList.length == 0 || this.CounterSelectionList.length == this.pCounter.records.length) {
            CounterIds = void 0;
        }
        else {
            for (var i = 0; i < this.CounterSelectionList.length; i++) {
                CounterIds[i] = this.CounterSelectionList[i].id;
            }
        }
        this.dataChartLoading = true;


        this._CounterReportServiceProxy.getDeviceCounterChartByDeviceIds(
            // this.startTime,
            // this.endTime,
            startTime,
            endTime,
            this.typeCounter,
            CounterIds ? CounterIds[0] : void 0,
            [this.device.id]
        ).pipe(finalize(() => {
            this.dataChartLoading = false;
            if (!this.dataChart.dataSets || this.dataChart.dataSets.length == 0) {
                var data = [{
                    'title': '',
                    'chartItems': [{
                        "date": moment(new Date()).format("yyyy/MM/DD").toString(),
                        "value": 0
                    }]
                }];

                this.dataChart.draw(data);
            }
        })).subscribe((result) => {
            this.dataChartLoading = false;
            this.dataChart.draw(result, this.typeCounter == "hh" ? moment() : void 0);
        })
    }

    getDeviceCounters() {
        setTimeout(() => {
            this.CounterSelectionList = [];
            this.pCounter.showLoadingIndicator();
            this._CounterDeviceServiceProxy.getDeviceCountersByDeviceId(
                this.device.id,
                void 0,
                this.pCounter.getSorting(this.dataTableCounter),
                this.pCounter.getMaxResultCount(this.paginatorCounter, void 0),
                this.pCounter.getSkipCount(this.paginatorCounter, void 0)
            ).pipe(finalize(() => {
                this.pCounter.hideLoadingIndicator();
            })).subscribe(result => {
                this.pCounter.totalRecordsCount = result.totalCount;
                this.pCounter.records = result.items;
                if (this.pCounter.records.length > 0 && this.device.deviceTypeId == 19) this.CounterSelectionList[0] = this.pCounter.records[0];
                this.getCountByDeviceIds();
            })
        })
    }


    ngAfterViewInit() {
        $('date-range-picker input').val('');
    }

    ngOnInit() {
        var search = window.location.search;
        if (search) {
            setTimeout(() => {
                this.initTab = search.replace("?initTab=", "");
            }, 500)
        }
    }

    changeClick() {
        this.appPod.isLock = !this.appPod.isLock;
    }



    GetDeviceAppPodVersion() {
        if (Number(this.device.osType) != 0 && Number(this.device.osType) != 1) {
            return
        }


        if (this.appSession.tenant) {
            this._AppPodServiceProxy.getDeviceAppPodVersion4Device(
                this.device.id,
                this.device.osType
            ).subscribe((result) => {
                this.targetAppPodVersion = result;
                if (!this.targetAppPodVersion.targetAppPodVersionId) {
                    this.targetAppPodVersion.targetAppPodVersionId = '';
                }
                this.appPod.targetAppPodVersionId = this.targetAppPodVersion.targetAppPodVersionId;
                this.appPod.isLock = this.targetAppPodVersion.isLocked;
                this.appPod.extensionData = this.targetAppPodVersion.appSetting;
            })
            return
        }


        this._AppPodServiceProxy.getAppPodVersions(
            void 0,
            this.device.osType,
            void 0,
            void 0,
            99,
            0
        ).subscribe(result => {
            this.versionList = result.items;

            this._AppPodServiceProxy.getDeviceAppPodVersion4Device(
                this.device.id,
                this.device.osType
            ).subscribe((result) => {
                this.targetAppPodVersion = result;
                if (!this.targetAppPodVersion.targetAppPodVersionId) {
                    this.targetAppPodVersion.targetAppPodVersionId = '';
                }
                this.appPod.targetAppPodVersionId = this.targetAppPodVersion.targetAppPodVersionId;
                this.appPod.isLock = this.targetAppPodVersion.isLocked;
                this.appPod.extensionData = this.targetAppPodVersion.appSetting;
            })
        });


    }
    saveApppod() {

        if (!this.checkJson(this.appPod.extensionData)) {
            return
        }

        this._AppPodServiceProxy.changeDeviceApppodVersion4Device(new ChangeDeviceAppPodVersionInput({
            deviceId: this.device.id,
            targetAppPodVersionId: this.appPod.targetAppPodVersionId ? Number(this.appPod.targetAppPodVersionId) : void 0,
            extensionData: this.appPod.extensionData,
            isLock: this.appPod.isLock
        })).subscribe(r => {
            this.notify.info("success");
        })
    }

    showActivityData(record) {
        this.router.navigate(['app', 'admin', 'activity', 'activity', 'data'], { queryParams: { id: record.activityId, deviceId: record.deviceId, name: record.activity.name } });
    }

    getCountByDeviceId() {
        if (this.isGranted("Pages.Tenant.Products")) {

            this._deviceProductService.getProductsByDeviceId(
                this.device.id,
                void 0,
                AuditStatus.Online,
                void 0,
                void 0,
                1,
                0).subscribe((result) => {
                    this.dashboards[1].count = result.totalCount;
                    this.dashboardsCount++
                })
        } else {
            this.dashboards[1].count = 0;
            this.dashboardsCount++
        }

        if (this.isGranted("Pages.Tenant.Ads")) {

            this._DeviceAdsServiceProxy.getAdsByDeviceId(
                this.device.id,
                void 0,
                AuditStatus.Online,
                void 0,
                void 0,
                1,
                0).subscribe((result) => {
                    this.dashboards[3].count = result.totalCount;
                    this.dashboardsCount++
                })
        } else {
            this.dashboards[3].count = 0;
            this.dashboardsCount++
        }

        if (this.isGranted('Pages.Softwares')) {
            this._DeviceSoftwareServiceProxy.getSoftwaresByDeviceId(
                this.device.id,
                void 0,
                AuditStatus.Online,
                void 0,
                void 0,
                1,
                0).subscribe((result) => {
                    this.dashboards[0].count = result.totalCount;
                    this.dashboardsCount++
                })
        } else {
            this.dashboardsCount++
        }



        if (this.isGranted("Pages.Tenant.Coupons")) {
            this._deviceProductService.getCouponsByDeviceId(
                this.device.id,
                void 0,
                AuditStatus.Online,
                void 0,
                void 0,
                1,
                0).subscribe((result) => {
                    this.dashboards[2].count = result.totalCount;
                    this.dashboardsCount++
                })
        } else {
            this.dashboards[2].count = 0;
            this.dashboardsCount++
        }

        if (this.isGranted("Pages.Tenant.Activities")) {
            this._deviceAcitvityService.getDeviceActivitiesById(
                this.device.id,
                void 0,
                void 0,
                1,
                0
            ).subscribe(result => {
                this.dashboards[4].count = result.totalCount;
                this.dashboardsCount++
            })
        } else {
            this.dashboards[4].count = 0;
            this.dashboardsCount++
        }
    }

    getSingleShelf() {
        this.ShelfInfoLoading = true;
        this._ShelfDeviceServiceProxy.getSingleShelf(
            this.device.id
        ).pipe(finalize(() => {
            this.ShelfInfoLoading = false;
        })).subscribe(result => {
            this.singleShelfData = result;

            this.cargoUIList = _.cloneDeep(this.singleShelfData.layers.sort(function (a, b) { return b.index - a.index }));
            if (!this.singleShelfData.layers || this.singleShelfData.layers.length == 0) {
                this.singleShelfData.layers = [{}];
            }
            console.log("cargoUIList", this.cargoUIList)
            console.log("layers", this.singleShelfData.layers)

        })
    }

    AddOrUpdateShelfInfo() {
        var inputItem = _.cloneDeep(this.singleShelfData);
        inputItem.deviceId = inputItem.id;
        inputItem.layers = inputItem.layers.map(item => {
            var newItem = new LayerInput(item);
            newItem.id = item.layerId;
            return newItem;
        }).reverse()
        inputItem = new AddOrUpdateShelfInfoInput(inputItem);

        this.ShelfInfoLoading = true;
        this._ShelfDeviceServiceProxy.addOrUpdateShelfInfo(
            inputItem,
        ).pipe(finalize(() => {
            this.ShelfInfoLoading = false;
        })).subscribe(result => {
            this.getSingleShelf();
        })
    }

    dragCargo(e, originCol) {
        e.dataTransfer.setData("originCol", JSON.stringify(originCol));
    }
    dropCargo(e, newCol?) {
        e.preventDefault();
        var originCol = JSON.parse(e.dataTransfer.getData("originCol"));
        if (newCol) {
            this.message.confirm(`${this.l('exchangeCargoQuestion')} ${originCol.name} ${newCol.name}`, this.l('AreYouSure'), (r) => {
                if (r) {
                    this.ShelfInfoLoading = true;
                    this._ShelfDeviceServiceProxy.exchangeCargoRoadSku(new ExchangeCargoRoadSkuInput({
                        sourceCargoRoadId: originCol.id,
                        targetCargoRoadId: newCol.id
                    })).pipe(finalize(() => {
                        this.ShelfInfoLoading = false;
                    })).subscribe(result => {
                        this.getSingleShelf();
                    })
                }
            })
        } else {
            this.message.confirm(`${this.l('clearCargoQuestion')} ${originCol.name}`, this.l('AreYouSure'), (r) => {
                if (r) {
                    this.ShelfInfoLoading = true;
                    var inputItem = Object.assign({}, originCol);
                    inputItem.cargoThings = [];
                    this._ShelfDeviceServiceProxy.updateCargoRoad(inputItem)
                        .pipe(finalize(() => {
                            this.ShelfInfoLoading = false;
                        }))
                        .subscribe(() => {
                            this.getSingleShelf();
                        });
                }
            })
        }

    }


    getCargoList(event?: LazyLoadEvent) {
        setTimeout(() => {

            this.pCargo.showLoadingIndicator();
            this._ShelfDeviceServiceProxy.getCargoRoadsByDevice(
                this.device.id,
                this.cargoIsEnabled,
                this.cargoFilterText,
                this.pCargo.getSorting(this.dataTableCargo) || 'outerId',
                this.pCargo.getMaxResultCount(this.paginatorCargo, event),
                this.pCargo.getSkipCount(this.paginatorCargo, event)
            ).pipe(this.myFinalize(() => { this.pCargo.hideLoadingIndicator(); }))
                .subscribe(r => {
                    this.cargoDetailList = r.items.map(cargo => {

                        var obj: any = { name: "", stock: 0 };
                        for (var i = 0; i < cargo.cargoThings.length; i++) {
                            obj.name = obj.name + " " + cargo.cargoThings[i].thingName;
                            obj.stock = obj.stock + cargo.cargoThings[i].stock;
                        }
                        return obj
                    })

                    this.pCargo.totalRecordsCount = r.totalCount;
                    this.pCargo.records = r.items;
                    // this.pCargo.hideLoadingIndicator();
                })
        })

    }
    showHistory() {
        this.getHistoryList()
    }

    getHistoryList(event?: LazyLoadEvent) {
        setTimeout(() => {

            this.pHistory.showLoadingIndicator();
            this._SensingDeviceServiceProxy.getCargoHisotory(
                this.device.subKey,
                void 0,
                void 0,
                this.historyFilterText,
                this.pHistory.getSorting(this.dataTableHistory),
                this.pHistory.getMaxResultCount(this.paginatorHistory, event),
                this.pHistory.getSkipCount(this.paginatorHistory, event)
            )
                .pipe(this.myFinalize(() => { this.pHistory.hideLoadingIndicator(); }))
                .subscribe(r => {
                    this.pHistory.totalRecordsCount = r.totalCount;
                    this.pHistory.records = r.items;
                    // this.pHistory.hideLoadingIndicator();
                })
        })

    }

    cargoGoImport() {
        this.router.navigate(['app', 'admin', 'import', 'import', 'cargo'], { queryParams: { id: this.device.id } });
    }
    OnCargo() {
        if (this.CargoSelectionList.length === 0) {
            this.message.warn(this.l('selectOneWarn'));
        } else {
            this.message.confirm(this.l('onCargoQuestion'), this.l('AreYouSure'), (r) => {
                if (r) {
                    this.pCargo.showLoadingIndicator();
                    var CargoSelectionList = [];
                    for (var value of this.CargoSelectionList) {
                        CargoSelectionList.push(new CargoStatus({
                            id: value.id,
                            isEnable: true
                        }));
                    }
                    var input = new UpdateCargoStatusInput({ cargoStatus: CargoSelectionList });
                    this._ShelfDeviceServiceProxy.updateCargoRoadStatus(input)
                        .pipe(this.myFinalize(() => { this.pCargo.hideLoadingIndicator(); }))
                        .subscribe(result => {
                            this.notify.info("success");
                            this.getCargoList();
                            this.CargoSelectionList = [];
                        })
                    // this.pCargo.hideLoadingIndicator();
                }
            })
        }
    }
    OffCargo() {
        if (this.CargoSelectionList.length === 0) {
            this.message.warn(this.l('selectOneWarn'));
        } else {
            this.message.confirm(this.l('onCargoQuestion'), this.l('AreYouSure'), (r) => {
                if (r) {
                    this.pCargo.showLoadingIndicator();
                    var CargoSelectionList = [];
                    for (var value of this.CargoSelectionList) {
                        CargoSelectionList.push(new CargoStatus({
                            id: value.id,
                            isEnable: false
                        }));
                    }
                    var input = new UpdateCargoStatusInput({ cargoStatus: CargoSelectionList });
                    this._ShelfDeviceServiceProxy.updateCargoRoadStatus(input)
                        .pipe(this.myFinalize(() => { this.pCargo.hideLoadingIndicator(); }))
                        .subscribe(result => {
                            this.notify.info("success");
                            this.getCargoList();
                            this.CargoSelectionList = [];
                        })
                    // this.pCargo.hideLoadingIndicator();
                }
            })
        }
    }
    deleteBatchCargo() {
        if (this.CargoSelectionList.length === 0) {
            this.message.warn(this.l('selectOneWarn'));
        } else {
            this.message.confirm(this.l('deleteCargoQuestion'), this.l('AreYouSure'), (r) => {
                if (r) {
                    this.pCargo.showLoadingIndicator();
                    var CargoSelectionList = [];
                    for (var value of this.CargoSelectionList) {
                        CargoSelectionList.push(value.id);
                    }
                    this._ShelfDeviceServiceProxy.deleteManyCargoRoads(CargoSelectionList)
                        .pipe(this.myFinalize(() => { this.pCargo.hideLoadingIndicator(); }))
                        .subscribe(result => {
                            this.notify.info(this.l('success'));
                            this.getCargoList();
                            this.CargoSelectionList = [];
                        })
                    // this.pCargo.hideLoadingIndicator();
                }
            })
        }
    }
    addOrDeleteCargoLane(layerId, record?) {
        if (record) {
            this.message.confirm(this.l('deleteCargoQuestion'), this.l('AreYouSure'), (r) => {
                if (r) {
                    this.ShelfInfoLoading = true;
                    this._ShelfDeviceServiceProxy.addOrDeleteCargoRoadByLayerId(new AddOrDeleteCargoRoadByLayerIdInput({
                        "layerId": layerId,
                        "cargoRoadId": record.cargoRoadId
                    })).pipe(finalize(() => {
                        this.ShelfInfoLoading = false;
                    })).subscribe(r => {
                        this.getSingleShelf();
                    })

                }
            })
        } else {
            this.ShelfInfoLoading = true;
            this._ShelfDeviceServiceProxy.addOrDeleteCargoRoadByLayerId(new AddOrDeleteCargoRoadByLayerIdInput({
                "layerId": layerId,
                "cargoRoadId": void 0
            })).pipe(finalize(() => {
                this.ShelfInfoLoading = false;
            })).subscribe(r => {
                this.getSingleShelf();
            })
        }

    }
    deleteCargoLane(record) {
        this.message.confirm(this.l('deleteCargoQuestion'), this.l('AreYouSure'), (r) => {
            if (r) {
                this._ShelfDeviceServiceProxy.deleteCargoRoad(record.id).subscribe(r => {
                    this.notify.info(this.l('success'));
                    this.getCargoList();
                    this.getSingleShelf();
                })
            }
        })
    }
    createCargo() {
        this.cargoModal.deviceId = this.device.id;
        this.cargoModal.show();
    }
    editCargoLane(record) {
        this.cargoModal.deviceId = this.device.id;
        this.cargoModal.show(record);
    }
    transCargoIndex(i, event?: LazyLoadEvent) {
        return i + 1 + this.pCargo.getSkipCount(this.paginatorCargo, event);
    }
    transHistoryIndex(i, event?: LazyLoadEvent) {
        return i + 1 + this.pHistory.getSkipCount(this.paginatorHistory, event);
    }





    getFaceByDeviceId(event?: LazyLoadEvent) {
        setTimeout(() => {

            this.pFace.showLoadingIndicator();

            this._DeviceBehaviorServiceProxy.getFaceRecords(new GetFaceRecordsInput({
                deviceId: this.device.id,
                // 30353,
                gender: this.faceGender,
                collectionStartTime: this.startDateFace,
                collectionEndTime: this.endDateFace,
                filter: void 0,
                sorting: this.pFace.getSorting(this.dataTableFace),
                maxResultCount: this.pFace.getMaxResultCount(this.paginatorFace, event),
                skipCount: this.pFace.getSkipCount(this.paginatorFace, event)
            }))
                .pipe(this.myFinalize(() => { this.pFace.hideLoadingIndicator(); }))
                .subscribe(result => {
                    this.pFace.totalRecordsCount = result.totalCount;
                    this.pFace.records = result.items;
                    // this.pFace.hideLoadingIndicator();
                })
        })

    }
    transFaceIndex(i, event?: LazyLoadEvent) {
        return i + 1 + this.pFace.getSkipCount(this.paginatorFace, event);
    }

    deleteFace(record) {

    }
    editFace(record) {

    }





    getActivityByDeviceId(event?: LazyLoadEvent) {
        setTimeout(() => {
            this.pActivity.showLoadingIndicator();
            this._deviceAcitvityService.getDeviceActivitiesById(
                this.device.id,
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
        })
    }

    transActivityIndex(i, event?: LazyLoadEvent) {
        return i + 1 + this.pActivity.getSkipCount(this.paginatorActivity, event);
    }
    deleteDeviceActivity(record) {
        this.message.confirm(this.l('deletethisactivity'), this.l('AreYouSure'), (r) => {
            if (r) {
                var input = new PublishEntitiesInput2({
                    ouOrStoreOrDeviceList: [new IdTypeDto({
                        id: this.device.id,
                        type: 'device'
                    })],
                    entityIds: [record.activityId],
                    action: 'delete',
                    // 'includeSku': void 0,
                    // 'isCreateDefaultSchedule': void 0,
                    // 'informDevice': void 0,
                    // 'type': void 0
                })
                this._acitvityService.publishToOrganizationOrStoreOrDevices(input).subscribe(r => {
                    this.notify.info(this.l('success'));
                    this.getActivityByDeviceId();
                })
            }
        })
    }

    gameSetup(record) {
        this.router.navigate(['app', 'admin', 'device', 'deviceList', 'game'], { queryParams: { id: record.activityId, deviceId: this.device.id, name: record.activity.name } });
    }

    editActivity(record) {
        this.router.navigate(['app', 'admin', 'activity', 'activity', 'basic'], { queryParams: { id: record.activityId, deviceId: this.device.id, name: record.activity.name } });
    }

    //维护记录
    getRecordList(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }
        setTimeout(() => {

            this.primengTableHelper.showLoadingIndicator();
            this._deviceOpt.getOperationRecords(new GetDeviceOptInput(
                {
                    deviceId: this.device.id,
                    startTime: this.StartTime,
                    endTime: this.EndTime,
                    optStatus: this.statusSelect,
                    tenantId: void 0,
                    categoryId: void 0,
                    optKnowledgeId: void 0,
                    filter: this.questionFilter,
                    sorting: this.primengTableHelper.getSorting(this.dataTable),
                    maxResultCount: this.primengTableHelper.getMaxResultCount(this.paginator, event),
                    skipCount: this.primengTableHelper.getSkipCount(this.paginator, event)
                }
            )).pipe(finalize(() => {
                this.primengTableHelper.hideLoadingIndicator();
            })).subscribe(result => {
                this.primengTableHelper.totalRecordsCount = result.totalCount;
                this.primengTableHelper.records = result.items;
            })
        })

    }

    createRecord() {
        this.createOrEditDeviceRecordModal.device = this.device;
        this.createOrEditDeviceRecordModal.show();
    }

    editRecord(record) {
        this.createOrEditDeviceRecordModal.device = this.device;
        this.createOrEditDeviceRecordModal.show(record);
    }

    deleteRecord(record) {
        this.message.confirm(this.l("DeleteThisDeviceRecord"), this.l('AreYouSure'), (r) => {
            if (r) {
                this._deviceOpt.deleteOperationRecord(record.id).subscribe(() => {
                    this.notify.info(this.l('success'));
                    this.getRecordList();
                })
            }
        })
    }

    //转换序列
    transIndex(i, event?: LazyLoadEvent) {
        return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
    }
    transIndexChild(i, event?: LazyLoadEvent) {
        return i + 1 + this.pChild.getSkipCount(this.paginatorChild, event);
    }
    transIndexCounter(i, event?: LazyLoadEvent) {
        return i + 1 + this.pCounter.getSkipCount(this.paginatorCounter, event);
    }
    transIndexSchedule(i, event?: LazyLoadEvent) {
        return i + 1 + this.pSchedule.getSkipCount(this.paginatorSchedule, event);
    }

    dateChange() {
        if (this.dateChangeCount) {
            this.dateChangeCount = false;
            this.getRecordList();
        } else {
            this.dateChangeCount = true;
        }
    }

    //
    getDeviceRunningTotalTime() {
        this._reportService.getDeviceRunTime(this.device.id, this.startDate2, this.endDate2, []).subscribe((result) => {
            this.deviceRunningTotalTime = result;
        })
    }
    // --click 点击次数
    // --playVideo 播放视频
    // --play3D 播放3D
    // --playGame 玩游戏
    // --JewleryTry 虚拟试戴
    // --PeopleEnter 进入
    // --leave 离开
    drawBehaviorChart() {
        //设备下商品点击
        this.deviceProductClickLoading = true;
        var input = new ChartReportInput({
            'deviceId': this.device.id,
            'startTime': this.startDate2,
            'endTime': this.endDate2,
            'type': this.type,
            'actions': "click,enter",
            'categories': null,
            'storeIds': this.appSession.ouId ? [this.appSession.ouId] : null
        });
        this._reportService.getBehaviorChartReport(input).pipe(finalize(() => {
            if (this.deviceProductClickLoading && this.deviceClickDataSets.length == 0) {
                this.deviceClickDataSets = [{
                    'title': this.l('deviceProductClick'),
                    'chartItems': [{
                        "date": moment.utc(new Date()).format("yyyy/MM/DD").toString(),
                        "value": 0
                    }]
                }];
                this.deviceClickChart.draw(this.deviceClickDataSets, this.type == "hh" ? this.endDate2 : void 0);
            }
            this.deviceProductClickLoading = false;
        })).subscribe((result) => {
            this.deviceClickDataSets = result;
            if (this.deviceClickDataSets.length == 0) {
                this.deviceClickDataSets = [{
                    'title': this.l('deviceProductClick'),
                    'chartItems': [{
                        "date": moment(new Date()).format("yyyy/MM/DD").toString(),
                        "value": 0
                    }]
                }]
            }
            this.deviceClickChart.draw(this.deviceClickDataSets, this.type == "hh" ? this.endDate2 : void 0);
            //以下为测试
            // this.activityChart.draw(this.deviceClickDataSets);
        })
    }
    drawDeviceStatusChart() {//设备运行状态时间
        this.deviceRunningLoading = true;
        this.getDeviceRunningTotalTime();
        this._reportService.getDeviceStatusChartReport(this.device.id, this.startDate1, this.endDate1, [])
            .pipe(finalize(() => {
                this.deviceRunningLoading = false;
                console.log("deviceRunningLoading1", this.deviceRunningLoading)
                if (this.deviceStatusDataSets.length == 0) {
                    this.deviceStatusDataSets = [{
                        'title': this.l('deviceRunningStatus'),
                        'chartItems': [{
                            "date": moment(new Date()).format("yyyy/MM/DD").toString(),
                            "value": 0
                        }]
                    }];
                    this.deviceStatusChart.draw(this.deviceStatusDataSets);
                }
            })).subscribe((result) => {
                // this.deviceRunningLoading = false;
                console.log("deviceRunningLoading2", this.deviceRunningLoading)
                this.deviceStatusDataSets = result;
                this.deviceStatusChart.draw(this.deviceStatusDataSets);
            })
    }

    drawActivityChart() {
        this._ActivityReportServiceProxy.getTotal(
            this.startDate3,
            this.endDate3,
            void 0,
            this.device.id,
            void 0,
            void 0,
            void 0,
        ).subscribe(r => {
            this.activityData = r;
        })
        this.activityLoading = true;
        this._ActivityReportServiceProxy.getActivityLabelChartReport(
            'fans,like,view,share,Interactive',
            'dd',
            this.startDate3,
            this.endDate3,
            void 0,
            this.device.id,
            void 0,
            void 0,
            void 0
        )
            .pipe(finalize(() => {
                this.activityLoading = false;
            }))
            .subscribe(r => {
                this.activityChart.draw(r, void 0);
            })
    }

    changeViewType(type) {
        this.type = type;
        if (type == "dd") {
            this.startDate2 = moment().utc().subtract(30, 'days').startOf('day');
            this.endDate2 = moment().utc().endOf('day');
        } else if (type == "mm") {
            this.startDate2 = moment().utc().subtract(12, 'month').startOf('day');
            this.endDate2 = moment().utc().endOf('day');
        } else if (type == "hh") {
            this.startDate2 = moment().utc().startOf('day');
            this.endDate2 = moment().utc().endOf('day');
        }
        setTimeout(() => {
            this.dateranger.refresh();
        }, 0);
        this.drawBehaviorChart();
    }
    draw() {
        setTimeout(() => {
            this.dashboardsCount = 0;
            this.drawBehaviorChart();
            this.drawDeviceStatusChart();
            this.drawActivityChart();
            this.getDeviceRunningTotalTime();
            this.getCountByDeviceId();
        })
    }
    //初始化
    initMessage() {
        var urls = location.pathname.split('\/');
        this.device.id = urls[urls.length - 1];
        this._NewDeviceServiceProxy.getDeviceById(this.device.id).pipe(finalize(() => {
            this.showFreezeUi = false;
        })).subscribe((result) => {
            this.device = result;

            var ability = this.device.deviceType.abilities;
            if (ability && JSON.parse(ability) instanceof Array) {
                var abilityArr = JSON.parse(ability);
                this.abilities.forEach(item => {
                    if (abilityArr.indexOf(item.name) > -1) {
                        item.active = true;
                    } else {
                        item.active = false;
                    }
                })
                this.realAbilities.forEach(item => {
                    if (abilityArr.indexOf(item.name) > -1) {
                        item.active = true;
                    } else {
                        item.active = false;
                    }
                })
            }


            if (this.device.deviceTypeId == 4) {
                this.startTime = moment().utc().subtract(30, 'days').startOf('day');
            }
            this.taobaoDeviceId = this.device.extraDeviceId;
            this.peripheralIds = (result.peripherals || []).map((item) => {
                return {
                    'selectKey': item.peripheral.id,
                    'selectValue': item.peripheral.name
                }
            });
            var date = new Date(this.device.shutdownTime);
            this.shutdownTime = date.toTimeString().substr(0, 5);

            if (this.peripheralIds.some(item => {
                return item.selectKey == 4
            })) {
                this.hasCamera = true;
            }
            // if (this.device.isSupportRemoteControl) {
            //     this.isSupportRemoteControl = true
            // }

            this._NewDeviceServiceProxy.getDevices(
                [],
                void 0,
                void 0,
                void 0,
                true,
                [17],//10=>17
                void 0,
                void 0,
                void 0,
                999,
                0
            ).subscribe((result) => {
                this.gatewayList = result.items.filter(item => {
                    return item.id != this.device.id
                });
            })
            this._NewDeviceServiceProxy.getDevices(
                [],
                void 0,
                void 0,
                void 0,
                true,
                [18],
                void 0,
                void 0,
                void 0,
                999,
                0
            ).subscribe((result) => {
                this.gatewayList2 = result.items.filter(item => {
                    return item.id != this.device.id
                });
            })
            this._NewDeviceServiceProxy.getDevices(
                [],
                void 0,
                void 0,
                void 0,
                true,
                [16],
                void 0,
                void 0,
                void 0,
                999,
                0
            ).subscribe((result) => {
                this.gatewayList3 = result.items.filter(item => {
                    return item.id != this.device.id
                });
            })

            if (AppConsts.customTheme != 'kewosi') {
                this._SensorAgreementServiceProxy.getAgreements(
                    void 0,
                    void 0,
                    999,
                    0
                ).subscribe(r => {
                    this.agreementList = r.items;
                })
            }

            if (this.device.deviceTypeId == 4 || this.device.deviceTypeId == 23 || this.device.deviceTypeId == 20) {
                this.showFreezeUi = true;
                this._CounterDeviceServiceProxy.getGatewayByChildDeviceId(this.device.id)
                    .pipe(finalize(() => { this.showFreezeUi = false; }))
                    .subscribe(r => {
                        if (r.gatewayId) {
                            this.belongGateWay = r.gatewayId
                            this.LayerThingId = r.thingId;
                            this.LayerOrderNumber = r.orderNumber;
                            this.changeGateWay();
                        }
                    })
            } else if (this.device.deviceTypeId == 18) {
                this.showFreezeUi = true;
                this._CounterDeviceServiceProxy.getGatewayOrSensorInfo(
                    this.device.id
                ).pipe(finalize(() => { this.showFreezeUi = false; }))
                    .subscribe(r => {
                        this.pollingTime = r.pollingTime
                        this.gatewayType = r.gatewayType
                        this.agreementId = r.agreementId
                    })
            } else if (this.device.deviceTypeId == 19) {
                this._CounterDeviceServiceProxy.getGatewayOrSensorInfo(
                    this.device.id
                ).pipe(finalize(() => { this.showFreezeUi = false; }))
                    .subscribe(r => {
                        this.addressCode = r.address;
                        this.command = r.command;
                        this.belongGateWay2 = r.gatewayId;
                        this.agreementId = r.agreementId;
                        if (this.belongGateWay2) {
                            this.saving = true;
                            this._CounterDeviceServiceProxy.getNextSensorAddress(this.belongGateWay2).subscribe(r => {
                                this.saving = false;
                                this.fromGatewayType = r.gatewayType;
                            })
                        }

                    })
            }



        })


        this.ouOrDeviceList.push(new IdTypeDto({
            'id': this.device.id,
            'type': 'device'
        }));
        //外设
        this._NewDeviceServiceProxy.selectPeriperal().subscribe((result) => {
            this.devicePeriList = result;
        })
        //设备类型下拉
        this._NewDeviceServiceProxy.getDeviceTypeSelect().subscribe((result) => {
            this.deviceTypeList = result.items;
        })
        //电商类型
        this._deviceProductService.onlineStoreInfoSelect().subscribe((result) => {
            this.onlineStoreInfo = result;
        })
    }



    changeGateWay() {
        if (this.device.deviceTypeId == 23 || this.device.deviceTypeId == 20) {
            this._ShelfDeviceServiceProxy.getSingleShelf(
                this.belongGateWay
            ).subscribe(result => {
                if (this.device.deviceTypeId == 23) {
                    this.LayerThingIdList = result.layers;
                } else if (this.device.deviceTypeId == 20) {
                    var LayerThingIdList = [];
                    result.layers.forEach(layer => {
                        layer.cargoRoads.forEach(cargoRoad => {
                            LayerThingIdList.push(cargoRoad)
                        })
                    });
                    this.LayerThingIdList = LayerThingIdList;
                }
            })
            return
        }
        if (!this.belongGateWay2) {
            this.addressCode = void 0;
            this.fromGatewayType = void 0;
            return
        }
        this.saving = true;
        this._CounterDeviceServiceProxy.getNextSensorAddress(this.belongGateWay2).subscribe(r => {
            this.saving = false;
            this.addressCode = r.address;
            this.fromGatewayType = r.gatewayType;
        })
    }





    //筛选外设
    filterPeri(event) {
        //外设
        this._NewDeviceServiceProxy.selectPeriperal().subscribe((result) => {
            this.devicePeriList = result.filter((item) => {
                return item.selectValue.indexOf(event.query) + 1 > 0
            });
        })
    }
    //同步外设列表
    assignPeri() {
        var ids = [];
        this.peripheralIds.forEach((item) => {
            ids.push(item.selectKey);
        })
        this.device.peripheralIds = ids;
    }
    //广告tab
    //通过设备id获取广告列表
    getAdsByDeviceId(event?: LazyLoadEvent) {
        this.pAds.showLoadingIndicator();
        this._DeviceAdsServiceProxy.getAdsByDeviceId(
            this.device.id,
            void 0,
            this.adsDeviceStatus,
            this.adsFilterText,
            void 0,
            this.pAds.getMaxResultCount(this.paginatorAds, event),
            this.pAds.getSkipCount(this.paginatorAds, event))
            .pipe(this.myFinalize(() => { this.pAds.hideLoadingIndicator(); }))
            .subscribe((result) => {
                this.pAds.totalRecordsCount = result.totalCount;
                this.pAds.records = result.items;
                // this.pAds.hideLoadingIndicator();
            })
    }

    onOperateAds(event) {
        if (event.action == 'delete') {
            if (!this.isGranted('Pages.Tenant.Ads.Publish')) {
                return this.message.warn(this.l('needadspublishpermission'));
            }
            var ids = [];
            ids.push(event.image.id);
            var id = Math.floor(Math.random() * 10000000);
            this.message.confirm(`
            <div class="form-group">
                <label class="checkbox">
                    <input id="device_edit_isDelete_${id}" type="checkbox" name="device_edit_isDelete_${id}" ${this.informDevice ? 'checked' : ''}/>${this.l('informDevice')}
                    <span></span>
                </label>
            </div>
         `, this.l('deleteThisAdOfDevice'), (r) => {
                if (!r) return
                if ($(`#device_edit_isDelete_${id}`).is(':checked')) {
                    this.informDevice = true;
                } else {
                    this.informDevice = false;
                }
                var input = new PublishEntitiesInput({
                    'entityIds': ids,
                    'ouOrDeviceOrStoreList': this.ouOrDeviceList,
                    'action': "delete",
                    'includeSku': false,
                    'isCreateDefaultSchedule': false,
                    'informDevice': this.informDevice,
                    'type': 'publish'
                });
                // publishToOrganizationOrDevicesOrStore
                this._adsService.publishAdsToOrganizationOrDevicesOrStore(input)
                    .subscribe((result) => {
                        this.notify.info(this.l('success'));
                        this.AdsSelectionList = [];
                        this.getAdsByDeviceId();
                    })
            }, { isHtml: true })
        }
    }
    deleteBatchAd() {
        var list = [];
        for (var i = 0; i < this.AdsSelectionList.length; i++) {
            list.push(this.AdsSelectionList[i].id)
        }
        if (list.length == 0) return this.message.warn(this.l('atLeastChoseOneItem'))
        var id = Math.floor(Math.random() * 10000000);
        this.message.confirm(`
        <div class="form-group">
            <label class="checkbox">
                <input id="device_edit_isDelete_${id}" type="checkbox" name="device_edit_isDelete_${id}" ${this.informDevice ? 'checked' : ''}/>${this.l('informDevice')}
                <span></span>
            </label>
        </div>
     `, this.l('deleteThisAdOfDevice'), (r) => {
            if (!r) return
            if ($(`#device_edit_isDelete_${id}`).is(':checked')) {
                this.informDevice = true;
            } else {
                this.informDevice = false;
            }
            var input = new PublishEntitiesInput({
                'entityIds': list,
                'ouOrDeviceOrStoreList': this.ouOrDeviceList,
                'action': "delete",
                'includeSku': false,
                'isCreateDefaultSchedule': false,
                'informDevice': this.informDevice,
                'type': 'publish'
            });
            this._adsService.publishAdsToOrganizationOrDevicesOrStore(input).subscribe((result) => {
                this.notify.info(this.l('success'));
                this.AdsSelectionList = [];
                this.getAdsByDeviceId();
            })
        }, { isHtml: true })
    }

    createAdForDevice() {
        this.AdsSelectionList = [];
        this.AdsAlertModal.show(this.device.id);
    }
    publishAdsByDeviceId(e) {
        var ids = [], entityIds = e.selection || [];
        entityIds.forEach(record => {
            ids.push(record.id);
        });
        if (ids.length == 0) { return; }
        var id = Math.floor(Math.random() * 10000000);
        this.message.confirm(`
        <div class="form-group">
            <label class="checkbox">
                <input id="device_edit_isDelete_${id}" type="checkbox" name="device_edit_isDelete_${id}" ${this.informDevice ? 'checked' : ''}/>${this.l('informDevice')}
                <span></span>
            </label>
        </div>
     `, this.l('AreYouSure'), (r) => {
            if (!r) return
            if ($(`#device_edit_isDelete_${id}`).is(':checked')) {
                this.informDevice = true;
            } else {
                this.informDevice = false;
            }
            var input = new PublishEntitiesInput({
                'entityIds': ids,
                'ouOrDeviceOrStoreList': this.ouOrDeviceList,
                'action': "add",
                'includeSku': false,
                'isCreateDefaultSchedule': false,
                'informDevice': this.informDevice,
                'type': 'publish'
            });
            this._adsService.publishAdsToOrganizationOrDevicesOrStore(input).subscribe((result) => {
                this.notify.info(this.l('success'));
                this.AdsSelectionList = [];
                this.getAdsByDeviceId();
            })
        }, { isHtml: true })
    }
    //软件tab
    //通过设备id获取广告列表
    getSoftwareByDeviceId(event?: LazyLoadEvent) {
        this.pApp.showLoadingIndicator();
        this._DeviceSoftwareServiceProxy.getSoftwaresByDeviceId(
            this.device.id,
            void 0,
            this.softwareDeviceStatus,
            this.softwareFilterText,
            void 0,
            this.pApp.getMaxResultCount(this.paginatorSoftware, event),
            this.pApp.getSkipCount(this.paginatorSoftware, event))
            .pipe(this.myFinalize(() => { this.pApp.hideLoadingIndicator(); }))
            .subscribe((result) => {
                this.pApp.totalRecordsCount = result.totalCount;
                this.pApp.records = result.items;
                // this.pApp.hideLoadingIndicator();
            })
    }
    getSoftwareByDeviceId2(event?: LazyLoadEvent) {
        this._DeviceSoftwareServiceProxy.getSoftwaresByDeviceId(
            this.device.id,
            void 0,
            AuditStatus.Online,
            void 0,
            void 0,
            99,
            0).subscribe((result) => {
                this.controlList = result.items;
            })
    }
    onOperateSoftware(event) {
        if (event.action == 'delete') {
            if (!this.isGranted('Pages.Softwares.Publish')) {
                return this.message.warn(this.l('needapppublishpermission'));
            }
            var ids = [];
            ids.push(event.image.dispatchedId);
            var id = Math.floor(Math.random() * 10000000);
            this.message.confirm(`
            <div class="form-group">
                <label class="checkbox">
                    <input id="device_edit_isDelete_${id}" type="checkbox" name="device_edit_isDelete_${id}" ${this.informDevice ? 'checked' : ''}/>${this.l('informDevice')}
                    <span></span>
                </label>
            </div>
         `, this.l('deleteThisAppOfDevice'), (r) => {
                if (!r) return
                if ($(`#device_edit_isDelete_${id}`).is(':checked')) {
                    this.informDevice = true;
                } else {
                    this.informDevice = false;
                }
                var input = new PublishEntitiesInput({
                    'entityIds': ids,
                    'ouOrDeviceOrStoreList': this.ouOrDeviceList,
                    'action': "delete",
                    'includeSku': false,
                    'isCreateDefaultSchedule': false,
                    'informDevice': this.informDevice,
                    'type': 'publish'
                });
                this._appService.publishSoftwaresToOrganizationOrDevicesOrStore(input).subscribe((result) => {
                    this.notify.info(this.l('success'));
                    this.SoftwareSelectionList = [];
                    this.getSoftwareByDeviceId();
                })
            }, { isHtml: true })
        } else {
            this.appSettingModal.show(event.image, this.device.id);
        }
    }

    deleteBatchApp() {
        var list = [];

        for (var i = 0; i < this.SoftwareSelectionList.length; i++) {
            list.push(this.SoftwareSelectionList[i].dispatchedId)
        }

        if (list.length == 0) return this.message.warn(this.l('atLeastChoseOneItem'))
        var id = Math.floor(Math.random() * 10000000);
        this.message.confirm(`
        <div class="form-group">
            <label class="checkbox">
                <input id="device_edit_isDelete_${id}" type="checkbox" name="device_edit_isDelete_${id}" ${this.informDevice ? 'checked' : ''}/>${this.l('informDevice')}
                <span></span>
            </label>
        </div>
     `, this.l('deleteThisAppOfDevice'), (r) => {
            if (!r) return
            if ($(`#device_edit_isDelete_${id}`).is(':checked')) {
                this.informDevice = true;
            } else {
                this.informDevice = false;
            }
            var input = new PublishEntitiesInput({
                'entityIds': list,
                'ouOrDeviceOrStoreList': this.ouOrDeviceList,
                'action': "delete",
                'includeSku': false,
                'isCreateDefaultSchedule': false,
                'informDevice': this.informDevice,
                'type': 'publish'
            });
            this._appService.publishSoftwaresToOrganizationOrDevicesOrStore(input).subscribe((result) => {
                this.notify.info(this.l('success'));
                this.SoftwareSelectionList = [];
                this.getSoftwareByDeviceId();
            })


        }, { isHtml: true })
    }

    createAppForDevice() {
        this.AppAlertModal.show(this.device.id);
    }
    publishAppByDeviceId(e) {
        var ids = [], entityIds = e.selection || [];
        entityIds.forEach(record => {
            ids.push(record.dispatchedId);
        });

        if (ids.length == 0) { return; }
        var id = Math.floor(Math.random() * 10000000);
        this.message.confirm(`
        <div class="form-group">
            <label class="checkbox">
                <input id="device_edit_isDelete_${id}" type="checkbox" name="device_edit_isDelete_${id}" ${this.informDevice ? 'checked' : ''}/>${this.l('informDevice')}
                <span></span>
            </label>
        </div>
     `, this.l('AreYouSure'), (r) => {
            if (!r) return
            if ($(`#device_edit_isDelete_${id}`).is(':checked')) {
                this.informDevice = true;
            } else {
                this.informDevice = false;
            }
            var input = new PublishEntitiesInput({
                'entityIds': ids,
                'ouOrDeviceOrStoreList': this.ouOrDeviceList,
                'action': "add",
                'includeSku': false,
                'isCreateDefaultSchedule': false,
                'informDevice': this.informDevice,
                'type': 'publish'
            });
            this._appService.publishSoftwaresToOrganizationOrDevicesOrStore(input).subscribe((result) => {
                this.notify.info(this.l('success'));
                this.SoftwareSelectionList = [];
                this.getSoftwareByDeviceId();
            })
        }, { isHtml: true })


    }
    //商品tab
    //通过设备id获取商品列表
    getProductByDeviceId(event?: LazyLoadEvent) {
        this.pProduct.showLoadingIndicator();
        this._deviceProductService.getProductsByDeviceId(
            this.device.id,
            void 0,
            this.productDeviceStatus,
            this.productFilterText,
            void 0,
            this.paginatorProduct ? this.pProduct.getMaxResultCount(this.paginatorProduct, event) : 10,
            this.paginatorProduct ? this.pProduct.getSkipCount(this.paginatorProduct, event) : 0)
            .pipe(this.myFinalize(() => { this.pProduct.hideLoadingIndicator(); }))
            .subscribe((result) => {
                this.pProduct.totalRecordsCount = result.totalCount;
                this.pProduct.records = result.items;
                this.pProduct.hideLoadingIndicator();
            })
    }
    onOperateProduct(event) {
        if (event.action == 'delete') {
            if (!this.isGranted('Pages.Tenant.Products.Publish')) {
                return this.message.warn(this.l('needproductpublishpermission'));
            }
            var ids = [];
            ids.push(event.image.id);
            var id = Math.floor(Math.random() * 10000000);
            this.message.confirm(`
            <div class="form-group">
                <label class="checkbox">
                    <input id="device_edit_isDelete_${id}" type="checkbox" name="device_edit_isDelete_${id}" ${this.informDevice ? 'checked' : ''}/>${this.l('informDevice')}
                    <span></span>
                </label>
            </div>
         `, this.l('deleteThisProductOfDevice'), (r) => {
                if (!r) return
                if ($(`#device_edit_isDelete_${id}`).is(':checked')) {
                    this.informDevice = true;
                } else {
                    this.informDevice = false;
                }
                var input = new PublishEntitiesInput({
                    'entityIds': ids,
                    'ouOrDeviceOrStoreList': this.ouOrDeviceList,
                    'action': "delete",
                    'includeSku': true,
                    'isCreateDefaultSchedule': false,
                    'informDevice': this.informDevice,
                    'type': 'publish'
                });
                this._productService.publishToOrganizationOrDevicesOrStore(input).subscribe((result) => {
                    this.notify.info(this.l('success'));
                    this.ProductSelectionList = [];
                    this.getProductByDeviceId();
                })
            }, { isHtml: true })
        } else {
            this._connector.setCache("deviceAndProduct", {
                'productName': event.image.title,
                'deviceName': this.device.name
            })
            this.router.navigate(['product', event.image.id], { relativeTo: this.route });
        }
    }

    deleteBatchProduct() {
        var id = Math.floor(Math.random() * 10000000);
        var list = [];

        for (var i = 0; i < this.ProductSelectionList.length; i++) {
            list.push(this.ProductSelectionList[i].id)
        }
        if (list.length == 0) return this.message.warn(this.l('atLeastChoseOneItem'))

        this.message.confirm(`
        <div class="form-group">
            <label class="checkbox">
                <input id="device_edit_isDelete_${id}" type="checkbox" name="device_edit_isDelete_${id}" ${this.informDevice ? 'checked' : ''}/>${this.l('informDevice')}
                <span></span>
            </label>
        </div>
     `, this.l('deleteThisProductOfDevice'), (r) => {
            if (!r) return
            if ($(`#device_edit_isDelete_${id}`).is(':checked')) {
                this.informDevice = true;
            } else {
                this.informDevice = false;
            }
            var input = new PublishEntitiesInput({
                'entityIds': list,
                'ouOrDeviceOrStoreList': this.ouOrDeviceList,
                'action': "delete",
                'includeSku': true,
                'isCreateDefaultSchedule': false,
                'informDevice': this.informDevice,
                'type': 'publish'
            });
            this._productService.publishToOrganizationOrDevicesOrStore(input).subscribe((result) => {
                this.notify.info(this.l('success'));
                this.ProductSelectionList = [];
                this.getProductByDeviceId();
            })
        }, { isHtml: true })
    }

    createProForDevice() {
        this.ProductAlertModal.show(this.device.id);
    }
    publishProductByDeviceId(e) {
        var ids = [], entityIds = e.selection || [];
        entityIds.forEach(record => {
            ids.push(record.id);
        });
        if (ids.length == 0) { return; }

        var id = Math.floor(Math.random() * 10000000);
        this.message.confirm(`
        <div class="form-group">
            <label class="checkbox">
                <input id="device_edit_isDelete_${id}" type="checkbox" name="device_edit_isDelete_${id}" ${this.informDevice ? 'checked' : ''}/>${this.l('informDevice')}
                <span></span>
            </label>
        </div>
     `, this.l('AreYouSure'), (r) => {
            if (!r) return
            if ($(`#device_edit_isDelete_${id}`).is(':checked')) {
                this.informDevice = true;
            } else {
                this.informDevice = false;
            }
            var input = new PublishEntitiesInput({
                'entityIds': ids,
                'ouOrDeviceOrStoreList': this.ouOrDeviceList,
                'action': "add",
                'includeSku': true,
                'isCreateDefaultSchedule': false,
                'informDevice': this.informDevice,
                'type': 'publish'
            });
            this._productService.publishToOrganizationOrDevicesOrStore(input).subscribe((result) => {
                this.notify.info(this.l('success'));
                this.ProductSelectionList = [];
                this.getProductByDeviceId();
            })
        }, { isHtml: true })




    }
    //红包tab
    //通过设备id获取红包列表
    getCouponByDeviceId(event?: LazyLoadEvent) {
        this.pCoupon.showLoadingIndicator();
        this._deviceProductService.getCouponsByDeviceId(
            this.device.id,
            void 0,
            this.couponDeviceStatus,
            this.couponFilterText,
            void 0,
            this.pCoupon.getMaxResultCount(this.paginatorCoupon, event),
            this.pCoupon.getSkipCount(this.paginatorCoupon, event))
            .pipe(this.myFinalize(() => { this.pCoupon.hideLoadingIndicator(); }))
            .subscribe((result) => {
                this.pCoupon.totalRecordsCount = result.totalCount;
                this.pCoupon.records = result.items;
                this.pCoupon.hideLoadingIndicator();
            })
    }
    deleteDeviceCoupon(record) {
        if (!this.isGranted('Pages.Tenant.Coupons.Publish')) {
            return this.message.warn(this.l('needcouponpublishpermission'));
        }
        var ids = [];
        ids.push(record.id);
        var id = Math.floor(Math.random() * 10000000);
        this.message.confirm(`
        <div class="form-group">
            <label class="checkbox">
                <input id="device_edit_isDelete_${id}" type="checkbox" name="device_edit_isDelete_${id}" ${this.informDevice ? 'checked' : ''}/>${this.l('informDevice')}
                <span></span>
            </label>
        </div>
     `, this.l('deleteThisCouponOfDevice'), (r) => {
            if (!r) return
            if ($(`#device_edit_isDelete_${id}`).is(':checked')) {
                this.informDevice = true;
            } else {
                this.informDevice = false;
            }
            var input = new PublishEntitiesInput({
                'entityIds': ids,
                'ouOrDeviceOrStoreList': this.ouOrDeviceList,
                'action': "delete",
                'includeSku': false,
                'isCreateDefaultSchedule': false,
                'informDevice': this.informDevice,
                'type': 'publish'
            });
            this._couponService.publishCouponToOrganizationOrDevicesOrStore(input).subscribe((result) => {
                this.notify.info(this.l('success'));
                this.CouponSelectionList = [];
                this.getCouponByDeviceId();
            })
        }, { isHtml: true })
    }
    transCouponIndex(i, event?: LazyLoadEvent) {
        return i + 1 + this.pCoupon.getSkipCount(this.paginatorCoupon, event);
    }

    deleteBatchCoupon() {
        var list = [];
        for (var i = 0; i < this.CouponSelectionList.length; i++) {
            list.push(this.CouponSelectionList[i].id)
        }
        if (list.length == 0) return this.message.warn(this.l('atLeastChoseOneItem'))
        var id = Math.floor(Math.random() * 10000000);
        this.message.confirm(`
        <div class="form-group">
            <label class="checkbox">
                <input id="device_edit_isDelete_${id}" type="checkbox" name="device_edit_isDelete_${id}" ${this.informDevice ? 'checked' : ''}/>${this.l('informDevice')}
                <span></span>
            </label>
        </div>
     `, this.l('deleteThisCouponOfDevice'), (r) => {
            if (!r) return
            if ($(`#device_edit_isDelete_${id}`).is(':checked')) {
                this.informDevice = true;
            } else {
                this.informDevice = false;
            }
            var input = new PublishEntitiesInput({
                'entityIds': list,
                'ouOrDeviceOrStoreList': this.ouOrDeviceList,
                'action': "delete",
                'includeSku': false,
                'isCreateDefaultSchedule': false,
                'informDevice': this.informDevice,
                'type': 'publish'
            });
            this._couponService.publishCouponToOrganizationOrDevicesOrStore(input).subscribe((result) => {
                this.notify.info(this.l('success'));
                this.CouponSelectionList = [];
                this.getCouponByDeviceId();
            })

        }, { isHtml: true })
    }

    createCouponForDevice() {
        this.CouponAlertModal.show(this.device.id);
    }
    publishCouponByDeviceId(e) {
        var ids = [], entityIds = e.selection || [];
        entityIds.forEach(record => {
            ids.push(record.id);
        });
        if (ids.length == 0) { return; }

        var id = Math.floor(Math.random() * 10000000);
        this.message.confirm(`
        <div class="form-group">
            <label class="checkbox">
                <input id="device_edit_isDelete_${id}" type="checkbox" name="device_edit_isDelete_${id}" ${this.informDevice ? 'checked' : ''}/>${this.l('informDevice')}
                <span></span>
            </label>
        </div>
     `, this.l('AreYouSure'), (r) => {
            if (!r) return
            if ($(`#device_edit_isDelete_${id}`).is(':checked')) {
                this.informDevice = true;
            } else {
                this.informDevice = false;
            }
            var input = new PublishEntitiesInput({
                'entityIds': ids,
                'ouOrDeviceOrStoreList': this.ouOrDeviceList,
                'action': "add",
                'includeSku': false,
                'isCreateDefaultSchedule': false,
                'informDevice': this.informDevice,
                'type': 'publish'
            });
            this._couponService.publishCouponToOrganizationOrDevicesOrStore(input).subscribe((result) => {
                this.notify.info(this.l('success'));
                this.CouponSelectionList = [];
                this.getCouponByDeviceId();
            })
        }, { isHtml: true })




    }
    //控制 tab
    /// shutdown-pc, restart-pc.
    /// close-container,update-resource,snapshot
    /// switch-app,restart-app,close-app.
    screenShot() {
        var input = new DevicesActionInput({
            'deviceIds': [this.device.id],
            'actionName': 'snapshot',
            'appId': void 0,
            'actionContent': ''
        });
        this.screenLoading++;
        this._NewDeviceServiceProxy.broadcastEvent(input).pipe(finalize(() => {
            this.screenLoading = 0;
        })).subscribe(() => {
            this.notify.info(this.l('success'));
            this.getDeviceScreenshot()
        })



    }




    getDeviceScreenshot() {
        this.screenLoading++;
        this._AppPodServiceProxy.getDeviceScreenshot(this.device.id).pipe(finalize(() => {
        })).subscribe(result => {
            if (typeof (result) == 'string') {
                this.screenUrl = result;
                this.screenLoading = 0;
            } else {
                if (this.screenLoading < 5) {
                    setTimeout(() => {
                        this.getDeviceScreenshot()
                    }, 1500)
                } else {
                    this.screenLoading = 0;
                }

            }
        })
    }

    updateResource() {
        var input = new DevicesActionInput({
            'deviceIds': [this.device.id],
            'actionName': 'update-resource',
            'appId': void 0,
            'actionContent': ''
        });
        this._NewDeviceServiceProxy.broadcastEvent(input).subscribe((result) => {
            this.notify.info(this.l('success'));
        })
    }
    restart() {
        var input = new DevicesActionInput({
            'deviceIds': [this.device.id],
            'actionName': 'restart-pc',
            'appId': void 0,
            'actionContent': ''
        });
        this._NewDeviceServiceProxy.broadcastEvent(input).subscribe((result) => {
            this.notify.info(this.l('success'));
        })
    }
    shutdown() {
        var input = new DevicesActionInput({
            'deviceIds': [this.device.id],
            'actionName': 'shutdown-pc',
            'appId': void 0,
            'actionContent': ''
        });
        this._NewDeviceServiceProxy.broadcastEvent(input).subscribe((result) => {
            this.notify.info(this.l('success'));
        })
    }
    closeSoftware() {
        var input = new DevicesActionInput({
            'deviceIds': [this.device.id],
            'actionName': 'close-app',
            'appId': void 0,
            'actionContent': ''
        });
        this._NewDeviceServiceProxy.broadcastEvent(input).subscribe((result) => {
            this.notify.info(this.l('success'));
        })
    }
    restartSoftware() {
        var input = new DevicesActionInput({
            'deviceIds': [this.device.id],
            'actionName': 'restart-app',
            'appId': void 0,
            'actionContent': ''
        });
        this._NewDeviceServiceProxy.broadcastEvent(input).subscribe((result) => {
            this.notify.info(this.l('success'));
        })
    }
    closeAppPod() {
        var input = new DevicesActionInput({
            'deviceIds': [this.device.id],
            'actionName': 'close-container',
            'appId': void 0,
            'actionContent': ''
        });
        this._NewDeviceServiceProxy.broadcastEvent(input).subscribe((result) => {
            this.notify.info(this.l('success'));
        })
    }
    clearCache() {
        var input = new DevicesActionInput({
            'deviceIds': [this.device.id],
            'actionName': 'clear-cache',
            'appId': void 0,
            'actionContent': ''
        });
        this._NewDeviceServiceProxy.broadcastEvent(input).subscribe((result) => {
            this.notify.info(this.l('success'));
        })
    }
    switchApp(record) {
        var input = new DevicesActionInput({
            'deviceIds': [this.device.id],
            'actionName': 'switch-app',
            'appId': record.softwareId,
            'actionContent': ''
        });
        this._NewDeviceServiceProxy.broadcastEvent(input).subscribe((result) => {
            this.notify.info(this.l('success'));
        })
    }
    //淘宝设备
    getTokenIdList() {
        this._externalaccessService.getAll(
            void 0,
            void 0,
            999,
            0
        ).subscribe(result => {
            this.externalAccessList = result.items.filter(item => item.fromType == "Taobao");
            if (this.externalAccessList.length) {
                this.externalAccessTokenInfoId = this.externalAccessList[0].id;
            }
        });
    }


    registerDeviceToTaobao() {
        this._NewDeviceServiceProxy.addSmartStoreDeviceToExtraPlatform(new AddSmartStoreDeviceToExtraPlatformInput({
            deviceId: this.device.id,
            platformType: AddSmartStoreDeviceToExtraPlatformInputPlatformType['Taobao'],
            contact: void 0,
            bizType: void 0,
            categoryId: void 0,
            qrCodeExtraInfo: void 0,
            externalAccessTokenInfoId: this.externalAccessTokenInfoId
        })).subscribe((result) => {
            this.device.extraDeviceId = result.extraDeviceId;
            this.device.taobaoRegistTime = result.extraRegistTime;
        })
    }

    saveTaobaoDeviceId() {
        this._NewDeviceServiceProxy.updateThirdDeviceCode(new UpdateThirdDeivceCodeInput({
            deviceId: this.device.id,
            platformType: UpdateThirdDeivceCodeInputPlatformType['Taobao'],
            code: this.taobaoDeviceId,
            contact: void 0,
            bizType: void 0,
            categoryId: void 0,
            qrCodeExtraInfo: void 0
        })).subscribe(r => {
            this.notify.info(this.l('success'));
        })
    }


    // BIND    UNBIND_ESLID   CUTPAGE_FLASHLIGHTS

    bindPriceTag() {
        this._PriceTagServiceProxy.priceTagIntegration({
            deviceIds: [this.device.id],
            command: 'BIND'
        } as PriceTagPriceTagIntegrationInput).subscribe(r => {
            this.notify.success("sucess");
            this.device.isRegistered = true;
            this.getDefaultAndBindSkusByPriceTagId();
        })
    }
    unbindPriceTag() {
        this._PriceTagServiceProxy.priceTagIntegration({
            deviceIds: [this.device.id],
            command: 'UNBIND_ESLID'
        } as PriceTagPriceTagIntegrationInput).subscribe(r => {
            this.notify.success("sucess");
            this.device.isRegistered = false;
            this.getDefaultAndBindSkusByPriceTagId();
        })
    }
    lightUp() {
        this._PriceTagServiceProxy.priceTagIntegration({
            deviceIds: [this.device.id],
            command: 'CUTPAGE_FLASHLIGHTS'
        } as PriceTagPriceTagIntegrationInput).subscribe(r => {
            this.notify.success("sucess");
        })
    }

    getDefaultAndBindSkusByPriceTagId() {
        this._PriceTagServiceProxy.getDefaultAndBindSkusByPriceTagId(this.device.id).subscribe(r => {
            this.eslBindSku = r;
        })
    }
    changeType() {
        var ability = this.deviceTypeList.find(item => {
            return item.value == this.device.deviceTypeId
        }).abilities
        if (ability && JSON.parse(ability) instanceof Array) {
            var abilityArr = JSON.parse(ability);
            this.abilities.forEach(item => {
                if (abilityArr.indexOf(item.name) > -1) {
                    item.active = true;
                } else {
                    item.active = false;
                }
            })
        }

    }


    checkAbility(ability) {
        return this.realAbilities.some(item => {
            return item.name == ability && item.active
        })
    }
    checkControlItem(controlItem) {
        return this.controlItems.some(item => {
            return item == controlItem
        })
    }

    //返回
    goBack() {
        this.router.navigate(['app', 'admin', 'device', 'deviceList'], { queryParams: { useQuery: true } });
    }
    //提交
    save() {
        if (this.peripheralIds.some(item => {
            return item.selectKey == 4
        })) {
            this.hasCamera = true;
        }
        this.saving = true;
        this.showFreezeUi = true;

        if (this.shutdownTime == "Inval") {
            console.log("shutdownTime", this.shutdownTime);
            this.device.shutdownTime = null;
        } else {
            this.device.shutdownTime = moment(`2017-12-31T${this.shutdownTime}:00.000Z`);
        }

        //tagtag
        var type;
        if (this.device.deviceTypeId == 23) {
            type = "Layer"
        } else if (this.device.deviceTypeId == 20) {
            type = "CargoRoad"
        }

        // V3 for ecovacs
        if (AppConsts.customTheme == 'kewosi') {
            this.saving = true;
            this.showFreezeUi = true;
            this.device.abilities = JSON.stringify(this.abilities.filter(item => {
                return item.active
            }).map(item => {
                return item.name
            }));

            this._NewDeviceServiceProxy.updateDevice(new UpdateDeviceInput(this.device))
                .pipe(finalize(() => {
                    this.saving = false;
                    this.showFreezeUi = false;
                })).subscribe(() => {

                    if (this.device.deviceTypeId == 18) {
                        this.saving = true;
                        this.showFreezeUi = true;
                        this._CounterDeviceServiceProxy.addOrUpdateGatewayInfo(new AddOrUpdateGatewayInput({
                            // id: void 0,
                            deviceId: this.device.id,
                            agreementId: this.agreementId,
                            gatewayType: this.gatewayType,
                            pollingTime: this.pollingTime
                        })).pipe(finalize(() => { this.saving = false; this.showFreezeUi = false; }))
                            .subscribe(result => {
                                this.notify.success("sucess");
                                setTimeout(() => {
                                    this.goBack();
                                }, 1000)
                            })
                    } else if (this.device.deviceTypeId == 19) {
                        this.saving = true;
                        this.showFreezeUi = true;
                        this._CounterDeviceServiceProxy.addOrUpdateSensorInfo(new AddOrUpdateSensorInput({
                            // id: void 0,
                            deviceId: this.device.id,
                            gatewayId: this.belongGateWay2,
                            address: this.addressCode,
                            command: this.command,
                            agreementId: this.agreementId
                        })).pipe(finalize(() => { this.saving = false; }))
                            .subscribe(result => {
                                this.notify.success("sucess");
                                setTimeout(() => {
                                    this.goBack();
                                }, 1000)
                            })
                    } else {
                        this.notify.success("sucess");
                        setTimeout(() => {
                            this.goBack();
                        }, 1000)
                    }
                })

        } else {
            this._CounterDeviceServiceProxy.bindChildDevicesToGateway(
                new BindChildDevicesToGatewayInput({
                    gatewayId: this.belongGateWay,
                    deviceIds: [this.device.id],
                    type: type,
                    thingId: this.LayerThingId,
                    orderNumber: this.LayerOrderNumber
                })

            ).pipe(finalize(() => { this.saving = false; this.showFreezeUi = false; }))
                .subscribe(() => {
                    this.saving = true;
                    this.showFreezeUi = true;
                    this.device.abilities = JSON.stringify(this.abilities.filter(item => {
                        return item.active
                    }).map(item => {
                        return item.name
                    }));

                    this._NewDeviceServiceProxy.updateDevice(new UpdateDeviceInput(this.device))
                        .pipe(finalize(() => {
                            this.saving = false;
                            this.showFreezeUi = false;
                        })).subscribe(() => {

                            if (this.device.deviceTypeId == 18) {
                                this.saving = true;
                                this.showFreezeUi = true;
                                this._CounterDeviceServiceProxy.addOrUpdateGatewayInfo(new AddOrUpdateGatewayInput({
                                    // id: void 0,
                                    deviceId: this.device.id,
                                    agreementId: this.agreementId,
                                    gatewayType: this.gatewayType,
                                    pollingTime: this.pollingTime
                                })).pipe(finalize(() => { this.saving = false; this.showFreezeUi = false; }))
                                    .subscribe(result => {
                                        this.notify.success("sucess");
                                        setTimeout(() => {
                                            this.goBack();
                                        }, 1000)
                                    })
                            } else if (this.device.deviceTypeId == 19) {
                                this.saving = true;
                                this.showFreezeUi = true;
                                this._CounterDeviceServiceProxy.addOrUpdateSensorInfo(new AddOrUpdateSensorInput({
                                    // id: void 0,
                                    deviceId: this.device.id,
                                    gatewayId: this.belongGateWay2,
                                    address: this.addressCode,
                                    command: this.command,
                                    agreementId: this.agreementId
                                })).pipe(finalize(() => { this.saving = false; }))
                                    .subscribe(result => {
                                        this.notify.success("sucess");
                                        setTimeout(() => {
                                            this.goBack();
                                        }, 1000)
                                    })
                            } else {
                                this.notify.success("sucess");
                                setTimeout(() => {
                                    this.goBack();
                                }, 1000)
                            }

                        })
                })
        }


    }




    selectControl() {
        var controlItems = this.deviceTypeList.find(item => {
            return item.value == this.device.deviceTypeId
        }).controlItems
        if (controlItems && JSON.parse(controlItems) instanceof Array) {
            this.controlItems = JSON.parse(controlItems);
        }
        if (this.device.deviceTypeId == 20) {
            this.getDefaultAndBindSkusByPriceTagId()
        } else {
            if (this.isGranted('Pages.Softwares')) {
                this.getSoftwareByDeviceId2();
            }
            this.GetDeviceAppPodVersion();
        }
    }

    getDeviceSchedulings(event?) {
        this.pSchedule.showLoadingIndicator();
        this._DeviceAdsServiceProxy.getDeviceSchedulings(
            this.device.id,
            this.ScheduleFilterText,
            this.pSchedule.getSorting(this.dataTableSchedule),
            this.pSchedule.getMaxResultCount(this.paginatorSchedule, event),
            this.pSchedule.getSkipCount(this.paginatorSchedule, event)
        )
            .pipe(this.myFinalize(() => { this.pSchedule.hideLoadingIndicator() }))
            .subscribe(result => {
                this.pSchedule.totalRecordsCount = result.totalCount;
                this.pSchedule.records = result.items;
                this.pSchedule.hideLoadingIndicator();
            })
    }
    scheduleDetail(record) {
        var target = _.cloneDeep(record);
        target.id = target.adSchedulingId;
        this.CalendarModalComponent.show(target);
    }

    scheduleOpenOrShut(record) {
        console.log(record);
        this._DeviceAdsServiceProxy.openOrShutDeviceScheduling(
            record.adSchedulingId,
            this.device.id,
            !record.isUse
        )
            .pipe(this.myFinalize(() => { this.pSchedule.hideLoadingIndicator(); }))
            .subscribe(r => {
                this.notify.info(this.l('success'));
                this.getDeviceSchedulings();
            })
    }

    scheduleDelete(id) {
        var myId = Math.floor(Math.random() * 10000000);
        this.message.confirm(`
        <div class="form-group">
            <label class="checkbox">
                <input id="device_schedule_${myId}" type="checkbox" name="device_schedule_${myId}" ${this.informDevice ? 'checked' : ''}/>${this.l('informDevice')}
                <span></span>
            </label>
        </div>
     `, this.l('isWithdrewChosen'), (r) => {
            if (!r) return
            if ($(`#device_schedule_${myId}`).is(':checked')) {
                this.informDevice = true;
            } else {
                this.informDevice = false;
            }
            this.pSchedule.showLoadingIndicator();
            var input = new PublishAdScheduliingInput({
                deviceIds: [this.device.id],
                adSchedulingIds: [id],
                action: 'delete',
                'informDevice': this.informDevice
            })
            this._adsService.publishSchedulingToDevice(input)
                .pipe(this.myFinalize(() => { this.pSchedule.hideLoadingIndicator(); }))
                .subscribe(r => {
                    this.notify.info(this.l('success'));
                    this.getDeviceSchedulings();
                })
        }, { isHtml: true })
    }
    //显示图片加载失败的占位图
    showEmpty(e) {
        var target = $(e.target);
        target.attr("src", AppConsts.appBaseUrl + "/assets/common/images/holderimg.png")
    }

}
