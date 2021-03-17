import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked, AfterViewInit } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';

import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';

import { finalize } from 'rxjs/operators';
import { OutPutInStorageServiceProxy } from '@shared/service-proxies/service-proxies-product';

@Component({
    selector: 'skuGridModal',
    templateUrl: './sku-grid-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`, `.skuList label{
            width: 100%;
            text-align: center;
        }`, `.skuList img{
            width: 100%;
        }`, `.skuList img.chosed{
            border:1px solid red;
        }`, `.modal-lg{
             margin:30px auto;
             min-width: 900px;
             width: 80%;
        }`
    ]
})
export class SkuGridModalComponent extends AppComponentBase {
    @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;
    @ViewChild('paginator',{static:true}) paginator: Paginator;
    selection: any[] = [];
    saving: boolean = false;
    filterText: string = '';
    storeList: any = [];
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    constructor(injecor: Injector,
        private _OutPutInStorageServiceProxy: OutPutInStorageServiceProxy) {
        super(injecor);
    }
    //获取skus
    getSkus(event?: LazyLoadEvent, e?: Event) {
        e && e.preventDefault();
        this.primengTableHelper.showLoadingIndicator();
        this._OutPutInStorageServiceProxy.getSkus(
            undefined,
            undefined,
            this.storeList,
            undefined,
            undefined,
            this.filterText,
            undefined,
            this.primengTableHelper.getMaxResultCount(this.paginator, event),
            this.primengTableHelper.getSkipCount(this.paginator, event)
        ).pipe(finalize(() => {
            this.primengTableHelper.hideLoadingIndicator();
        })).subscribe((result) => {
            this.primengTableHelper.totalRecordsCount = result.totalCount;
            this.primengTableHelper.records = result.items;
        })
    }

    save() {
        this.modalSave.emit({ 'selection': this.selection });
        this.modal.hide();
    }
    close(): void {
        this.modal.hide();
    }
    //弹出显示方法
    show(storeList, filterText, initListObj) {
        console.log('show', storeList, filterText, initListObj);
        this.storeList = storeList;
        this.filterText = filterText;
        this.primengTableHelper.totalRecordsCount = initListObj.totalCount;
        this.primengTableHelper.records = initListObj.items;
        this.selection = [];
        this.modal.show();
    }
    //监听显示事件
    onShown() {
        // this.getSkus();
    }
    //imageGrid 广播事件
    onOperate(e) {
        this.selection = e.image;
        this.save();
    }

}
