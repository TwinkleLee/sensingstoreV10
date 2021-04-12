import { Component, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table, TableCheckbox } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { CreateOrEditTicketModalComponent } from '@app/admin/redpacket/ticket/create-or-edit-ticket-modal.component';
import { PublishTicketModalComponent } from '@app/admin/redpacket/ticket/publish-ticket-modal.component';

import { CommonServiceProxy, TicketServiceProxy, AuditStatus, TicketType, TakeType, SetTicketStatusInput } from '@shared/service-proxies/service-proxies2';
import { ProductCategoryServiceProxy, CouponServiceProxy, CreateCouponByTicketInput } from '@shared/service-proxies/service-proxies-product';
import { TagServiceProxy, TagType as Type } from '@shared/service-proxies/service-proxies';
import * as _ from 'lodash';
import { finalize } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';


import { StoreServiceProxy as NewStoreServiceProxy,GetStorseListInput} from '@shared/service-proxies/service-proxies-devicecenter';

@Component({
  templateUrl: './ticket.component.html',
  animations: [appModuleAnimation()]
})
export class TicketComponent extends AppComponentBase {

  @ViewChild('ticketModal', { static: true }) ticketModal: CreateOrEditTicketModalComponent;
  @ViewChild('publishTicketModal', { static: true }) publishTicketModal: PublishTicketModalComponent;
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;
  @ViewChild('TableCheckbox', { static: true }) TableCheckbox: TableCheckbox;



  ticketStatus: any = '';
  ticketType: any = '';
  takeType: any = '';
  filter = '';

  TicketStatus = AuditStatus;
  TicketType = TicketType;
  TakeType = TakeType;

  memberTypeList: any = [];
  typeList: any = [];
  tagList: any = [];

  publishList: any[] = [];

  storeList: any[] = [];


  constructor(injector: Injector,
    private _TicketServiceProxy: TicketServiceProxy,
    private _CommonServiceProxy: CommonServiceProxy,
    private _ProductCategoryServiceProxy: ProductCategoryServiceProxy,
    private _TagServiceProxy: TagServiceProxy,
    private router: Router, private route: ActivatedRoute,
    private _CouponServiceProxy: CouponServiceProxy,
    private _NewStoreServiceProxy: NewStoreServiceProxy

  ) {
    super(injector);
    this._CommonServiceProxy.memberType().subscribe(r => {
      this.memberTypeList = r.map(item => {
        var newItem: any = item;
        newItem.id = newItem.value;
        return newItem
      });
    })
    if (this.isGranted('Pages.Tenant.Products')) {
      this._ProductCategoryServiceProxy.getCategoryTrees().subscribe(r => {
        this.typeList = r;
      })
    }

    this._TagServiceProxy.getTagsByType(
      void 0,
      void 0,
      999,
      0,
      Type['Product']
    ).subscribe(r => {
      this.tagList = r.items;
    })

    this.getStoreList()
  }

  //创建
  createItem() {
    this.ticketModal.memberTypeList = _.cloneDeep(this.memberTypeList);
    this.ticketModal.typeList = _.cloneDeep(this.typeList);
    this.ticketModal.tagList = _.cloneDeep(this.tagList);
    this.ticketModal.show();
  }

  createCouponByTicket(record) {
    this.message.confirm(this.l('CreatingCoupon'), this.l('AreYouSure'), (r) => {
      if (r) {
        this._CouponServiceProxy.createCouponByTicket(record as CreateCouponByTicketInput).subscribe(r => {
          this.notify.info(this.l('success'));
        })
      }
    })

  }
  //获取列表
  getList(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }

