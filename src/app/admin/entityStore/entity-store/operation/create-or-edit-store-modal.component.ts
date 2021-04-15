import { Component, ViewChild, Injector, Output, Input, EventEmitter, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';

import * as moment from 'moment';
import { finalize } from 'rxjs/operators';
import { MyMapComponent } from '@app/shared/common/map/my-map.component';

import { RoomServiceProxy, UpdateRoomListInput, UpdateRoomDto } from '@shared/service-proxies/service-proxies-floor'

import { StoreServiceProxy as NewStoreServiceProxy, CreateStoreInput, UpdateStoreInput, PositionDto } from '@shared/service-proxies/service-proxies-devicecenter';

@Component({
    selector: 'createOrEditStoreModal',
    templateUrl: './create-or-edit-store-modal.component.html'
})
export class CreateOrEditStoreModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: false }) modal: ModalDirective;
    @ViewChild('organizationUnitDisplayName', { static: true }) organizationUnitDisplayNameInput: ElementRef;
    @ViewChild('map', { static: false }) map: MyMapComponent;
    @Output() modalSave: EventEmitter<any> = new EventEmitter();
    @Input() buildingList: any;

    @Input() brandList: any;

    active = false;
    saving = false;
    checkBoxShow = false;
    outypeList: any[] = [];
    openingTime: string = "07:00";
    closedTime: string = "23:00";
    organizationUnit: any = {
        'position': {},
        'storeId': ''
    };
    _oldPosition: string = "";
    TypeIdStore;
    onShowBool = false;
    showBusy = false;

    buildingId: any = '';
    rooms: any = [];
    lastRooms: any = [];
    roomSuggestions: any = [];

    constructor(
        injector: Injector,
        private _NewStoreServiceProxy: NewStoreServiceProxy,
        private _changeDetector: ChangeDetectorRef,
        private _roomServiceProxy: RoomServiceProxy
    ) {
        super(injector);
    }

    ngOnDestroy() {

    }

    onShown(): void {

    }

    // 更新room
    updateRoomList(store) {

        let obj = {}

        let ary = []

        this.lastRooms.concat(this.rooms).reduce(function (item, next) {
            obj[next.id] ? '' : obj[next.id] = true && item.push(next);
            return item;
        }, []).forEach(item => {
            if (this.rooms.find(i => item.id == i.id)) {
            } else {
                ary.push(item)
            }
        })

        console.log(ary);

        var input: any = this.rooms.map(room => new UpdateRoomDto({
            id: room.id,
            storeId: store.storeId,
            storeName: store.displayName,
            brandName: store.brandId ? this.brandList.find(i => i.id == store.brandId).name : "",
            brandLogo: store.brandId ? this.brandList.find(i => i.id == store.brandId).logoUrl : ""
        }));

        input = input.concat(ary.map(item => new UpdateRoomDto({
            id: item.id,
            storeId: void 0,
            storeName: void 0,
            brandName: void 0,
            brandLogo: void 0
        })))
        this._roomServiceProxy.updateRoomList(new UpdateRoomListInput({ "updateRoomDtos": input })).subscribe(r => { })
    }

    show(organizationUnit?: any): void {
        this.rooms = [];
        this.lastRooms = [];
        if (organizationUnit) {
            this.showBusy = true;
            this._NewStoreServiceProxy.getStoreById(organizationUnit.storeId).subscribe((r) => {
                this.organizationUnit = r;
                this.organizationUnit.position = this.organizationUnit.position ? this.organizationUnit.position : {};
                if (this.organizationUnit.closedTime) {
                    var closedTime = moment(this.organizationUnit.closedTime).format("HH:mm");
                    this.closedTime = closedTime;
                }
                if (this.organizationUnit.openingTime) {
                    var openingTime = moment(this.organizationUnit.openingTime).format("HH:mm");
                    this.openingTime = openingTime;
                }

                this.onShowBool = true;
                this.showBusy = false;
            })

            // getRoom -> building -> floor 
            var ids = JSON.parse(organizationUnit.roomIds) || [];

            // 回显  楼，房间
            if (ids.length != 0) {
                this._roomServiceProxy.getRoomDetailsById(ids[0])
                    .subscribe(r => {
                        this.buildingId = this.buildingList.find(i => i.id == r.floor.buildingId).id;
                        this._roomServiceProxy.getRooms4Select(r.floor.buildingId, void 0, 'store', void 0)
                            .subscribe(result => {
                                ids.forEach(item => {
                                    var singleRoom: any = result.find(o => o.id == item)
                                    console.log(singleRoom);
                                    this.rooms.push({
                                        'id': singleRoom.id,
                                        'value': singleRoom.name
                                    });

                                });

                                this.lastRooms.concat(this.rooms)

                                this.modal.show();
                                this.active = true;
                                this._changeDetector.detectChanges();
                            })
                    })
            } else {
                this.modal.show();
                this.active = true;
                this._changeDetector.detectChanges();
            }

        } else {
            this.organizationUnit = {
                'position': {}
            };

            this.onShowBool = true;
            this.modal.show();
            this.active = true;
            this._changeDetector.detectChanges();
        }

    }

    save(): void {
        if (!this.organizationUnit.storeId) {
            this.createUnit();
        } else {
            this.updateUnit();
        }

    }

    createUnit() {
        var temp: any = [];
        this.rooms.forEach(i => {
            temp.push(i.id);
        });
        this.organizationUnit.roomIds = JSON.stringify(temp);

        console.log(this.organizationUnit.roomIds)
        this.organizationUnit.openingTime = moment(`2017-12-31T${this.openingTime}:00.000Z`);
        this.organizationUnit.closedTime = moment(`2017-12-31T${this.closedTime}:00.000Z`);
        this.organizationUnit.position = new PositionDto(this.organizationUnit.position);
        const createInput = new CreateStoreInput(this.organizationUnit);
        this.saving = true;

        if (window['BMap'].Geocoder) {
            var myGeo = new window['BMap'].Geocoder();
            myGeo.getPoint(this.organizationUnit.position.location, (point) => {
                if (point) {
                    this.organizationUnit.position.longitude = point.lng;
                    this.organizationUnit.position.latitude = point.lat;
                }
                this._NewStoreServiceProxy
                    .createStore(createInput)
                    .pipe(finalize(() => { this.saving = false }))
                    .subscribe((result) => {
                        console.log(result);

                        this.updateRoomList(result);

                        this.notify.info(this.l('SavedSuccessfully'));
                        this.modalSave.emit();
                        this.close();
                    });
            }, this.organizationUnit.position.city);
        } else {
            this._NewStoreServiceProxy
                .createStore(createInput)
                .pipe(finalize(() => { this.saving = false }))
                .subscribe((result) => {
                    console.log(result);

                    this.updateRoomList(result);

                    this.notify.info(this.l('SavedSuccessfully'));
                    this.modalSave.emit();
                    this.close();
                });
        }

    }

    updateUnit() {
        var temp: any = [];
        this.rooms.forEach(i => {
            temp.push(i.id);
        });
        this.organizationUnit.roomIds = JSON.stringify(temp);
        this.organizationUnit.openingTime = moment(`2017-12-31T${this.openingTime}:00.000Z`);
        this.organizationUnit.closedTime = moment(`2017-12-31T${this.closedTime}:00.000Z`);
        this.organizationUnit.position = new PositionDto(this.organizationUnit.position);
        this.organizationUnit.id = this.organizationUnit.storeId;
        const updateInput = new UpdateStoreInput(this.organizationUnit);
        this.saving = true;


        // var myGeo = new window['BMap'].Geocoder();
        // myGeo.getPoint(this.organizationUnit.position.location, (point) => {
        //     if (point) {
        //         this.organizationUnit.position.longitude = point.lng;
        //         this.organizationUnit.position.latitude = point.lat;
        //     }

        // }, this.organizationUnit.position.city);

        if (window['BMap'].Geocoder) {
            var myGeo = new window['BMap'].Geocoder();
            myGeo.getPoint(this.organizationUnit.position.location, (point) => {
                if (point) {
                    this.organizationUnit.position.longitude = point.lng;
                    this.organizationUnit.position.latitude = point.lat;
                }
                this._NewStoreServiceProxy
                    .updateStore(updateInput)
                    .pipe(finalize(() => { this.saving = false }))
                    .subscribe((result) => {
                        console.log(result);
                        this.updateRoomList(result);
                        this.notify.info(this.l('SavedSuccessfully'));
                        this.modalSave.emit();
                        this.close();
                    });
            }, this.organizationUnit.position.city);
        } else {
            this._NewStoreServiceProxy
                .updateStore(updateInput)
                .pipe(finalize(() => { this.saving = false }))
                .subscribe((result) => {
                    console.log(result);
                    this.updateRoomList(result);
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.modalSave.emit();
                    this.close();
                });
        }
    }

    close(): void {
        this.rooms = [];
        this.roomSuggestions = [];
        this.buildingId = '';
        this.organizationUnit = {
            'position': {}
        };
        this.modal.hide();
        this.active = false;
    }
    showMap(e?: Event) {
        e && e.preventDefault();
        //仍是旧地址
        if (JSON.stringify(this.organizationUnit.position || {}) == this._oldPosition) {
            if (this.map.visible) {
                this.map.hide();
            } else {
                this.map.show();
            }
        } else {
            this.map.render(false, '500px');
            this._oldPosition = JSON.stringify(this.organizationUnit.position || {});
            this.map.show();
        }
    }
    getPointer(e) {

    }
    mapClick(e) {

    }

    buildingChang() {
        this.rooms = [];
        console.log(this.buildingId);
    }


    assignRoom() {
    }
    roomFilter(event) {
        console.log(this.buildingId);

        this._roomServiceProxy.getRooms4Select(
            this.buildingId,
            void 0,
            'store',
            event.query
        ).subscribe((result) => {
            this.roomSuggestions = (result || []).map((item) => {
                return {
                    'id': item.id,
                    'value': item.name
                }
            })
        })
    }
}
