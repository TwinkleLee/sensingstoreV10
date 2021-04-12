import { Component, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import * as _ from 'lodash';

import { OKRServiceProxy, Status, Category, Charge, AddOrUpdateAttentionToObjectiveInput } from '@shared/service-proxies/service-proxies-okr';

import { CreateOrEditObjectiveModalComponent } from './objective-modal.component'

@Component({
  templateUrl: './objective-list.component.html',
  animations: [appModuleAnimation()]

})
export class ObjectiveComponent extends AppComponentBase {

  @ViewChild('objectiveModal', { static: true }) objectiveModal: CreateOrEditObjectiveModalComponent;
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  filterText = "";
  // startTime: any = '';
  // endTime: any = '';
  selectedList = [];
  objectiveStatus: any = '';
  objectiveCate: any = '';
  objectiveCharge: any = '';

  ObjectiveStatus = Status;
  ObjectiveCate = Category;
  ObjectiveCharge = Charge;

  startTime: any = moment().utc().subtract(29, 'days').startOf('day');
  endTime: any = moment().utc().endOf('day');

  constructor(injector: Injector,
    private _OKRServiceProxy: OKRServiceProxy,
    private _router: Router
  ) { 
    super(injector);
  }

  getList(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.selectedList = [];

    this.primengTableHelper.showLoadingIndicator();
    this._OKRServiceProxy.getObjectives(
      this.objectiveStatus,
      this.objectiveCharge,
      this.objectiveCate,
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

  createObjective() {
    this.objectiveModal.show();
  }

  editObjective(record) {
    console.log(record)
    this.objectiveModal.show(_.cloneDeep(record));
  }

  deleteObjective(record) {
    this.message.confirm(this.l('deletethisselected'), this.l('AreYouSure'), (r) => {
      if (r) {
        this.primengTableHelper.showLoadingIndicator();
        this._OKRServiceProxy.deleteObjective(record.id)
          .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
          .subscribe(result => {
            this.selectedList = [];
            this.notify.info(this.l('success'));
            this.getList();
          })
      }
    })
  }

  deleteObjectiveList() {
    var ids = this.selectedList.map(({ id }) => id);
    this.message.confirm(this.l('deletethisselected'), this.l('AreYouSure'), (r) => {
      if (r) {
        this.primengTableHelper.showLoadingIndicator();

        this._OKRServiceProxy.batchDeleteObjective(ids)
          .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
          .subscribe(result => {
            this.selectedList = [];
            this.notify.info(this.l('success'));
            this.getList();
          })
      }
    })
  }

  showResult (record) {
    this._router.navigate(['app/objective', 'keyresult', record.id])
  }

  focusObject (id, attention) {
    var obj = {
      objectiveId: id,
      objectiveAction: attention
    }
    this._OKRServiceProxy.addOrUpdateAttentionToObjective4Me(new AddOrUpdateAttentionToObjectiveInput(obj))
      .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
      .subscribe(result => {
        this.selectedList = [];
        this.notify.info(this.l('success'));
        this.getList();
      })

  }
}
