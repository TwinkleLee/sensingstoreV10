import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked, Input } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { BuildingServiceProxy} from '@shared/service-proxies/service-proxies-floor';
import { RoomServiceProxy, CreateRoomInput, UpdateRoomInput, FloorServiceProxy } from '@shared/service-proxies/service-proxies-floor';

import { AddOrUpdateOutPutInStorageBillInput, GetOutPutInStorageRecordInput, OutPutInStorageServiceProxy, OutPutInStorageSku } from '@shared/service-proxies/service-proxies-product';

import { SkuGridModalComponent } from '@app/admin/organization-units/organization-detail/sku-grid-modal.component';

import * as _ from 'lodash'

@Component({
  selector: 'bindModal',
  templateUrl: './operation.component.html',
  styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
  ]
})
export class BindModalComponent extends AppComponentBase implements AfterViewChecked {

  @ViewChild('createOrEditModal', { static: false }) modal: ModalDirective;
  @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
  saving = false;

  storeId: "";
  buildingList: any[] = [];
  buildingId: "";
  floorId: "";
  floorList: any[] = [];
  rooms: "";
  roomList: any[] = [];
  roomId: "";
  roomName: "";
  resource: any = {};
  operationType = "add";
  skuList: any = [];
  nowIndex: any = '';
  Input: any = {
    outPutInStorageType: 'Put',
    outPutInStorageSkus: []
  };


  constructor(
    injector: Injector,
    private _buildingServiceProxy: BuildingServiceProxy,
    private _FloorServiceProxy: FloorServiceProxy,
    private _RoomServiceProxy: RoomServiceProxy,
    private _OutPutInStorageServiceProxy: OutPutInStorageServiceProxy
  ) {
    super(injector);
  }
  ngAfterViewChecked(): void {

  }
  floorChang() {
    this.getroomlist();
  }
  onShown() {

  }
  buildingChang() {
    this.getfloorlist();
  }
  show(storeId: any): void {
    this.storeId = storeId;
    this.roomId = "";
    this.getbuildinglist();
    console.log("this.roomId", this.roomId);

    this.modal.show();
  }
  getbuildinglist(): void {
    this._buildingServiceProxy.getBuildings(
      void 0,
      void 0,
      999,
      void 0
    ).subscribe(result => {
      this.buildingList = result.items.map((r) => {
        return {
          id: r.id,
          name: r.name
        }
      })
      console.log("buildinglist", this.buildingList);
    })
  }
  getfloorlist(): void {
    this._FloorServiceProxy.getFloors(
      this.buildingId,
      void 0,
      void 0,
      999,
      void 0
    ).subscribe(result => {
      this.floorList = result.items.map((r) => {
        return {
          id: r.id,
          name: r.name
        }
      })
      console.log("this.floorList", this.floorList);
    })

  }
  getroomlist() {
    this._RoomServiceProxy.getRoomsNew(
      this.floorId,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      999,
      void 0
    ).subscribe(result => {
      this.roomList = result.items.map(r => {
        return {
          id: r.id,
          name: r.name,
          storeId: r.storeId
        }
      }).filter(item => {
        return item.storeId == null
      })
      console.log("this.roomList", this.roomList);
    })
  }

  save(): void {
    for (var i = 0; i < this.roomList.length; i++) {
      if (this.roomList[i].id == this.roomId) {
        this.roomName = this.roomList[i].name;
      }
    }
    this._RoomServiceProxy.updateRoom(new UpdateRoomInput({
      id: this.roomId,
      floorId: this.floorId,
      name: this.roomName,
      no: undefined,
      description: undefined,
      areaWidth: 0,
      areaHeight: 0,
      storeId: Number(this.storeId),
      storeName: undefined,
      brandName: undefined,
      brandLogo: undefined,
      roomType: undefined,
    })).subscribe(res => {
      this.notify.info(this.l('SavedSuccessfully'));
      
      this.modalSave.emit(null);
    })
    this.floorId="";
    this.close();
  }
  close(): void {
    this.modal.hide();
  }
}
