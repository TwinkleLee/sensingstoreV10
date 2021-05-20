import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked, Input } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';

import { AddOrUpdateOutPutInStorageBillInput, OutPutInStorageServiceProxy } from '@shared/service-proxies/service-proxies-product';

import { SkuGridModalComponent } from '@app/admin/organization-units/organization-detail/sku-grid-modal.component';

import * as _ from 'lodash'

@Component({
    selector: 'billModal',
    templateUrl: './bill-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class BillModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('skuGridModal', { static: true }) skuGridModal: SkuGridModalComponent;

    active = false;
    saving = false;


    resource: any = {};
    operationType = "add";
    skuList: any = [];
    nowIndex: any = '';
    Input: any = {
        outPutInStorageType: 'Put',
        outPutInStorageSkus: []
    };

    constructor(
        injector: Injector,
        private _OutPutInStorageServiceProxy: OutPutInStorageServiceProxy
    ) {
        super(injector);
    }
    ngAfterViewChecked(): void {

    }

    doSearch(e, record, index) {
        this.nowIndex = index;
        this.primengTableHelper.showLoadingIndicator();
        record.loading = true;

        this._OutPutInStorageServiceProxy.getSkus(
            void 0,
            void 0,
            this.Input.storeId ? [this.Input.storeId] : void 0,
            void 0,
            void 0,
            e.target.value,
            void 0,
            10,
            0
        ).pipe(finalize(() => {
            this.primengTableHelper.hideLoadingIndicator();
            record.loading = false;
        }))
            .subscribe(r => {
                this.primengTableHelper.hideLoadingIndicator();
                if (r.items.length == 1) {
                    record.title = r.items[0].title;
                    record.sku_id = r.items[0].sku_id;
                    record.picUrl = r.items[0].picUrl;
                    record.quantity = r.items[0].quantity;

                    record.skuId = r.items[0].id;
                    record.productId = r.items[0].productId;
                    this.focusNumber();
                } else {
                    this.skuGridModal.show(this.Input.storeId ? [this.Input.storeId] : void 0, e.target.value, _.cloneDeep(r));
                }
            })
    }

    getSelect(e) {
        console.log(e.selection);
        if (this.skuList.some(item => {
            return item.skuId == e.selection.id;
        }).length) {
            this.notify.error(this.l('ExistRepeatedCargoThing'));
            return
        }
        this.skuList[this.nowIndex].title = e.selection.title;
        this.skuList[this.nowIndex].sku_id = e.selection.sku_id;
        this.skuList[this.nowIndex].picUrl = e.selection.picUrl;
        this.skuList[this.nowIndex].quantity = e.selection.quantity;

        this.skuList[this.nowIndex].skuId = e.selection.id;
        this.skuList[this.nowIndex].productId = e.selection.productId;
        this.focusNumber();
    }

    focusNumber() {
        var jqEle = $('.numberInputInAddOutputinModal');
        jqEle.eq(this.nowIndex).focus();
    }

    show(storeId,record?): void {
        this.active = true;
        this.Input.storeId = storeId;

        if (record) {
            this.operationType = 'edit';
            this.Input = record;
        }

        this.modal.show();
    }

    add() {
        this.skuList.push({
            loading: false,
            title: '',
            sku_id: '',
            picUrl: '',
            quantity: void 0,
            number: void 0
        });
    }

    deleteRecord(i) {
        this.skuList.splice(i, 1);
    }

    onShown(): void {
    }

    focusNext() {
        if (this.nowIndex == this.skuList.length - 1) {
            this.add();
        }
        setTimeout(() => {
            var jqEle = $('.titleInputInAddOutputinModal');
            jqEle.eq(this.nowIndex + 1).focus();
        })
    }

    checkNumber(value, index) {
        if (!value || parseInt(value) != value) {
            this.skuList[index].valid = false;
            this.buildInput();
            return
        }
        if (this.Input.outPutInStorageType == 'Put' || this.Input.outPutInStorageType == 'Check') {
            this.skuList[index].valid = true;
            this.buildInput();
            return
        }
        if (value > this.skuList[index].quantity) {//出货
            console.log('too much')
            this.skuList[index].valid = false;
            this.buildInput();
        } else {
            this.skuList[index].valid = true;
            this.buildInput();
        }
    }

    buildInput() {
        this.Input.outPutInStorageSkus = this.skuList.filter(item => {
            return item.valid
        }).map(item => {
            return {
                "productId": item.productId,
                "skuId": item.skuId,
                "number": item.number
            }
        })
    }

    save(): void {
        this.saving = true;

        this.Input.storageOuterId = this.Input.outerId;
        this.Input.skuQuantity = this.Input.outPutInStorageSkus.map(item => {
            item.quantity = item.number;
            return item
        })
        console.log(this.Input)


        this._OutPutInStorageServiceProxy.addOrUpdateOutPutInStorageBill(new AddOrUpdateOutPutInStorageBillInput(this.Input))
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
            });

    }
    close(): void {
        this.active = false;
        this.modal.hide();
    }
}