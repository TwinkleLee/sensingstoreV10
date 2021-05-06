import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';
import { AppSessionService } from '@shared/common/session/app-session.service';

// import { DeviceOptServiceProxy, AddDeviceOptRecordInput, UpdateDeviceOptRecordInput } from '@shared/service-proxies/service-proxies3';
import * as moment from 'moment';
import {AddDeviceOptRecordInput, DeviceOperationsServiceProxy, OperationKnowledgeServiceProxy, UpdateDeviceOptRecordInput } from '@shared/service-proxies/service-proxies3';
import { DeviceServiceProxy as NewDeviceServiceProxy} from '@shared/service-proxies/service-proxies-devicecenter';

@Component({
    selector: 'createOrEditDeviceRecordModal',
    templateUrl: './create-or-edit-deviceRecord-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditDeviceRecordComponent extends AppComponentBase {

    @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;
    @ViewChild('SampleDatePicker',{static:true}) sampleDatePicker: ElementRef;
    @ViewChild('SampleDatePicker2',{static:true}) sampleDatePicker2: ElementRef;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    operation: string = "add";
    deviceRecord: any;
    device;


    tenants: any = [];
    devices: any = [];
    tenantId: any = "";

    deviceId = '';

    categoryId;
    categorys: any = [];
    categorysReady = false;

    optKnowledgeId;
    optKnowledges: any = [];
    optKnowledgesReady = false;


    constructor(
        injector: Injector,
        // private _deRecordService: DeviceOptServiceProxy,
        private _sessionService: AppSessionService,
        private _NewDeviceServiceProxy: NewDeviceServiceProxy,
        private _OperationsServiceProxy: DeviceOperationsServiceProxy,
        private _KnowledgeCategoryServiceProxy: OperationKnowledgeServiceProxy,

    ) {
        super(injector);
    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    optStatusChange() {
        if (this.deviceRecord.optStatus == 'Completed' && !this.deviceRecord.endTime) {
            this.deviceRecord.endTime = moment().format('YYYY/MM/DD HH:mm');
        }
    }

    show(deviceRecord?: any): void {
        if (deviceRecord) {
            this.operation = "edit";
            // this.deviceRecord = new UpdateDeviceOptRecordInput(deviceRecord);
            this.deviceRecord = new UpdateDeviceOptRecordInput(deviceRecord);

            console.log(this.deviceRecord);


            if (!this.device) {
                this.device = {
                    id: this.deviceRecord.deviceId,
                    tenantId: this.deviceRecord.tenantId
                }
                this.tenantId = this.deviceRecord.tenantId;
                this.getDevices(true);
            }


        } else {
            this.operation = "add";
            // this.initDate = moment().format('YYYY-MM-DD');

            // this.deviceRecord = new AddDeviceOptRecordInput(<any>{
            this.deviceRecord = new AddDeviceOptRecordInput(<any>{
                // deviceId: this.device ? this.device.id : '',
                // tenantId: this.device ? this.device.tenantId : '',
                // deviceName: this.device ? this.device.name : '',
                operator: this._sessionService.user.userName,
                optStatus: 'Undo'
            });
            this.deviceRecord.startTime = moment();


        }

        if (this.tenants.length > 0) {
            this.getQuestionCategories();
            this.getKnowledgeCategories();
        }




        this.active = true;

        this.modal.show();
    }

    onShown(): void {//activeäšĺ


    }
    changeTenant() {
        this.getDevices(false);
        this.getQuestionCategories(true);
    }
    getQuestionCategories(ifChangeKnowledge?) {
        this._KnowledgeCategoryServiceProxy.getQuestionCategories(this.tenantId, void 0, void 0, 999, 0).subscribe(r => {
            this.categorys = r.items;
            if (this.deviceRecord.categoryId) {
                this.categoryId = this.deviceRecord.categoryId;
            }
            this.categorysReady = true;
            if (ifChangeKnowledge) {
                this.getKnowledgeCategories();
            }
        })
    }
    getKnowledgeCategories() {
        var categoryId;
        if (this.categoryId) {
            categoryId = this.categoryId;
        } else if (this.deviceRecord.categoryId) {
            categoryId = this.deviceRecord.categoryId
        }
        this._KnowledgeCategoryServiceProxy.getOptKnowledges(this.tenantId, categoryId, void 0, void 0, 999, 0).subscribe(r => {
            this.optKnowledges = r.items;
            if (this.deviceRecord.optKnowledgeId) {
                this.optKnowledgeId = this.deviceRecord.optKnowledgeId;
            }
            this.optKnowledgesReady = true;
        })
    }

    changeoptKnowledge() {
        for (var i = 0; i < this.optKnowledges.length; i++) {
            if (this.optKnowledgeId == this.optKnowledges[i].id && !this.deviceRecord.action) {
                this.deviceRecord.action = this.optKnowledges[i].operations
            }
        }
        this.deviceRecord.optKnowledgeId = this.optKnowledgeId;
    }
    changeCategory() {
        console.log(this.categoryId)
        for (var i = 0; i < this.categorys.length; i++) {
            if (this.categoryId == this.categorys[i].id && !this.deviceRecord.question) {
                this.deviceRecord.question = this.categorys[i].name
            }
        }
        this.deviceRecord.categoryId = this.categoryId;
        this.getKnowledgeCategories();
    }
    getDevices(bol) {
        this.deviceId = "";
        this.device = {};
        this._NewDeviceServiceProxy.getDevicesForHost(
            this.tenantId,
            void 0,
            void 0,
            void 0,
            void 0,
            void 0,
            void 0,
            1000,
            0).subscribe(result => {
                console.log(result.items)
                this.devices = result.items;
                if (bol) {
                    this.deviceId = this.deviceRecord.deviceId
                    this.device = {
                        id: this.deviceRecord.deviceId,
                        tenantId: this.deviceRecord.tenantId
                    }
                }

            });
    }

    changeDevice() {
        for (var i = 0; i < this.devices.length; i++) {
            if (this.deviceId == this.devices[i].id) {
                this.device = this.devices[i]
            }
        }
    }



    save(): void {

        console.log(this.device)
        this.deviceRecord.organizationUnitId = this.device.organizationUnitId;
        this.deviceRecord.deviceId = this.device.id;
        this.deviceRecord.tenantId = this.tenantId ? this.tenantId : this.device.tenantId;


        if (this.deviceRecord.tenantId && this.tenants.length > 0) {
            for (var i = 0; i < this.tenants.length; i++) {
                if (this.deviceRecord.tenantId == this.tenants[i].id) {
                    this.deviceRecord.tenantName = this.tenants[i].name
                }
            }
        }

        this.deviceRecord.deviceName = this.device.name;
        this.deviceRecord.organizationUnitName = this.device.organizationUnitName;

        this.deviceRecord.categoryId = this.categoryId ? Number(this.categoryId) : void 0;
        this.deviceRecord.optKnowledgeId = this.optKnowledgeId ? Number(this.optKnowledgeId) : void 0;


        if (this.operation == "add") {
            console.log(this.deviceRecord.startTime, 111)
            this.deviceRecord.startTime = this.deviceRecord.startTime ? this.deviceRecord.startTime.add(-(new Date().getTimezoneOffset() / 60), 'h') : void 0;
            this.deviceRecord.endTime = this.deviceRecord.endTime ? this.deviceRecord.endTime.add(-(new Date().getTimezoneOffset() / 60), 'h') : void 0;
            if (this.tenants.length == 0) {
                this._OperationsServiceProxy.addOperationRecords([this.deviceRecord])
                    .pipe(finalize(() => { this.saving = false; }))
                    .subscribe(result => {
                        console.log(result)
                        this.notify.info(this.l('SavedSuccessfully'));
                        this.close();
                        this.modalSave.emit(null);
                    })
            } else {
                this._OperationsServiceProxy.addOperationRecords([this.deviceRecord])
                    .pipe(finalize(() => { this.saving = false; }))
                    .subscribe(result => {
                        console.log(result)
                        this.notify.info(this.l('SavedSuccessfully'));
                        this.close();
                        this.modalSave.emit(null);
                    })
            }

        } else {
            this.deviceRecord.startTime = this.deviceRecord.startTime ? this.deviceRecord.startTime.add(-(new Date().getTimezoneOffset() / 60), 'h') : void 0;
            this.deviceRecord.endTime = this.deviceRecord.endTime ? this.deviceRecord.endTime.add(-(new Date().getTimezoneOffset() / 60), 'h') : void 0;
            if (this.tenants.length == 0) {
                this._OperationsServiceProxy.updateOperationRecord(this.deviceRecord)
                    .pipe(finalize(() => { this.saving = false; }))
                    .subscribe(result => {
                        console.log(result)
                        this.notify.info(this.l('SavedSuccessfully'));
                        this.close();
                        this.modalSave.emit(null);
                    })
            } else {
                this._OperationsServiceProxy.updateOperationRecord(this.deviceRecord)
                    .pipe(finalize(() => { this.saving = false; }))
                    .subscribe(result => {
                        console.log(result)
                        this.notify.info(this.l('SavedSuccessfully'));
                        this.close();
                        this.modalSave.emit(null);
                    })
            }
        }
    }

    close(): void {
        this.active = false;
        this.deviceRecord = {};
        this.device = void 0;
        this.tenants = [];
        this.devices = [];
        this.tenantId = "";
        this.deviceId = '';
        this.categorys = [];
        this.categoryId = void 0;
        this.optKnowledges = [];
        this.optKnowledgeId = void 0;
        this.categorysReady = false;
        this.optKnowledgesReady = false;
        this.modal.hide();
    }

}
