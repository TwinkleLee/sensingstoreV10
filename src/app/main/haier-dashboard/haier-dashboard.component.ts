import { AfterViewInit, Component, Injector, ViewEncapsulation, ViewChild, ChangeDetectorRef } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';
import * as moment from 'moment';
import { IdTypeDto } from '@shared/service-proxies/service-proxies2';
import { ReportServiceProxy as ReportServiceProxy2, RankInput, ChartReportInput, DevieStatusChartReportInput } from '@shared/service-proxies/service-proxies3';
import { AppConsts } from '@shared/AppConsts';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';

@Component({
    templateUrl: './haier-dashboard.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()],
    styles: [`.nav-tabs {
        margin: 0 !important;
   }`
    ]
})
export class HaierDashboardComponent extends AppComponentBase {
    @ViewChild('highTree', { static: false }) highTree;
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    productClickLoading = false;
    SkuSaleLoading = false;
    skuSaleTopTen = [];
    productClickTopTen = [];

    realStartTime: any = moment().utc().subtract(29, 'days').startOf('day');
    realEndTime: any = moment().utc().endOf('day');
    allStartTime: any;
    allEndTime: any;
    exportLoading = false;
    chosenItem = [];
    // filterText = '';
    constructor(
        injector: Injector,
        private _bigDataService: ReportServiceProxy2,
    ) {
        super(injector);
        this.refreshAll();
    }
    clickContainer() {
        if (this.highTree && this.highTree.showStore) {
            this.highTree.clickInput()
        }
    }
    getSkuSaleTopTen() {
        var input = new RankInput({
            "startTime": this.allStartTime,
            "endTime": this.allEndTime,
            "top": 10,
            "action": "try",
            "ouOrStoreList": this.chosenItem,
            "category": ['product', 'sku'],
            "brandId": void 0
        });
        this.productClickLoading = true;
        this._bigDataService.topItems(input).pipe(finalize(() => {
            this.productClickLoading = false;
        })).subscribe(r => {
            if (r[0]) {
                this.skuSaleTopTen = r[0].chartItems
            }
        })
    }


    goExport() {
        this.exportLoading = true;

        this._bigDataService.getPickAndRfidAndOrderReportToExcel(
            this.allStartTime,
            this.allEndTime,
            this.primengTableHelper.getSorting(this.dataTable),
            1,
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


    getProductClickTopTen() {

        var input = new RankInput({
            "startTime": this.allStartTime,
            "endTime": this.allEndTime,
            "top": 10,
            "action": "pickup",
            "ouOrStoreList": this.chosenItem,
            "category": ['product', 'sku'],
            "brandId": void 0
        });
        this.productClickLoading = true;
        this._bigDataService.topItems(input).pipe(finalize(() => {
            this.productClickLoading = false;
        })).subscribe(r => {
            if (r[0]) {
                this.productClickTopTen = r[0].chartItems
            }
        })
    }

    refreshAll() {

        if (this.realStartTime) {
            this.allStartTime = moment(this.realStartTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h')
        }
        if (this.realEndTime) {
            this.allEndTime = moment(this.realEndTime.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's')
        }

        setTimeout(() => {
            this.getSkuSaleTopTen();
            this.getProductClickTopTen();
            this.getList();
        })

    }

    //显示图片加载失败的占位图
    showEmpty(e) {
        var target = $(e.target);
        target.attr("src", AppConsts.appBaseUrl + "/assets/common/images/holderimg.png")
    }

    onTreeUpdate(originalArr) {
        this.chosenItem = originalArr.map(item => {
            return new IdTypeDto({
                type: item.type,
                id: item.id
            })
        });
    }












    //tab


    //获取列表
    getList(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();
        this._bigDataService.getPickAndRfidAndOrderReport(
            this.allStartTime,
            this.allEndTime,
            this.primengTableHelper.getSorting(this.dataTable),
            this.primengTableHelper.getMaxResultCount(this.paginator, event),
            this.primengTableHelper.getSkipCount(this.paginator, event)
        )
            .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
            .subscribe(result => {
                this.primengTableHelper.totalRecordsCount = result.totalCount;
                this.primengTableHelper.records = result.items;
                // this.primengTableHelper.hideLoadingIndicator();
            })
    }

    //转换序列
    transIndex(i, event?: LazyLoadEvent) {
        return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
    }




}




