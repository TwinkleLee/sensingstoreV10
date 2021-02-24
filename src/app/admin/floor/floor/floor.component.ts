import { Component, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';

import { CreateOrEditFloorModalComponent } from './floor-modal.component';

import { BuildingServiceProxy, FloorServiceProxy } from '@shared/service-proxies/service-proxies-floor';

import { Router, ActivatedRoute } from '@angular/router';
import { AppConsts } from '@shared/AppConsts';

var that;

@Component({
  templateUrl: './floor.component.html',
  animations: [appModuleAnimation()]
})
export class FloorComponent extends AppComponentBase {

  @ViewChild('floorModal', { static: true }) floorModal: CreateOrEditFloorModalComponent;
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;


  filterText = "";
  handled: any = "";
  buildingId: any = "";
  buildingList = [];
  selectedList = [];

  showIframe = false;
  isLocal = (window.location.href.indexOf("localhost") > -1 || window.location.href.indexOf("127.0.0.1") > -1) ? true : false;
  // isLocal = true;
  nowFloor: any;

  constructor(injector: Injector,
    private router: Router,
    private _activatedRoute: ActivatedRoute,
    private _BuildingServiceProxy: BuildingServiceProxy,
    private _FloorServiceProxy: FloorServiceProxy
  ) {
    super(injector);
    that = this;
    this._activatedRoute.queryParams.subscribe(queryParams => {
      console.log("queryParams", queryParams.buildingId);
      if (queryParams.buildingId) {
        this.buildingId = queryParams.buildingId;
      }
    })
    this._BuildingServiceProxy.getBuildingsForSelect()
      .subscribe(result => {
        this.buildingList = result;
      })
  }

  goRoom(record) {
    this.router.navigate(['app', 'floor', 'room'], { queryParams: { floorId: record.id, buildingId: record.buildingId } });
  }

  Flag(record) {
    console.log(record);
    this.showIframe = true;
    this.nowFloor = record;
  }
  iframeLoad() {
    //   try {
    //     var customContent = this.Ad.customContent ? JSON.parse(this.Ad.customContent) : {};
    //     // if (customContent.basicData.type != 'basic') {
    //     //     throw 'err'
    //     // }
    //     //考虑到也可能为空等,因此不做判断
    // } catch (error) {
    //     this.message.warn(this.l('JsonNotPattern3'))
    //     this.showIframe = false;
    //     return
    // }

    var token = 'Bearer ' + abp.utils.getCookieValue(abp.auth.tokenCookieName),
      tenantId = abp.utils.getCookieValue('Abp.TenantId'),
      buildingId = this.nowFloor.buildingId,
      floorId = this.nowFloor.id,
      serverConfig = {
        s: AppConsts.remoteServiceBaseUrl,
        f: AppConsts.remoteFloorServiceUrl
      },
      input = JSON.stringify({ token, tenantId, serverConfig, buildingId, floorId });

    var a: any = document.getElementById("iframe");
    a.contentWindow.postMessage(input, this.isLocal ? 'http://127.0.0.1:5500' : 'https://m.sensingstore.com');
  }

  ngOnInit(): void {
    window.addEventListener('message', this.messageListener);
  }
  messageListener(e) {
    //有时会收到来自框架的其他非JSON信息导致报错 因此catch不做处理
    if (e.data) {
      try {
        console.log(e.data)
      } catch (error) {
        // that.message.warn(that.l('JsonNotPattern1'))
        return
      }
    }
    that.showIframe = false;
  }

  //获取列表
  getList(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.selectedList = [];

    this.primengTableHelper.showLoadingIndicator();
    this._FloorServiceProxy.getFloorsNew(
      this.buildingId,
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
    this.floorModal.show();
  }

  //修改
  editItem(record) {
    this.floorModal.show(Object.assign({}, record))
  }

  //删除
  deleteItem(record) {
    this.message.confirm(this.l('deletethisselected'), this.l('AreYouSure'), (r) => {
      if (r) {
        this.primengTableHelper.showLoadingIndicator();
        this._FloorServiceProxy.deleteFloor(record.id)
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

        this._FloorServiceProxy.batchDeleteFloors(ids)
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

}
