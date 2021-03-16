import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked, Input } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { AdsPackageServiceProxy, AddOrUpdateAdsPackageInput, AuditStatus, AdPackageBindingDto, AdPackageDto, AdDto, GetPackageDto } from '@shared/service-proxies/service-proxies-ads';

import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';
import { LazyLoadEvent } from 'primeng/api';
import { ProductAlertModalComponent } from '@app/admin/device/device-list/tabAlert/product-selection-modal.component';
import * as moment from 'moment';
import { RobotServiceProxy } from '@shared/service-proxies/service-proxies-floor';

import { AppConsts } from '@shared/AppConsts';



@Component({
    selector: 'createOrEditAdsPackageModal',
    templateUrl: './create-or-edit-ads-package-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`]
})
export class CreateOrEditAdsPackageModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput', { static: true }) nameInput: ElementRef;
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('dataTable', { static: false }) dataTable: Table;
    @ViewChild('ProductAlertModal', { static: true }) ProductAlertModal: ProductAlertModalComponent;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    @Input() deviceList;

    active = false;
    saving = false;

    // troncell 
    customTheme=AppConsts.customTheme;

    lines: any = '';

    pointList: any = [];
    routeList: any = [];

    operation: string = "add";
    record?: AddOrUpdateAdsPackageInput;
    _record?: AddOrUpdateAdsPackageInput;
    adPackageList?: AdPackageDto[];
    _selectedList = [];
    _adsTransitionList: any = [];
    constructor(
        injector: Injector,
        private _adsPackageSvc: AdsPackageServiceProxy,
        private _robotServiceProxy: RobotServiceProxy
    ) {
        super(injector);
    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    getAdInfos(event?: LazyLoadEvent): void {

        this._selectedList = [];
        this.primengTableHelper.showLoadingIndicator();

        this._adsPackageSvc.getAdInfosInSamePackage(this.record.id,
            undefined,
            this.primengTableHelper.getSorting(this.dataTable) || 'OrderNumber',
            200,
            0)
            .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
            .subscribe(result => {
                this.adPackageList = result.items
            });
    }

    //转换序列
    transIndex(i, event?: LazyLoadEvent) {
        return i + 1;
    }
    show(adpackage?: GetPackageDto, transitionList?: any): void {
        this._adsTransitionList = transitionList;
        this.active = true;
        this.record = new AddOrUpdateAdsPackageInput();
        this._record = this.record;
        if (adpackage) {
            this.operation = "edit";
            this.record.id = adpackage.id;
            this.record.name = adpackage.name;
            this.record.deviceId = adpackage.deviceId;
            this.record.patrolName = adpackage.patrolName;
            this.record.isLocationBased = adpackage.isLocationBased;
            this.record.description = adpackage.description;

            if (this.record.isLocationBased) {
                this.selectDevice();
                this.getPointList();
            }
        } else {
            this.operation = "add";
            this.record.isLocationBased = false;
        }
        this.modal.show();

    }

    onShown(): void {
        this.getAdInfos();
        if (this.nameInput) {
            $(this.nameInput.nativeElement).focus()
        }
    }

    save(): void {
        this.record.adPackages = this.adPackageList;
        this._adsPackageSvc.addOrUpdateAdsPackage(this.record)
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
            });
    }

    close(): void {
        this.lines = {};
        this.routeList = [];
        this.pointList = [];
        this.active = false;
        this.record = null;
        this.adPackageList = null;
        this.modal.hide();
    }

    showSelectMoreAds() {
        this.ProductAlertModal.AuditStatus = AuditStatus.Online;
        this.ProductAlertModal.cargoType = 'ads';
        this.ProductAlertModal.show();
    }

    deleteRecord(i: number) {
        this.adPackageList.splice(i, 1);
    }

    getDurationByDefault(duration: string) {
        var convertValue = Number(duration);//first with number string.
        if (isNaN(convertValue)) {
            convertValue = 15;
            var m = moment(duration, moment.HTML5_FMT.TIME_SECONDS); //second for time format 00:15:00
            if (m.isValid) {
                convertValue = m.seconds();
            }
        }
        return convertValue === 0 ? 15 : convertValue;
    }
    getTransitionByDefault(transition: string) {
        return transition ? transition : 'None';
    }

    getOrderNumberByDefault(): number {
        var orders = this.adPackageList.map(({ orderNumber }) => orderNumber);
        var valueMax = Math.max(...orders);
        var maxIndex = this.adPackageList.length + 1;
        return Math.max(valueMax + 1, maxIndex);
    }

    addMoreAds(record) {
        if (record.selection.length == 0) {
            return
        }
        if (record.cargoType == "ads") {
            record.selection.forEach(element => {
                var addAdItem = element as AdDto;
                var newItem = new AdPackageDto();
                newItem.adId = addAdItem.id;
                newItem.playDuration = this.getDurationByDefault(addAdItem.timeSpan);
                newItem.playTransition = this.getTransitionByDefault(addAdItem.transition);
                newItem.orderNumber = this.getOrderNumberByDefault();
                // var ad = new AdPlayInfoDto();
                // ad.name = addAdItem.name;
                // ad.resourceType = addAdItem.resourceType;
                // newItem.ad = ad;
                this.adPackageList.push(newItem);
            });

        }
    }


    // upload completed event
    onUpload(result): void {
        //this.createOrUpdateAdsPackage.logoUrl = result.fileUri;
    }

    onBeforeSend(event): void {
    }

    selectDevice() {
        this.routeList = [];
        this._robotServiceProxy.getDeviceNavigateLines(this.record.deviceId).subscribe((result) => {
            this.routeList = (result || []).map((item) => {
                return {
                    'id': item.id,
                    'value': item.name
                }
            })
        })
    }

    getPointList() {
        this.pointList = [];
        this._robotServiceProxy.getDeviceNavigateLinePointsByName(this.record.deviceId, this.record.patrolName)
            .subscribe(r => {
                this.pointList = (r || []).map(item => {
                    return {
                        "id": item.id,
                        "value": item.name
                    }
                })
            })
    }
}
