import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { ProductCategoryServiceProxy } from '@shared/service-proxies/service-proxies-product';

import { ShopServiceProxy, CreateShopCategoryInput, UpdateShopCategoryInput } from '@shared/service-proxies/service-proxies-product'


import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'setCategoryModal',
    templateUrl: './set-category-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class SetCategoryModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('createOrEditModal' ,{static:true}) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    operation: string = "add";
    cate: any;
    cateList: any = [];

    constructor(
        injector: Injector,
        private _ShopServiceProxy: ShopServiceProxy,
        private _ProductCategoryServiceProxy: ProductCategoryServiceProxy
    ) {
        super(injector);
        this._ProductCategoryServiceProxy.getProductCategories(
            undefined,
            undefined,
            999,
            0
        ).subscribe(r => {
            this.cateList = r.items;
        })
    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }


    show(cate?: any): void {
        this.active = true;
        if (cate) {
            this.operation = "edit";
            this.cate = cate;
        } else {
            this.operation = "add";
            this.cate = {};

        }
        this.modal.show();
    }

    onShown(): void {

    }

    save(): void {
        this.saving = true;
        if (this.operation == "add") {
            this._ShopServiceProxy.createShopCategory(new CreateShopCategoryInput(this.cate))
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        }
        else {
            this._ShopServiceProxy.updateShopCategory(this.cate as UpdateShopCategoryInput)
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
        this.cate = {};
        this.modal.hide();
    }


    // upload completed event
    onUpload(result): void {
        this.cate.pictureUrl = result.fileUri;
    }

    onBeforeSend(event): void {
    }
}
