import { Component, ViewChild, Injector, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';

import * as moment from 'moment';
import { DateRangePickerComponent } from '@app/shared/common/timing/date-range-picker.component';
import { OutPutInStorageServiceProxy, GetOutPutInStorageRecordInput } from '@shared/service-proxies/service-proxies-product';


@Component({
    selector: 'outputinDetailModal',
    templateUrl: './outputin-detail-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class OutputinDetailModalComponent extends AppComponentBase implements AfterViewChecked {
    @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;
    @ViewChild('dataTable',{static:true}) dataTable: Table;
    @ViewChild('paginator',{static:true}) paginator: Paginator;
    @ViewChild('daterange',{static:true}) daterange: DateRangePickerComponent;


    active = false;
    billId;
    skuId;
    storeId;
    filter = '';

    StartTime: any = undefined;
    EndTime: any = undefined;
    OutPutInStorageType: any = '';
    constructor(
        injector: Injector,
        private _OutPutInStorageServiceProxy: OutPutInStorageServiceProxy,
    ) {
        super(injector);
    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(billId, skuId?, storeId?): void {
        this.active = true;
        this.billId = billId;
        this.skuId = skuId;
        if (storeId && storeId.length) this.storeId = storeId;
        this.modal.show();
        this.getList();
    }


    getList(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }
        if (this.StartTime) {
            var StartTime = moment(this.StartTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h')
        }
        if (this.EndTime) {
            var EndTime = moment(this.EndTime.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's')
        }
        this.primengTableHelper.showLoadingIndicator();

        this._OutPutInStorageServiceProxy.getOutPutInStorageRecords({
            outPutInStorageBillId: this.billId,
            skuId: this.skuId,
            storeId: undefined,//list
            startTime: StartTime ? StartTime : this.StartTime,
            endtTime: EndTime ? EndTime : this.EndTime,
            ignoreStore: undefined,
            outPutInStorageType: this.OutPutInStorageType,//OutPutInStorageType
            filter: this.filter,
            sorting: this.primengTableHelper.getSorting(this.dataTable),
            maxResultCount: this.primengTableHelper.getMaxResultCount(this.paginator, event),
            skipCount: this.primengTableHelper.getSkipCount(this.paginator, event)
        } as GetOutPutInStorageRecordInput)
        .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
        .subscribe(result => {
            console.log(result)
            this.primengTableHelper.totalRecordsCount = result.totalCount;
            this.primengTableHelper.records = result.items;
            // this.primengTableHelper.hideLoadingIndicator();
        })

    }

    onShown() {

    }
    close(): void {
        this.active = false;
        this.modal.hide();
    }

    //转换序列
    transIndex(i, event?: LazyLoadEvent) {
        return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
    }

}
