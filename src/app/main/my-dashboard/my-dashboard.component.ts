import { AfterViewInit, Component, Injector, ViewEncapsulation, ViewChild, ChangeDetectorRef } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ReportServiceProxy } from '@shared/service-proxies/service-proxies-cargo';
import { ChartsComponent } from '@app/shared/charts/charts.component';
import { finalize } from 'rxjs/operators';
import * as moment from 'moment';
import { AppConsts } from '@shared/AppConsts';
import { DateRangePickerComponent } from '@app/shared/common/timing/date-range-picker.component';
import { CounterAnalysisServiceProxy } from '@shared/service-proxies/service-proxies-cargo';
import { DeviceHeatmapDataServiceProxy } from '@shared/service-proxies/service-proxies3';

import { DeviceServiceProxy as NewDeviceServiceProxy} from '@shared/service-proxies/service-proxies-devicecenter';


@Component({
    templateUrl: './my-dashboard.component.html',
    styleUrls: ['./my-dashboard.component.css'],
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class MyDashboardComponent extends AppComponentBase implements AfterViewInit {

    @ViewChild("deviceChartDiv", { static: false }) deviceChartDiv: ChartsComponent;
    // @ViewChild('highTree') highTree;
    @ViewChild("clickDateranger", { static: false }) dateranger: DateRangePickerComponent;



    realStartTime: any = moment().utc().subtract(365, 'days').startOf('day');
    realEndTime: any = moment().utc().endOf('day');

    // chosenItem = [];
    // storeList = [];
    dashboardList = [];
    deviceList = [];

    nowDashboardId: any = "";
    nowDashboard;

    customTheme=AppConsts.customTheme;

    nowDeviceId: any = "";
    nowDevice;

    exportLoading = false;
    deviceChartLoading = false

    dateType = 'mm';

    chartType;
    showChart = false;

    zifengData: any = null;

    constructor(
        injector: Injector,
        private _ReportServiceProxy: ReportServiceProxy,
        private _NewDeviceServiceProxy: NewDeviceServiceProxy,
        private _CounterAnalysisServiceProxy: CounterAnalysisServiceProxy,
        private _DeviceHeatmapDataServiceProxy: DeviceHeatmapDataServiceProxy

    ) {
        super(injector);
        console.log(abp.session)
        console.log(this.appSession)
    }

    ngOnInit() {
        this._ReportServiceProxy.getReports(
            undefined,
            undefined,
            undefined,
            undefined,
            999,
            0
        ).subscribe(r => {
            console.log(r);
            this.dashboardList = r.items;
            // if (this.dashboardList.length) {
            //     this.nowDashboardId = this.dashboardList[0].id;
            //     this.changeDashboard();
            // }

        })
        this._NewDeviceServiceProxy.getDevices(
            [],
            undefined,
            undefined,
            undefined,
            undefined,
            [4],
            undefined,
            undefined,
            undefined,
            999,
            0
        ).subscribe(result => {
            console.log(result)
            this.deviceList = result.items;
            if (this.deviceList.length) {
                this.nowDeviceId = this.deviceList[0].id;
                this.changeDevice();
            }
        })



    }
    ngOnDestroy() {

    }
    changeViewType(type) {
        this.dateType = type;
        if (type == "dd") {
            this.realStartTime = moment().utc().subtract(30, 'days').startOf('day');
            this.realEndTime = moment().utc().endOf('day');
        } else if (type == "mm") {
            this.realStartTime = moment().utc().subtract(12, 'month').startOf('day');
            this.realEndTime = moment().utc().endOf('day');
        } else if (type == "hh") {
            this.realStartTime = moment().utc().startOf('day');
            this.realEndTime = moment().utc().endOf('day');
        }
        setTimeout(() => {
            this.dateranger.refresh();
        }, 0);
        this.doSearch();
    }
    doSearch() {
        console.log('this.nowDashboardId', this.nowDashboardId, 'this.nowDeviceId', this.nowDeviceId)
        if (this.nowDashboardId) {
            this.getData();
        } else if (this.nowDeviceId) {
            this.getData2();
        }
    }


    goExport() {
        console.log('this.nowDashboardId', this.nowDashboardId, 'this.nowDeviceId', this.nowDeviceId)
        this.exportLoading = true;

        if (this.nowDashboardId) {
            this.exportData();
        } else if (this.nowDeviceId) {
            this.exportData2();
        }
    }

    changeDashboard() {
        this.nowDeviceId = "";
        this.nowDevice = undefined;

        if (!this.nowDashboardId) return

        this.nowDashboard = this.dashboardList.filter(item => {
            return item.id == this.nowDashboardId
        })[0]
        // console.log(this.nowDashboard);
        // console.log(this.nowDashboard.reportTemplate.reportType)//0 Line 2 Column
        if (this.nowDashboard.reportTemplate.reportType == 0) {
            this.chartType = "Line";
        } else if (this.nowDashboard.reportTemplate.reportType == 2) {
            this.chartType = "Column";
        }
        this.getData();
    }
    changeDevice() {
        this.nowDashboardId = "";
        this.nowDashboard = undefined;

        if (!this.nowDeviceId) return

        this.nowDevice = this.deviceList.filter(item => {
            return item.id == this.nowDeviceId
        })[0]
        this.chartType = "Line";
        this.getData2();
    }

    clickContainer() {
        // if (this.highTree && this.highTree.showStore) {
        //     this.highTree.clickInput()
        // }
    }

    // onTreeUpdate(originalArr) {
    //     this.chosenItem = originalArr.map(item => {
    //         return {
    //             type: item.type,
    //             id: item.id
    //         }
    //     });
    // }



    getData() {
        $('#heatmap').html("");
        $('#heatmap').css({ width: 0, height: 0 })
        $("#heatmap").css("background", "none");

        this.showChart = false;
        if (this.realStartTime) {
            var StartTime = moment(this.realStartTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h')
        }
        if (this.realEndTime) {
            var EndTime = moment(this.realEndTime.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's')
        }
        this.deviceChartLoading = true;

        this._ReportServiceProxy.getReport(
            StartTime,
            EndTime,
            this.dateType,
            this.nowDashboardId
        ).pipe(finalize(() => {
            this.deviceChartLoading = false;
        })).subscribe(r => {
            console.log(r)
            this.showChart = true;
            setTimeout(() => {
                this.deviceChartDiv.draw(r, this.dateType == "hh" ? StartTime : undefined);
            })
        })
    }


    getData2() {
        this.showChart = false;
        if (this.realStartTime) {
            var StartTime = moment(this.realStartTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h')
        }
        if (this.realEndTime) {
            var EndTime = moment(this.realEndTime.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's')
        }
        this.makeHeatMap(StartTime, EndTime);
        this.deviceChartLoading = true;
        this._CounterAnalysisServiceProxy.getCountByDeviceIds(
            StartTime,
            EndTime,
            this.dateType,
            undefined,
            [this.nowDeviceId]
        ).pipe(finalize(() => {
            this.deviceChartLoading = false;
        })).subscribe((result) => {
            this.showChart = true;
            setTimeout(() => {
                this.deviceChartDiv.draw(result, this.dateType == "hh" ? StartTime : undefined);
            })
        })

        // if (abp.session.tenantId == 5129) {
            this._CounterAnalysisServiceProxy.getDigitCountByDeviceIds(
                StartTime,
                EndTime,
                this.dateType,
                undefined,
                [this.nowDeviceId]
            ).subscribe((result) => {
                try {
                    var today = result[0].chartItems[0].value;
                    var yesterday = result[1].chartItems[0].value;
                    var percentTip = "", color = "";
                    if (yesterday) {
                        if (today > yesterday) {
                            percentTip = `同比上升${(100 * (today / yesterday - 1)).toFixed(2)}%`
                            color = "Green";
                        } else if (today < yesterday) {
                            percentTip = `同比下降${(100 * (1 - today / yesterday)).toFixed(2)}%`
                            color = "Crimson";
                        }
                    }
                    this.zifengData = {
                        today,
                        yesterday,
                        percentTip,
                        color
                    }
                } catch (error) {
                    console.log("try catch err", error);
                    this.zifengData = null;
                }

            })
        // }

    }

    zifengDownLoad() {
        if (this.realStartTime) {
            var StartTime = moment(this.realStartTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h')
        }
        if (this.realEndTime) {
            var EndTime = moment(this.realEndTime.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's')
        }
        this._CounterAnalysisServiceProxy.getDigitCountToExcel(
            StartTime,
            EndTime,
            this.dateType,
            undefined,
            [this.nowDeviceId]
        ).subscribe((result) => {
            var href = result;
            var link = document.getElementById('aaa');
            $(link).attr("href", href);
            link.click();
        })

    }

    exportData() {

        if (this.realStartTime) {
            var StartTime = moment(this.realStartTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h')
        }
        if (this.realEndTime) {
            var EndTime = moment(this.realEndTime.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's')
        }

        this._ReportServiceProxy.getReportToExcel(
            StartTime,
            EndTime,
            this.dateType,
            this.nowDashboardId
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


    exportData2() {
        if (this.realStartTime) {
            var StartTime = moment(this.realStartTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h')
        }
        if (this.realEndTime) {
            var EndTime = moment(this.realEndTime.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's')
        }
        this.makeHeatMap(StartTime, EndTime);
        this._CounterAnalysisServiceProxy.getCountToExcel(
            StartTime,
            EndTime,
            this.dateType,
            undefined,
            [this.nowDeviceId]
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
    makeHeatMap(startTime, endTime) {//h337
        this._DeviceHeatmapDataServiceProxy.getDeviceHeatmapData(
            startTime,
            endTime,
            this.nowDeviceId
        ).subscribe(r => {
            var data = r;
            if (!data.length) return;
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



    //显示图片加载失败的占位图
    showEmpty(e) {
        var target = $(e.target);
        target.attr("src", AppConsts.appBaseUrl + "/assets/common/images/holderimg.png")
    }


    ngAfterViewInit(): void {
        // this.refreshAll();
    }


}




