import { Component, OnInit, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { CreateOrEditPerModalComponent } from '@app/admin/device/peripheral/create-or-edit-peri-modal.component';
import { PeripheralServiceProxy,PeripheralDto} from '@shared/service-proxies/service-proxies';
import { AppConsts } from '@shared/AppConsts';

@Component({
  selector: 'app-peripheral',
  templateUrl: './peripheral.component.html',
  styleUrls: ['./peripheral.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})
export class PeripheralComponent extends AppComponentBase {

 @ViewChild('createOrEditPerModal',{static:true}) createOrEditPerModal: CreateOrEditPerModalComponent;
  // @ViewChild('editUserPermissionsModal') editPerPermissionsModal: EditPerPermissionsModalComponent;
  @ViewChild('dataTable',{static:true}) dataTable: Table;
  @ViewChild('paginator',{static:true}) paginator: Paginator;

  filterText:string;

  constructor(injector: Injector,
              private _peripheralService:PeripheralServiceProxy) {
      super(injector);
   }

  //获取外设列表
  getPeripherals(event?: LazyLoadEvent){
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.primengTableHelper.showLoadingIndicator();
      this._peripheralService.getPeripherals(
          this.filterText,
          this.primengTableHelper.getSorting(this.dataTable)||'name',
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
  //新增外设
  createPeripheral(){
      this.createOrEditPerModal.show();
  }
  //编辑外设
  editPeripheral(record){
    this.createOrEditPerModal.show(Object.assign({},record));
  }
  //删除外设
  deletePeripheral(record: PeripheralDto){
    this.message.confirm(this.l("DeleteThisPeriQuestion"),this.l('AreYouSure'), (r) => {
      if (r) {
        this._peripheralService.deletePeripheral(record.id).subscribe(result=>{
          this.notify.info(this.l('success'));
          this.getPeripherals();
        })
      }
    })
  }
  //转换序列
  transIndex(i,event?: LazyLoadEvent){
    return i+1+this.primengTableHelper.getSkipCount(this.paginator,event);
  }
  //转换图片路径
  transfileUrl(fileUrl){
     var url;
     if(!fileUrl){
        url = './assets/common/images/holderimg.png';
     }else if(fileUrl.indexOf('http:')>-1||fileUrl.indexOf('https:')>-1||fileUrl.indexOf('data:')>-1){
        url = fileUrl;
      }else{
        url = AppConsts.remoteServiceBaseUrl+'\\'+fileUrl;
      } 
      return url;
  }
}
