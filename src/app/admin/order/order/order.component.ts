import { Component, OnInit, Injector, ViewChild, ElementRef } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { MyTreeComponent } from '@app/shared/common/my-tree/my-tree.component';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';
import { OrderServiceProxy, CommonServiceProxy } from '@shared/service-proxies/service-proxies2';
import { OrderDetailModalComponent } from '@app/admin/order/order/order-detail-modal.component';
import { finalize } from 'rxjs/operators';
import * as moment from 'moment';
import { SensingShopManageServiceProxy } from '@shared/service-proxies/service-proxies2';

import { StoreServiceProxy as NewStoreServiceProxy} from '@shared/service-proxies/service-proxies-devicecenter';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css'],
  animations: [appModuleAnimation()]
})
export class OrderComponent extends AppComponentBase {

  @ViewChild('dataTable', { static: false }) dataTable: Table;
  @ViewChild('paginator', { static: false }) paginator: Paginator;
  @ViewChild('orderDetailModal', { static: false }) orderDetailModal: OrderDetailModalComponent;
  @ViewChild('StoreCombobox', { static: false }) storeComboboxElement: ElementRef;
  @ViewChild('storeTree', { static: false }) storeTree: MyTreeComponent;



  filterText: string;
  startTime: any = moment().utc().subtract(29, 'days').startOf('day');
  endTime: any = moment().utc().endOf('day');


  orderStatus: any = '';
  orderStatusList: any[] = [];
  orderSelection = [];
  belongStore: any = "";
  stores: any[] = [];
  storeFilter: string = '';
  totalSale;
  exportLoading = false;


  storeText = '';
  showStore = false;
  chosenItem = [];

  from: any = "";
  fromList: any = [];

  memberName = "";
  regPhone = "";

  // stores;
  constructor(injector: Injector,
    private _orderService: OrderServiceProxy,
    private _commonService: CommonServiceProxy,
    private _NewStoreServiceProxy: NewStoreServiceProxy,
    private _SensingShopManageServiceProxy: SensingShopManageServiceProxy,
    private router: Router) {
    super(injector);
    _commonService.orderStatus().subscribe((result) => {
      this.orderStatusList = result;
    })
    _commonService.orderFrom().subscribe((result) => {
      this.fromList = result;
    })
    this.getStores();
  }


  ngOnInit() {
    $(document).on("click", this.dropDownBind2);
  }
  ngOnDestroy() {
    $(document).off("click", this.dropDownBind2);
  }
  updateStoreSelected() {
    if (this.showStore) {
      var arr = this.storeTree.getchosen().map(item => {
        return item.text
      })
      this.storeText = '';
      for (var i = 0; i < arr.length; i++) {
        this.storeText = this.storeText + arr[i] + ' '
      }
    }
  }

  dropDownBind2 = function (e) {
    var target = e.target;
    if (!$(target).hasClass("belongToTree")) {
      this.showStore = false;
      this.updateStoreSelected();
    }
  }.bind(this);

  //筛选树
  storeFilterTree(e?: Event) {
    e && e.preventDefault();
    setTimeout(() => {
      this.storeTree.filterTree(this.storeFilter);
    }, 100)
  }

  //所属店铺
  getStores() {
    this._NewStoreServiceProxy.getCurrentTenantOrganizationUnitsAndStoresTree(true).subscribe((result) => {
      this.stores = [result];
    })
  }

