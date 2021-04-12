import { Component, OnInit, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { CourseServiceProxy, CourseDto} from '@shared/service-proxies/service-proxies5';
import { CreateOrEditCourseModalComponent } from './course-modal.component';
import { SetTrainingModalComponent } from './training-modal.component'


var a=100;
@Component({
  templateUrl: './course.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})
export class CourseComponent extends AppComponentBase {

  @ViewChild('dataTable',{static:true}) dataTable: Table;
  @ViewChild('paginator',{static:true}) paginator: Paginator;
  @ViewChild('courseModal', { static: true }) courseModal: CreateOrEditCourseModalComponent;
  @ViewChild('trainingModal', { static: true }) trainingModal: SetTrainingModalComponent;

  filterText: string = "";
  coursePublishList :any =[];

  constructor(injector: Injector,
    private _courseSerivce: CourseServiceProxy,
  ) {
    super(injector);
  }


  //获取培训列表
  getCourses(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }

    this.primengTableHelper.showLoadingIndicator();

    this._courseSerivce.getCourses(
      void 0,
      void 0,
      void 0,     
      void 0,     
      this.filterText,
      this.primengTableHelper.getSorting(this.dataTable),
      this.primengTableHelper.getMaxResultCount(this.paginator, event),
      this.primengTableHelper.getSkipCount(this.paginator, event)
    )
    .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
    .subscribe(result => {
      this.primengTableHelper.totalRecordsCount = result.totalCount;
      this.primengTableHelper.records = result.items;
    });
  }


  //删除
  deleteCourse(record: CourseDto) {
    this.message.confirm(this.l('deletethisselected'),this.l('AreYouSure'), (r) => {
      if (r) {
        this._courseSerivce.deleteCourse(record.id).subscribe(result => {
          this.coursePublishList = [];
          this.notify.info(this.l('success'));
          this.getCourses();
        })
      }
    })
  }

  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }


  // 新增课程
  creatCourse () {
    this.courseModal.show()
  }

  // 批量删除
  deleteBatch() {
    var ids = this.coursePublishList.map(({ id }) => id);
    this.message.confirm(this.l('deletethisselected'), this.l('AreYouSure'), (r) => {
      if (r) {
        this.primengTableHelper.showLoadingIndicator();

        this._courseSerivce.batchDeleteCourses(ids)
          .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
          .subscribe(result => {
            this.coursePublishList = [];
            this.notify.info(this.l('success'));
            this.getCourses();
          })
      }
    })
  }

  // 编辑课程
  editCourse (record: any) {
    this.courseModal.show(Object.assign({}, record))
  }

  // 生成培训
  setTraining () {
    this.trainingModal.show()
  }
 

}


