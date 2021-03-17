import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked, Input } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { ProductServiceProxy, CreateSkuResourceInput, UpdateEntityResourceInput } from '@shared/service-proxies/service-proxies-product';

import { FileServiceProxy } from '@shared/service-proxies/service-proxies'

import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';


@Component({
    selector: 'createOrEditSkuResourceModal',
    templateUrl: './create-or-edit-sku-resource-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditSkuResourceModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    @Input('editable') editable:boolean=true;
    active = false;
    saving = false;
    resource: any = {};
    createInput: CreateSkuResourceInput;
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
            this.resource.skuId = Number(id);
        }
        this.modal.show();
    }

    onShown(): void {
    }
    save(): void {
        this.saving = true;
        if (this.operationType == "edit") {
            this.updateInput = new UpdateEntityResourceInput(this.resource);
            this._prodService.updateSkuResource(this.updateInput).pipe(finalize(() => {
                this.saving = false;
            })).subscribe((result) => {
                this.modalSave.emit();
                this.notify.info(this.l('success'));
                this.modal.hide();
            })
        }else{
            this.createInput = new CreateSkuResourceInput(this.resource);
            this._prodService.addSkuResource(this.createInput).pipe(finalize(() => {
                this.saving = false;
            })).subscribe((result) => {
                this.modalSave.emit();
                this.notify.info(this.l('success'));
                this.modal.hide();
            })
        }
    }
    close(): void {
        this.active = false;
        this.modal.hide();
    }
    onUpload(event): void {
        this.resource.fileUrl = event.fileUri;
    }
}
