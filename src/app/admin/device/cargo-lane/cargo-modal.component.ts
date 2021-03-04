import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';
import { CargoRoadServiceProxy, CreateCargoRoadsInput, CreateCargoThingInput } from '@shared/service-proxies/service-proxies-cargo';
import { ProductAlertModalComponent } from '@app/admin/device/device-list/tabAlert/product-selection-modal.component';
import * as _ from 'lodash';

@Component({
    selector: 'CargoModal',
    templateUrl: './cargo-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CargoModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput', { static: true }) nameInput: ElementRef;
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('TypeCombobox', { static: true }) typeComboboxElement: ElementRef;

    @ViewChild('ProductAlertModal', { static: true }) ProductAlertModal: ProductAlertModalComponent;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    operation: string = "add";
    Personality: any = {};
    CreateCargoRoadsInput: CreateCargoRoadsInput;
    deviceId;
    nowSelectedItem: any;

    constructor(
        injector: Injector,
        private _CargoRoadServiceProxy: CargoRoadServiceProxy
    ) {
        super(injector);
    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }



    show(Personality?: any): void {
        console.log('Personality', Personality)
        Personality = _.cloneDeep(Personality);
        this.active = true;
        if (Personality) {
            this.operation = "edit";
            this.Personality = Object.assign({}, Personality);
            if (this.Personality.cargoThings && !this.Personality.cargoThings.length) {
                this.Personality.cargoThings.push(new CreateCargoThingInput())
                this.Personality.cargoThings[0].type = "1";
                this.Personality.cargoThings[0].stock = 1;
                this.Personality.cargoThings[0].orderNumber = 0;
            }
        } else {
            this.operation = "add";
            this.Personality = new CreateCargoRoadsInput();
            // this.Personality.type = "1";
            this.Personality.cargoType = "0";
            this.Personality.deviceId = this.deviceId;
            this.Personality.isEnabled = true;

            //创建时给予一个默认货物
            this.Personality.cargoThings = [];
            this.Personality.cargoThings.push(new CreateCargoThingInput())
            this.Personality.cargoThings[0].type = "2";
            this.Personality.cargoThings[0].stock = 1;
            this.Personality.cargoThings[0].orderNumber = 0;
        }
        this.modal.show();
    }

    onShown(): void {

    }

    setCargo(item) {
        this.nowSelectedItem = item;
        this.ProductAlertModal.cargoType = item.type;
        this.ProductAlertModal.show(this.deviceId);
    }

    changeType(item) {
        console.log(item)
        item.thingId = "";
        item.thingName = "";
    }

    changeCargo(record) {
        if (record.selection.length == 0) return

        this.nowSelectedItem.thingId = "";
        this.nowSelectedItem.thingName = "";

        if (this.nowSelectedItem.type == 0) {//商品

            if (this.Personality.cargoThings.some(item => {
                return item.type == 0 && item.thingId == record.selection[0].id
            })) {
                this.notify.warn(this.l('ExistRepeatedCargoThing'));
                return
            }

            this.nowSelectedItem.thingId = record.selection[0].id;
            this.nowSelectedItem.thingName = record.selection[0].title;
        }
        if (this.nowSelectedItem.type == 1) {//sku
            console.log(record)
            if (this.Personality.cargoThings.some(item => {
                return item.type == 1 && item.thingId == record.selection[0].id
            })) {
                this.notify.warn(this.l('ExistRepeatedCargoThing'));
                return
            }

            this.nowSelectedItem.thingId = record.selection[0].id;
            this.nowSelectedItem.thingName = record.selection[0].title;
        }
        if (this.nowSelectedItem.type == 2) {//奖品
            if (this.Personality.cargoThings.some(item => {
                return item.type == 2 && item.thingId == record.selection[0].awardId
            })) {
                this.notify.warn(this.l('ExistRepeatedCargoThing'));
                return
            }
            this.nowSelectedItem.thingId = record.selection[0].awardId;
            this.nowSelectedItem.thingName = record.selection[0].awardName;
        }





    }
    save(): void {
        console.log(this.Personality.cargoThings);

        if (this.Personality.cargoType == '0' && this.Personality.cargoThings.length > 1) {
            this.message.warn(this.l('OrderCargoOnlyOneThing'))
            return
        }

        if (this.Personality.cargoThings.some(item => {
            return (!item.thingId || (!item.orderNumber) && item.orderNumber != 0)
        })) {
            this.message.warn(this.l('ExistUncompletedCargo'))
            return
        }

        this.Personality.cargoThings = this.Personality.cargoThings.sort((a, b) => {
            return a.orderNumber - b.orderNumber
        })




        if (this.Personality.cargoThings.length) {
            var stockSum = this.Personality.cargoThings[0].stock;//stock总量
            // var orderRepeat = false;//检测重复orderNumber
            for (var i = 1; i < this.Personality.cargoThings.length; i++) {
                // if (this.Personality.cargoThings[i].orderNumber == this.Personality.cargoThings[i - 1].orderNumber) {
                //     orderRepeat = true;
                // }
                stockSum += this.Personality.cargoThings[i].stock;
            }

            if (stockSum > this.Personality.stockCapacity) {
                this.message.warn(this.l('StockOverCapacity'))
                return
            }

            // if (orderRepeat) {
            //     this.message.warn(this.l('ExistRepeatedOrder'))
            //     return
            // }
        }






        this.saving = true;
        if (this.operation == "add") {
            this._CargoRoadServiceProxy.createCargoRoad(this.Personality)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(() => {
                    this.modalSave.emit(null);
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                });
        } else {
            this._CargoRoadServiceProxy.updateCargoRoad(this.Personality)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(() => {
                    this.modalSave.emit(null);
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                });
        }
    }

    close(): void {
        this.active = false;
        this.saving = false;
        this.modal.hide();
    }
    logoOnUpload(result): void {
        this.Personality.iconUrl = result.fileUri;
    }


    deleteThing(i) {
        this.Personality.cargoThings.splice(i, 1);
    }

    addThing() {
        var newInput = new CreateCargoThingInput()
        this.Personality.cargoThings.push(newInput)
        this.Personality.cargoThings[this.Personality.cargoThings.length - 1].type = "2";
        this.Personality.cargoThings[this.Personality.cargoThings.length - 1].stock = 1;
        this.Personality.cargoThings[this.Personality.cargoThings.length - 1].orderNumber = this.Personality.cargoThings.length - 1;
    }

}
