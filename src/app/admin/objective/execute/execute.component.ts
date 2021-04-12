import { Component, Injector, ViewChild, ViewChildren } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import * as _ from 'lodash';

import { OKRServiceProxy, Status, Category, Charge, AddOrUpdateAttentionToObjectiveInput } from '@shared/service-proxies/service-proxies-okr';
import { CreateOrEditExecuteModalComponent } from './execute-modal.component'

@Component({
  templateUrl: './execute.component.html',
  animations: [appModuleAnimation()]

})
export class ExecuteComponent extends AppComponentBase {

  
  @ViewChild('executetModal', { static: true }) executetModal: CreateOrEditExecuteModalComponent;
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  filterText = "";
  selectedList: any = [];

  objectiveId: any = '';
  keyResultId: any = '';
  complete: any = '';
  objName: string = '';

  startTime: any = moment().utc().subtract(29, 'days').startOf('day');
  endTime: any = moment().utc().endOf('day');

  constructor(injector: Injector,
    private _OKRServiceProxy: OKRServiceProxy,
    private _router: Router,
    private _ActivatedRoute: ActivatedRoute
  ) { 
    super(injector);

    this._ActivatedRoute.params
      .subscribe(data => {
        this.keyResultId = data.id
      })

    this._ActivatedRoute.queryParams.subscribe(data => {
      console.log(data)
      this.objectiveId = data.objectiveId
    })
  }

  ngOnInit () {
  }

  getList(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.selectedList = [];

    this.primengTableHelper.showLoadingIndicator();

    this._OKRServiceProxy.getExecuteList(
      this.keyResultId,
      this.complete,
      this.startTime ? moment(this.startTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h') : void 0,
      this.endTime ? moment(this.endTime.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's') : void 0,
      this.filterText,
      this.primengTableHelper.getSorting(this.dataTable),
      this.primengTableHelper.getMaxResultCount(this.paginator, event),
      this.primengTableHelper.getSkipCount(this.paginator, event)
    )
      .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
      .subscribe(result => {
        this.primengTableHelper.totalRecordsCount = result.totalCount;
        this.primengTableHelper.records = result.items;
      })
  }

  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }

  createItem() {
    this.executetModal.show()
  }

  editItem(record) {
    this.executetModal.show(_.cloneDeep(record))
  }

  deleteItem(record) {
    this.message.confirm(this.l('deletethisselected'), this.l('AreYouSure'), (r) => {
      if (r) {
        this.primengTableHelper.showLoadingIndicator();
        this._OKRServiceProxy.deleteExcute(record.id)
          .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
          .subscribe(result => {
            this.selectedList = [];
            this.notify.info(this.l('success'));
            this.getList();
          })
      }
    })
  }

  deleteBatch() {
    var ids = this.selectedList.map(({ id }) => id);
    this.message.confirm(this.l('deletethisselected'), this.l('AreYouSure'), (r) => {
      if (r) {
        this.primengTableHelper.showLoadingIndicator();

        this._OKRServiceProxy.batchDeleteExecute(ids)
          .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
          .subscribe(result => {
            this.selectedList = [];
            this.notify.info(this.l('success'));
            this.getList();
          })
      }
    })
  }

  goBack() {
    console.log(this.objectiveId)
    this._router.navigate(['app','admin','objective', 'keyresult', this.objectiveId])
  }

}
