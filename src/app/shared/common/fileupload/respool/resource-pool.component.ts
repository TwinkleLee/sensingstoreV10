import { Component, Injector, Input, EventEmitter, Output, ViewChild, AfterContentInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';;
import {  ResourceFileServiceProxy } from '@shared/service-proxies/service-proxies';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { ModalDirective } from 'ngx-bootstrap/modal'




@Component({
  selector: 'app-fileupload-res-pool',
  templateUrl: './resource-pool.component.html',
  styles:[`.visible{overflow: visible;}`,`.modal{position:absolute;}`]
})
export class FileuploadResPoolComponent extends AppComponentBase implements AfterContentInit {
  //
  @ViewChild('dataTable',{static:true}) dataTable: Table;
  @ViewChild('paginator',{static:true}) paginator: Paginator;
  @ViewChild('resPoolModal',{static:true}) modal: ModalDirective;
  @Input() filearea:any;
  //广播事件
  @Output() onApply: EventEmitter<any> = new EventEmitter<any>();
  //
  filterText:string="";
  currentResourceId:number;
  resourceSelection:any[]=[];
  saving:boolean=false;
  constructor(injector: Injector,
    private _resourceService: ResourceFileServiceProxy) {
    super(injector);
  }
  ngAfterContentInit(){
      $("#resPoolModal").appendTo("body");
  }
  show(){
    this.modal.show();
  }
  close(){
    this.modal.hide();
  }
  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }
  //获取资源列表
  getResources(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.primengTableHelper.showLoadingIndicator();
    this._resourceService.getResources(
      undefined,
      undefined,
      this.filearea,
      this.filterText,
      undefined,
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
  //
  save(){
    var index = this.primengTableHelper.records.indexOf(this.resourceSelection[0])+this.primengTableHelper.getSkipCount(this.paginator, null)+1;
    var floor = Math.floor(index/5)*5;
    var toshow =  floor==index?index-5:floor;  
    this.onApply.emit({
      'selection':this.resourceSelection[0],
      'index':toshow});
    this.close();
  }
  
}
