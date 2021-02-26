import { Component, OnInit, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Router } from '@angular/router';
import { FaceModalComponent } from '@app/admin/recommend/face-recommend/operation/face-modal.component';
import { ActivityServiceProxy } from '@shared/service-proxies/service-proxies5';
import { FaceTagsServiceProxy } from '@shared/service-proxies/service-proxies4';
import { finalize } from 'rxjs/operators';



@Component({
  selector: 'app-face',
  templateUrl: './face-recommend.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})
export class FaceRecommendComponent extends AppComponentBase {

  @ViewChild('FaceModal',{static:true}) FaceModalComponent: FaceModalComponent;
  @ViewChild('dataTable',{static:true}) dataTable: Table;
  @ViewChild('paginator',{static:true}) paginator: Paginator;

  filterText: string = "";
  activityPublishList = [];
  busy = false;
  tenantId = abp.session.tenantId;

  IsEnabled: any = '';

  constructor(injector: Injector,
    private router: Router,
    private _FaceTagsServiceProxy: FaceTagsServiceProxy,
    private _acitvityService: ActivityServiceProxy) {
    super(injector);
  }

  getFaceTagList(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.activityPublishList = [];

    this.primengTableHelper.showLoadingIndicator();
    this._FaceTagsServiceProxy.getFaceTagList(
      // this._acitvityService.getActivities(
      undefined,
      undefined,
      this.IsEnabled,
      undefined,
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
  createActivity() {
    this.FaceModalComponent.show();
  }
  editActivity(id) {
    this.FaceModalComponent.show(id);
  }
  //删除活动
  deleteActivity(id) {
    this.message.confirm(this.l('deletethisfacetag'),this.l('AreYouSure'), (r) => {
      if (r) {
        this._FaceTagsServiceProxy.deleteFaceTag(id).subscribe(result => {
          this.notify.info(this.l('success'));
          this.getFaceTagList();
        })
      }
    })
  }
  deleteBatch() {
    if (this.activityPublishList.length === 0) {
      this.message.warn(this.l('selectOneWarn'));
    } else {
      this.message.confirm(this.l('deleteFaceTagQuestion'), this.l('AreYouSure'),(r) => {
        if (r) {
          var personalCheckedIdList = [];
          for (var value of this.activityPublishList) {
            personalCheckedIdList.push(value.id);
          }
          this._FaceTagsServiceProxy.deleteFaceTagList(personalCheckedIdList).subscribe(result => {
            this.notify.info(this.l('success'));
            this.getFaceTagList();
            this.activityPublishList = [];
          })
        }
      })
    }
  }
  On() {
    if (this.activityPublishList.length === 0) {
      this.message.warn(this.l('selectOneWarn'));
    } else {
      var personalCheckedIdList = [];
      for (var value of this.activityPublishList) {
        personalCheckedIdList.push(value.id);
      }
      this._FaceTagsServiceProxy.batchEnableTags(personalCheckedIdList).subscribe(result => {
        this.notify.info("启用成功");
        this.getFaceTagList();
        this.activityPublishList = [];
      })
    }
  }
  Off() {
    if (this.activityPublishList.length === 0) {
      this.message.warn(this.l('selectOneWarn'));
    } else {
      var personalCheckedIdList = [];
      for (var value of this.activityPublishList) {
        personalCheckedIdList.push(value.id);
      }
      this._FaceTagsServiceProxy.batchDisableTags(personalCheckedIdList).subscribe(result => {
        this.notify.info("禁用成功");
        this.getFaceTagList();
        this.activityPublishList = [];
      })
    }
  }

  goImport() {
    this.router.navigate(['app', 'import', 'import', 'faceRecommend']);
  }

  SynchronousData() {
    this.message.confirm(this.l('IfSynchronousData'), this.l('AreYouSure'),(r) => {
      if (r) {
        this.busy = true;
        this._FaceTagsServiceProxy.syncFromHost()
          .pipe(finalize(() => { this.busy = false; }))
          .subscribe(r => {
            this.notify.info("同步成功");
            this.getFaceTagList();
          })
      }
    })
  }

  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }
}


