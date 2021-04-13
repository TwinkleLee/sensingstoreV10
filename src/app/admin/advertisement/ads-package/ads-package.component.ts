import { Component, OnInit, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { CreateOrEditAdsPackageModalComponent } from '@app/admin/advertisement/ads-package/create-or-edit-ads-package-modal.component';
import { AdsPackageServiceProxy } from '@shared/service-proxies/service-proxies-ads';
import { AppConsts } from '@shared/AppConsts';
import {DeviceServiceProxy as NewDeviceServiceProxy} from '@shared/service-proxies/service-proxies-devicecenter';

@Component({
  selector: 'app-ads-package',
  templateUrl: './ads-package.component.html',
  styleUrls: ['./ads-package.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})
export class AdsPackageComponent extends AppComponentBase {

  @ViewChild('createOrEditAdsPackageModal',{static:true}) createOrEditAdsPackageModal: CreateOrEditAdsPackageModalComponent;
  @ViewChild('dataTable',{static:true}) dataTable: Table;
  @ViewChild('paginator',{static:true}) paginator: Paginator;

  filterText: string = "";
  _selectedAdsPackageList = [];

  busy = false;

  //for setting adsPackeage's transition.
  _adsTransitionList: any = [];
  deviceTypeId: any = "";
  deviceList: any = [];

  constructor(injector: Injector,
    private _adsPackageSvc:AdsPackageServiceProxy,
    private _NewDeviceServiceProxy: NewDeviceServiceProxy
  ) {
    super(injector);
    this.setAdsTransitions();
    this.getDeviceList()
  }

  setAdsTransitions(){
    this._adsPackageSvc.getAllTransitionsInAds().subscribe(o => this._adsTransitionList = o);
  }

  getAdsPackages(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this._selectedAdsPackageList = [];

    this.primengTableHelper.showLoadingIndicator();
    this._adsPackageSvc.getPackages(
      this.filterText,
      this.primengTableHelper.getSorting(this.dataTable) || 'Id',
      this.primengTableHelper.getMaxResultCount(this.paginator, event),
      this.primengTableHelper.getSkipCount(this.paginator, event)
    )
    .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
    .subscribe(result => {
      this.primengTableHelper.totalRecordsCount = result.totalCount;
      this.primengTableHelper.records = result.items;
    });
  }

  createAdsPackage() {
    this.createOrEditAdsPackageModal.show(void 0, this._adsTransitionList);
  }

  editAdsPackage(record) {
    this.createOrEditAdsPackageModal.show(Object.assign({}, record), this._adsTransitionList);
  }

  getDeviceList () {
    this._NewDeviceServiceProxy.getDevices(
      [],
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      999,
      0
    ).subscribe(r => {
      this.deviceList = (r.items || []).map(i => {
        return {
          'id': i.id,
          'value': i.name
        }
      });
    })
  }

  deleteAdsPackages(){
    var ids = this._selectedAdsPackageList.map(({ id }) => id);
    if (ids.length == 0) {
      this.message.warn(this.l('atLeastChoseOneItem'));
      return
    }
    this.message.confirm(this.l('deletethisadpackage'),this.l('AreYouSure'), (r) => {
      if (r) {
        this._adsPackageSvc.deletePackageByIds(ids).subscribe(result => {
          this._selectedAdsPackageList = [];
          this.notify.info(this.l('success'));
          this.getAdsPackages();
        })
      }
    })
  }

  deleteAdsPackage(record) {
    this.message.confirm(this.l('deletethisadpackage'),this.l('AreYouSure'), (r) => {
      if (r) {
        this._adsPackageSvc.deletePackageByIds([record.id]).subscribe(result => {
          this._selectedAdsPackageList = [];
          this.notify.info(this.l('success'));
          this.getAdsPackages();
        })
      }
    })
  }
  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }
  //转换图片路径
  transfileUrl(fileUrl) {
    var url;
    if (!fileUrl) {
      url = './assets/common/images/holderimg.png';
    } else if (fileUrl.indexOf('http:') > -1 || fileUrl.indexOf('https:') > -1 || fileUrl.indexOf('data:') > -1) {
      url = fileUrl;
    } else {
      url = AppConsts.remoteServiceBaseUrl + '\\' + fileUrl;
    }
    return url;
  }
  //选中所有
  chooseAll(items) {
    items.forEach((item) => {
      item.isSelected = true;
      if (item.children instanceof Array) {
        this.chooseAll(item.children);
      }
    })
  }
}