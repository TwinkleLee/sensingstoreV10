import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked, Input } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';

import { FloorAngleResourceInput, FloorServiceProxy } from '@shared/service-proxies/service-proxies-floor'


@Component({
    selector: 'resourceModal',
    templateUrl: './resource-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditResourceModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    active = false;
    saving = false;
    resource: any = {};
    operationType = "add";
    constructor(
        injector: Injector,
        private _FloorServiceProxy: FloorServiceProxy,
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
            this.resource.floorId = id;
            this.resource.isDefault = false;
        }

        this.modal.show();
    }

    onShown(): void {
    }
    save(): void {
        this.saving = true;
        console.log(this.resource)
        this._FloorServiceProxy.addOrUpdateAngleResourcesToFloor(new FloorAngleResourceInput(this.resource))
            .pipe(finalize(() => {
                this.saving = false;
            })).subscribe((result) => {
                this.modalSave.emit();
                this.notify.info(this.l('success'));
                this.modal.hide();
            })

    }
    close(): void {
        this.active = false;
        this.modal.hide();
    }
    // upload completed event
    onUpload(event): void {
        this.resource.imageUrl = event.fileUri;
    }
    onBeforeSend(event): void {

    }
}
