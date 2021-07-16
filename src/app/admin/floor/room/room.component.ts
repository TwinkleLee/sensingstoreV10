import { Component, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';

import { CreateOrEditRoomModalComponent } from './room-modal.component';

import { BuildingServiceProxy, FloorServiceProxy, RoomServiceProxy } from '@shared/service-proxies/service-proxies-floor';

import { Router, ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './room.component.html',
  animations: [appModuleAnimation()]
})
export class RoomComponent extends AppComponentBase {

  @ViewChild('roomModal', { static: true }) roomModal: CreateOrEditRoomModalComponent;
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;


  filterText = "";
  handled: any = "";
  buildingId: any = "";
  buildingList = [];
  floorId: any = "";
  floorList = [];
  selectedList = [];
  recprdsList: any = [];
  roomstatus: any= "";
  bind:any='';

  constructor(injector: Injector,
    private router: Router,
    private _activatedRoute: ActivatedRoute,
    private _RoomServiceProxy: RoomServiceProxy,
    private _FloorServiceProxy: FloorServiceProxy,
    private _BuildingServiceProxy: BuildingServiceProxy
  ) {
    super(injector);
    this._activatedRoute.queryParams.subscribe(queryParams => {
      if (queryParams.buildingId) {
        this.buildingId = queryParams.buildingId;
      }
      if (queryParams.floorId) {
        this.floorId = queryParams.floorId;
      }
    })
    this._BuildingServiceProxy.getBuildingsForSelect()
      .subscribe(result => {
        this.buildingList = result;
      })
    this.getFloor4Select();
  }
  bindchange()
  {
    this.getList();
  }
  getFloor4Select() {
    if (!this.buildingId) {
      this.floorId = "";
      return
    }
    this.floorList = [];
    this._FloorServiceProxy.getFloors4Select(this.buildingId)
      .subscribe(result => {
        this.floorList = result;
      })

  }
  //获取列表
  getList(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.selectedList = [];

    this.primengTableHelper.showLoadingIndicator();
    this._RoomServiceProxy.getRoomsNew(
      this.floorId,
      this.buildingId,
      void 0,
      void 0,
      this.bind,
      this.filterText,
      this.primengTableHelper.getSorting(this.dataTable),
      this.primengTableHelper.getMaxResultCount(this.paginator, event),
      this.primengTableHelper.getSkipCount(this.paginator, event)
    )
      .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
      .subscribe(result => {
        this.primengTableHelper.totalRecordsCount = result.totalCount;
        this.primengTableHelper.records = result.items;
      })
      
  }

  //创建
  createItem() {
    this.roomModal.show();
  }

  //修改
  editItem(record) {
    
    this.roomModal.show(Object.assign({}, record))
  }

  //删除
  deleteItem(record) {
    this.message.confirm(this.l('deletethisselected'), this.l('AreYouSure'), (r) => {
      if (r) {
        this.primengTableHelper.showLoadingIndicator();
        this._RoomServiceProxy.deleteRoom(record.id)
          .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
          .subscribe(result => {
            this.selectedList = [];
            this.notify.info(this.l('success'));
            this.getList();
          })
      }
    })
  }

  deleteBatch() {
    var ids = this.selectedList.map(({ id }) => id);
    this.message.confirm(this.l('deletethisselected'), this.l('AreYouSure'), (r) => {
      if (r) {
        this.primengTableHelper.showLoadingIndicator();

        this._RoomServiceProxy.batchDeleteRooms(ids)
          .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
          .subscribe(result => {
            this.selectedList = [];
            this.notify.info(this.l('success'));
            this.getList();
          })
      }
    })
  }

  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }

  goImport() {
    this.router.navigate(['app', 'admin', 'import', 'import', 'room']);
  }
}
