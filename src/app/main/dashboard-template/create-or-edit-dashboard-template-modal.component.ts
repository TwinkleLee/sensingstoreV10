import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { CustomizeReportServiceProxy } from '@shared/service-proxies/service-proxies-smartdevice';

@Component({
    selector: 'dashboardTemplateModal',
    templateUrl: './create-or-edit-dashboard-template-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditDashboardTemplateModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    operation: string = "add";
    objItem: any = {
        reportType: 'Line',
    };

    constructor(
        injector: Injector,
        private _CustomizeReportServiceProxy: CustomizeReportServiceProxy
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
            this.objItem = {
                reportType: 'Line',
            };
        }
        this.modal.show();
    }

    onShown(): void {

    }

    save(): void {
        this.saving = true;
        console.log(this.objItem);
        // this.objItem.id = 999;
        this._CustomizeReportServiceProxy.addOrUpdateReportTemplate(this.objItem)
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
            reportType: 'Line'
        };
        this.saving = false;
        this.modal.hide();
    }

}
