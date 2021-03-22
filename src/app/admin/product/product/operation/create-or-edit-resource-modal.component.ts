import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked, Input } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { ProductServiceProxy, UpdateEntityResourceInput, CreateEntityResourceInput } from '@shared/service-proxies/service-proxies-product';

import { FileServiceProxy } from '@shared/service-proxies/service-proxies'

import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';


@Component({
    selector: 'createOrEditProductResourceModal',
    templateUrl: './create-or-edit-resource-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditProductResourceModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    @Input("editable") editable:boolean=true;
    active = false;
    saving = false;
    resource: any = {};
    createInput: CreateEntityResourceInput;
    updateInput: UpdateEntityResourceInput;
    operationType = "add";
    constructor(
        injector: Injector,
        private _prodService: ProductServiceProxy,
        private _fileService: FileServiceProxy
    ) {
        super(injector);
    }
    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(id, resource?): void {
        this.active = true;
        if (resource) {
            this.operationType = "edit";
            this.resource = resource;

        } else {
            this.operationType = "add";
            this.resource = {};
            this.resource.entityId = id;
        }
        this.modal.show();
    }

    onShown(): void {
    }
    save(): void {
        this.saving = true;
        if (this.operationType == "edit") {
            this.updateInput = new UpdateEntityResourceInput(this.resource);
            this._prodService.updateProductResource(this.updateInput).pipe(finalize(() => {
                this.saving = false;
            })).subscribe((result) => {
                this.modalSave.emit();
                this.notify.info(this.l('success'));
                // this.modal.hide();
                this.close();
            })
        }else{
            this.createInput = new CreateEntityResourceInput(this.resource);
            this._prodService.addProductResource(this.createInput).pipe(finalize(() => {
                this.saving = false;
            })).subscribe((result) => {
                this.modalSave.emit();
                this.notify.info(this.l('success'));
                // this.modal.hide();
                this.close();
            })
        }
    }
    close(): void {
        this.active = false;
        this.resource = {};
        this.modal.hide();
        console.log(123)
    }
    // upload completed event
    onUpload(event): void {
        this.resource.fileUrl = event.fileUri;
        this.resource.resourceItemId = Number(event.resourceId)
    }

    onBeforeSend(event):void {}
    
}
