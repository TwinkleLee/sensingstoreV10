import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked, AfterViewInit } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import {  AdServiceProxy, AuditStatus, AuditStatus as AuditStatus10 } from '@shared/service-proxies/service-proxies-ads';

// tag1
import {MatchInfoDto,MatchInfoServiceProxy,CreateMatchInfoInput,UpdateMatchInfoInput, DeviceServiceProxy} from '@shared/service-proxies/service-proxies'

import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';

@Component({
    selector: 'AdsAlertModal',
    templateUrl: './ads-selection-modal.component.html',
    styles: []
})
export class AdsAlertModalComponent extends AppComponentBase {
    @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;
    @ViewChild('paginator',{static:true}) paginator: Paginator;
    selection:any[]=[];
    saving:boolean=false;
    filterText:string='';
    deviceId;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    constructor(injecor:Injector,
        private _deviceService:DeviceServiceProxy,
        private _adsService:AdServiceProxy){
        super(injecor);
    }
    //获取ads
    getAds(event?:LazyLoadEvent){
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
          }
          this.primengTableHelper.showLoadingIndicator();
        this._deviceService.getUnPublishedAdsByDeviceId(
            this.deviceId,
            undefined,
            AuditStatus10.Online,
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
    show(id){
        this.selection= [];
        this.filterText = '';
        this.deviceId = id;
        this.modal.show()
    }
    //监听显示事件
    onShown(){
        this.getAds();
    }
    //imageGrid 广播事件
    onOperate(e){
        
    }
   
}
