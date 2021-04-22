import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AuditUserAppointmentInput, UserAppointmentServiceProxy } from '@shared/service-proxies/service-proxies-pager';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
@Component({
    selector: 'appointmentModal',
    templateUrl: './appointment-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditAppointmentModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    operation: string = "add";
    objItem: any = {};

    constructor(
        injector: Injector,
        private _UserAppointmentServiceProxy: UserAppointmentServiceProxy
    ) {
        super(injector);
    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        // $('tabset ul.nav').addClass('m-tabs-line');
        // $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(objItem?: any): void {
        this.active = true;
        if (objItem) {
            this.operation = "edit";
            this.objItem = objItem;
        } else {
            this.operation = "add";
            this.objItem = {};
        }
        this.modal.show();
    }

    onShown(): void {

    }

    save(): void {
        this.saving = true;
        console.log(this.objItem);
        this._UserAppointmentServiceProxy.auditAppointment(47, new AuditUserAppointmentInput({
            userAppointmentId: void 0,
            targetStatus: void 0,
        }))
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe(result => {
                console.log(result)
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
            })
    }

    close(): void {
        this.active = false;
        this.objItem = {
            parameters: {},
            from: ""
        };
        this.saving = false;
        this.modal.hide();
    }

}