  goExport() {
    this.exportLoading = true;
    if (this.showStore) {
      this.chosenItem = this.storeTree.getchosen().filter(item => {
        return item.type == 'store'
      }).map(item => {
        return item.id
      })
    }
    this._orderService.getOrderListToExcel(
      undefined,
      this.memberName,
      this.regPhone,
      this.filterText,
      this.startTime ? moment(this.startTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h') : undefined,
      this.endTime ? moment(this.endTime.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's') : undefined,
      this.from,
      undefined,
      undefined,
      this.orderStatus || undefined,
      this.chosenItem,
      undefined,
      this.primengTableHelper.getSorting(this.dataTable),
      this.primengTableHelper.getMaxResultCount(this.paginator, undefined),
      this.primengTableHelper.getSkipCount(this.paginator, undefined)
    ).subscribe(r => {
      setTimeout(() => {
        this.exportLoading = false;
      }, 2000)
      var href = `https://o.api.troncell.com/api/File/DownloadTempFile?FileName=` + r.fileName + `&FileType=` + r.fileType + `&FileToken=` + r.fileToken;
      var link = document.getElementById('aaa');
      $(link).attr("href", href);
      link.click();
    })
  }


  //获取订单列表
  getOrders(event?: LazyLoadEvent) {
    if (this.showStore) {
      this.chosenItem = this.storeTree.getchosen().filter(item => {
        return item.type == 'store'
      }).map(item => {
        return item.id
      })
    }

    setTimeout(() => {

      if (this.primengTableHelper.shouldResetPaging(event)) {
        this.paginator.changePage(0);
        return;
      }
      this.orderSelection = [];

      this.primengTableHelper.showLoadingIndicator();
      this._orderService.getOrders(
        undefined,
        this.memberName,
        this.regPhone,
        this.filterText,
        this.startTime ? moment(this.startTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h') : undefined,
        this.endTime ? moment(this.endTime.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's') : undefined,
        this.from,
        undefined,
        undefined,
        this.orderStatus || undefined,
        this.chosenItem,
        undefined,
        this.primengTableHelper.getSorting(this.dataTable),
        this.primengTableHelper.getMaxResultCount(this.paginator, event),
        this.primengTableHelper.getSkipCount(this.paginator, event)
      ).pipe(finalize(() => {
        this.primengTableHelper.hideLoadingIndicator();
      })).subscribe(result => {
        this.primengTableHelper.totalRecordsCount = result.totalCount;
        this.primengTableHelper.records = result.items;
        this.primengTableHelper.hideLoadingIndicator();
        this.totalSale = result.totalSale;
      });
    }, 300)
  }

  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }

  goDetail(record, editable) {
    this.orderDetailModal.show(record, editable, this.orderStatusList);
  }

  consignGood(record) {
    this.orderDetailModal.show(record, true, this.orderStatusList, 1);
  }
  returnGood(record) {
    this.orderDetailModal.show(record, true, this.orderStatusList, 2);
  }

  closeWeishopOrder(record) {
    this.message.confirm(this.l("Cancel"), this.l('AreYouSure'), (r) => {
      if (r) {
        this.primengTableHelper.showLoadingIndicator();
        this._SensingShopManageServiceProxy.closeWeishopOrder(record.id)
          .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
          .subscribe(r => {
            // this.primengTableHelper.hideLoadingIndicator();
            this.notify.info(this.l('success'));
            this.getOrders();
            this.orderSelection = [];
          })
      }
    })
  }

  confirmWeishopOrder(record) {
    this.message.confirm(this.l("complete"), this.l('AreYouSure'), (r) => {
      if (r) {
        this.primengTableHelper.showLoadingIndicator();
        this._SensingShopManageServiceProxy.comfirmWeishopOrder(record.id)
          .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
          .subscribe(r => {
            // this.primengTableHelper.hideLoadingIndicator();
            this.notify.info(this.l('success'));
            this.getOrders();
            this.orderSelection = [];
          })
      }
    })
  }


  deleteOrders() {
    var ids = this.orderSelection.map((order) => {
      return order.id;
    });
    if (ids.length == 0) {
      return this.notify.info(this.l('atLeastChoseOneItem'));
    }
    this.message.confirm(this.l("DeleteOrderMsg"), this.l('AreYouSure'), (r) => {
      if (r) {
        this.primengTableHelper.showLoadingIndicator();
        this._orderService.batchDeleteOrders(ids)
          .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
          .subscribe(() => {
            this.notify.info(this.l('success'));
            // this.primengTableHelper.hideLoadingIndicator();
            this.getOrders();
            this.orderSelection = [];
          })
      }
    })
  }

  deleteOrder(record) {
    console.log(record.id)
    this.message.confirm(this.l("DeleteOrderMsg"), this.l('AreYouSure'), (r) => {
      if (r) {
        this.primengTableHelper.showLoadingIndicator();
        this._orderService.deleteOrder(record.id)
          .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
          .subscribe(() => {
            this.notify.info(this.l('success'));
            // this.primengTableHelper.hideLoadingIndicator();
            this.getOrders();
            this.orderSelection = [];
          })
      }
    })

  }

}
