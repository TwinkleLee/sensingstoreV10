import { Component, OnInit, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppConsts } from '@shared/AppConsts';
import { MyTreeComponent } from '@app/shared/common/my-tree/my-tree.component';
import { NaireModalComponent } from '@app/admin/question/question/operation/naire-modal.component';
import { PublishPapersToSoftwares, PaperServiceProxy } from '@shared/service-proxies/service-proxies5';
import { SoftwareServiceProxy } from '@shared/service-proxies/service-proxies-ads';
//ooo
import { TagServiceProxy, TagType as Type } from '@shared/service-proxies/service-proxies2';


import { Router } from '@angular/router';

@Component({
  selector: 'app-naire',
  templateUrl: './naire.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})

export class NaireComponent extends AppComponentBase {

  @ViewChild('naireModal', { static: true }) NaireModalComponent: NaireModalComponent;
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;
  @ViewChild('myTree', { static: false }) myTree: MyTreeComponent;

  filterText: string = "";
  treeFilter: string = "";
  toPublish;
  operateAll;
  auditStatus: any = "";
  publishType = "add";
  softwareTree: any[] = [];
  paperPublishList = [];


  tags = [];
  tagFilter = "";

  constructor(injector: Injector,
    private _softwareService: SoftwareServiceProxy,
    private _TagServiceProxy: TagServiceProxy,
    private _PaperServiceProxy: PaperServiceProxy,
    private router: Router) {
    super(injector);
    this.getTags();
    if (this.isGranted("Pages.Softwares")) {

      this._softwareService.getAuthorizedSoftwares(
        undefined,
        undefined,
        undefined,//filterText
        undefined,
        999,
        0
      ).subscribe(result => {
        console.log(result.items, '软件树');

        this.softwareTree = result.items.map(item => {
          return {
            id: item.id,
            name: item.alias || item.software.name
          }
        });
      })
    }

  }

  getTags() {
    this._TagServiceProxy.getTagsByType('', undefined, 1000, 0, Type.Question).subscribe((r) => {
      this.tags = r.items;
    })
  }

  goImport() {

  }

  deleteBatch() {
    this.message.confirm(this.l('deletethispaper'), this.l('AreYouSure'), (r) => {
      if (r) {
        var ids = this.paperPublishList.map(item => {
          return item.id
        })
        this._PaperServiceProxy.deletePapers(ids).subscribe((result) => {
          this.notify.info(this.l('success'));
          this.getPaper();
        })
      }
    })
  }
  getPaper(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.paperPublishList = [];


    this.primengTableHelper.showLoadingIndicator();
    this._PaperServiceProxy.getPapers(
      undefined,
      this.tagFilter ? [Number(this.tagFilter)] : [],
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
  //新增
  createNaire() {
    this.NaireModalComponent.show();
  }
  editNaire(record) {
    this.NaireModalComponent.show(record);
  }
  goDashboard(record) {
    this.router.navigate(['app', 'admin','question', 'naire', 'dashboard'], { queryParams: { id: record.id, name: record.name, paperUsageType: record.paperUsageType } });
  }

  //删除
  deleteNaire(record) {
    this.message.confirm(this.l('deletethispaper'), this.l('AreYouSure'), (r) => {
      if (r) {
        this._PaperServiceProxy.deletePaper(record.id).subscribe(result => {
          this.paperPublishList = [];
          this.notify.info(this.l('success'));
          this.getPaper();
        })
      }
    })
  }

  //显示图片加载失败的占位图
  showEmpty(e) {
    var target = $(e.target);
    target.attr("src", AppConsts.appBaseUrl + "/assets/common/images/holderimg.png")
  }

  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }


  getSoftwareTree(cb?) {
    // this._softwareService.getAuthorizedSoftwares(
    //   undefined,
    //   undefined,
    //   undefined,//filterText
    //   undefined,
    //   999,
    //   0
    // ).subscribe(result => {
    //   console.log(result.items, '软件树');

    //   this.softwareTree = result.items.map(item => {
    //     return {
    //       id: item.id,
    //       name: item.alias || item.software.name
    //     }
    //   });
    cb && cb();
    // });
  }

  // 显示发布侧栏
  publishNaire() {
    if (this.paperPublishList.length > 0) {
      this.getSoftwareTree(() => {
        this.toPublish = true;
      });
    } else {
      this.message.warn(this.l('atLeastChoseOneItem'))
    }
  }


  doPublishNaire() {
    var dispathcedSoftwareIds: any = this.myTree.getchosen().map(item => {
      return item.id
    })

    var paperIds = this.paperPublishList.map(item => {
      return item.id
    });
    var publishType = this.publishType;

    var input = new PublishPapersToSoftwares({
      dispathcedSoftwareIds,
      paperIds,
      action: publishType
    })

    console.log(input)

    if (this.operateAll) {
      this.paperPublishList = [];
      this.message.confirm(this.publishType == 'delete' ? this.l('isWithdrewAll') : this.l('isPublishAll'), this.l('AreYouSure'), (r) => {
        if (r) {
          this._PaperServiceProxy.publishPapersToSoftwares(input).subscribe(r => {
            this.notify.info(this.l('success'));
            this.toPublish = false;
            this.operateAll = false;
          })
        }
      })
    } else {
      this.message.confirm(this.publishType == 'delete' ? this.l('isWithdrewChosen') : this.l('isPublishChosen'), this.l('AreYouSure'), (r) => {
        if (r) {
          this._PaperServiceProxy.publishPapersToSoftwares(input).subscribe(r => {
            this.notify.info(this.l('success'));
            this.paperPublishList = [];
            this.toPublish = false;
            this.operateAll = false;
          })
        }
      })
    }
  }



  //筛选树
  filterTree(e?: Event) {
    e && e.preventDefault();
    this.myTree.filterTree(this.treeFilter);
  }
}


