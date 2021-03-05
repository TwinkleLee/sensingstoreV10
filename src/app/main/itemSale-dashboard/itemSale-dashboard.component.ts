import { AfterViewInit, Component, Injector, ViewEncapsulation, ViewChild, ChangeDetectorRef } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';
import * as moment from 'moment';
import { OrganizationUnitServiceProxy, BrandServiceProxy } from '@shared/service-proxies/service-proxies';
import { CommonServiceProxy, OrderServiceProxy, GetSaleItemDetailInput, ReportServiceProxy } from '@shared/service-proxies/service-proxies2';
import { AppConsts } from '@shared/AppConsts';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';


@Component({
    templateUrl: './itemSale-dashboard.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class ItemSaleDashboardComponent extends AppComponentBase {
    @ViewChild('highTree',{static:false}) highTree;
    @ViewChild('highTree2',{static:false}) highTree2;
    @ViewChild('highTree3',{static:false}) highTree3;
    @ViewChild('highTreeFirst',{static:false}) highTreeFirst;
    @ViewChild('highTreeSecond',{static:false}) highTreeSecond;
    @ViewChild('highTreeActivity',{static:false}) highTreeActivity;
    @ViewChild('highTreeBrand',{static:false}) highTreeBrand;
    @ViewChild('highTreeProm',{static:false}) highTreeProm;
    @ViewChild('dataTable',{static:true}) dataTable: Table;
    @ViewChild('paginator',{static:true}) paginator: Paginator;

    productClickLoading = false;
    SkuSaleLoading = false;
    skuSaleTopTen = [];
    productClickTopTen = [];

    realStartTime: any = moment().utc().subtract(29, 'days').startOf('day');
    realEndTime: any = moment().utc().endOf('day');
    allStartTime: any;
    allEndTime: any;


    ouTree = []; chosenItem = [];
    ouTree2 = []; chosenItem2 = []; showTree2 = true;
    ouTree3 = []; chosenItem3 = []; showTree3 = true;

    originTree = [];
    firstTree = []; chosenFirst = [];
    secondTree = []; chosenSecond = []; showTreeSecond = true;

    orderActivityTags = []; activityTag = [];
    brandList = []; brand = [];
    promList = []; prom = [];


    groupByStore = "";
    groupByProduct = "";
    groupByMember = "";
    jancode = "";
    exportLoading = false;

    constructor(
        injector: Injector,
        private _OrganizationUnitServiceProxy: OrganizationUnitServiceProxy,
        private _CommonServiceProxy: CommonServiceProxy,
        private _BrandServiceProxy: BrandServiceProxy,
        private _OrderServiceProxy: OrderServiceProxy,
        private _ReportServiceProxy: ReportServiceProxy
    ) {
        super(injector);
        this._CommonServiceProxy.orderActivityTags().subscribe(r => {
            this.orderActivityTags = r.map(item => {
                return {
                    name: item.name,
                    id: item.value
                }
            });
        })
        this._CommonServiceProxy.orderMemberDiscounts().subscribe(r => {
            this.promList = r.map(item => {
                return {
                    name: item.name,
                    id: item.value
                }
            });
        })
        this._OrganizationUnitServiceProxy.getDaquList().subscribe(r => {
            this.ouTree = r;
        })
        this._CommonServiceProxy.getOrderCategorys().subscribe(r => {
            console.log(r);
            this.originTree = r;
            this.firstTree = this.originTree.map(item => {
                return {
                    id: item.category,
                    name: item.category
                }
            })
            this.getSecondTree();
        })
        this._BrandServiceProxy.gets(
            undefined,
            undefined,
            undefined,
            undefined,
            999,
            0
        ).subscribe(r => {
            this.brandList = r.items;
        })

        setTimeout(() => {
            this.getProvinceList();
            this.getStoreList();
            // this.getList();
        })

    }

    getSecondTree() {
        this.secondTree = [];
        this.chosenSecond = [];
        this.showTreeSecond = false;
        setTimeout(() => {
            this.showTreeSecond = true;
        })
        var selectedTree = this.originTree;
        if (this.chosenFirst.length > 0) {
            selectedTree = this.originTree.filter(item => {
                return this.chosenFirst.indexOf(item.category) > -1
            })
        }
        var secondTree = [];
        selectedTree.forEach(item1 => {
            item1.subCategory.forEach(item2 => {
                secondTree.push({
                    id: item2,
                    name: item2
                })
            })
        })
        this.secondTree = secondTree;
        console.log(this.secondTree)
    }

    getProvinceList() {
        this.ouTree2 = [];
        this.chosenItem2 = [];
        this.showTree2 = false;
        setTimeout(() => {
            this.showTree2 = true;
        })
        this._OrganizationUnitServiceProxy.getProvinceList(this.chosenItem).subscribe(r => {
            this.ouTree2 = r;
        })
    }
    getStoreList() {
        this.ouTree3 = [];
        this.chosenItem3 = [];
        this.showTree3 = false;
        setTimeout(() => {
            this.showTree3 = true;
        })
        this._OrganizationUnitServiceProxy.getStoreList(this.chosenItem, this.chosenItem2).subscribe(r => {
            this.ouTree3 = r;
        })
    }

    clickContainer() {
        if (this.highTree3 && this.highTree3.showStore) {
            this.highTree3.clickInput()
        }
        if (this.highTree2 && this.highTree2.showStore) {
            this.highTree2.clickInput()
        }
        if (this.highTree && this.highTree.showStore) {
            this.highTree.clickInput();
        }
        if (this.highTreeFirst && this.highTreeFirst.showStore) {
            this.highTreeFirst.clickInput();
        }
        if (this.highTreeSecond && this.highTreeSecond.showStore) {
            this.highTreeSecond.clickInput();
        }
        if (this.highTreeActivity && this.highTreeActivity.showStore) {
            this.highTreeActivity.clickInput();
        }
        if (this.highTreeBrand && this.highTreeBrand.showStore) {
            this.highTreeBrand.clickInput();
        }
        if (this.highTreeProm && this.highTreeProm.showStore) {
            this.highTreeProm.clickInput();
        }
    }


    //显示图片加载失败的占位图
    showEmpty(e) {
        var target = $(e.target);
        target.attr("src", AppConsts.appBaseUrl + "/assets/common/images/holderimg.png")
    }

    onTreeUpdate(originalArr) {
        this.chosenItem = originalArr.map(item => {
            return item.id
        });
        this.getStoreList();
        this.getProvinceList();
    }
    onTreeUpdate2(originalArr) {
        this.chosenItem2 = originalArr.map(item => {
            return item.id
        });
        this.getStoreList();
    }
    onTreeUpdate3(originalArr) {
        this.chosenItem3 = originalArr.map(item => {
            return item.id
        });
    }
    onTreeUpdateFirst(originalArr) {
        this.chosenFirst = originalArr.map(item => {
            return item.id
        });
        this.getSecondTree();
    }
    onTreeUpdateSecond(originalArr) {
        this.chosenSecond = originalArr.map(item => {
            return item.id
        });
    }
    onTreeUpdateActivity(originalArr) {
        this.activityTag = originalArr.map(item => {
            return item.id
        });
    }
    onTreeUpdateBrand(originalArr) {
        this.brand = originalArr.map(item => {
            return item.name
        });
    }
    onTreeUpdateProm(originalArr) {
        this.prom = originalArr.map(item => {
            return item.id
        });
    }

    //获取列表
    getList(event?: LazyLoadEvent) {
        var allStartTime, allEndTime;
        if (this.realStartTime) {
            allStartTime = moment(this.realStartTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h')
        }
        if (this.realEndTime) {
            allEndTime = moment(this.realEndTime.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's')
        }
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        console.log("this.primengTableHelper",this.primengTableHelper)
        console.log("this.dataTable",this.dataTable)

        this.primengTableHelper.showLoadingIndicator();
        this._OrderServiceProxy.salesItemDetailReport({
            "storeIds": this.chosenItem3.length ? this.chosenItem3 : this.ouTree3.map(item => { return item.id }),
            "startTime": allStartTime,
            "endTime": allEndTime,
            "activtyTags": this.activityTag,
            "brandNames": this.brand,
            "discounts": this.prom,
            "categorys": this.chosenFirst,//chosenFirst
            "subCategorys": this.chosenSecond,//chosenSecond
            "skuId": this.jancode,
            "groupByStore": this.groupByStore,
            "groupByProduct": this.groupByProduct,
            "groupByMember": this.groupByMember,
            "sorting": this.primengTableHelper.getSorting(this.dataTable),
            "maxResultCount": this.primengTableHelper.getMaxResultCount(this.paginator, event),
            "skipCount": this.primengTableHelper.getSkipCount(this.paginator, event)
        } as GetSaleItemDetailInput
        ).pipe(finalize(() => {
            this.primengTableHelper.hideLoadingIndicator();
        })).subscribe(result => {
            this.primengTableHelper.totalRecordsCount = result.totalCount;
            this.primengTableHelper.records = result.items;
        })
    }

    export() {
        this.exportLoading = true;
        var allStartTime, allEndTime;
        if (this.realStartTime) {
            allStartTime = moment(this.realStartTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h')
        }
        if (this.realEndTime) {
            allEndTime = moment(this.realEndTime.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's')
        }

        console.log(this.chosenItem3.length ? this.chosenItem3 : this.ouTree3.map(item => { return item.id }))

        //
        // this._ReportServiceProxy.saleDetailToExcel({
        this._ReportServiceProxy.saleDetailToExcelAsUrl({
            "storeIds": this.chosenItem3.length ? this.chosenItem3 : this.ouTree3.map(item => { return item.id }),
            "startTime": allStartTime,
            "endTime": allEndTime,
            "activtyTags": this.activityTag,
            "brandNames": this.brand,
            "discounts": this.prom,
            "categorys": this.chosenFirst,//chosenFirst
            "subCategorys": this.chosenSecond,//chosenSecond
            "skuId": this.jancode,
            "groupByStore": this.groupByStore,
            "groupByProduct": this.groupByProduct,
            "groupByMember": this.groupByMember,
            "sorting": this.primengTableHelper.getSorting(this.dataTable),
            "maxResultCount": this.primengTableHelper.getMaxResultCount(this.paginator, undefined),
            "skipCount": this.primengTableHelper.getSkipCount(this.paginator, undefined)
        } as GetSaleItemDetailInput
        ).pipe(finalize(() => {
            this.exportLoading = false;
        })).subscribe(r => {
            console.log('r', r);
            var link = document.getElementById('aaa');
            // var href = `https://o.api.troncell.com/api/File/DownloadTempFile?FileName=` + r.fileName + `&FileType=` + r.fileType + `&FileToken=` + r.fileToken;
            var href = r;
            $(link).attr("href", href);
            link.click();
        })
    }

    //转换序列
    transIndex(i, event?: LazyLoadEvent) {
        return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
    }




}




