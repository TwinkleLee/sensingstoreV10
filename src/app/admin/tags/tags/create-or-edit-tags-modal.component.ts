import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';

import { TagServiceProxy, TagType as Type, TagDto, CreateTagInput, UpdateTagInput } from '@shared/service-proxies/service-proxies';

import { TagServiceProxy as ProductTagServiceProxy } from '@shared/service-proxies/service-proxies-product'

import { TagServiceProxy as AdsTagServiceProxy } from '@shared/service-proxies/service-proxies-ads'

import { TagServiceProxy as GameTagServiceProxy, TagType } from '@shared/service-proxies/service-proxies5'

import { TagServiceProxy as DeviceTagServiceProxy } from '@shared/service-proxies/service-proxies-devicecenter'

import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'createOrEditTagModal',
    templateUrl: './create-or-edit-tags-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditTagModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput', { static: true }) nameInput: ElementRef;
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;


    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    readonly = false;

    uploadUrl: string;
    uploadedFiles: any[] = [];
    operation: string = "add";
    tag: any;
    ToResource = true;
    createTag: CreateTagInput;
    updateTag: UpdateTagInput;

    ServiceProxy: any = '';

    tagTypes = TagType;


    // tagTypes = [{
    //     name: this.l("Resources"),
    //     value: 0
    // }, {
    //     name: this.l("Devices"),
    //     value: 1
    // }, {
    //     name: this.l("Product"),
    //     value: 2
    // }, {
    //     name: this.l("Advertisement"),
    //     value: 3
    // }, {
    //     name: this.l("Brand"),
    //     value: 5
    // }, {
    //     name: this.l("Question"),
    //     value: 6
    // }, {
    //     name: this.l("counter"),
    //     value: 7
    // }, {
    //     name: this.l("WechatPublicMessage"),
    //     value: 8
    // }, {
    //     name: this.l("Others"),
    //     value: 4
    // }];

    memberedOrganizationUnits: string[];

    constructor(
        injector: Injector,
        private _tagService: TagServiceProxy,
        private _DeviceTagServiceProxy: DeviceTagServiceProxy,
        private _AdsTagServiceProxy: AdsTagServiceProxy,
        private _ProductTagServiceProxy: ProductTagServiceProxy,
        private _GameTagServiceProxy: GameTagServiceProxy,
    ) {
        super(injector);
    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }


    show(tag?: any, type?): void {
        this.active = true;
        if (tag) {
            this.readonly = true;
            this.operation = "edit";
            this.tag = tag;
        } else {
            this.operation = "add";
            this.tag = {
                "type": type || ""
            };

        }
        this.modal.show();
    }

    onShown(): void {
        if (this.nameInput) {
            $(this.nameInput.nativeElement).focus()
        }
    }

    save(): void {

        console.log(this.tag)

        if (this.tag.type == this.tagTypes.Resource || this.tag.type == this.tagTypes.Counter || this.tag.type == this.tagTypes.Other) {
            this.ServiceProxy = this._tagService
        }

        if (this.tag.type == this.tagTypes.Question || this.tag.type == this.tagTypes.WechatPublicMessage) {
            this.ServiceProxy = this._GameTagServiceProxy
        }

        if (this.tag.type == this.tagTypes.Device || this.tag.type == this.tagTypes.Brand) {
            this.ServiceProxy = this._DeviceTagServiceProxy
        }

        if (this.tag.type == this.tagTypes.Product) {
            this.ServiceProxy = this._ProductTagServiceProxy
        }

        if (this.tag.type == this.tagTypes.Ads) {
            this.ServiceProxy = this._AdsTagServiceProxy
        }

        if (this.operation == "add") {
            this.createTag = this.tag as CreateTagInput;
            this.ServiceProxy.createTag(this.createTag)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        } else {
            this.updateTag = this.tag as UpdateTagInput;
            this.ServiceProxy.updateTag(this.updateTag)
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
        this.readonly = false;
        this.modal.hide();
    }


    // upload completed event
    onUpload(result): void {
        this.tag.iconUrl = result.fileUri;
    }

    onBeforeSend(event): void {
    }
}
