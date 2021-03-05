import { AfterViewInit, Component, Injector, ViewEncapsulation, ViewChild, ChangeDetectorRef } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';
import * as moment from 'moment';
import { ReportInput, ReportServiceProxy as OrderReportServiceProxy, TopSkusInput, MembersCountInput, OrderCountAndSalesInput, BuyerCountInput, IdTypeDto } from '@shared/service-proxies/service-proxies2';
import { ReportServiceProxy as ReportServiceProxy2, RankInput, ChartReportInput, DevieStatusChartReportInput } from '@shared/service-proxies/service-proxies3';
import { AppConsts } from '@shared/AppConsts';
import { BrandServiceProxy, OnlineOrOffLineBrandInput } from '@shared/service-proxies/service-proxies';


@Component({
    templateUrl: './product-rank.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class ProductRankComponent extends AppComponentBase {
    @ViewChild('highTree',{static:false}) highTree;

    productClickLoading = false;
    SkuSaleLoading = false;
    skuSaleTopTen = [];
    productClickTopTen = [];

    realStartTime: any = moment().utc().subtract(29, 'days').startOf('day');
    realEndTime: any = moment().utc().endOf('day');
    allStartTime: any;
    allEndTime: any;

    chosenItem = [];
    BrandId: any = '';
    BrandList = [];

    constructor(
        injector: Injector,
        private _orderService: OrderReportServiceProxy,
        private _bigDataService: ReportServiceProxy2,
        private _brandService: BrandServiceProxy,

    ) {
        super(injector);
        this._brandService.gets(
            undefined,
            undefined,
            undefined,
            undefined,
            999,
            0
        ).subscribe(r => {
            this.BrandList = r.items;
        })
        this.refreshAll();
    }
    clickContainer() {
        if (this.highTree && this.highTree.showStore) {
            this.highTree.clickInput()
        }
    }
    getSkuSaleTopTen() {
        var input = new TopSkusInput({
            'endTime': this.allEndTime,
            'startTime': this.allStartTime,
            'top': 10,
            'ouOrStoreList': this.chosenItem,
            'brandId': this.BrandId
        });
        this.SkuSaleLoading = true;
        this._orderService.topSkus(input).pipe(finalize(() => {
            this.SkuSaleLoading = false;
        })).subscribe(r => {
            this.skuSaleTopTen = r;
        })
    }


    getProductClickTopTen() {

        var input = new RankInput({
            "startTime": this.allStartTime,
            "endTime": this.allEndTime,
            "top": 10,
            "action": "click",
            "ouOrStoreList": this.chosenItem,
            "category": ['product', 'sku'],
            'brandId': this.BrandId

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
}




