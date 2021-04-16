import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked, Input } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AdServiceProxy, AddAdResourceFileInput} from '@shared/service-proxies/service-proxies-ads';

import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';


@Component({
    selector: 'createOrEditAdResourceModal',
    templateUrl: './create-or-edit-ad-resource-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditAdResourceModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('createOrEditModal' ,{static:true}) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    @Input("editable") editable:boolean=true;
    active = false;
    saving = false;
    resource: any = {};
    createInput: AddAdResourceFileInput;
    updateInput: AddAdResourceFileInput;
    operationType = "add";
    constructor(
        injector: Injector,
        private _prodService: AdServiceProxy,
    ) {
        super(injector);
    }
    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(id, resource?): void {
        console.log(id);
        this.active = true;
        if (resource) {
            this.operationType = "edit";
            this.resource = resource;

        } else {
            this.operationType = "add";
            this.resource = {};
            this.resource.adId = id;
        }
        
        this.modal.show(); 
    }

    onShown(): void {
    }
    save(): void {
        this.saving = true;
        if (this.operationType == "edit") {
            this.updateInput = new AddAdResourceFileInput(this.resource);
            this._prodService.addorUpdateAdResource(this.updateInput).pipe(finalize(() => {
                this.saving = false;
            })).subscribe((result) => {
                this.modalSave.emit();
                this.notify.info(this.l('success'));
                this.modal.hide();
            })
        }
        else {
            if (!this.resource.resourceItemId) {
                this.message.warn(this.l('atLeastChoseOneItem') + this.l('Image'));
                return
            }
            this.createInput = new AddAdResourceFileInput(this.resource);
            this._prodService.addorUpdateAdResource(this.createInput).pipe(finalize(() => {
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
        this.resource.resourceItemId = Number(event.resourceId);
    }
    onBeforeSend(event): void {

    }
}
