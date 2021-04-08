import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';
import { OutPutInStorageServiceProxy  } from '@shared/service-proxies/service-proxies-product';
import { SkuGridModalComponent } from '@app/admin/product/outputin/operation/sku-grid-modal.component';
import * as _ from 'lodash';

@Component({
    selector: 'addOutputinModal',
    templateUrl: './add-outputin-modal.component.html',
    styles: [`
    .user-edit-dialog-profile-image {
        margin-bottom: 20px;
    }
    .recordNotValid{
        border-color:red !important;
    }`]
})
export class AddOutputinComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput',{static:true}) nameInput: ElementRef;
    @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;
    @ViewChild('skuGridModal',{static:true}) skuGridModal: SkuGridModalComponent;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('highTree',{static:false}) highTree;

    active = false;
    saving = false;
    Input: any = {
        outPutInStorageSkus: []
    };

    treeList: any = [];

    storeIdArr: any = [];

    skuList: any = [];
    isTenant = false;

    nowIndex = 0;

    constructor(
        injector: Injector,
        private _OutPutInStorageServiceProxy: OutPutInStorageServiceProxy
    ) {
        super(injector);
    }


    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        // $('tabset ul.nav').addClass('m-tabs-line');
        // $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(type, treeList): void {
        if (treeList[0].type == 'tenant') {
            this.isTenant = true;
        }
        this.checkStorelength(treeList);
        console.log('storeIdArr', this.storeIdArr);
        if (this.storeIdArr.length == 0) {
            // return
        } else if (this.storeIdArr.length == 1) {
            if (this.isTenant = true) {
                this.treeList = treeList;
            } else {
                this.Input.storeId = this.storeIdArr[0];
            }
        } else if (this.storeIdArr.length > 1) {
            this.treeList = treeList;
        }


        this.Input.outPutInStorageType = type;

        this.modal.show();
        this.active = true;
    }

    checkStorelength(treeList) {
        treeList.forEach(item => {
            if (item.type == 'store') {
                this.storeIdArr.push(item.id);
            }
            if (item.children.length) {
                this.checkStorelength(item.children)
            }
        })
    }

    clickContainer() {
        if (this.highTree && this.highTree.showStore) {
            this.highTree.clickInput()
        }
    }

    onTreeUpdate(originalArr) {
        if (originalArr.length) {
            this.Input.storeId = originalArr[0].id;
        } else {
            this.Input.storeId = undefined;
        }
        this.skuList = [];
    }

    onShown(): void {

    }


    save(): void {
        this.saving = true;

        this.Input.storageOuterId = this.Input.outerId;
        this.Input.skuQuantity = this.Input.outPutInStorageSkus.map(item=>{
            item.quantity = item.number;
            return item
        })
        console.log(this.Input)
        
        if (this.Input.outPutInStorageType != 2) {
            this._OutPutInStorageServiceProxy.addOrUpdateOutPutInStorageBill(this.Input)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        } else {//验货
            this._OutPutInStorageServiceProxy.addStorageCheck(this.Input)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        }

    }

    close(): void {
        this.active = false;
        this.saving = false;
        this.Input = {
            outPutInStorageSkus: []
        };
        this.treeList = [];
        this.storeIdArr = [];
        this.skuList = [];
        this.isTenant = false;
        this.modal.hide();
    }

    add() {
        this.skuList.push({
            loading: false,
            title: '',
            sku_id: '',
            picUrl: '',
            quantity: undefined,
            number: undefined
        });
    }

    deleteRecord(i) {
        this.skuList.splice(i, 1);
    }

    doSearch(e, record, index) {
        this.nowIndex = index;
        this.primengTableHelper.showLoadingIndicator();
        record.loading = true;
        this._OutPutInStorageServiceProxy.getSkus(
            undefined,
            undefined,
            this.Input.storeId ? [this.Input.storeId] : undefined,
            undefined,
            undefined,
            e.target.value,
            undefined,
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
                    this.skuGridModal.show(this.Input.storeId ? [this.Input.storeId] : undefined, e.target.value, _.cloneDeep(r));
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
        if (this.Input.outPutInStorageType == 1 || this.Input.outPutInStorageType == 2) {
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
}
