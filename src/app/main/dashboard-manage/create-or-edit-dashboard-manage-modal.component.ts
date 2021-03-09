import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked, ViewChildren } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { ReportServiceProxy, ReportDataInput, AddOrUpdateReportInput } from '@shared/service-proxies/service-proxies-cargo';
import { DeviceServiceProxy as NewDeviceServiceProxy} from '@shared/service-proxies/service-proxies-devicecenter';

@Component({
    selector: 'dashboardManageModal',
    templateUrl: './create-or-edit-dashboard-manage-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditDashboardManageModalComponent extends AppComponentBase implements AfterViewChecked {
    @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;
    @ViewChild('createOrEditmodal1',{static:true}) modal1: ModalDirective;
    @ViewChild('createOrEditmodal2',{static:true}) modal2: ModalDirective;
    @ViewChild('highTree1',{static:false}) highTree1;
    @ViewChild('highTree2',{static:false}) highTree2;


    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    operation: string = "add";
    tenantList = [];
    templateList = [];
    dataElementList = [];


    selectedTemplate;
    selectedData;
    objItem: any = {
        reportDataType: 0,
    };

    deviceList = [];
    counterList = [];
    showTree1 = false;
    showTree2 = false;

    constructor(
        injector: Injector,
        private _ReportServiceProxy: ReportServiceProxy,
        private _NewDeviceServiceProxy: NewDeviceServiceProxy
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
            this.dataElementList = objItem.reportDatas.map(item => {
                var obj: any = {
                    deviceNameList: "",
                    counterNameList: ""
                };
                obj.counterTags = item.counterTags.map(tag => {
                    obj.counterNameList += tag.value + ' ';
                    return tag.tagId
                })
                obj.deviceIds = item.deviceInfos.map(device => {
                    obj.deviceNameList += device.deviceName + ' ';
                    return device.id
                })
                obj.name = item.name;
                obj.calculateType = item.calculateType;
                return obj
            });
            this.objItem = objItem;
            this.changeTenant(this.objItem.tenantId, true);
        } else {
            this.operation = "add";
            this.objItem = {
                reportDataType: 0,
            };
        }
        this.modal.show();
    }

    onShown(): void {

    }

    addDataElement() {
        this.dataElementList.push({
            "name": "",
            "calculateType": "0",
            "counterTags": [],
            "deviceIds": []
        })
    }
    deleteData(index) {
        this.dataElementList.splice(index, 1);
    }

    save(): void {
        this.saving = true;
        // this.objItem.reportDataInput = this.dataElementList;
        this.objItem.reportDataInput = this.dataElementList.map(item => {
            return new ReportDataInput(item)
        });


        // var obj2 = this.objItem;
        var obj3 = Object.assign({}, this.objItem)//来自get的类不包含reportDataInput,因此会stringify时会丢失

        // console.log(obj2)
        // console.log(obj3)
        // console.log(JSON.stringify(obj2))
        // console.log(JSON.stringify(obj3))


        // this._ReportServiceProxy.addOrUpdateReport(this.objItem as AddOrUpdateReportInput)
        this._ReportServiceProxy.addOrUpdateReport(obj3 as AddOrUpdateReportInput)
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
            reportDataType: 0
        };
        this.saving = false;
        this.modal.hide();
    }


    changeTemplate(e) {
        this.templateList.forEach(item => {
            if (item.id == e) {
                this.selectedTemplate = item;
                this.objItem.multiToOneName = item.multiToOneName;
            }
        })
    }
    changeTenant(e, notClear?) {
        this._NewDeviceServiceProxy.getDevicesForHost(
            e,
            [4],
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            999,
            0
        ).subscribe(r => {
            this.deviceList = r.items;
            if (!notClear) {
                this.dataElementList = [];
                this.addDataElement();
            }
            console.log(this.dataElementList, 'dataElementList')
        })
    }

    selectDevice(data) {
        this.selectedData = data;
        this.modal1.show();
        this.showTree1 = false;
        setTimeout(() => {
            this.showTree1 = true;
        })
    }
    onTreeUpdate1(e) {
        this.selectedData.deviceIds = e.map(item => {
            return item.id
        })
        this.selectedData.deviceNameList = this.highTree1.storeText;
        this.modal1.hide();

        this.selectedData.counterList = [];
        this.selectedData.counterNameList = "";
    }
    selectCounter(data) {
        this.selectedData = data;
        this._ReportServiceProxy.getCounterTagsByDeviceIds(data.deviceIds).subscribe(r => {
            console.log(r)
            this.counterList = r;
            this.modal2.show();
            this.showTree2 = false;
            setTimeout(() => {
                this.showTree2 = true;
            })
        })


    }
    onTreeUpdate2(e) {
        this.selectedData.counterTags = e.map(item => {
            return item.id
        })
        this.selectedData.counterNameList = this.highTree2.storeText;
        this.modal2.hide();
    }
}
