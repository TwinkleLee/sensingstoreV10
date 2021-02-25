import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked, AfterViewInit } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { MatchInfoDto,MatchInfoServiceProxy,CreateMatchInfoInput,UpdateMatchInfoInput } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';

import { finalize } from 'rxjs/operators';

@Component({
    selector: 'createOrEditMatchModal',
    templateUrl: './create-or-edit-match-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`,`.skuList label{
            width: 100%;
            text-align: center;
        }`,`.skuList img{
            width: 100%;
        }`,`.skuList img.chosed{
            border:1px solid red;
        }`,`.modal-lg{
             margin:30px auto;
             min-width: 900px;
             width: 80%;
        }`
    ]
})
export class CreateOrEditMatchModalComponent extends AppComponentBase {
    @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;
    @ViewChild('paginator',{static:true}) paginator: Paginator;
    matchId;
    selection:any[]=[];
    saving:boolean=false;
    filterText:string = '';
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    constructor(injecor:Injector,private matchService:MatchInfoServiceProxy){
        super(injecor);
    }
    //获取skus
    getSkus(event?:LazyLoadEvent,e?:Event){
        e&&e.preventDefault();
        this.primengTableHelper.showLoadingIndicator();
        this.matchService.getSkusForMatchInfo(
            this.matchId,this.filterText,undefined,
            this.primengTableHelper.getMaxResultCount(this.paginator, event),
            this.primengTableHelper.getSkipCount(this.paginator, event)
        ).pipe(finalize(() => {
            this.primengTableHelper.hideLoadingIndicator();
        })).subscribe((result)=>{
          this.primengTableHelper.totalRecordsCount = result.totalCount;
          this.primengTableHelper.records = result.items;
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
    show(id?){
        this.selection=[];
        this.matchId = id;
        this.modal.show()
    }
    //监听显示事件
    onShown(){
        this.getSkus();
    }
    //imageGrid 广播事件
    onOperate(e){}
   
}
