import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';

import { BatchTaskLogServiceProxy } from '@shared/service-proxies/service-proxies-sync';



@Component({
  selector: 'planHistoryModal',
  templateUrl: './plan-history-modal.component.html',
  styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
  ]
})
export class PlanHistoryModalComponent extends AppComponentBase {

  @ViewChild('nameInput',{static:false}) nameInput: ElementRef;
  @ViewChild('createOrEditModal',{static:false}) modal: ModalDirective;


  @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();


  @ViewChild('dataTable',{static:false}) dataTable: Table;
  @ViewChild('paginator',{static:false}) paginator: Paginator;


  primengTableHelper0: PrimengTableHelper = new PrimengTableHelper();


  filterText: string;



  active = false;
  planId;

  constructor(
    injector: Injector,
    private _BatchTaskLogServiceProxy: BatchTaskLogServiceProxy
  ) {
    super(injector);
  }



  getPlanHistory(event?: LazyLoadEvent) {
    this.primengTableHelper0.showLoadingIndicator();

    this._BatchTaskLogServiceProxy.getBatchTaskLogs(
      this.planId,
      void 0,
      this.primengTableHelper0.getSorting(this.dataTable),
      this.primengTableHelper0.getMaxResultCount(this.paginator, event),
      this.primengTableHelper0.getSkipCount(this.paginator, event)
    )
    .pipe(this.myFinalize(() => { this.primengTableHelper0.hideLoadingIndicator(); }))
    .subscribe(result => {
      this.primengTableHelper0.totalRecordsCount = result.totalCount;
      this.primengTableHelper0.records = result.items;
      // this.primengTableHelper0.hideLoadingIndicator();
    });
  }

  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper0.getSkipCount(this.paginator, event);
  }


  ngAfterViewChecked(): void {
    //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
    $('tabset ul.nav').addClass('m-tabs-line');
    $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
  }

  show(planId): void {

    this.planId = planId;
    this.active = true;
    this.modal.show();

    console.log(planId)
    setTimeout(() => {
      this.getPlanHistory()
    }, 500)

  }

  onShown(): void {

  }


  close(): void {
    // this.active = false;
    this.modal.hide();
  }

}
