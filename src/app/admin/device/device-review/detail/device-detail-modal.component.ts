import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { ApplyServiceProxy } from '@shared/service-proxies/service-proxies-devicecenter';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { finalize } from 'rxjs/operators';


@Component({
    selector: 'deviceDetailModal',
    templateUrl: './device-detail-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class DeviceDetailModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;
    @ViewChild('dataTable',{static:true}) dataTable: Table;
    @ViewChild('paginator',{static:true}) paginator: Paginator;

    detailId;

    constructor(
        injector: Injector,
        private _applyService: ApplyServiceProxy
    ) {
        super(injector);
    }


    ngAfterViewChecked(): void {
    }


    show(id?: number): void {
        this.detailId = id;
        this.modal.show();
    }
    getApplyFormDetail(event?: LazyLoadEvent) {
        this.primengTableHelper.showLoadingIndicator();
        this._applyService.getAuditDeviceDetails(
            this.detailId,
            void 0,
            this.primengTableHelper.getSorting(this.dataTable),
            this.primengTableHelper.getMaxResultCount(this.paginator, event),
            this.primengTableHelper.getSkipCount(this.paginator, event)
        ).pipe(finalize(() => {
            this.primengTableHelper.hideLoadingIndicator();
        })).subscribe(result => {
            this.primengTableHelper.totalRecordsCount = result.totalCount;
            this.primengTableHelper.records = result.items;
        });
    }
    onShown(): void {
        this.getApplyFormDetail();
    }

    close(): void {
        this.modal.hide();
    }
    //
    transIndex(i) {
        return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, null);
    }
}
