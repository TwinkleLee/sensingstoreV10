import { Component, ViewChild, Injector, Output, Input, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { Route, ActivatedRoute } from '@angular/router'
import { IndependentDeploymentServiceProxy, AddOrUpdateIndependentDeploymentInfoInput, AddOrUpdateDeployedTenant } from '@shared/service-proxies/service-proxies';
import { from } from 'rxjs';

@Component({
    selector: 'tenancyModal',
    templateUrl: './tenancy-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditTenancyModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    operation: string = "add";
    objItem: any = {};
    tenantId: any = '';
    deploymentId: any = '';
    objName: string = '';
    constructor(
        injector: Injector,
        private _ActivatedRoute: ActivatedRoute,
        private _DeploymentServiceProxy: IndependentDeploymentServiceProxy
    ) {
        super(injector);
        this._ActivatedRoute.params.subscribe(data => {
            this.deploymentId = data.id
            this.tenantId = data.sId
        })
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
            this.objName = objItem.tenancyName;
        } else {
            this.operation = "add";
            this.objItem = {};
        }
        this.objItem.independentDeploymentInfoId = this.deploymentId
        this.objItem.tenantId = this.tenantId
        this.modal.show();
    }

    onShown(): void {

    }

    save(): void {
        this.saving = true;
        console.log(this.objItem);
        this.objItem.supportEndTime = this.objItem.supportEndTime ? this.objItem.supportEndTime.add(-(new Date().getTimezoneOffset() / 60), 'h') : void 0;
        if (!this.objItem.id) {
            this._DeploymentServiceProxy.addOrUpdateDeployedTenant(new AddOrUpdateDeployedTenant(this.objItem))
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(result => {
                    console.log(result)
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                })
        } else {
            this._DeploymentServiceProxy.addOrUpdateDeployedTenant(new AddOrUpdateDeployedTenant(this.objItem))
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(result => {
                    console.log(result)
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                })
        }
    }

    close(): void {
        this.active = false;
        this.objItem = {};
        this.objName = '';
        this.saving = false;
        this.modal.hide();
    }

}