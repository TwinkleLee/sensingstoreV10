import { AfterViewInit, Component, Injector, ViewEncapsulation, ViewChild, ChangeDetectorRef } from '@angular/core';
// import { AppSalesSummaryDatePeriod } from '@shared/AppEnums';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ReportServiceProxy as ReportServiceProxy2, RankInput, ChartReportInput, DevieStatusChartReportInput, DevieOnlineReportInput, GetDeviceActionsChartReportInput } from '@shared/service-proxies/service-proxies3';
import { ChartsComponent } from '@app/shared/charts/charts.component';
import { finalize } from 'rxjs/operators';
import * as moment from 'moment';
import { DateRangePickerComponent } from '@app/shared/common/timing/date-range-picker.component';
import { ReportInput, ReportServiceProxy as OrderReportServiceProxy, TopSkusInput, MembersCountInput, OrderCountAndSalesInput, BuyerCountInput, IdTypeDto } from '@shared/service-proxies/service-proxies2';
import { AppConsts } from '@shared/AppConsts';
import { OrderInfoModalComponent } from '@app/main/dashboard/order-information-modal.component';
import { MyTreeComponent } from '@app/shared/common/my-tree/my-tree.component';

import { SalesSummaryDatePeriod } from '@shared/service-proxies/service-proxies';

import { ReportServiceProxy as DeviceReportServiceProxy, GetCountReportInput } from '@shared/service-proxies/service-proxies-devicecenter';
import { ReportServiceProxy as ProductReportServiceProxy, GetCountReportInput as GetCountReportInput2 } from '@shared/service-proxies/service-proxies-product';


