import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { DeviceServiceProxy as NewDeviceServiceProxy, CreateDeviceTypeInput, UpdateDeviceTypeInput } from '@shared/service-proxies/service-proxies-devicecenter';


@Component({
    selector: 'createOrEditDevModal',
    templateUrl: './create-or-edit-deviceType-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditDevModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput', { static: true }) nameInput: ElementRef;
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;


    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    uploadUrl: string;
    uploadedFiles: any[] = [];
    operation: string = "add";
    deviceType: any;
    ToResource = true;
    createDeviceType: CreateDeviceTypeInput;
    updateDeviceType: UpdateDeviceTypeInput;


    memberedOrganizationUnits: string[];

    abilities: any = [{
        name: 'BaseMsg',
        active: true
    }, {
        name: 'Advertisement',
        active: false
    }, {
        name: 'Apps',
        active: false
    }, {
        name: 'Product',
        active: false
    }, {
        name: 'Coupon',
        active: false
    }, {
        name: 'Activities',
        active: false
    }, {
        name: 'Control',//6
        active: false
    }, {
        name: 'thirdPartyMsg',
        active: false
    }, {
        name: 'Statistics',
        active: false
    }, {
        name: 'cargoManagement',
        active: false
    }, {
        name: 'MaintainRecord',
        active: false
    }, {
        name: 'FaceData',
        active: false
    }, {
        name: 'childDevice',
        active: false
    }, {
        name: 'counter',
        active: false
    }, {
        name: 'Scheduling',
        active: false
    }];

    controlItems: any = [
        {
            name: 'screenShot',
            active: false
        }, {
            name: 'SoftwareManage',
            active: false
        }, {
            name: 'PriceTag',
            active: false
        }
    ]

    constructor(
        injector: Injector,
        private _NewDeviceServiceProxy: NewDeviceServiceProxy
    ) {
        super(injector);
        this.uploadUrl = AppConsts.remoteServiceBaseUrl + '/DemoUiComponents/UploadFiles';
    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(deviceType?: any): void {
        this.active = true;
        if (deviceType) {
            this.operation = "edit";
            this.deviceType = deviceType;
            if (this.deviceType.abilities && JSON.parse(this.deviceType.abilities) instanceof Array) {
                var abilityArr = JSON.parse(this.deviceType.abilities);
                this.abilities.forEach(item => {
                    if (abilityArr.indexOf(item.name) > -1) {
                        item.active = true;
                    } else {
                        item.active = false;
                    }
                })
            }
            if (this.deviceType.controlItems && JSON.parse(this.deviceType.controlItems) instanceof Array) {
                var controlItemsArr = JSON.parse(this.deviceType.controlItems);
                this.controlItems.forEach(item => {
                    if (controlItemsArr.indexOf(item.name) > -1) {
                        item.active = true;
                    } else {
                        item.active = false;
                    }
                })
            }
        } else {
            this.operation = "add";
            this.deviceType = {};
        }
        this.modal.show();
    }

    onShown(): void {
        if (this.nameInput) {
            $(this.nameInput.nativeElement).focus()
        }
    }

    save(): void {
        this.deviceType.abilities = JSON.stringify(this.abilities.filter(item => {
            return item.active
        }).map(item => {
            return item.name
        }));
        if (this.abilities[6].active) {
            this.deviceType.controlItems = JSON.stringify(this.controlItems.filter(item => {
                return item.active
            }).map(item => {
                return item.name
            }));
        } else {
            this.deviceType.controlItems = null;
        }

        if (this.operation == "add") {
            this.createDeviceType = new CreateDeviceTypeInput(this.deviceType);
            this._NewDeviceServiceProxy.createDeviceType(this.createDeviceType)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        } else {
            this.updateDeviceType = new UpdateDeviceTypeInput(this.deviceType);
            this._NewDeviceServiceProxy.updateDeviceType(this.updateDeviceType)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        }
    }

    close(): void {
        this.active = false;
        this.deviceType = {};
        this.modal.hide();
    }


    // upload completed event
    onUpload(result): void {
        this.deviceType.iconUrl = result.fileUri;
    }

    onBeforeSend(event): void {
    }
}
