import { Component, OnInit, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { BatchTaskLogServiceProxy} from '@shared/service-proxies/service-proxies';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import { Table } from 'primeng/table';
import { finalize } from 'rxjs/operators';
import * as moment from 'moment';
import { CreateOrEditPlanModalComponent } from '@app/admin/onlineStore/online-store/create-or-edit-plan-modal';

import { PlanServiceProxy, ChangePlanStatusInput } from '@shared/service-proxies/service-proxies-sync';
import { PlanHistoryModalComponent } from '@app/admin/onlineStore/online-store/operation/plan-history-modal.component';
import { environment } from '@app/../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './online-store-history.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})
export class OnlineStoreHistoryComponent extends AppComponentBase {

  @ViewChild('planHistoryModalComponent',{static:true}) planHistoryModalComponent: PlanHistoryModalComponent;

  @ViewChild('CreateOrEditPlanModal',{static:true}) CreateOrEditPlanModal: CreateOrEditPlanModalComponent;

  @ViewChild('dataTable',{static:true}) dataTable: Table;
  @ViewChild('paginator',{static:true}) paginator: Paginator;

  historyPrimeng: PrimengTableHelper = new PrimengTableHelper();
  @ViewChild('dataTablehistory',{static:true}) dataTablehistory: Table;
  @ViewChild('paginatorhistory',{static:true}) paginatorhistory: Paginator;

  planPrimeng: PrimengTableHelper = new PrimengTableHelper();
  @ViewChild('dataTablePlan',{static:true}) dataTablePlan: Table;
  @ViewChild('paginatorPlan',{static:true}) paginatorPlan: Paginator;


  // SyncInputSyncType = SyncInputSyncType;
  // syncType: SyncInputSyncType = SyncInputSyncType.Full;
  ignoreField1 = false;
  ignoreField2 = false;
  accessTokenId;
  onlineStoreList;



  basic: any = {}

  constructor(injector: Injector,
    private _batchTaskLog: BatchTaskLogServiceProxy,
    // private _thirdParyService: ThirdParyServiceProxy,
    private _PlanServiceProxy: PlanServiceProxy,
    private router: Router,
    private _activeRouter: ActivatedRoute
  ) {
    super(injector);
    this._activeRouter.queryParams.subscribe(params => {
      this.basic = {
        name: params.name,
        id: params.id
      }
    })
  }



  goBack() {
    this.router.navigate(['app', 'admin','onlineStore', 'onlineStore']);
  }

  getPlanList(event?: LazyLoadEvent) {
    // if (!environment.production) {
    //   return
    // }
    if (this.planPrimeng.shouldResetPaging(event)) {
      this.paginatorPlan.changePage(0);
      return;
    }
    this.planPrimeng.showLoadingIndicator();
    //需要修改为按id筛选
    this._PlanServiceProxy.getAll(
      this.basic.id,
      void 0,
      this.planPrimeng.getSorting(this.dataTablehistory),
      this.planPrimeng.getMaxResultCount(this.paginatorPlan, event),
      this.planPrimeng.getSkipCount(this.paginatorPlan, event)
    )
    .pipe(this.myFinalize(() => { this.planPrimeng.hideLoadingIndicator(); }))
    .subscribe(result => {
      this.planPrimeng.totalRecordsCount = result.totalCount;
      this.planPrimeng.records = result.items;
      // this.planPrimeng.hideLoadingIndicator();
    })

  }


  offPlan(record) {
    this._PlanServiceProxy.changePlanStatus(new ChangePlanStatusInput({
      planId: record.id,
      isEnabled: false
    })).subscribe(r => {
      this.notify.info(this.l('success'));
      this.getPlanList();
    })
  }

  onPlan(record) {
    this._PlanServiceProxy.changePlanStatus(new ChangePlanStatusInput({
      planId: record.id,
      isEnabled: true
    })).subscribe(r => {
      this.notify.info(this.l('success'));
      this.getPlanList();
    })
  }


  createPlan() {
    // this.CreateOrEditPlanModal.show(this.onlineStoreList);
    this.CreateOrEditPlanModal.show(this.basic);
  }

  editPlan(record) {
    this._PlanServiceProxy.getSingle(record.id).subscribe(r => {
      // this.CreateOrEditPlanModal.show(this.onlineStoreList, r);
      this.CreateOrEditPlanModal.show(this.basic, r);
    })
  }

  showHistory(record) {
    this.planHistoryModalComponent.show(record.id);
  }

  deletePlan(record) {
    this.message.confirm(this.l('deletethissyncplan'),this.l('AreYouSure'), (r) => {
      if (r) {
        this._PlanServiceProxy.deletePlan(record.id).subscribe(() => {
          this.notify.info(this.l('success'));
          this.getPlanList();
        })
      }
    })
  }


  //查询同步历史
  getSyncHistory(event?: LazyLoadEvent) {
    if (this.historyPrimeng.shouldResetPaging(event)) {
      this.paginatorhistory.changePage(0);
      return;
    }
    this.historyPrimeng.showLoadingIndicator();
    this._batchTaskLog.getBatchTaskLogs(//ImportProducts,ImportAds,ImportMatches,ImportLikes,ImportStaffs,ImportDevices
      'SyncThirdOnlineProducts',
      // this.filterText,
      this.basic.id,
      void 0,
      this.historyPrimeng.getSorting(this.dataTablehistory) || 'taobao_user_nick',
      this.historyPrimeng.getMaxResultCount(this.paginatorhistory, event),
      this.historyPrimeng.getSkipCount(this.paginatorhistory, event)
    )
    .pipe(this.myFinalize(() => { this.historyPrimeng.hideLoadingIndicator(); }))
    .subscribe(result => {
      this.historyPrimeng.totalRecordsCount = result.totalCount;
      this.historyPrimeng.records = result.items;
      // this.historyPrimeng.hideLoadingIndicator();
    });
  }

  manageWeShop(record) {
    this.router.navigate(['app', 'admin','weshop', 'weshop'], { queryParams: { id: record.id } });
  }
  no() {
    $("#choseType").hide();
  }
  ok() {
    // var ignoreFields = this.ignoreField1 ? "Title" : "";
    // ignoreFields += this.ignoreField2 ? ",PicUrl" : "";
    // var input = new SyncInput({
    //   'syncType': this.syncType,
    //   'ignoreFields': ignoreFields,
    //   'accessTokenId': this.accessTokenId
    // });
    // this._thirdParyService.syncFromTaobao(input).subscribe((result) => {
    //   this.notify.info(this.l('success'));
    //   this.getSyncHistory();
    //   $("#choseType").hide();
    // })
  }
  syncOnlineStore(record) {
    console.log(record)
    this.accessTokenId = record.id
    $("#choseType").show();
  }
  //转换序列
  transIndex2(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginatorhistory, event);
  }
  transIndex3(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginatorPlan, event);
  }
  truncateStringWithPostfix(text: string, length: number): string {
    return abp.utils.truncateStringWithPostfix(text, length);
  }


}
