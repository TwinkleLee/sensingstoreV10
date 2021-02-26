import { Component, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { CreatePublicAccountComponent } from '@app/admin/publicaccount/public-account/operation/create-public-account.component';
import { AppConsts } from '@shared/AppConsts';
import { WeixinMpServiceProxy } from '@shared/service-proxies/service-proxies5';
import { Router, ActivatedRoute } from '@angular/router';



@Component({
  selector: 'public-account',
  templateUrl: './public-account.component.html',
  styleUrls: ['./public-account.component.css'],
  animations: [appModuleAnimation()]
})
export class PublicAccountComponent extends AppComponentBase {
  @ViewChild('createPublicAccountModal',{static:true}) createPublicAccountModal: CreatePublicAccountComponent;
  @ViewChild('dataTable',{static:true}) dataTable: Table;
  @ViewChild('paginator',{static:true}) paginator: Paginator;
  filterText: string;
  StartTime;
  EndTime;
  MetaCheckedList: any = [];
  constructor(injector: Injector,
    private _weixinMpService: WeixinMpServiceProxy,
    private router: Router, private route: ActivatedRoute,
  ) {
    super(injector);
  }

  goCreate() {
    this.createPublicAccountModal.show();
  }

  getWXList(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.primengTableHelper.showLoadingIndicator();

    this._weixinMpService.getWeixinMps(
      this.filterText,
      this.primengTableHelper.getSorting(this.dataTable),
      this.primengTableHelper.getMaxResultCount(this.paginator, event),
      this.primengTableHelper.getSkipCount(this.paginator, event)
    )
    .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
    .subscribe(result => {
      console.log(result);
      this.primengTableHelper.totalRecordsCount = result.totalCount;
      this.primengTableHelper.records = result.items;
      // this.primengTableHelper.hideLoadingIndicator();
    })
  }


  goManage(record) {
    console.log(record);
    this.router.navigate(['app', 'publicaccount', 'publicaccount', 'manage'], { queryParams: { weixinAppID: record.weixinAppID, nickName: record.nickName } });
  }


  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }

}
