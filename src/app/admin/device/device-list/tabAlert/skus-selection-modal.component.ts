import { Component, ViewChild, Injector, Output, EventEmitter} from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import {  DeviceServiceProxy, AuditStatus as AuditStatus12, AuditStatus as AuditStatus13 } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';

@Component({
    selector: 'SkusSelectionModal',
    templateUrl: './skus-selection-modal.component.html',
    styles: [
    ]
})
export class SkusSelectionModalComponent extends AppComponentBase {
    @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;
    @ViewChild('paginator',{static:true}) paginator: Paginator;
    selection:any[]=[];
    saving:boolean=false;
    productId:number;
    deviceId:number;
    filterText:string='';
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    constructor(injecor:Injector,private _deviceService:DeviceServiceProxy){
        super(injecor);
    }
    //获取product
    getDeviceProductSkus(event?:LazyLoadEvent){
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
          }
          this.primengTableHelper.showLoadingIndicator();
            this._deviceService.getUnpublishedSkusByDeviceId(
                this.deviceId,
                this.productId,
                AuditStatus13.Online,
                this.filterText,
                undefined,
                this.primengTableHelper.getMaxResultCount(this.paginator, event),
                this.primengTableHelper.getSkipCount(this.paginator, event)
            )
            .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
            .subscribe((result)=>{
                this.primengTableHelper.totalRecordsCount = result.totalCount;
                this.primengTableHelper.records = result.items;
                // this.primengTableHelper.hideLoadingIndicator();
            })
    }

    save(){
        this.modalSave.emit({'selection':this.selection});
        this.modal.hide();
    }
    close(): void {  
        this.modal.hide();
    }
    //弹出显示方法
    show(deviceId,productId){
        this.selection= [];
        this.filterText = '';
        this.deviceId = deviceId;
        this.productId = productId;
        this.modal.show()
    }
    //监听显示事件
    onShown(){
        this.getDeviceProductSkus();
    }
   
}
