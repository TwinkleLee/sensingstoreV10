import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { MarketingServiceProxy } from '@shared/service-proxies/service-proxies-pager';

@Component({
    selector: 'applicationModal',
    templateUrl: './create-or-edit-application-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditApplicationModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    operation: string = "add";
    objItem: any = {};

    constructor(
        injector: Injector,
        private _ApplicationServiceProxy: MarketingServiceProxy
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
        if (this.operation == "add") {
            this._ApplicationServiceProxy.createApplication(this.objItem)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(result => {
                    console.log(result)
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                })
        } else {
            this._ApplicationServiceProxy.updateApplication(this.objItem)
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
        this.objItem = {
            parameters: {},
            from: ""
        };
        this.saving = false;
        this.modal.hide();
    }

}
