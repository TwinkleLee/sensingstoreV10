import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal'
import { FileServiceProxy } from '@shared/service-proxies/service-proxies';
import { BrandServiceProxy, CreateEntityResourceInput, UpdateEntityResourceInput } from '@shared/service-proxies/service-proxies-devicecenter';

import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { moment } from 'ngx-bootstrap/chronos/test/chain';
import { finalize } from 'rxjs/operators';


@Component({
    selector: 'BrandResourceModal',
    templateUrl: './brand-res-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class BrandResourceModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('createOrEditModal') modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    resource: any = {};
    createInput: CreateEntityResourceInput;
    updateInput: UpdateEntityResourceInput;
    operationType = "add";
    constructor(
        injector: Injector,
        private _brandService: BrandServiceProxy,
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
            this._brandService.updateBrandResource(this.updateInput).pipe(finalize(() => {
                this.saving = false;
            })).subscribe((result) => {
                this.modalSave.emit();
                this.notify.info(this.l('success'));
                this.modal.hide();
            })
        } else {
            this.createInput = new CreateEntityResourceInput(this.resource);
            this._brandService.addBrandResource(this.createInput).pipe(finalize(() => {
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
    // upload completed event
    onUpload(event): void {
        this.resource.fileUrl = event.fileUri;
    }
    onBeforeSend(event): void {

    }

}
