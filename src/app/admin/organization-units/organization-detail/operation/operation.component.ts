import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked, Input } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { BuildingServiceProxy} from '@shared/service-proxies/service-proxies-floor';
import { RoomServiceProxy, CreateRoomInput, UpdateRoomInput, FloorServiceProxy } from '@shared/service-proxies/service-proxies-floor';

import { AddOrUpdateOutPutInStorageBillInput, GetOutPutInStorageRecordInput, OutPutInStorageServiceProxy, OutPutInStorageSku } from '@shared/service-proxies/service-proxies-product';

import { SkuGridModalComponent } from '@app/admin/organization-units/organization-detail/sku-grid-modal.component';

import * as _ from 'lodash'
import { result } from 'lodash-es';

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

  room:any;
  no:any;
  roomType:any;
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
  roomchange(){
  }
  floorChange() {
    this.getroomlist();
    if(this.roomList.length!=0){//当房间列表为默认值是为roomId赋值，因为使用默认值时roomId获取不到第一个id
      this.roomId=this.roomList[0].id
    }
  }
  onShown() {

  }
  buildingChange() {
    this.getfloorlist();
  }
  show(storeId: any): void {
    this.storeId = storeId;
    this.roomId = "";
    this.getbuildinglist();
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
    })

  }
  getroomlist() {
    this._RoomServiceProxy.getRoomsNew(
      this.floorId,
      void 0,
      void 0,
      void 0,
      null,
      void 0,
      void 0,
      999,
      void 0
    ).subscribe(result => {
      this.roomList = result.items.filter(item => {
        return item.storeId == null
      })
    })
  }

  save(): void {
    for (var i = 0; i < this.roomList.length; i++) {
      if (this.roomList[i].id == this.roomId) {
        this.room=this.roomList[i];
      }
    }
    this._RoomServiceProxy.updateRoom(new UpdateRoomInput({
      id: this.room.id,
      floorId: this.room.floorId,
      name: this.room.name,
      no: this.room.no,
      description: this.room.description,
      areaWidth: this.room.areaWidth,
      areaHeight: this.room.areaHeight,
      storeId: Number(this.storeId),
      storeName: this.room.storeName,
      brandName:this.room.brandName,
      brandLogo:this.room.brandLogo,
      roomType: this.room.roomType,
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
