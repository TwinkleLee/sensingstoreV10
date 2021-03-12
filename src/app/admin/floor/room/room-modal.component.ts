import { Component, ViewChild, Injector, Output, Input, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { RoomServiceProxy, CreateRoomInput, UpdateRoomInput, FloorServiceProxy } from '@shared/service-proxies/service-proxies-floor';
import { Table } from 'primeng/table';
import { CreateOrEditRoomResourceModalComponent } from './resource-modal.component';

@Component({
    selector: 'roomModal',
    templateUrl: './room-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditRoomModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    @Input("buildingList") buildingList: any = [];
    @Input("initBuildingId") initBuildingId: any = "";
    @Input("initFloorId") initFloorId: any = "";
    @ViewChild('dataTable', { static: false }) dataTable: Table;
    @ViewChild('roomResourceModal', { static: false }) roomResourceModal: CreateOrEditRoomResourceModalComponent;

    active = false;
    saving = false;

    operation: string = "add";
    objItem: any = {};
    buildingId: any = "";
    floorList: any = [];


    angleList: any = [];


    roomTypeList = ["store", "path", "toilet", "elevator", "staircase", "escalator", "exit", "children", "disabled", "maternal", "reception", "smoking"];

    constructor(
        injector: Injector,
        private _RoomServiceProxy: RoomServiceProxy,
        private _FloorServiceProxy: FloorServiceProxy
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
        console.log("objItem", objItem)
        if (objItem) {
            this.operation = "edit";
            this.objItem = objItem;
            if (objItem.buildingID) {
                this.buildingId = objItem.buildingID;
            }
        } else {
            this.operation = "add";
            this.buildingId = this.initBuildingId;
            this.objItem = {
                roomType: "store",
                floorId: this.initFloorId,
            };
        }
        this.getFloors();
        this.modal.show();
    }

    getResByRoomId() {
        this._RoomServiceProxy.getRoomAngleLocationResources(
            this.objItem.id,
            "",
            undefined,
            999,
            0
        ).subscribe(result => {
            console.log(result)
            this.angleList = result.items;
        })
    }

    createAngle() {
        this.roomResourceModal.show(this.objItem.id);
    }

    editAngle(record) {
        this.roomResourceModal.show(this.objItem.id, record);
    }

    deleteAngle(record) {
        this.message.confirm(this.l('deletethisresource'), this.l('AreYouSure'), (r) => {
            if (r) {
                this._RoomServiceProxy.batchDeleteRoomAngleLocationResouces([record.id]).subscribe((result) => {
                    this.notify.info(this.l('success'));
                    this.getResByRoomId();
                })

            }
        })
    }

    getFloors() {
        if (!this.buildingId) {
            this.objItem.floorId = "";
            return
        }
        this.floorList = [];
        this._FloorServiceProxy.getFloors4Select(this.buildingId)
            .subscribe(result => {
                this.floorList = result;
            })
    }

    onShown(): void {

    }

    save(): void {
        this.saving = true;
        console.log(this.objItem);
        if (!this.objItem.id) {
            this._RoomServiceProxy.createRoom(new CreateRoomInput(this.objItem))
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(result => {
                    console.log(result)
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                })
        } else {
            this._RoomServiceProxy.updateRoom(new UpdateRoomInput(this.objItem))
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
        this.modal.hide();
    }

}
