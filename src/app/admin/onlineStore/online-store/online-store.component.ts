import { Component, OnInit, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { ExternalAccessServiceProxy, BatchTaskLogServiceProxy, AuditLogServiceProxy, TaobaoOpenPlatformServiceProxy } from '@shared/service-proxies/service-proxies';
import { TaobaoServiceProxy, SyncInput, SyncInputSyncType, MonecityServiceProxy } from '@shared/service-proxies/service-proxies-sync';
import { CreateOrEditExternalAccessModalComponent } from '@app/admin/onlineStore/online-store/create-or-edit-online-modal.component';
import { ChooseTaobaoModalComponent } from '@app/admin/onlineStore/online-store/choose-taobao-modal.component';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import { Table } from 'primeng/table';
import { PlanHistoryModalComponent } from '@app/admin/onlineStore/online-store/operation/plan-history-modal.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-online-store',
  templateUrl: './online-store.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})
export class OnlineStoreComponent extends AppComponentBase {

  @ViewChild('planHistoryModalComponent', { static: true }) planHistoryModalComponent: PlanHistoryModalComponent;

  @ViewChild('createOrEditOnlineModal', { static: true }) createOrEditOnlineModal: CreateOrEditExternalAccessModalComponent;
  @ViewChild('chooseTaobaoModal', { static: false }) chooseTaobaoModal: ChooseTaobaoModalComponent;

  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;


  SyncInputSyncType = SyncInputSyncType;
  syncType: SyncInputSyncType = SyncInputSyncType._0;
  filterText;
  ignoreField1 = false;
  ignoreField2 = false;
  chooseTaobaoLoading = false;
  accessTokenId;
  onlineStoreList;
  nowFromType;
  constructor(injector: Injector,
    private _externalaccessService: ExternalAccessServiceProxy,
    private _taobaoPlatformService: TaobaoOpenPlatformServiceProxy,
    private _TaobaoServiceProxy: TaobaoServiceProxy,
    private _MonecityServiceProxy: MonecityServiceProxy,
    private router: Router
  ) {
    super(injector);
  }


  goHistory(record) {
    this.router.navigate(['app', 'admin','onlineStore', 'onlineStoreHistory'], { queryParams: { id: record.id, name: record.taobao_user_nick } });
  }


  chooseTaobao() {
    this.chooseTaobaoLoading = true;
    this._taobaoPlatformService.getTaobaoOpenPlatformList(
      undefined,
      undefined,
      100, 0
    ).subscribe(r => {
      this.chooseTaobaoLoading = false;
      this.chooseTaobaoModal.show(r.items);
    })
  }



  createOnlineStore() {
    this.createOrEditOnlineModal.show();
  }
  getOnlineStore(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.primengTableHelper.showLoadingIndicator();
    this._externalaccessService.getAll(
      this.filterText,
      this.primengTableHelper.getSorting(this.dataTable),
      this.primengTableHelper.getMaxResultCount(this.paginator, event),
      this.primengTableHelper.getSkipCount(this.paginator, event)
    )
      .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
      .subscribe(result => {
        this.onlineStoreList = result.items;
        this.primengTableHelper.totalRecordsCount = result.totalCount;
        this.primengTableHelper.records = result.items;
        // this.primengTableHelper.hideLoadingIndicator();
      });
  }
  deleteOnlineStore(record) {
    this.message.confirm(this.l('deletethisonlinestore'), this.l('AreYouSure'), (r) => {
      if (r) {
        this._externalaccessService.delete(record.id).subscribe(() => {
          this.notify.info(this.l('success'));
          this.getOnlineStore();
        })
      }
    })
  }
  editOnlineStore(record) {
    this.createOrEditOnlineModal.show(record);
  }

  manageWeShop(record) {
    this.router.navigate(['app', 'admin','weshop', 'weshop'], { queryParams: { id: record.id } });
  }
  no() {
    $("#choseType").hide();
  }
  ok() {
    var ignoreFields = this.ignoreField1 ? "Title" : "";
    ignoreFields += this.ignoreField2 ? ",PicUrl" : "";
    var input = new SyncInput({
      'syncType': this.syncType,
      'ignoreFields': ignoreFields,
      'accessTokenId': this.accessTokenId
    });
    if (this.nowFromType == "Monecity") {
      this._MonecityServiceProxy.syncFromMonecity(input).subscribe((result) => {
        this.notify.info(this.l('success'));
        $("#choseType").hide();
      })

    } else {
      // this._TaobaoServiceProxy.syncFromTaobao(input).subscribe((result) => {
      //   this.notify.info(this.l('success'));
      //   $("#choseType").hide();
      // })
      this._TaobaoServiceProxy.syncFromTaobao(input).subscribe((result) => { this.notify.info(this.l('success')); });
      $("#choseType").hide();
    }

  }
  syncOnlineStore(record) {
    this.accessTokenId = record.id;
    this.nowFromType = record.fromType;
    $("#choseType").show();
  }
  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }

  truncateStringWithPostfix(text: string, length: number): string {
    return abp.utils.truncateStringWithPostfix(text, length);
  }


}
