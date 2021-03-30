import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { AppPodServiceProxy, SetDefaultAppPodVersionInput } from '@shared/service-proxies/service-proxies-devicecenter';
import { CounterDeviceServiceProxy, SensorAgreementServiceProxy, AddOrUpdateGatewayInput, AddOrUpdateSensorInput, ShelfDeviceServiceProxy, BindChildDevicesToGatewayInput } from '@shared/service-proxies/service-proxies-smartdevice';
import { DeviceServiceProxy as NewDeviceServiceProxy, CreateDeviceInput } from '@shared/service-proxies/service-proxies-devicecenter';
import { DeviceServiceProxy } from '@shared/service-proxies/service-proxies';
import { DeviceServiceProxy as DeviceProductServiceProxy } from '@shared/service-proxies/service-proxies-product';

@Component({
    selector: 'createOrEditDeviceModal',
    templateUrl: './create-or-edit-device-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditDeviceModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput', { static: true }) nameInput: ElementRef;
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;


    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    Device: any = {};
    CreateDeviceInput: CreateDeviceInput;
    memberedOrganizationUnits: string[];

    deviceTypeList: any[] = [];
    devicePeriList: any[] = [];
    onlineStoreInfo: any[] = [];
    peripheralIds: any[] = [];
    categoryIds: any[] = [];

    // Device.deviceTypeId==4
    belongGateWay: any = '';
    gatewayList: any = [];


    // Device.deviceTypeId==18
    gatewayType: any = '';
    pollingTime: any = '';
    agreementId: any = '';
    agreementList: any = [];

    // Device.deviceTypeId==19
    belongGateWay2: any = '';
    gatewayList2: any = [];
    addressCode: any = '';
    command: any = '';
    fromGatewayType = null;


    // Device.deviceTypeId==23/20
    belongGateWay3: any = '';
    gatewayList3: any = [];
    LayerThingId: any = "";
    LayerOrderNumber: any = "";
    LayerThingIdList: any = [];

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
        name: 'Control',
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
    }];

    constructor(
        injector: Injector,
        private _AppPodServiceProxy: AppPodServiceProxy,
        private _CounterDeviceServiceProxy: CounterDeviceServiceProxy,
        private _SensorAgreementServiceProxy: SensorAgreementServiceProxy,
        private _ShelfDeviceServiceProxy: ShelfDeviceServiceProxy,
        private _NewDeviceServiceProxy: NewDeviceServiceProxy,
        private _DeviceServiceProxy:DeviceServiceProxy,
        private _DeviceProductServiceProxy:DeviceProductServiceProxy

    ) {
        super(injector);
        //分类
        _NewDeviceServiceProxy.getDeviceTypeSelect().subscribe((r) => {
            this.deviceTypeList = r.items;
        })
        _DeviceProductServiceProxy.onlineStoreInfoSelect().subscribe((result) => {
            this.onlineStoreInfo = result;
        })
        //外设
        _NewDeviceServiceProxy.selectPeriperal().subscribe((result) => {
            this.devicePeriList = result;
        })



    }


    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    changeGateWay() {
        if (!this.belongGateWay2) {
            this.addressCode = undefined;
            this.fromGatewayType = undefined;
            return
        }
        this.saving = true;
        this._CounterDeviceServiceProxy.getNextSensorAddress(this.belongGateWay2).subscribe(r => {
            console.log(r)
            this.saving = false;
            this.addressCode = r.address;
            this.fromGatewayType = r.gatewayType;
        })
    }

    changeGateWay3() {

        this._ShelfDeviceServiceProxy.getSingleShelf(
            this.belongGateWay3,
        ).subscribe(result => {
            console.log("getSingleShelf", result)
            if (this.Device.deviceTypeId == 23) {
                this.LayerThingIdList = result.layers;
            } else if (this.Device.deviceTypeId == 20) {
                var LayerThingIdList = [];
                result.layers.forEach(layer => {
                    layer.cargoRoads.forEach(cargoRoad => {
                        LayerThingIdList.push(cargoRoad)
                    })
                });
                this.LayerThingIdList = LayerThingIdList;
            }
        })
    }

    changeType() {
        var ability = this.deviceTypeList.find(item => {
            return item.value == this.Device.deviceTypeId
        }).abilities
        if (ability && JSON.parse(ability) instanceof Array) {
            var abilityArr = JSON.parse(ability);
            this.abilities.forEach(item => {
                if (abilityArr.indexOf(item.name) > -1) {
                    item.active = true;
                } else {
                    item.active = false;
                }
            })
        }

        // if (this.Device.deviceTypeId == 17 || this.Device.deviceTypeId == 18) {
        //     this.Device.isSupportAccessToChildDevices = true
        // } else {
        //     this.Device.isSupportAccessToChildDevices = false
        // }
        if (this.Device.deviceTypeId == 4) {
            this._NewDeviceServiceProxy.getDevices(
                [],
                undefined,
                undefined,
                undefined,
                true,
                [17],
                undefined,
                undefined,
                undefined,
                999,
                0
            ).subscribe((result) => {
                this.gatewayList = result.items;
            })
        }
        if (this.Device.deviceTypeId == 19) {
            this._NewDeviceServiceProxy.getDevices(
                [],
                undefined,
                undefined,
                undefined,
                true,
                [18],
                undefined,
                undefined,
                undefined,
                999,
                0
            ).subscribe((result) => {
                this.gatewayList2 = result.items;
            })
        }
        if (this.Device.deviceTypeId == 23 || this.Device.deviceTypeId == 20) {
            this._NewDeviceServiceProxy.getDevices(
                [],
                undefined,
                undefined,
                undefined,
                true,
                [16],
                undefined,
                undefined,
                undefined,
                999,
                0
            ).subscribe((result) => {
                this.gatewayList3 = result.items;
            })
        }
        if ((this.Device.deviceTypeId == 18 || this.Device.deviceTypeId == 19) && AppConsts.customTheme != 'kewosi') {
            this._SensorAgreementServiceProxy.getAgreements(
                undefined,
                undefined,
                999,
                0
            ).subscribe(r => {
                this.agreementList = r.items;
            })
        }
    }
    //筛选外设
    filterPeri(event) {
        var lower_value, lower_query = event.query.toLowerCase();
        this._NewDeviceServiceProxy.selectPeriperal().subscribe((result) => {
            this.devicePeriList = result.filter((item) => {
                lower_value = item.selectValue.toLowerCase();
                return lower_value.indexOf(lower_query) + 1 > 0;
            });
        })
    }


    //同步外设列表
    assignPeri() {
        var ids = [];
        this.peripheralIds.forEach((item) => {
            ids.push(item.selectKey);
        })
        this.Device.peripheralIds = ids;
    }
    //同步分组
    assignCate() {
        var ids = [];
        this.categoryIds.forEach((item) => {
            ids.push(item.selectKey);
        })
        this.Device.categoryIds = ids;
    }
    show(): void {
        this.active = true;
        this.peripheralIds = [];
        this.Device = new CreateDeviceInput;
        // this.Device.isSupportRemoteControl = true
        this.modal.show();
    }

    onShown(): void {
        if (this.nameInput) {
            $(this.nameInput.nativeElement).focus()
        }
    }

    save(needVerify?): void {

        if (!needVerify && this.Device.deviceTypeId == 19 && this.addressCode) {
            this._CounterDeviceServiceProxy.verifySensorAddress(
                this.belongGateWay2,
                this.addressCode
            ).subscribe(r => {
                if (r) {
                    this.save(true);
                } else {
                    this.notify.error(this.l('existDuplicateAddressCode'));
                }
            })
            return
        }

        this.saving = true;
        this.Device.abilities = JSON.stringify(this.abilities.filter(item => {
            return item.active
        }).map(item => {
            return item.name
        }));

        this.CreateDeviceInput = new CreateDeviceInput(this.Device);

        this._NewDeviceServiceProxy.createDevice(this.CreateDeviceInput)
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe((res) => {
                this.notify.info(this.l('SavedSuccessfully'));

                // V3
                if (AppConsts.customTheme != 'kewosi') {
                    if (this.Device.deviceTypeId == 4 && this.belongGateWay) {
                        this.saving = true;
                        this._CounterDeviceServiceProxy.bindChildDevicesToGateway(new BindChildDevicesToGatewayInput({
                            gatewayId: this.belongGateWay,
                            deviceIds: [res.id],
                            type: undefined,
                            thingId: undefined,
                            orderNumber: undefined
                        })

                        ).pipe(finalize(() => { this.saving = false; }))
                            .subscribe(result => {
                                this.setDefaultAppPod(res)
                            })
                    } else if (this.Device.deviceTypeId == 23 && this.belongGateWay3) {
                        this.saving = true;
                        this._CounterDeviceServiceProxy.bindChildDevicesToGateway(new BindChildDevicesToGatewayInput({
                            gatewayId: this.belongGateWay3,
                            deviceIds: [res.id],
                            type: "Layer",
                            thingId: this.LayerThingId,
                            orderNumber: this.LayerOrderNumber
                        })).pipe(finalize(() => { this.saving = false; }))
                            .subscribe(result => {
                                this.setDefaultAppPod(res)
                            })
                    } else if (this.Device.deviceTypeId == 20 && this.belongGateWay3) {
                        this.saving = true;
                        this._CounterDeviceServiceProxy.bindChildDevicesToGateway(new BindChildDevicesToGatewayInput({
                            gatewayId: this.belongGateWay3,
                            deviceIds: [res.id],
                            type: "CargoRoad",
                            thingId: this.LayerThingId,
                            orderNumber: undefined
                        })).pipe(finalize(() => { this.saving = false; }))
                            .subscribe(result => {
                                this.setDefaultAppPod(res)
                            })
                    } else if (this.Device.deviceTypeId == 18) {
                        this.saving = true;
                        this._CounterDeviceServiceProxy.addOrUpdateGatewayInfo(new AddOrUpdateGatewayInput({
                            // id: undefined,
                            deviceId: res.id,
                            agreementId: this.agreementId,
                            gatewayType: this.gatewayType,
                            pollingTime: this.pollingTime
                        })).pipe(finalize(() => { this.saving = false; }))
                            .subscribe(result => {
                                this.setDefaultAppPod(res)
                            })
                    } else if (this.Device.deviceTypeId == 19) {
                        this.saving = true;
                        this._CounterDeviceServiceProxy.addOrUpdateSensorInfo(new AddOrUpdateSensorInput({
                            // id: undefined,
                            gatewayId: this.belongGateWay2,
                            deviceId: res.id,
                            address: this.addressCode,
                            command: this.command,
                            agreementId: this.agreementId
                        })).pipe(finalize(() => { this.saving = false; }))
                            .subscribe(result => {
                                this.setDefaultAppPod(res)
                            })
                    } else {
                        this.setDefaultAppPod(res)
                    }
                } else {
                    this.saving = true;
                    this.close();
                    this.modalSave.emit(null);
                }

            });
    }

    setDefaultAppPod(res) {
        this.saving = true;
        this._AppPodServiceProxy.setDefaultAppPodVersion4Device(new SetDefaultAppPodVersionInput({
            deviceId: res.id,
            osType: this.Device.osType
        })).pipe(finalize(() => { this.saving = false; }))
            .subscribe(result => {
                this.close();
                this.modalSave.emit(null);
            })
    }

    close(): void {
        this.active = false;
        this.CreateDeviceInput = null;

        // Device.deviceTypeId==4
        this.belongGateWay = '';
        this.gatewayList = [];
        // Device.deviceTypeId==18
        this.gatewayType = '';
        this.pollingTime = '';
        this.agreementId = '';
        this.agreementList = [];
        // Device.deviceTypeId==19
        this.belongGateWay2 = '';
        this.gatewayList2 = [];
        this.addressCode = '';
        this.command = '';
        this.fromGatewayType = null;

        // Device.deviceTypeId==23/20
        this.belongGateWay3 = '';
        this.gatewayList3 = [];
        this.LayerThingId = "";
        this.LayerOrderNumber = "";
        this.LayerThingIdList = [];

        this.saving = false;
        this.modal.hide();
    }
    getPeri() {
        this._NewDeviceServiceProxy.selectPeriperal().subscribe((result) => {
            this.devicePeriList = result;
        })
    }

    // upload completed event
    onUpload(result): void {
        this.Device.resourceItemId = Number(result.resourceId);
    }

    onBeforeSend(event): void {

    }
}
