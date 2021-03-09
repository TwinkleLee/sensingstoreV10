import { Component, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { CreateOrEditDevModalComponent } from '@app/admin/device/device-type/create-or-edit-deviceType-modal.component';
import { AppConsts } from '@shared/AppConsts';
import { DeviceServiceProxy as NewDeviceServiceProxy} from '@shared/service-proxies/service-proxies-devicecenter';


@Component({
  selector: 'app-device-type',
  templateUrl: './device-type.component.html',
  styleUrls: ['./device-type.component.css'],
  animations: [appModuleAnimation()]
})
export class DeviceTypeComponent extends AppComponentBase {

  @ViewChild('createOrEditDevModal',{static:true}) createOrEditDevModal: CreateOrEditDevModalComponent;
  @ViewChild('dataTable',{static:true}) dataTable: Table;
  @ViewChild('paginator',{static:true}) paginator: Paginator;

  filterText: string;
  constructor(injector: Injector, private _NewDeviceServiceProxy: NewDeviceServiceProxy) {
    super(injector);
  }

  createDeviceType() {
    this.createOrEditDevModal.show();
  }
  //获取设备类型
  getDeviceType(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.primengTableHelper.showLoadingIndicator();
    this._NewDeviceServiceProxy.getDeviceTypes(
      this.filterText,
      this.primengTableHelper.getSorting(this.dataTable) || 'name',
      this.primengTableHelper.getMaxResultCount(this.paginator, event),
      this.primengTableHelper.getSkipCount(this.paginator, event)
    )
    .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
    .subscribe(result => {
      this.primengTableHelper.totalRecordsCount = result.totalCount;
      this.primengTableHelper.records = result.items;
      // this.primengTableHelper.hideLoadingIndicator();
    });
  }
  //x修改
  editDeviceType(record) {
    this.createOrEditDevModal.show(Object.assign({}, record))
  }
  //删除设备类型
  deleteDeviceType(record) {
    this.message.confirm(this.l('deletethisdevicetype'),this.l('AreYouSure'), (r) => {
      if (r) {
        this._NewDeviceServiceProxy.deleteDeviceType(record.id).subscribe(result => {
          this.notify.info(this.l('success'));
          this.getDeviceType();
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

}
