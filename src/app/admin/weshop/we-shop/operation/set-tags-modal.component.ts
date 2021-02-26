import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { TagServiceProxy, ShopServiceProxy, CreateShopTagInput, TagType as Type,UpdateShopTagInput } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'setTagModal',
    templateUrl: './set-tags-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class SetTagModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('createOrEditModal' ,{static:true}) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    operation: string = "add";
    tag: any;
    tagList: any = [];

    constructor(
        injector: Injector,
        private _ShopServiceProxy: ShopServiceProxy,
        private _TagServiceProxy: TagServiceProxy
    ) {
        super(injector);
        this._TagServiceProxy.getTagsByType(
            undefined,
            undefined,
            999,
            0,
            Type['Product']
        ).subscribe(r => {
            this.tagList = r.items;
        })
    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }


    show(tag?: any): void {
        this.active = true;
        if (tag) {
            this.operation = "edit";
            this.tag = tag;
        } else {
            this.operation = "add";
            this.tag = {};

        }
        this.modal.show();
    }

    onShown(): void {

    }

    save(): void {
        this.saving = true;
        if (this.operation == "add") {
            this._ShopServiceProxy.createShopTag(new CreateShopTagInput(this.tag))
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        }
        else {
            this._ShopServiceProxy.updateShopTag(this.tag as UpdateShopTagInput)
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
        this.tag = {};
        this.modal.hide();
    }


    // upload completed event
    onUpload(result): void {
        this.tag.pictureUrl = result.fileUri;
    }

    onBeforeSend(event): void {
    }
}
