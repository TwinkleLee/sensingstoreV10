import { Component, ViewChild, Injector, Input, Output, EventEmitter, ElementRef, AfterViewChecked, AfterViewInit } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { ProductServiceProxy, SoftwareServiceProxy, DeviceServiceProxy, AuditStatus as AuditStatus12, AuditStatus as AuditStatus7 } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { ActivityServiceProxy } from '@shared/service-proxies/service-proxies5';
import { AdServiceProxy } from '@shared/service-proxies/service-proxies';
import { AdsPackageServiceProxy } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'ProductAlertModal',
    templateUrl: './product-selection-modal.component.html',
    styles: []
})
export class ProductAlertModalComponent extends AppComponentBase {
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    selection: any[] = [];
    saving: boolean = false;
    deviceId;
    cargoType;
    filterText: string = '';
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    @Input() AuditStatus = undefined;
    @Input() Sorting = undefined;
    @Input() outputWhenClose = false;
    @Input() isMultiSelected?: boolean = undefined;


    constructor(
        injecor: Injector,
        private _deviceService: DeviceServiceProxy,
        private _ActivityServiceProxy: ActivityServiceProxy,
        private _SoftwareServiceProxy: SoftwareServiceProxy,
        private _AdServiceProxy: AdServiceProxy,
        private _adsPackageSvc: AdsPackageServiceProxy

    ) {
        super(injecor);
    }

    isSingleSection(): boolean {
        var oldMode = this.cargoType ? true : false;
        if (this.isMultiSelected == null || this.isMultiSelected == undefined) {
            return oldMode;
        }
        return this.isMultiSelected ? false : true;
    }

