import { Component, OnInit, Injector, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppConsts } from '@shared/AppConsts';
import { MyTreeComponent } from '@app/shared/common/my-tree/my-tree.component';
import { Router } from '@angular/router';
import { QuestionModalComponent } from '@app/admin/question/question/operation/question-modal.component';
import { UpdateQuestionStatusInput, PublishedQuestionDto, QuestionServiceProxy, PublishQuestionsToPapersInput, PaperServiceProxy } from '@shared/service-proxies/service-proxies5';
import { TagServiceProxy, TagType as Type } from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs/operators';
import { DeviceServiceProxy as NewDeviceServiceProxy} from '@shared/service-proxies/service-proxies-devicecenter';



@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})
export class QuestionComponent extends AppComponentBase {

  @ViewChild('questionModal' ,{static:true}) QuestionModalComponent: QuestionModalComponent;
  @ViewChild('dataTable' ,{static:true}) dataTable: Table;
  @ViewChild('paginator' ,{static:true}) paginator: Paginator;
  @ViewChild('myTree' ,{static:false}) myTree: MyTreeComponent;


  filterText: string = "";
  treeFilter: string = "";
  toPublish;
  publishType = 'add';
  paperTree: any[] = [];
  questionPublishList = [];


  type: any = "";


  busy = false;


  tags = [];
  tagFilter = "";

  constructor(injector: Injector,
    private router: Router,
    private _NewDeviceServiceProxy: NewDeviceServiceProxy,
    private _PaperServiceProxy: PaperServiceProxy,
    private _TagServiceProxy: TagServiceProxy,
    private _QuestionServiceProxy: QuestionServiceProxy) {
    super(injector);
    this.getTags()
  }


  deleteBatch() {
    this.message.confirm(this.l('deletethisquestion'), this.l('AreYouSure'),(r) => {
      if (r) {
        var ids = this.questionPublishList.map(item => {
          return item.id
        })
        this._QuestionServiceProxy.deleteQuestions(ids).subscribe((result) => {
          this.notify.info(this.l('success'));
          this.getQuestion();
        })
      }
    })
  }



  goImport() {
    this.router.navigate(['app', 'admin','import', 'import', 'question']);
  }

  getQuestion(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.questionPublishList = [];

    this.primengTableHelper.showLoadingIndicator();
    this._QuestionServiceProxy.getQuestions(
      this.type,
      this.tagFilter ? [Number(this.tagFilter)] : [],
      undefined,
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

  getTags() {
    this._TagServiceProxy.getTagsByType('', undefined, 1000, 0, Type.Question).subscribe((r) => {
      this.tags = r.items;
    })
  }



  createQuestion() {
    this.QuestionModalComponent.show();
  }
  editQuestion(record) {
    this.QuestionModalComponent.show(record);
  }
  showActivityData(record) {
    this.router.navigate(['app', 'admin','activity', 'activity', 'data'], { queryParams: { id: record.id, name: record.name } });
  }
  //删除
  deleteQuestion(record) {
    this.message.confirm(this.l('deletethisquestion'),this.l('AreYouSure'), (r) => {
      if (r) {
        this._QuestionServiceProxy.deleteQuestion(record.id).subscribe(result => {
          this.questionPublishList = [];
          this.notify.info(this.l('success'));
          this.getQuestion();
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


  //筛选设备上下线
  filterCoupon() {
    var upNum = [], upNumIds = [], downNum = [], downNumIds = [];
    this.questionPublishList.forEach((v, index, array) => {
      if (!v.enabled) {
        downNum.push(v);
        downNumIds.push(v.id);
      } else if (v.enabled) {
        upNum.push(v);
        upNumIds.push(v.id);
      }
    })
    return {
      upNum: upNum,
      upNumIds: upNumIds,
      downNum: downNum,
      downNumIds: downNumIds
    }
  }
  //检测选中活动上下线情况
  // f -> bool  代表上下线操作  true表示需要上线  则筛去已上线
  //all ->bool 表示是否操作全部
  checkSelection(f, callback, all?) {
    var upNum = this.filterCoupon().upNum, downNum = this.filterCoupon().downNum,
      upNumIds = this.filterCoupon().upNumIds, downNumIds = this.filterCoupon().downNumIds;
    if (all) {
      return callback && callback([]);
    }
    if (f) {
      if (downNum.length == 0) {
        return this.notify.info(this.l('noneOfflineGotten'));
      }
      if (upNum.length != 0) {
        this.message.confirm(this.l("nowChooseTip0") + upNum.length + this.l("nowChooseTip1"), this.l('AreYouSure'),(r) => {
          if (r) {
            this.questionPublishList = downNum;
          }
          callback && callback(f ? downNumIds : upNumIds);
        })
      } else {
        callback && callback(f ? downNumIds : upNumIds);
      }
    } else {
      if (upNum.length == 0) {
        return this.notify.info(this.l('noneOnlineGotten'));
      }
      if (downNum.length != 0) {
        this.message.confirm(this.l("nowChooseTip0") + downNum.length + this.l("nowChooseTip2"),this.l('AreYouSure'), (r) => {
          if (r) {
            this.questionPublishList = upNum;
          }
          callback && callback(f ? downNumIds : upNumIds);
        })
      } else {
        callback && callback(f ? downNumIds : upNumIds);
      }
    }
  }
  getPaperTree(cb?) {
    //获取组织树
    this._NewDeviceServiceProxy.getOuStoreDeviceTree([]).subscribe((result) => {
      // this.paperTree = [result];
      console.log([result], '获取组织树')
      // cb && cb();
    })


    this._PaperServiceProxy.getPapers(
      undefined,
      undefined,
      undefined,
      undefined,
      999,
      0
    ).subscribe(result => {
      this.paperTree = result.items;
      console.log(this.paperTree, '获取树')
      cb && cb();
    })
  }

  // 显示发布侧栏
  publishToNaire() {
    this.checkSelection(false, (ary) => {
      this.getPaperTree(() => {
        this.toPublish = true;
      });
    })
  }


  doPublishQuestion() {
    var targetPaperList = this.myTree.getchosen().map(item => {
      return item.id
    })

    var entityIds = this.questionPublishList.map(item => {
      var obj = new PublishedQuestionDto()
      obj.id = item.id;
      return obj
    });
    var publishType = this.publishType;


    var input = {
      questions: entityIds,
      paperIds: targetPaperList,
      action: publishType
    }


    this.message.confirm(this.publishType == 'delete' ? this.l('isWithdrewChosen') : this.l('isPublishChosen'), this.l('AreYouSure'),(r) => {
      if (r) {
        this._QuestionServiceProxy.publishQuestionsToPapers(new PublishQuestionsToPapersInput(input))
        .pipe(finalize(() => { 
          this.questionPublishList = [];
          this.toPublish = false;
        }))
        .subscribe(r => {
          this.notify.info(this.l('success'));
        })
      }
    })
  }



  //下线
  offline() {
    this.checkSelection(false, (ary) => {
      this._QuestionServiceProxy.updateQuestionStatus(new UpdateQuestionStatusInput({
        ids: ary,
        isEnabled: false
      })).subscribe(r => {
        this.getQuestion();
      })
    })
  }
  //上线
  online() {
    this.checkSelection(true, (ary) => {
      console.log(ary)
      this._QuestionServiceProxy.updateQuestionStatus(new UpdateQuestionStatusInput({
        ids: ary,
        isEnabled: true
      })).subscribe(r => {
        this.getQuestion();
      })
    })
  }

  //筛选树
  filterTree(e?: Event) {
    e && e.preventDefault();
    this.myTree.filterTree(this.treeFilter);
  }
}