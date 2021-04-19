import { Component, ViewChild, Injector, Input, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { MarketingServiceProxy } from '@shared/service-proxies/service-proxies-pager';
import { ProductServiceProxy } from '@shared/service-proxies/service-proxies-product';
import { ProductAlertModalComponent } from './product-selection-modal.component';

@Component({
    selector: 'pageModal',
    templateUrl: './create-or-edit-page-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditPageModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('ProductAlertModal', { static: true }) ProductAlertModal: ProductAlertModalComponent;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    @Input() applicationId;
    @Input() salespersonList = [];

    active = false;
    saving = false;

    operation: string = "add";
    objItem: any = {};
    constructor(
        injector: Injector,
        private _ApplicationServiceProxy: MarketingServiceProxy,
        private _ProductServiceProxy: ProductServiceProxy
    ) {
        super(injector);
    }

    show(objItem?: any): void {
        this.active = true;
        if (objItem) {
            this.operation = "edit";
            objItem.applicationId = this.applicationId;
            if (!objItem.pageExtras || objItem.pageExtras.length == 0) {
                objItem.pageExtras = [{
                    "productId": "",
                    "productName": "",
                    "skuId": 0,
                    "deviceActivityGameId": 0,
                    "salesId": ""
                }]
                this.objItem = objItem;
            } else {
                this.objItem = objItem;
                this.getProductName();
            }
        } else {
            this.operation = "add";
            this.objItem = {
                applicationId: this.applicationId,
                pageExtras: [{
                    "productId": "",
                    "productName": "",
                    "skuId": 0,
                    "deviceActivityGameId": 0,
                    "salesId": ""
                }]
            };
        }
        this.modal.show();
    }

    getProductName() {
        this._ProductServiceProxy.getSingleProduct(
            this.objItem.pageExtras[0].productId,
            void 0,
            void 0,
            void 0,
            void 0,
            void 0,
            void 0,
            void 0,
            void 0,
            void 0,
            void 0,
            void 0,
            void 0,
            void 0,
            void 0,
            void 0,
            void 0,
            void 0,
            void 0,
            void 0,
            void 0,
        ).subscribe(result => {
            this.objItem.pageExtras[0].productName = result.title;
        })
    }

    onShown(): void {

    }

    save(): void {
        this.saving = true;
        console.log(this.objItem);
        if (this.operation == "add") {
            this._ApplicationServiceProxy.createPages(this.objItem)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(result => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                })
        } else {
            this._ApplicationServiceProxy.updatePages(this.objItem)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(result => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                })
        }

    }

    close(): void {
        this.active = false;
        this.objItem = {
            pageExtras: [{
                "productId": "",
                "productName": "",
                "skuId": 0,
                "deviceActivityGameId": 0,
                "salesId": ""
            }]
        };
        this.saving = false;
        this.modal.hide();
    }


    chooseProduct() {
        this.ProductAlertModal.cargoType = 'product';
        this.ProductAlertModal.show();
    }
    changeProduct(record) {
        if (record.selection.length) {
            this.objItem.pageExtras[0].productId = record.selection[0].id;
            this.objItem.pageExtras[0].productName = record.selection[0].title;
        } else {
            this.objItem.pageExtras[0].productId = "";
            this.objItem.pageExtras[0].productName = "";
        }

    }
}
