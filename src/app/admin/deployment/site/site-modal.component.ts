import { Component, ViewChild, Injector, Output, Input, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { Route, ActivatedRoute } from '@angular/router'
import { IndependentDeploymentServiceProxy, AddOrUpdateIndependentDeploymentInfoInput } from '@shared/service-proxies/service-proxies';
import { from } from 'rxjs';
import * as moment from 'moment';

@Component({
    selector: 'siteModal',
    templateUrl: './site-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditSiteModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    operation: string = "add";
    objItem: any = {};
    id: any = '';
    objName: string = '';

    constructor(
        injector: Injector,
        private _ActivatedRoute: ActivatedRoute,
        private _DeploymentServiceProxy: IndependentDeploymentServiceProxy
    ) {
        super(injector);
        this._ActivatedRoute.params.subscribe(data => this.id = data.id)
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
            this.objName = objItem.host;
        } else {
            this.operation = "add";
            this.objItem = {};
            this.objItem.supportEndTime = moment().utc().endOf('day');
        }
        this.objItem.independentDeploymentId = this.id
        this.modal.show();
    }

    onShown(): void {

    }

    save(): void {
        this.saving = true;
        console.log(this.objItem);
        this.objItem.supportEndTime = this.objItem.supportEndTime ? this.objItem.supportEndTime.add(-(new Date().getTimezoneOffset() / 60), 'h') : void 0;
        if (!this.objItem.id) {
            this._DeploymentServiceProxy.addOrUpdateIndependentDeploymentInfo(new AddOrUpdateIndependentDeploymentInfoInput(this.objItem))
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(result => {
                    console.log(result)
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                })
        } else {
            this._DeploymentServiceProxy.addOrUpdateIndependentDeploymentInfo(new AddOrUpdateIndependentDeploymentInfoInput(this.objItem))
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
        this.saving = false;
        this.objName = '';
        this.modal.hide();
    }

}
