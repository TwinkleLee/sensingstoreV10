import { Component, OnInit, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { OrganizationUnitServiceProxy } from '@shared/service-proxies/service-proxies';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';


import { OrderServiceProxy, SaleReportInput, ReportServiceProxy } from '@shared/service-proxies/service-proxies2';
import * as moment from 'moment';
import { finalize } from 'rxjs/operators';
import { StoreServiceProxy as NewStoreServiceProxy} from '@shared/service-proxies/service-proxies-devicecenter';

@Component({
  selector: 'app-sales-chart',
  templateUrl: './saleschart.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})
export class SalesChartComponent extends AppComponentBase {

  @ViewChild('highTree', { static: false }) highTree;
  @ViewChild('highTree2', { static: false }) highTree2;
  @ViewChild('highTree3', { static: false }) highTree3;
  @ViewChild('dataTable1', { static: false }) dataTable1: Table;
  @ViewChild('paginator1', { static: false }) paginator1: Paginator;
  primengTableHelper1 = new PrimengTableHelper();

  StartTime1: any = moment().utc().subtract(1, 'days');
  EndTime1: any = moment().utc();
  filterText1: string;
  filterText2: string;

  exportLoading = false;
  deviceType = '';


  originTree = [];
  ouTree = []; chosenItem = [];
  ouTree2 = []; chosenItem2 = []; showTree2 = true;
  ouTree3 = []; chosenItem3 = []; showTree3 = true;

  constructor(injector: Injector,
    private _ReportServiceProxy: ReportServiceProxy,
    private _OrderServiceProxy: OrderServiceProxy,
    private _OrganizationUnitServiceProxy: OrganizationUnitServiceProxy,
    private _NewStoreServiceProxy: NewStoreServiceProxy) {
    super(injector);

    this._NewStoreServiceProxy.getCurrentTenantSimpleOrganizationUnitsAndStoresTree().subscribe(r => {
      this.originTree = r.children;
      console.log('getCurrentTenantSimpleOrganizationUnitsAndStoresTree', this.originTree);
      this.ouTree = this.originTree.map(item => {
        return {
          name: item.text,
          id: item.id
        }
      })
      this.getProvinceList();
      this.getStoreList();
    })

    // this._OrganizationUnitServiceProxy.getDaquList().subscribe(r => {
    //   this.ouTree = r;
    // })
    setTimeout(() => {
      this.getProvinceList();
      this.getStoreList();
      this.getDay();
    })

  }


  getProvinceList() {
    this.ouTree2 = [];
    this.chosenItem2 = [];
    this.showTree2 = false;
    setTimeout(() => {
      this.showTree2 = true;
    })
    // this._OrganizationUnitServiceProxy.getProvinceList(this.chosenItem).subscribe(r => {
    //   this.ouTree2 = r;
    // })
    var ouTree2 = [];
    if (this.chosenItem.length) {
      console.log('length', this.chosenItem.length)
      this.originTree.forEach(daqu => {
        if (this.chosenItem.indexOf(daqu.id) > -1) {
          daqu.children.forEach(province => {
            ouTree2.push({
              name: province.text,
              id: province.id
            })
          })
        }
      })
    } else {//全部
      console.log('length', '00')
      this.originTree.forEach(daqu => {
        daqu.children.forEach(province => {
          ouTree2.push({
            name: province.text,
            id: province.id
          })
        })
      })
    }
    this.ouTree2 = ouTree2;


  }
  getStoreList() {
    this.ouTree3 = [];
    this.chosenItem3 = [];
    this.showTree3 = false;
    setTimeout(() => {
      this.showTree3 = true;
    })
    // this._OrganizationUnitServiceProxy.getStoreList(this.chosenItem, this.chosenItem2).subscribe(r => {
    //   this.ouTree3 = r;
    // })
    var ouTree3 = [];
    if (!this.chosenItem.length && !this.chosenItem2.length) {//全部
      this.originTree.forEach(daqu => {
        daqu.children.forEach(province => {
          province.children.forEach(store => {
            ouTree3.push({
              name: store.text,
              id: store.id
            })
          })
        })
      })

    } else if (this.chosenItem2.length) {//有省
      this.originTree.forEach(daqu => {
        daqu.children.forEach(province => {
          if (this.chosenItem2.indexOf(province.id) > -1) {
            province.children.forEach(store => {
              ouTree3.push({
                name: store.text,
                id: store.id
              })
            })
          }
        })
      })
    } else {//只有大区

      this.originTree.forEach(daqu => {
        if (this.chosenItem.indexOf(daqu.id) > -1) {
          daqu.children.forEach(province => {
            province.children.forEach(store => {
              ouTree3.push({
                name: store.text,
                id: store.id
              })
            })
          })
        }
      })

    }
    this.ouTree3 = ouTree3;
  }
  clickContainer() {
    if (this.highTree3 && this.highTree3.showStore) {
      this.highTree3.clickInput()
    }
    if (this.highTree2 && this.highTree2.showStore) {
      this.highTree2.clickInput()
    }
    if (this.highTree && this.highTree.showStore) {
      this.highTree.clickInput();
    }
  }
  onTreeUpdate(originalArr) {
    this.chosenItem = originalArr.map(item => {
      return item.id
    });
    this.getStoreList();
    this.getProvinceList();
  }
  onTreeUpdate2(originalArr) {
    this.chosenItem2 = originalArr.map(item => {
      return item.id
    });
    this.getStoreList();
  }
  onTreeUpdate3(originalArr) {
    this.chosenItem3 = originalArr.map(item => {
      return item.id
    });
  }

  ngOnInit() {
  }
  ngOnDestroy() {
  }

  getStoreIds() {
    if (!this.chosenItem.length) {//全都没选则全部
      return []
    }
    if (this.chosenItem3.length) {//选了店铺则店铺
      return this.chosenItem3
    }
    if (this.chosenItem2.length || this.chosenItem.length) {//根据省/大区做处理
      var tempArr = this.ouTree3.map(r => { return r.id });
      if (tempArr.length == 0) {
        return [-1]
      } else {
        return tempArr
      }
    }
  }

  getDayExcel() {
    this.exportLoading = true;
    var StartTime1, EndTime1;
    if (this.StartTime1 && this.EndTime1) {
      StartTime1 = moment(this.StartTime1.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h')
      EndTime1 = moment(this.EndTime1.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's')
    }

    this._ReportServiceProxy.getSalesDayReport(
      this.getStoreIds(),
      StartTime1,
      EndTime1,
      this.filterText1
    ).pipe(finalize(() => { this.exportLoading = false; })).subscribe(result => {
      var link = document.getElementById('aaa');
      $(link).attr("href", result);
      link.click();
    })
  }
  getMonthExcel() {
    this.exportLoading = true;
    var StartTime1, EndTime1;
    if (this.StartTime1 && this.EndTime1) {
      StartTime1 = moment(this.StartTime1.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h')
      EndTime1 = moment(this.EndTime1.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's')
    }

    this._ReportServiceProxy.getSalesMonthReport(
      this.getStoreIds(),
      StartTime1,
      EndTime1,
      this.filterText1
    ).pipe(finalize(() => { this.exportLoading = false; })).subscribe(result => {
      var link = document.getElementById('aaa');
      $(link).attr("href", result);
      link.click();
    })
  }
  getCurrentExcel() {
    this.exportLoading = true;
    var StartTime1, EndTime1;
    if (this.StartTime1 && this.EndTime1) {
      StartTime1 = moment(this.StartTime1.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h')
      EndTime1 = moment(this.EndTime1.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's')
    }

    this._ReportServiceProxy.getSalesCurrentDayReport(
      this.getStoreIds(),
      StartTime1,
      EndTime1,
      this.filterText1
    ).pipe(finalize(() => { this.exportLoading = false; })).subscribe(result => {
      var link = document.getElementById('aaa');
      $(link).attr("href", result);
      link.click();
    })
  }



  getDay(event?: LazyLoadEvent) {
    var StartTime1, EndTime1;
    if (this.StartTime1 && this.EndTime1) {
      StartTime1 = moment(this.StartTime1.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h')
      EndTime1 = moment(this.EndTime1.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's')
    }
    this.primengTableHelper1.showLoadingIndicator();
    this._OrderServiceProxy.salesReport(new SaleReportInput({
      storeIds: this.getStoreIds(),
      startTime: StartTime1,
      endTime: EndTime1,
      storeDeviceInfo: this.deviceType,
      filter: this.filterText1,
      type: "",
      sorting: this.primengTableHelper1.getSorting(this.dataTable1),
      maxResultCount: this.primengTableHelper1.getMaxResultCount(this.paginator1, event),
      skipCount: this.primengTableHelper1.getSkipCount(this.paginator1, event)
    })).pipe(finalize(() => { this.primengTableHelper1.hideLoadingIndicator(); })).subscribe(result => {
      this.primengTableHelper1.totalRecordsCount = result.totalCount;
      this.primengTableHelper1.records = result.items;

    })
  }

  transIndex1(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper1.getSkipCount(this.paginator1, event);
  }

}