    this.primengTableHelper.showLoadingIndicator();
    this._TicketServiceProxy.getTickets(
      this.ticketStatus,
      this.ticketType,
      this.takeType,
      this.filter,
      this.primengTableHelper.getSorting(this.dataTable),
      this.primengTableHelper.getMaxResultCount(this.paginator, event),
      this.primengTableHelper.getSkipCount(this.paginator, event)
    ).pipe(finalize(() => { this.primengTableHelper.hideLoadingIndicator() }))
      .subscribe(result => {
        this.publishList = [];
        this.primengTableHelper.totalRecordsCount = result.totalCount;
        this.primengTableHelper.records = result.items;
      })
  }
  //修改
  editItem(record) {
    this.ticketModal.memberTypeList = _.cloneDeep(this.memberTypeList);
    this.ticketModal.typeList = _.cloneDeep(this.typeList);
    this.ticketModal.tagList = _.cloneDeep(this.tagList);
    this.ticketModal.show(Object.assign({}, record))
  }


  //删除
  deleteItem(record) {
    if (record.ticketStatus != 0) {
      return this.notify.info(this.l('noneOfflineGotten'));
    }
    this.message.confirm(this.l('deletethisselected'), this.l('AreYouSure'), (r) => {
      if (r) {
        this.primengTableHelper.showLoadingIndicator();
        this._TicketServiceProxy.deleteTickets([record.id])
          .pipe(finalize(() => { this.primengTableHelper.hideLoadingIndicator() }))
          .subscribe(result => {
            this.publishList = [];
            this.notify.info(this.l('success'));
            this.getList();
          })
      }
    })
  }

  //批量删除广告
  deleteBatch() {
    console.log(this.publishList)

    this.checkSelection(true, (ary) => {
      this.message.confirm(this.l('batchDeleteAdsQuestion'), this.l('AreYouSure'), (r) => {
        if (r) {
          this.primengTableHelper.showLoadingIndicator();
          this._TicketServiceProxy.deleteTickets(ary)
            .pipe(finalize(() => { this.primengTableHelper.hideLoadingIndicator() }))
            .subscribe((result) => {
              this.notify.info(this.l('success'));
              this.publishList = [];

              this.getList();
            })
        }
      })
    })
  }

  publishTicket() {
    this.checkSelection(false, (ary) => {
      this.publishTicketModal.show(this.memberTypeList, ary);
    })
  }

  //筛选广告上下线
  filterAds() {
    var upNum = [], upNumIds = [], downNum = [], downNumIds = [];
    this.publishList.forEach((v, index, array) => {
      if (v.ticketStatus == "0") {
        downNum.push(v);
        downNumIds.push(v.id);
      } else {
        upNum.push(v);
        upNumIds.push(v.id);
      }
    })
    return {
      upNum: upNum,
      upNumIds: upNumIds,
      downNum: downNum,
      downNumIds: downNumIds
    }
  }
  checkSelection(f, callback, all?) {
    var upNum = this.filterAds().upNum, downNum = this.filterAds().downNum,
      upNumIds = this.filterAds().upNumIds, downNumIds = this.filterAds().downNumIds;
    if (all) {
      return callback && callback([]);
    }
    if (f) {
      if (downNum.length == 0) {
        return this.notify.info(this.l('noneOfflineGotten'));
      }
      if (upNum.length != 0) {
        this.message.confirm(this.l("nowChooseTip0") + upNum.length + this.l("nowChooseTip1"), this.l('AreYouSure'), (r) => {
          if (r) {
            this.publishList = downNum;
          }
        })
      }
    } else {
      if (upNum.length == 0) {
        return this.notify.info(this.l('noneOnlineGotten'));
      }
      if (downNum.length != 0) {
        this.message.confirm(this.l("nowChooseTip0") + downNum.length + this.l("nowChooseTip2"), this.l('AreYouSure'), (r) => {
          if (r) {
            this.publishList = upNum;
          }
        })
      }
    }
    callback && callback(f ? downNumIds : upNumIds);
  }

  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }


  online() {
    this.checkSelection(true, (ary) => {
      this.primengTableHelper.showLoadingIndicator();

      this._TicketServiceProxy.setTicketStatus(new SetTicketStatusInput({
        ticketIds: ary,
        ticketStatus: 1
      }))
        .pipe(finalize(() => { this.primengTableHelper.hideLoadingIndicator() }))
        .subscribe(r => {
          this.publishList = [];
          this.notify.info(this.l('success'));
          this.getList();
        })
    })
  }

  offline() {
    this.checkSelection(false, (ary) => {
      this.primengTableHelper.showLoadingIndicator();

      this._TicketServiceProxy.setTicketStatus(new SetTicketStatusInput({
        ticketIds: ary,
        ticketStatus: 0
      }))
        .pipe(finalize(() => { this.primengTableHelper.hideLoadingIndicator() }))
        .subscribe(r => {
          this.publishList = [];
          this.notify.info(this.l('success'));
          this.getList();
        })
    })
  }

  goMember(record) {
    console.log(record);
    this.router.navigate(['app', 'admin','redpacket', 'ticketMember'], { queryParams: { ticketId: record.id } });
  }

  getStoreList () {
    this._NewStoreServiceProxy.getStoresList(new GetStorseListInput({
        organizationUnitId: void 0,
        storeStatus: void 0,
        areas: void 0,
        filter: void 0,
        sorting: void 0,
        maxResultCount: 999,
        skipCount: 0
    }))
        .subscribe(r => {
            this.storeList = (r.items || []).map(i => {
              return {
                "id": i.storeId,
                "value": i.displayName
              }
            })
        })
  }
}