    //获取product
    getProducts(event?: LazyLoadEvent) {
        console.log("this.cargoType", this.cargoType)
        if (!this.cargoType && this.cargoType != 0) {//商品的
            if (this.primengTableHelper.shouldResetPaging(event)) {
                this.paginator.changePage(0);
                return;
            }
            this.primengTableHelper.showLoadingIndicator();
            this._deviceService.getUnpublishedProductsByDeviceId(
                this.deviceId,
                undefined,
                AuditStatus12.Online,
                this.filterText,
                undefined,
                this.primengTableHelper.getMaxResultCount(this.paginator, event),
                this.primengTableHelper.getSkipCount(this.paginator, event)
            )
                .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
                .subscribe((result) => {
                    this.primengTableHelper.totalRecordsCount = result.totalCount;
                    this.primengTableHelper.records = result.items;
                    // this.primengTableHelper.hideLoadingIndicator();
                })
        } else if (this.cargoType == 0) {//货道 商品
            if (this.primengTableHelper.shouldResetPaging(event)) {
                this.paginator.changePage(0);
                return;
            }
            this.primengTableHelper.showLoadingIndicator();
            this._deviceService.getProductsByDeviceId(
                this.deviceId,
                undefined,
                AuditStatus7.Online,
                this.filterText,
                undefined,
                this.primengTableHelper.getMaxResultCount(this.paginator, event),
                this.primengTableHelper.getSkipCount(this.paginator, event)
            )
                .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
                .subscribe((result) => {
                    console.log(result.items)
                    this.primengTableHelper.totalRecordsCount = result.totalCount;
                    this.primengTableHelper.records = result.items;
                    // this.primengTableHelper.hideLoadingIndicator();
                })
        } else if (this.cargoType == 1) {//货道 sku
            if (this.primengTableHelper.shouldResetPaging(event)) {
                this.paginator.changePage(0);
                return;
            }
            this.primengTableHelper.showLoadingIndicator();
            this._deviceService.getSkusByDeviceId(
                this.deviceId,
                undefined,
                AuditStatus7.Online,
                this.filterText,
                undefined,
                this.primengTableHelper.getMaxResultCount(this.paginator, event),
                this.primengTableHelper.getSkipCount(this.paginator, event)
            )
                .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
                .subscribe((result) => {
                    console.log(result.items)
                    this.primengTableHelper.totalRecordsCount = result.totalCount;
                    this.primengTableHelper.records = result.items;
                    // this.primengTableHelper.hideLoadingIndicator();
                })
        } else if (this.cargoType == 2) {//货道 奖品
            if (this.primengTableHelper.shouldResetPaging(event)) {
                this.paginator.changePage(0);
                return;
            }
            this.primengTableHelper.showLoadingIndicator();
            this._ActivityServiceProxy.getDeviceActivityAward(
                this.deviceId,
                this.filterText,
                undefined,
                this.primengTableHelper.getMaxResultCount(this.paginator, event),
                this.primengTableHelper.getSkipCount(this.paginator, event)
            )
                .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
                .subscribe((result) => {
                    console.log(result.items)
                    this.primengTableHelper.totalRecordsCount = result.totalCount;
                    this.primengTableHelper.records = result.items;
                    // this.primengTableHelper.hideLoadingIndicator();
                })
        } else if (this.cargoType == 'ads') {//广告
            if (this.primengTableHelper.shouldResetPaging(event)) {
                this.paginator.changePage(0);
                return;
            }
            this.primengTableHelper.showLoadingIndicator();
            this._AdServiceProxy.getAds(
                this.AuditStatus, undefined, undefined, undefined,
                this.filterText,
                this.Sorting,
                this.primengTableHelper.getMaxResultCount(this.paginator, event),
                this.primengTableHelper.getSkipCount(this.paginator, event)
            )
                .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
                .subscribe((result) => {
                    console.log(result.items)
                    this.primengTableHelper.totalRecordsCount = result.totalCount;
                    this.primengTableHelper.records = result.items;
                    // this.primengTableHelper.hideLoadingIndicator();
                })
        } else if (this.cargoType == 'software') {//应用
            if (this.primengTableHelper.shouldResetPaging(event)) {
                this.paginator.changePage(0);
                return;
            }
            this.primengTableHelper.showLoadingIndicator();
            this._SoftwareServiceProxy.getAuthorizedSoftwares(
                undefined,
                undefined,
                this.filterText,
                undefined,//this.Sorting,
                this.primengTableHelper.getMaxResultCount(this.paginator, event),
                this.primengTableHelper.getSkipCount(this.paginator, event)
            )
                .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
                .subscribe((result) => {
                    console.log(result.items)
                    this.primengTableHelper.totalRecordsCount = result.totalCount;
                    this.primengTableHelper.records = result.items;
                    // this.primengTableHelper.hideLoadingIndicator();
                })
        } else if (this.cargoType == 'adsPackage') {//应用
            if (this.primengTableHelper.shouldResetPaging(event)) {
                this.paginator.changePage(0);
                return;
            }
            this.primengTableHelper.showLoadingIndicator();
            this._adsPackageSvc.getPackages(
                this.filterText,
                'Id',
                this.primengTableHelper.getMaxResultCount(this.paginator, event),
                this.primengTableHelper.getSkipCount(this.paginator, event)
            ).pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
                .subscribe(result => {
                    this.primengTableHelper.totalRecordsCount = result.totalCount;
                    this.primengTableHelper.records = result.items;
                });
        }



    }

    save() {
        this.modalSave.emit({ 'selection': this.selection, cargoType: this.cargoType });
        this.modal.hide();
        this.primengTableHelper.records = [];
    }
    close(): void {
        if (this.outputWhenClose) {
            this.modalSave.emit({ 'selection': [] });
        }
        this.modal.hide();
        this.primengTableHelper.records = [];
    }
    //弹出显示方法
    show(id?) {
        this.selection = [];
        this.filterText = '';
        this.deviceId = id;
        this.modal.show()
    }
    //监听显示事件
    onShown() {
        // if (this.cargoType != 0 && this.cargoType != 1 && this.cargoType != 2 && this.primengTableHelper.records) {
        //     return
        // }
        this.getProducts();

    }
    //imageGrid 广播事件
    onOperate(e) { }

}