export class AppSalesSummaryDatePeriod {
    static Daily: any = SalesSummaryDatePeriod.Daily;
    static Weekly: any = SalesSummaryDatePeriod.Weekly;
    static Monthly: any = SalesSummaryDatePeriod.Monthly;
}
@Component({
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.less'],
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class DashboardComponent extends AppComponentBase implements AfterViewInit {

    dashboardHeaderStats: DashboardHeaderStats;
    //
    @ViewChild("skuSaleChartDiv", { static: false }) skuSaleChartDiv: ChartsComponent;
    @ViewChild("productClickChartDiv", { static: false }) productClickChartDiv: ChartsComponent;
    @ViewChild("buyerChartDiv", { static: false }) buyerChartDiv: ChartsComponent;
    @ViewChild("deviceChartDiv", { static: false }) deviceChartDiv: ChartsComponent;
    @ViewChild("actionChartDiv", { static: false }) actionChartDiv: ChartsComponent;

    @ViewChild("orderDateranger", { static: true }) orderDateranger: DateRangePickerComponent;
    @ViewChild("clickDateranger", { static: true }) clickDateranger: DateRangePickerComponent;

    @ViewChild('orderInfoModal', { static: true }) orderInfoModal: OrderInfoModalComponent;
    @ViewChild('storeTree', { static: false }) storeTree: MyTreeComponent;

    @ViewChild('highTree', { static: false }) highTree;

    customTheme = AppConsts.customTheme;

    labels: any[] = [];
    ouLocaltionLoading: boolean = false;
    ouFilter: string = "";
    buyerStart: any = moment().utc().subtract(31, 'days').startOf('day');
    buyerEnd: any = moment().utc().endOf('day');
    orderStartTime: any = moment().utc().subtract(31, 'days').startOf('day');
    orderEndTime: any = moment().utc().endOf('day');
    clickStartTime: any = moment().utc().subtract(31, 'days').startOf('day');
    clickEndTime: any = moment().utc().endOf('day');
    deviceStartTime: any = moment().utc().subtract(31, 'days').startOf('day').add((new Date().getTimezoneOffset() / 60), 'h');
    deviceEndTime: any = moment().utc().subtract(1, 'days').endOf('day').add((new Date().getTimezoneOffset() / 60), 'h');


    realStartTime: any = moment().utc().subtract(29, 'days').startOf('day');
    realEndTime: any = moment().utc().endOf('day');
    // allStartTime: any = moment().utc().subtract(29, 'days').startOf('day');
    // allEndTime: any = moment().utc().endOf('day');
    allStartTime: any;
    allEndTime: any;

    headLoading1 = false;
    headLoading2 = false;
    headLoading3 = false;
    headLoading4 = false;
    storeText = '';
    // showStore = false;
    chosenItem = [];
    storeFilter = '';
    storeList = [];


    type: string = "dd";
    dataChartLoading: boolean = false;
    buyerChartLoading: boolean = false;
    deviceChartLoading: boolean = false;
    actions: string = "click,playvideo,enter";
    searchOuId: number[] = [];
    colors: string[] = ['#007bff', '#6f42c1', '#20c997', '#f4516c', '#ffb822', '#36a3f7', '#36a3f7', '#e83e8c'];
    skuSaleTopTen;
    productClickTopTen;
    disableExcel;

    order;
    sales;
    refundData;
    memberData;

    showPermitArr: any = {};


    constructor(
        injector: Injector,
        private _DeviceReportServiceProxy: DeviceReportServiceProxy,
        private _bigDataService: ReportServiceProxy2,
        private _orderService: OrderReportServiceProxy,
        private _ProductReportServiceProxy:ProductReportServiceProxy
    ) {
        super(injector);
        this.dashboardHeaderStats = new DashboardHeaderStats();
        console.log(abp.session)
        console.log(this.appSession)
    }

    ngOnInit() {

    }
    ngOnDestroy() {

    }
    clickContainer() {
        if (this.highTree && this.highTree.showStore) {
            this.highTree.clickInput()
        }
    }

    onTreeUpdate(originalArr) {
        this.chosenItem = originalArr.map(item => {
            return new IdTypeDto({
                type: item.type,
                id: item.id
            })
        });
    }


    refreshAll() {

        if (this.realStartTime) {
            this.allStartTime = moment(this.realStartTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h')
        }
        if (this.realEndTime) {
            this.allEndTime = moment(this.realEndTime.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's')
        }

        setTimeout(() => {
            this.showPermitArr = {
                Order: this.isGranted('Pages.Tenant.Dashboard.Dashboard.Order'),
                Sales: this.isGranted('Pages.Tenant.Dashboard.Dashboard.Sales'),
                Member: this.isGranted('Pages.Tenant.Dashboard.Dashboard.MemberCount')
            }
            this.getDashboardStatisticsData(AppSalesSummaryDatePeriod.Daily);
            if (this.showPermitArr.Order || this.showPermitArr.Sales) {
                this.getOrderCountAndSales();
            }
            if (this.showPermitArr.Order) {
                this.getRefundCount()
            }
            if (this.showPermitArr.Member) {
                this.getMembersCount()
            }
            if (this.isGranted('Pages.Tenant.Dashboard.Dashboard.BuyerCount')) {
                this.getBuyerCount();
            }
            this.getDeviceOnline();
        })

    }

    showOrderInformation() {
        this.orderInfoModal.show(this.chosenItem)
    }

    getBuyerCount() {
        this.buyerChartLoading = true;
        var obj = new BuyerCountInput({
            "startTime": this.allStartTime,
            "endTime": this.allEndTime,
            'ouOrStoreList': this.chosenItem
        })
        this._orderService.buyerCount(obj).pipe(finalize(() => {
            this.buyerChartLoading = false;
            if (!this.buyerChartDiv.dataSets || this.buyerChartDiv.dataSets.length == 0) {
                var data = [{
                    'title': this.l('buyerCount'),
                    'chartItems': [{
                        "date": moment(new Date()).format("yyyy/MM/DD").toString(),
                        "value": 0
                    }]
                }];

                this.buyerChartDiv.draw(data);
            }
        })).subscribe((r) => {
            var arr = JSON.parse(r).map(item => {
                var newItem = {
                    value: item.Total,
                    date: item.OrderDateTime.substr(0, 10).replace('-', '/').replace('-', '/')
                }
                return newItem
            })
            var data = [{
                'title': this.l('buyerCount'),
                'chartItems': arr
            }];
            this.buyerChartDiv.draw(data, undefined);
        })
    }



    getDeviceOnline() {
        this.deviceChartLoading = true;

        this._bigDataService.getDeviceRuntimeChartReportPost(new DevieStatusChartReportInput({
            deviceId: undefined,
            startTime: this.allStartTime,
            endTime: this.allEndTime,
            ouOrStoreList: this.chosenItem
        })).pipe(finalize(() => {
            this.deviceChartLoading = false;
        })).subscribe((result) => {
            this.deviceChartDiv.draw(result, undefined);
        })

        this._bigDataService.getDeviceActionsChartReport(new GetDeviceActionsChartReportInput({
            deviceId: undefined,
            startTime: this.allStartTime,
            endTime: this.allEndTime,
            ouOrStoreList: this.chosenItem
        })).pipe(finalize(() => {
            this.deviceChartLoading = false;
        })).subscribe((result) => {
            this.actionChartDiv.draw(result, undefined);
        })
    }


    getDeviceExcel() {


        if (this.disableExcel) return

        this.disableExcel = true;

        var du: any = moment.duration(this.allEndTime - this.allStartTime, 'ms');
        if (du._data.days > 1) {
            this._bigDataService.getBigDataToExcelByTask({
                startTime: this.allStartTime,
                endTime: this.allEndTime,
                organizationUnitIds: this.chosenItem.map(item => {
                    return item.id
                })
            } as DevieOnlineReportInput).pipe(finalize(() => {
                this.disableExcel = false;
            })).subscribe(r => {
                this.message.success(this.l(r))
            })
        } else {
            this._bigDataService.getBigDataToExcel(
                // this._bigDataService.getDeviceOnlineCsv(
                {
                    startTime: this.allStartTime,
                    endTime: this.allEndTime,
                    organizationUnitIds: this.chosenItem.map(item => {
                        return item.id
                    })
                } as DevieOnlineReportInput
            ).pipe(finalize(() => {
                this.disableExcel = false;
            })).subscribe(r => {
                var link = document.getElementById('aaa');
                $(link).attr("href", r);
                link.click();
                setTimeout(() => {
                    this.disableExcel = false;
                }, 2500)
            })
        }

    }
    //显示图片加载失败的占位图
    showEmpty(e) {
        var target = $(e.target);
        target.attr("src", AppConsts.appBaseUrl + "/assets/common/images/holderimg.png")
    }
    get getCol() {
        var count = Math.min(this.dashboardHeaderStats.records.length, 6);
        var col = (100 / (count || 1)) + '%';
        var classObj = {};
        classObj['width'] = col;
        // classObj['min-width'] = '250px';
        classObj['min-width'] = '20%';
        return classObj;
    }

    getDashboardStatisticsData(datePeriod): void {
        this.headLoading1 = true;
        var newList = [];

        Promise.all([
            // new Promise((resolve, reject) => {
            //     if (this.isGranted("Pages.Tenant.Dashboard.Dashboard.Device")) {
            //         this._DeviceReportServiceProxy.getDevicesCount()
            //             .pipe(finalize(() => {
            //                 this.checkHeadLoad();
            //                 resolve(null);
            //             })).subscribe((result) => {
            //                 newList.push({
            //                     name: "device",
            //                     totalProfitCounter: result
            //                 })
            //             })
            //     } else {
            //         resolve(null);
            //     }
            // }),
            // new Promise((resolve, reject) => {
            //     if (this.isGranted("Pages.Tenant.Dashboard.Dashboard.Store")) {
            //         this._DeviceReportServiceProxy.getStoresCount()
            //             .pipe(finalize(() => {
            //                 this.checkHeadLoad();
            //                 resolve(null);
            //             })).subscribe((result) => {
            //                 newList.push({
            //                     name: "store",
            //                     totalProfitCounter: result
            //                 })
            //             })
            //     } else {
            //         resolve(null);
            //     }
            // }),
            // new Promise((resolve, reject) => {
            //     if (this.isGranted("Pages.Tenant.Dashboard.Dashboard.Device")) {

            //         this._DeviceReportServiceProxy.getOnlineDevicesCount()
            //             .pipe(finalize(() => {
            //                 this.checkHeadLoad();
            //                 resolve(null);
            //             })).subscribe((result) => {
            //                 newList.push({
            //                     name: "specialDevice",
            //                     totalProfitCounter: result
            //                 })
            //             })
            //     } else {
            //         resolve(null);
            //     }
            // }),
            new Promise((resolve, reject) => {
                this._DeviceReportServiceProxy.getCountReport(new GetCountReportInput({
                    startTime: this.allStartTime,
                    endTime: this.allEndTime,//.format()
                    storeOrOuList: this.chosenItem,
                    filter: ""
                })).pipe(finalize(() => {
                    this.checkHeadLoad();
                    resolve(null);
                })).subscribe((result) => {
                    console.log("result", result)
                    newList.push(...result)
                })

            }),
            new Promise((resolve, reject) => {
                this._ProductReportServiceProxy.getCountReportPost(new GetCountReportInput({
                    startTime: this.allStartTime,
                    endTime: this.allEndTime,//.format()
                    storeOrOuList: this.chosenItem,
                    filter: ""
                })).pipe(finalize(() => {
                    this.checkHeadLoad();
                    resolve(null);
                })).subscribe((result) => {
                    console.log("result", result)
                    newList.push(...result)
                })

            })
        ])
            .then(() => {
                console.log("newList", newList);
                var newNewList = newList.map(item => {
                    var newItem = {
                        name: item.name,
                        totalProfitCounter: item.count
                    }
                    return newItem
                })
                this.dashboardHeaderStats.init(newNewList);
            })



        //TODO 拆分接口
        //店铺总数
        // this._reportService.getCountReportPost(new GetCountReportInput({
        //     startTime: this.allStartTime,
        //     endTime: this.allEndTime,
        //     storeOrOuList: this.chosenItem
        // })).pipe(finalize(() => {
        //     this.headLoading1 = false;
        //     this.checkHeadLoad()
        // })).subscribe((result) => {
        //     var newList = result.map(item => {

        //         var newItem = {
        //             name: item.name,
        //             totalProfitCounter: item.id.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        //         }
        //         return newItem
        //     })

        //     var newNewList = newList.filter(item => {
        //         return (item.name == "store" && this.isGranted("Pages.Tenant.Dashboard.Dashboard.Store"))
        //             || (item.name == "product" && this.isGranted("Pages.Tenant.Dashboard.Dashboard.Product"))
        //             || (item.name == "ads" && this.isGranted("Pages.Tenant.Dashboard.Dashboard.Ad"))
        //             || (item.name == "device" && this.isGranted("Pages.Tenant.Dashboard.Dashboard.Device"))
        //             || (item.name == "software" && this.isGranted("Pages.Tenant.Dashboard.Dashboard.Software"))
        //             || (item.name == "coupon" && this.isGranted("Pages.Tenant.Dashboard.Dashboard.Coupon"))
        //             || (item.name == "specialDevice" && this.isGranted("Pages.Tenant.Dashboard.Dashboard.Device"))
        //     })
        //     this.dashboardHeaderStats.init(newNewList);
        // })
    }

    checkHeadLoad() {
        if (!this.headLoading1 && !this.headLoading2 && !this.headLoading3 && !this.headLoading4) {
            if (this.showPermitArr.Order) {
                if (this.order) {
                    this.dashboardHeaderStats.records.push(this.order);
                }
                if (this.refundData) {
                    this.dashboardHeaderStats.records.push(this.refundData);
                }
            }
            if (this.showPermitArr.Sales && this.sales) {
                this.dashboardHeaderStats.records.push(this.sales);
            }
            if (this.showPermitArr.Member && this.memberData) {
                this.dashboardHeaderStats.records.push(this.memberData);
            }
        }
    }

    //获取订单总销售额
    getOrderCountAndSales() {
        this.headLoading2 = true;
        this._orderService.orderCountAndSales(new OrderCountAndSalesInput({
            'ouOrStoreList': this.chosenItem,
            'startTime': this.allStartTime,
            'endTime': this.allEndTime
        })).pipe(finalize(() => {
            this.headLoading2 = false;
            this.checkHeadLoad()
        })).subscribe((result) => {
            var res = JSON.parse(result);
            if (<any>res instanceof Array && res.length > 0) {
                var order = {
                    'id': res[0].OrderCount.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                    'name': 'order',
                    'totalProfitCounter': res[0].OrderCount.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),

                }, sales = {
                    'id': res[0].TotalSales.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                    'name': 'TotalSales',
                    'totalProfitCounter': res[0].TotalSales.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                    'Change': res[0].Change ? res[0].Change.toFixed(0) * 100 : null
                };
                this.order = order;
                this.sales = sales;
            }
        })
    }


    getRefundCount() {
        this.headLoading3 = true;
        this._orderService.refundCount(new ReportInput({
            'endTime': this.allEndTime,
            'startTime': this.allStartTime,
            'ouOrStoreList': this.chosenItem
        })).pipe(finalize(() => {
            this.headLoading3 = false;
            this.checkHeadLoad()
        })).subscribe(result => {
            var res = JSON.parse(result);
            if (<any>res instanceof Array && res.length > 0) {
                let refundCount = res[0].Total;
                this.refundData = {
                    'id': refundCount.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                    'name': 'refundOrder',
                    'totalProfitCounter': refundCount.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                }
            }
        })
    }

    getMembersCount() {
        this.headLoading4 = true;
        this._orderService.membersCount(new MembersCountInput({
            'endTime': this.allEndTime,
            'startTime': this.allStartTime,
            'ouOrStoreList': this.chosenItem
        })).pipe(finalize(() => {
            this.headLoading4 = false;
            this.checkHeadLoad()
        })).subscribe((result) => {
            this.headLoading4 = false;
            var res = JSON.parse(result);
            if (<any>res instanceof Array && res.length > 0) {
                let memberCount = res[0].Total;
                this.memberData = {
                    'id': memberCount.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                    'name': 'Membership',
                    'totalProfitCounter': memberCount.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                    'Change': res[0].Change ? res[0].Change.toFixed(0) * 100 : null
                }
            }
        })
    }


    ngAfterViewInit(): void {
        this.refreshAll();
    }


}


abstract class DashboardChartBase {
    loading = true;

    showLoading() {
        setTimeout(() => { this.loading = true; });
    }

    hideLoading() {
        setTimeout(() => { this.loading = false; });
    }
}

class DashboardHeaderStats extends DashboardChartBase {
    records: any[] = [];
    // totalProfit = 0; totalProfitCounter = 0;
    // newFeedbacks = 0; newFeedbacksCounter = 0;
    // newOrders = 0; newOrdersCounter = 0;
    // newUsers = 0; newUsersCounter = 0;

    // totalProfitChange = 76; totalProfitChangeCounter = 0;
    // newFeedbacksChange = 85; newFeedbacksChangeCounter = 0;
    // newOrdersChange = 45; newOrdersChangeCounter = 0;
    // newUsersChange = 57; newUsersChangeCounter = 0;

    init(result) {
        console.log("DashboardChartBase", result)
        this.records = result || [];
        this.hideLoading();
    }
}

