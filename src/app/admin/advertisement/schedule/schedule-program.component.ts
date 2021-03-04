import { Component, OnInit, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppConsts } from '@shared/AppConsts';
import { AdServiceProxy, PublishContentToAdScheduling } from '@shared/service-proxies/service-proxies';
import * as moment from 'moment';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ProgramModalComponent } from '@app/admin/advertisement/schedule/operation/program-modal.component';
import { MyTreeComponent } from '@app/shared/common/my-tree/my-tree.component';

@Component({
  templateUrl: './schedule-program.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})
export class ScheduleProgram extends AppComponentBase {

  @ViewChild('programModal', { static: true }) ProgramModalComponent: ProgramModalComponent;

  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;
  @ViewChild('myTree', { static: false }) myTree: MyTreeComponent;


  filterText: string = "";
  programPublishList = [];
  busy = false;

  scheduleName;
  from;
  deviceId;
  treeFilter: string = "";
  toPublish;
  publishType = 'add';
  scheduleTree: any[] = [];


  constructor(injector: Injector,
    private router: Router,
    private _AdServiceProxy: AdServiceProxy,
    private activatedRoute: ActivatedRoute) {
    super(injector);
    this._AdServiceProxy.getSchedulings(
      undefined,
      undefined,
      999,
      0
    )
      .pipe(this.myFinalize(() => { }))
      .subscribe(result => {
        console.log(result);
        this.scheduleTree = result.items;
      })
  }
  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.from = params['from'];
      this.deviceId = params['deviceId'];
      console.log('queryParams', params);
    });
  }

  goBack() {
    if (this.from == 'ads') {
      this.router.navigate(['app', 'advertisement', 'schedule']);
    } else {
      this.router.navigate(['app', 'device', 'deviceList', 'operation', this.deviceId]);
    }
  }

  getProgram(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.programPublishList = [];

    this.primengTableHelper.showLoadingIndicator();
    this._AdServiceProxy.getProgramsIn24HoursList(
      undefined,
      this.filterText,
      this.primengTableHelper.getSorting(this.dataTable),
      this.primengTableHelper.getMaxResultCount(this.paginator, event),
      this.primengTableHelper.getSkipCount(this.paginator, event)
    )
      .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
      .subscribe(result => {
        var list = Object.assign({}, result);
        list.items.forEach((element,index) => {
          element.content = JSON.parse(element.content);
          if(index==0){
            if(!element.adList)element.adList=[];
            if(!element.softwareList)element.softwareList=[];
          }else{
            element.adList = list.items[0].adList;
            element.softwareList = list.items[0].softwareList;
          }
        });
        this.primengTableHelper.totalRecordsCount = result.totalCount;
        this.primengTableHelper.records = list.items;
        console.log(this.primengTableHelper.records);
      })
  }
  createProgram() {
    this.ProgramModalComponent.show();
  }

  editProgram(record) {
    this.ProgramModalComponent.show(record);
  }
  //删除
  deleteProgram(id) {
    this.message.confirm(this.l('deletethisselected'), this.l('AreYouSure'), (r) => {
      if (r) {
        this._AdServiceProxy.deleteSchedulingContents([id]).subscribe(result => {
          this.programPublishList = [];
          this.notify.info(this.l('success'));
          this.getProgram();
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



  // 显示发布侧栏
  goPublish() {
    this.toPublish = true;
  }

  doPublishSchedule() {
    var adschedulingIds = this.myTree.getchosen()
      .map(item => {
        return item.id
      })

    if (adschedulingIds.length == 0) {
      this.notify.info(this.l('atLeastChoseOneItem'));
      return
    }
    var programIds = this.programPublishList.map(item => {
      return item.id
    });
    var publishType = this.publishType;

    var input = new PublishContentToAdScheduling({
      "adSchedulingContentIds": programIds,
      "adschedulingId": adschedulingIds[0],
      "action": publishType
    })


    this.message.confirm(this.publishType == 'delete' ? this.l('isWithdrewChosen') : this.l('isPublishChosen'), this.l('AreYouSure'), (r) => {
      if (r) {
        this._AdServiceProxy.addContentToScheduling(input).subscribe(r => {
          this.notify.info(this.l('success'));
          this.programPublishList = [];
          this.toPublish = false;
        })
      }
    })
  }

  //筛选树
  filterTree(e?: Event) {
    e && e.preventDefault();
    this.myTree.filterTree(this.treeFilter);
  }

}


