import { AfterViewInit, Component, Injector, ViewEncapsulation, ViewChild, ChangeDetectorRef } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { StoreServiceProxy, OrganizationUnitServiceProxy, PositionDto } from '@shared/service-proxies/service-proxies';
import { ReportServiceProxy as ReportServiceProxy2, ChartReportInput } from '@shared/service-proxies/service-proxies3';
import { MyMapComponent } from '@app/shared/common/map/my-map.component';
import { ChartsComponent } from '@app/shared/charts/charts.component';
import { finalize } from 'rxjs/operators';
import * as moment from 'moment';
import { DateRangePickerComponent } from '@app/shared/common/timing/date-range-picker.component';


@Component({
    templateUrl: './store-info.component.html',
    styleUrls: ['./store-info.component.less'],
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class StoreInfoComponent extends AppComponentBase implements AfterViewInit {

    @ViewChild("ouLocaltion", { static: false }) ouLocaltion: MyMapComponent;
    @ViewChild("dataChartDiv", { static: false }) dataChart: ChartsComponent;
    @ViewChild("dateranger", { static: true }) dateranger: DateRangePickerComponent;


    positions: PositionDto[] = [];
    labels: any[] = [];
    ouLocaltionLoading: boolean = false;
    ouFilter: string = "";
    startTime: any = moment().utc().subtract(7, 'days').startOf('day');
    endTime: any = moment().utc().endOf('day');
    type: string = "dd";
    dataChartLoading: boolean = false;
    actions: string = "click,playvideo,enter,Rfid,pickup";
    searchOuId: number[] = [];

    MapNgIf = true;
    constructor(
        injector: Injector,
        private _bigDataService: ReportServiceProxy2,
        private _StoreServiceProxy: StoreServiceProxy
    ) {
        super(injector);
        this.getOuLocaltion();
        this.getChartData();
        console.log(abp.session)
        console.log(this.appSession)
    }



    //全国ou分布
    getOuLocaltion() {

        // if (this.ouFilter == "苏") {
        //     this.ouLocaltion.map.clearOverlays();
        //     return;
        // }
        // if (this.ouFilter == "M") {
        //     console.log(this.ouLocaltion.markers.length);
        //     return;
        // }
        this.MapNgIf = false;
        setTimeout(() => {

            this.MapNgIf = true;
            this.ouLocaltionLoading = true;
            this._StoreServiceProxy.getStorePosition(this.ouFilter, undefined, 1000, 0).pipe(finalize(() => {
                // if (this.ouLocaltionLoading && this.positions.length == 0) {
                //     setTimeout(() => {
                //         this.ouLocaltion.render("100%", "600px");
                //         if (!this.ouFilter) {
                //             this.searchOuId = [];
                //             this.getChartData();
                //         }
                //         this.ouLocaltionLoading = false;
                //     })
                // }
            })).subscribe((result) => {
                this.positions = result.items.map((record) => {
                    return record.position || new PositionDto();
                }) || [];
                this.labels = result.items.map((record) => {
                    return {
                        'name': record.displayName,
                        'id': record.id,
                        'outerId': record.outerId
                    };
                }) || [];
                this.searchOuId = this.labels.map((position) => {
                    return position.id;
                }) || [];
                setTimeout(() => {
                    this.ouLocaltion.render("100%", "600px");
                    // this.getChartData();
                    this.ouLocaltionLoading = false;

                    // this.myBaidu();
                    // this.ouLocaltionLoading = false;

                })
            })

        })

    }
    changeViewType(type) {
        this.type = type;
        if (type == "dd") {
            this.startTime = moment().utc().subtract(30, 'days').startOf('day');
            this.endTime = moment().utc().endOf('day');
        } else if (type == "mm") {
            this.startTime = moment().utc().subtract(12, 'month').startOf('day');
            this.endTime = moment().utc().endOf('day');
        } else if (type == "hh") {
            this.startTime = moment().utc().startOf('day');
            this.endTime = moment().utc().endOf('day');
        }
        setTimeout(() => {
            this.dateranger.refresh();
        }, 0);
        this.getChartData();
    }

    //
    switchToOuView(e) {
        this.searchOuId = [e.data.id];
        this.getChartData();
    }

    getChartData() {
        this.dataChartLoading = true;
        var input = new ChartReportInput({
            'deviceId': undefined,
            'startTime': this.startTime,
            'endTime': this.endTime,
            'type': this.type,
            'actions': this.actions,
            'categories': null,
            'storeIds': this.searchOuId
        });
        this._bigDataService.getBehaviorChartReport(input).pipe(finalize(() => {
            this.dataChartLoading = false;
            if (!this.dataChart.dataSets || this.dataChart.dataSets.length == 0) {
                var data = [{
                    'title': this.l('deviceProductClick'),
                    'chartItems': [{
                        "date": moment(new Date()).format("yyyy/MM/DD").toString(),
                        "value": 0
                    }]
                }];
                this.dataChart.draw(data);
            }
        })).subscribe((result) => {
            this.dataChartLoading = false;
            this.dataChart.draw(result, this.type == "hh" ? moment() : undefined);
            // this.dataChart.draw([{
            //     chartItems: [
            //         { date: '1', value: '20', thingId: 0, category: 'aaa' },
            //         { date: '2', value: '40', thingId: 0, category: 'aaa' },
            //         { date: '3', value: '50', thingId: 0, category: 'aaa' },
            //     ],
            //     title: 'aaa'
            // }], undefined);
        })
    }

    ngAfterViewInit(): void {

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



