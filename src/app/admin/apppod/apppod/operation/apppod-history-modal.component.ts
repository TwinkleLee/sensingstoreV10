import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
// import {DeviceTypeServiceProxy,DeviceTypeDto,CreateDeviceTypeInput,UpdateDeviceTypeInput} from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { LazyLoadEvent } from 'primeng/api';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';

import { BatchTaskLogServiceProxy } from '@shared/service-proxies/service-proxies-sync';

import { AppPodServiceProxy } from '@shared/service-proxies/service-proxies-cargo';
import { CreateOrEditApppodModalComponent } from '@app/admin/apppod/apppod/create-or-edit-apppod-modal.component';



@Component({
  selector: 'apppodHistoryModal',
  templateUrl: './apppod-history-modal.component.html',
  styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
  ]
})
export class ApppodHistoryModalComponent extends AppComponentBase {

  @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
  @ViewChild('createOrEditApppodModal', { static: true }) createOrEditApppodModal: CreateOrEditApppodModalComponent;


  @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();


  @ViewChild('dataTable', { static: false }) dataTable: Table;
  @ViewChild('paginator', { static: false }) paginator: Paginator;


  primengTableHelper0: PrimengTableHelper = new PrimengTableHelper();


  filterText: string;

  active = false;
  item: any = {};

  constructor(
    injector: Injector,
    private _BatchTaskLogServiceProxy: BatchTaskLogServiceProxy,
    private _AppPodServiceProxy: AppPodServiceProxy
  ) {
    super(injector);
  }


  getHistory(event?: LazyLoadEvent) {
    this.primengTableHelper0.showLoadingIndicator();

    this._AppPodServiceProxy.getAppPodVersions(
      this.item.id,
      undefined,
      undefined,
      // this.primengTableHelper0.getSorting(this.dataTable),
      'version DESC',
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

  show(item): void {

    this.item = item;
    this.active = true;
    this.modal.show();

    console.log(this.item)
    setTimeout(() => {
      this.getHistory()
    }, 500)

  }

  onShown(): void {

  }

  Create() {
    this.createOrEditApppodModal.show(this.item.id)
  }

  Edit(item) {
    this.createOrEditApppodModal.show(this.item.id, Object.assign({}, item))
  }



  Delete(item) {

  }

  close(): void {
    // this.active = false;
    this.modal.hide();
  }

}
