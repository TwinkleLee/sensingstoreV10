import { Component, ViewChild, Injector, Input, Output, EventEmitter, ElementRef, AfterViewChecked, AfterViewInit } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { ProductServiceProxy, AuditStatus as AuditStatus12, AuditStatus as AuditStatus7 } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';

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
    cargoType;
    filterText: string = '';
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    @Input() AuditStatus = undefined;
    @Input() Sorting = undefined;
    @Input() outputWhenClose = false;


    constructor(
        injecor: Injector,
        private _ProductServiceProxy: ProductServiceProxy,
    ) {
        super(injecor);
    }


    //获取product
    getProducts(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }
        this.primengTableHelper.showLoadingIndicator();
        this._ProductServiceProxy.getProducts(
            undefined,
            undefined,
            undefined,
            this.AuditStatus,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            this.filterText,
            this.Sorting,
            this.primengTableHelper.getMaxResultCount(this.paginator, event),
            this.primengTableHelper.getSkipCount(this.paginator, event)
        )
            .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
            .subscribe((result) => {
                this.primengTableHelper.totalRecordsCount = result.totalCount;
                this.primengTableHelper.records = result.items;
                // this.primengTableHelper.hideLoadingIndicator();
            })

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
        this.modal.show()
    }
    //监听显示事件
    onShown() {
        this.getProducts();

    }
    //imageGrid 广播事件
    onOperate(e) { }

}
