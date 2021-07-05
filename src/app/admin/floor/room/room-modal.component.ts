import { Component, ViewChild, Injector, Output, Input, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { RoomServiceProxy, CreateRoomInput, UpdateRoomInput, FloorServiceProxy } from '@shared/service-proxies/service-proxies-floor';
import { Table } from 'primeng/table';
import { CreateOrEditRoomResourceModalComponent } from './resource-modal.component';
import { BrandServiceProxy } from '@shared/service-proxies/service-proxies-devicecenter';
import { Paginator } from 'primeng/paginator';
import { StoreServiceProxy as NewStoreServiceProxy, PublishStoresInput, GetStorseListInput, StoreAuditInput,OrganizationUnitServiceProxy as DeviceOrganizationUnitServiceProxy, IdTypeDto, StoreStatus } from '@shared/service-proxies/service-proxies-devicecenter';

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
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('roomResourceModal', { static: false }) roomResourceModal: CreateOrEditRoomResourceModalComponent;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    

    active = false;
    saving = false;
    filterText: string;
    areaFilter = "";
    brandName = "";
    storeName = "";
    operation: string = "add";
    objItem: any = {};
    buildingId: any = "";
    floorList: any = [];
    brandList:any =[];
    storeList:any =[];
    chosenItem = [];
    StoreStatus = StoreStatus;
    storeStatus: any = "";
    storeCheckedList: any = [];
    angleList: any = [];


    roomTypeList = ["store", "path", "toilet", "elevator", "staircase", "escalator", "exit", "children", "disabled", "maternal", "reception", "smoking"];

    constructor(
        injector: Injector,
        private _BrandServiceProxy: BrandServiceProxy,
        private _RoomServiceProxy: RoomServiceProxy,
        private _FloorServiceProxy: FloorServiceProxy,
        private _NewStoreServiceProxy: NewStoreServiceProxy,
        
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
        this._BrandServiceProxy.getBrands(
            void 0,
            void 0,
            void 0,
            void 0,
            999, 0
          )
            .subscribe(result => {
              this.brandList = result.items;
            });
        this.getFloors();
        this.modal.show();
        this.getStoreList();
    }

    getStoreList() {
        this._NewStoreServiceProxy.getStoresList(new GetStorseListInput({
          storeStatus: StoreStatus['OnLine'],
          organizationUnitId: void 0,
          areas: void 0,
          filter: void 0,
          sorting: void 0,
          maxResultCount: 999,
          skipCount: 0
        })
        )
          .subscribe(result => {
            this.primengTableHelper.totalRecordsCount = result.totalCount;
            this.storeList = result.items.map(item => {
                return {
                    id: item.storeId,
                    name: item.displayName
                }
            });
            console.log("this.storeList",this.storeList);
          });
      }

    getResByRoomId() {
        this._RoomServiceProxy.getRoomAngleLocationResources(
            this.objItem.id,
            "",
            void 0,
            999,
            0
        ).subscribe(result => {
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
        if (!this.objItem.id) {
            this._RoomServiceProxy.createRoom(new CreateRoomInput(this.objItem))
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(result => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                })
        } else {
            console.log("room-mpdeal.component.ts.this.objItem:",this.objItem)
            this._RoomServiceProxy.updateRoom(new UpdateRoomInput(this.objItem))
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(result => {
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
