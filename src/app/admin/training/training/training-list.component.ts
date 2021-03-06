import { Component, OnInit, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { LoginServiceProxy } from '@shared/service-proxies/service-proxies';

import { AppConsts } from '@shared/AppConsts';
import { MyTreeComponent } from '@app/shared/common/my-tree/my-tree.component';
import { from } from 'rxjs';
import * as moment from 'moment';
import {
  AuditStatus, TrainingServiceProxy, TrainingBasicDto,TrainingAuditInput, AuditStatus as TrainingAuditStatus,TrainingStatusEnum 
} from '@shared/service-proxies/service-proxies5';
import { CreateOrEditTrainingModalComponent } from './create-or-edit-training-modal.component';
import { Router, ActivatedRoute } from '@angular/router';


var a = 100;
@Component({
  selector: 'app-red-packet',
  templateUrl: './training-list.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})
export class TrainingListComponent extends AppComponentBase {

  //  CreateOrEditTrainingModal绑定html里#号后面 
  @ViewChild('CreateOrEditTrainingModal', { static: true }) createOrEditTrainingModal: CreateOrEditTrainingModalComponent
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;
  @ViewChild('myTree', { static: false }) myTree: MyTreeComponent;

  AuditStatus = AuditStatus;

  filterText: string = "";
  auditStatus: any = '';
  trainingStatus: any = void 0;

  exportLoading = false;

  lecturerSuggestion: any = [];

  TrainingStatus = TrainingStatusEnum;

  busy = false;

  couponPublishList: any = [];

  onlyPublishToDevice = false;
  informDevice = false;
  trainingUserId: any = '';
  // startTime: any = moment().utc().subtract(29, 'days').startOf('day');
  // endTime: any = moment().utc().endOf('day');
  startTime = void 0;
  endTime = void 0;

  lecturers: any = '';

  constructor(injector: Injector,
    private _trainingService: TrainingServiceProxy,
    private router: Router, private route: ActivatedRoute,
    private _LoginServiceProxy: LoginServiceProxy
  ) {
    super(injector);

  }


  //获取培训列表
  getTrainings(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }

    this.primengTableHelper.showLoadingIndicator();

    this._trainingService.getTrainings(
      void 0,
      this.auditStatus,
      this.startTime ? moment(this.startTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h') : void 0,
      this.endTime ? moment(this.endTime.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's') : void 0,
      void 0,
      void 0,
      void 0,
      this.trainingStatus,
      this.trainingUserId,
      this.filterText,
      this.primengTableHelper.getSorting(this.dataTable) || 'title',
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

  //新增培训
  createTraining() {
    this.createOrEditTrainingModal.show();
  }
  //修改培训
  editTraining(record) {
    this.createOrEditTrainingModal.show(Object.assign({}, record));
  }

  //删除红包
  deleteTraining(record: TrainingBasicDto) {
    this.message.confirm(this.l('deletethistraining'), this.l('AreYouSure'), (r) => {
      if (r) {
        this._trainingService.deleteTraining(record.id).subscribe(result => {
          this.couponPublishList = [];
          this.notify.info(this.l('success'));
          this.getTrainings();
        })
      }
    })
  }


  //下线所有
  offlineAll() {
    // this.review(false);
    this._trainingService.trainingAudit(new TrainingAuditInput({
      trainingIds: [],
      currentAuditStatus: AuditStatus["Online"],
      targetAuditStatus: AuditStatus["Offline"]
    })).subscribe(r => {
      this.getTrainings()
    })
  }
  //下线
  offline() {
    this.checkSelection(false, (ary) => {
      // this.review(false, ary);
      this._trainingService.trainingAudit(new TrainingAuditInput({
        trainingIds: ary,
        currentAuditStatus: AuditStatus["Online"],
        targetAuditStatus: AuditStatus["Offline"]
      })).subscribe(r => {
        this.getTrainings()
      })
    })
  }
  //上线
  online() {
    this.checkSelection(true, (ary) => {
      console.log(ary)
      // this.review(true, ary);
      this._trainingService.trainingAudit(new TrainingAuditInput({
        trainingIds: ary,
        currentAuditStatus: AuditStatus["Offline"],
        targetAuditStatus: AuditStatus["Online"]
      })).subscribe(r => {
        this.getTrainings()
      })
    })
  }
  //上线所有
  onlineAll() {
    // this.review(true);
    this._trainingService.trainingAudit(new TrainingAuditInput({
      trainingIds: [],
      currentAuditStatus: AuditStatus["Offline"],
      targetAuditStatus: AuditStatus["Online"]
    })).subscribe(r => {
      this.getTrainings()
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

  //筛选培训上下线
  filterTraining() {
    var upNum = [], upNumIds = [], downNum = [], downNumIds = [];
    this.couponPublishList.forEach((v, index, array) => {
      if (v.auditStatus == 'Offline') {
        downNum.push(v);
        downNumIds.push(v.id);
      } else if (v.auditStatus == 'Online') {
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

  //检测选中设备上下线情况
  // f -> bool  代表上下线操作  true表示需要上线  则筛去已上线
  //all ->bool 表示是否操作全部
  checkSelection(f, callback, all?) {
    var upNum = this.filterTraining().upNum, downNum = this.filterTraining().downNum,
      upNumIds = this.filterTraining().upNumIds, downNumIds = this.filterTraining().downNumIds;
    if (all) {
      return callback && callback([]);
    }
    if (f) {
      if (downNum.length == 0) {
        return this.notify.info(this.l('noneOfflineGotten'));
      }
      if (upNum.length != 0) {
        this.message.confirm(this.l("nowChooseTip0") + upNum.length + this.l("nowChooseTip1"), this.l('AreYouSure'), (r) => {
          if (r) {
            this.couponPublishList = downNum;
          }
        })
      }
    } else {
      if (upNum.length == 0) {
        return this.notify.info(this.l('noneOnlineGotten'));
      }
      if (downNum.length != 0) {
        this.message.confirm(this.l("nowChooseTip0") + downNum.length + this.l("nowChooseTip2"), this.l('AreYouSure'), (r) => {
          if (r) {
            this.couponPublishList = upNum;
          }
        })
      }
    }
    callback && callback(f ? downNumIds : upNumIds);
  }


  //选中所有
  chooseAll(items) {
    items.forEach((item) => {
      item.isSelected = true;
      if (item.children instanceof Array) {
        this.chooseAll(item.children);
      }
    })
  }


  goImport() {
    this.router.navigate(['app', 'admin', 'import', 'import', 'training']);
  }


  goExport() {
    this.exportLoading = true;
    // var selectedBrands = this.brandTree.getchosen().map(item => {
    //   return item.id
    // })
    this._trainingService.getTrainingsToExcel(
      void 0,
      this.auditStatus,
      void 0,
      void 0,
      void 0,
      void 0,
      this.trainingStatus,
      void 0,
      this.filterText,
      this.primengTableHelper.getSorting(this.dataTable) || 'lastModificationTime DESC',
      void 0,
      0
    ).subscribe(r => {

      setTimeout(() => {
        this.exportLoading = false;
      }, 2000)

      var href = `https://activity.api.troncell.com/api/File/DownloadTempFile?FileName=` + r.fileName + `&FileType=` + r.fileType + `&FileToken=` + r.fileToken;
      // window.location.href = href;
      var link = document.getElementById('aaa');
      $(link).attr("href", href);
      link.click();
      // this._FileServiceProxy.downloadTempFile(
      //   r.fileName,
      //   r.fileType,
      //   r.fileToken
      // ).subscribe(result => {
      //   console.log(result)
      // })
    })
  }

  // 筛选讲师
  lecturerFilter(event) {
    this._LoginServiceProxy.getPlatformUsers(abp.session.tenantId).subscribe((result) => {
      this.lecturerSuggestion = (result || []).map((item) => {
        return {
          'id': item.userId,
          'value': item.userName
        }
      })
    })
  }

  assignLecturer() {
    console.log(this.lecturers)
    if (this.lecturers.length !== 0) {
      this.trainingUserId = this.lecturers[0].id
    } else {
      this.trainingUserId = ''
    }
    
  }

  deleteBatch () {
    this.checkSelection(true, (ary) => {
      this.message.confirm(this.l('deleteBatch'), this.l('AreYouSure'),(r) => {
        if (r) {
          this._trainingService.batchDeleteTraining(ary).subscribe((result) => {
            this.notify.info(this.l('success'));
            this.getTrainings();
          })
        }
      })
    })
  }

}


