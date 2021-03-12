import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { SoftwareServiceProxy, AuthorizeSoftwareInput, TenantServiceProxy, UpdateAuthorizeSoftwareInput } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'SoftwareAuth',
    templateUrl: './software-auth.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class SoftwareAuthComponent extends AppComponentBase {

    saving = false;
    auth: any;
    active = false;
    appList: any = [];
    tenantList: any[] = [];
    isquick = false;
    isUpdate = false;
    tenant: any = {};
    @ViewChild('createAppModal',{static:true}) modal: ModalDirective;
    // @ViewChild("dateranger") dateranger: DateRangePickerComponent;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    constructor(
        injector: Injector,
        private _appService: SoftwareServiceProxy,
        private router: Router,
        private _tenantService: TenantServiceProxy

    ) {
        super(injector);
        _appService.getSoftwares4Dropdownlist().subscribe((result) => {
            this.appList = result;
        })
    }

    filterTenant(e) {
        this._tenantService.getTenants(e.query, undefined, undefined, undefined, undefined, undefined, undefined, 'name', 100, 0).subscribe((result) => {
            this.tenantList = result.items;
        })
    }
    show(record?): void {
        this.active = true;
        this.isUpdate = record.id != undefined;
        if (this.isUpdate) {
            this.auth = record;
            this.tenant = {
                'id': record.tenantId,
                'name': record.tenantName
            }
        } else {
            this.auth = new AuthorizeSoftwareInput();
            // setTimeout(() => {
            //     this.dateranger.refresh();
            // }, 0);
            if (record.softwareId != undefined) {
                this.isquick = true;
                this.auth = record;
            } else {
                this.isquick = false;
            }
        }
        this.auth.startTime = moment().utc().startOf('day').add((new Date().getTimezoneOffset() / 60), 'h');
        this.auth.endTime = moment().utc().add(365, 'days').endOf('day').add((new Date().getTimezoneOffset() / 60), 'h');
        this.modal.show();
    }

    onShown(): void {

    }
    save(): void {
        this.saving = true;
        this.auth.tenantId = this.tenant.id;
        var input;
        if (this.isUpdate) {
            input = new UpdateAuthorizeSoftwareInput(this.auth);
            this._appService.updateAuthorizedSoftware(input).pipe(finalize(() => {
                this.saving = false;
            })).subscribe((result) => {
                this.notify.info(this.l('success'));
                this.modal.hide();
                this.modalSave.emit();
            })
        } else {
            input = new AuthorizeSoftwareInput(this.auth);
            this._appService.authorizeToTenant(input).pipe(finalize(() => {
                this.saving = false;
            })).subscribe((result) => {
                this.notify.info(this.l('success'));
                this.modal.hide();
                this.modalSave.emit();
            })
        }
    }
    close(): void {
        this.active = false;
        this.modal.hide();
    }

}
