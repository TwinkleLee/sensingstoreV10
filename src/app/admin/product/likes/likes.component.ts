import { Component, OnInit, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { LikeInfoDto, LikeInfoServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppConsts } from '@shared/AppConsts';
import { ConnectorService } from '@app/shared/services/connector.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-likes',
  templateUrl: './likes.component.html',
  styleUrls: ['./likes.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})
export class LikesComponent extends AppComponentBase {

  // @ViewChild('editUserPermissionsModal') editPerPermissionsModal: EditPerPermissionsModalComponent;
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  filterText: string;
  skuid: number;
  likeSelection: any = [];
  showImage = false;

  constructor(injector: Injector,
    private Connector: ConnectorService,
    private router: Router,
    private route: ActivatedRoute,
    private _likesService: LikeInfoServiceProxy) {
    super(injector);
  }

  //获取猜你喜欢列表
  getLikeInfos(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.primengTableHelper.showLoadingIndicator();
    this._likesService.gets(
      this.skuid,
      this.filterText,
      this.primengTableHelper.getSorting(this.dataTable) || 'name',
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
  //切换显示模式
  toggle(f) {
    if (f) {
      $("#tableShow").show();
      $("#gridShow").hide();
      this.showImage = false;
    } else {
      $("#tableShow").hide();
      $("#gridShow").show();
      this.showImage = true;
    }
  }
  //图片操作
  onOperate(e) {
    this.operateLikeInfo(e.action, e.image);
  }
  //操作猜你喜欢
  operateLikeInfo(f, record?) {
    if (f == 'add') {
      this.Connector.setCache('likeinfo', null);
      this.router.navigate(['operation'], { relativeTo: this.route });
    } else if (f == 'info') {
      this.Connector.setCache('likeinfo', Object.assign({}, record));
      this.router.navigate(['operation', record.id], { relativeTo: this.route });
    } else if (f == 'delete') {
      this.message.confirm(this.l("DeleteThisLikeInfoQuestion"), this.l('AreYouSure'), (r) => {
        if (r) {
          this._likesService.delete(record.id).subscribe(result => {
            this.getLikeInfos();
          })
        }
      })
    }
  }
  //删除猜你喜欢
  deleteLikeInfo(record: LikeInfoDto) {
    this.message.confirm(this.l("DeleteThisPeriQuestion"), this.l('AreYouSure'), (r) => {
      if (r) {
        this._likesService.delete(record.id).subscribe(result => {
          this.notify.info(this.l('success'));
          this.getLikeInfos();
        })
      }
    })
  }
  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }
  //转换图片路径
  transfileUrl(fileUrl) {
    var url;
    if (!fileUrl) {
      url = './assets/common/images/holderimg.png';
    } else if (fileUrl.indexOf('http:') > -1 || fileUrl.indexOf('https:') > -1 || fileUrl.indexOf('data:') > -1) {
      url = fileUrl;
    } else {
      url = AppConsts.remoteServiceBaseUrl + '\\' + fileUrl;
    }
    return url;
  }
  //前往导入页面
  goImport() {
    this.router.navigate(['app', 'admin','import', 'import', 'like']);
  }
}

