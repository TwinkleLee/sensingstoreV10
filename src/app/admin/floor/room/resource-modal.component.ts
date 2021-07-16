import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked, Input } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';

import { RoomAngleLocationResourceInput, RoomServiceProxy } from '@shared/service-proxies/service-proxies-floor'


@Component({
    selector: 'roomResourceModal',
    templateUrl: './resource-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditRoomResourceModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    active = false;
    saving = false;
    resource: any = {};
    operationType = "add";
    constructor(
        injector: Injector,
        private _RoomServiceProxy: RoomServiceProxy,
    ) {
        super(injector);
    }
    ngAfterViewChecked(): void {

    }

    show(id, resource?): void {
        this.active = true;
        if (resource) {
            this.operationType = "edit";
            this.resource = resource;

        } else {
            this.operationType = "add";
            this.resource = {};
            this.resource.roomId = id;
        }

        this.modal.show();
    }

    onShown(): void {
    }
    save(): void {
        this.saving = true;
        this._RoomServiceProxy.addOrUpdateAngleLocationResourcesToRoom(new RoomAngleLocationResourceInput(this.resource))
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
        this.resource.logoUrl = event.fileUri;
    }
    onBeforeSend(event): void {

    }
}
