import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';

import { AppPodServiceProxy } from '@shared/service-proxies/service-proxies-devicecenter';

@Component({
    selector: 'createOrEditApppodModal',
    templateUrl: './create-or-edit-apppod-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditApppodModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    active = false;
    saving = false;
    operation: string = "add";
    metaType: any;
    modalLoading = false;
    latestVersion;

    memberedOrganizationUnits: string[];

    constructor(
        injector: Injector,
        private _AppPodServiceProxy: AppPodServiceProxy

    ) {
        super(injector);
    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(id, metaType?: any): void {
        this.active = true;

        if (metaType) {
            this.operation = "edit";
            this.metaType = metaType;
            this.metaType.appPodId = id;

        } else {
            this.operation = "add";
            this.metaType = {};
            this.metaType.appPodId = id;
            this.modalLoading = true;
            this._AppPodServiceProxy.getAppPodLatestVersionDetail(id).subscribe(r => {
                this.latestVersion = r.version;
                this.metaType.appSetting = r.appSetting;
                this.modalLoading = false;
            })
        }

        this.modal.show();
    }

    onShown(): void {

    }

    save(): void {

        if (!this.checkJson(this.metaType.appSetting)) {
            return
        }

        this.saving = true;
        if (this.operation == "add") {

            var a = this.latestVersion.split('.');
            var b = this.metaType.version.split('.');
            if ((a[0] < b[0]) || (a[0] == b[0] && a[1] < b[1]) || (a[0] == b[0] && a[1] == b[1] && a[2] < b[2]) || (a[0] == b[0] && a[1] == b[1] && a[2] == b[2] && a[3] < b[3])) {
                this._AppPodServiceProxy.createAppPodVersion(this.metaType)
                    .pipe(finalize(() => { this.saving = false; }))
                    .subscribe(result => {
                        console.log(result)
                        this.notify.info(this.l('SavedSuccessfully'));
                        this.close();
                        this.modalSave.emit(null);
                    })
            } else {
                this.message.warn(this.l('versionMustHigher'))
                this.saving = false;
            }

        } else {
            console.log(this.metaType);
            this._AppPodServiceProxy.updateAppPodVersion(this.metaType)
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
        this.metaType = {};
        this.saving = false;
        this.modal.hide();
    }
}
