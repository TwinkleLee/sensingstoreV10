import { Component, OnInit, AfterViewInit, Injector, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import { PersonalityModalComponent } from '@app/admin/recommend/personal-recommend/operation/personality-modal.component';
import { FortuneModalComponent } from '@app/admin/recommend/personal-recommend/operation/fortune-modal.component';
import { MetaPhysicsServiceProxy, DateMetaPhysicsServiceProxy, GetImportDateMetaPhysicsInput } from '@shared/service-proxies/service-proxies4';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as moment from 'moment';


@Component({
  templateUrl: './personal-recommend.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})
export class PersonalRecommendComponent extends AppComponentBase {
  //查询
  PersonalCategory;
  StartTime: any = moment().utc().subtract(365, 'days').startOf('day');
  EndTime: any = moment().utc().subtract(-365, 'days').endOf('day');
  // EndTime: any = moment().utc().endOf('day');
  tenantId = abp.session.tenantId;
  PersonalName;
  metaName: string;
  metaName2: string;
  metaTypeSelect: any = "";
  metaTypeSelect2: any = "";
  FortuneCheckedList: any = [];
  PersonalCheckedList: any = [];
  //下拉
  PersonalCategories: any = [];
  HostCategories: any = [];
  //个性信息
  @ViewChild('PersonalityModal', { static: true }) PersonalityModal: PersonalityModalComponent;
  @ViewChild('PersonalityDataTable', { static: true }) PersonalityDataTable: Table;
  @ViewChild('PersonalityPaginator', { static: true }) PersonalityPaginator: Paginator;
  PersonalityPrimeng: PrimengTableHelper = new PrimengTableHelper();

  //运势信息
  @ViewChild('FortuneModal', { static: true }) FortuneModal: FortuneModalComponent;
  @ViewChild('FortuneDataTable', { static: true }) FortuneDataTable: Table;
  @ViewChild('FortunePaginator', { static: true }) FortunePaginator: Paginator;


  @ViewChild('TypeHostbox', { static: true }) typeHostboxElement: ElementRef;
  FortunePrimeng: PrimengTableHelper = new PrimengTableHelper();



  constructor(injector: Injector,
    private _metaService: MetaPhysicsServiceProxy,
    private router: Router,
    private _dateMetaService: DateMetaPhysicsServiceProxy) {
    super(injector);
    //个性分类下拉
    _metaService.getMetaPhysicsTypes(undefined, undefined, 1000, 0).subscribe((result) => {
      this.PersonalCategories = result.items;
    })
    _metaService.getHostMetaphysicsTypes(undefined, undefined, undefined, undefined).subscribe((result) => {
      this.HostCategories = result.items;
    })
  }


  ngAfterViewInit() {
    $('.fortuneTabset>ul>li>a').eq(0).click(function () {
      $('.fortuneTabset tab').eq(1).removeClass('active');
      $('.fortuneTabset tab').eq(0).addClass('active');
      $('.fortuneTabset>ul>li>a').eq(1).removeClass('active');
      $('.fortuneTabset>ul>li>a').eq(0).addClass('active');
    })

    $('date-range-picker input').val('');
  }





  /**
   * tab 个性信息
   */

  //获取个性信息列表
  getPersonalityInformation(event?: LazyLoadEvent) {
    if (this.PersonalityPrimeng.shouldResetPaging(event)) {
      this.PersonalityPaginator.changePage(0);
      return;
    }
    this.PersonalCheckedList = [];

    this.PersonalityPrimeng.showLoadingIndicator();
    this._metaService.getMetaPhysicsList(
      this.metaTypeSelect,
      this.metaName,
      this.PersonalityPrimeng.getSorting(this.PersonalityDataTable),
      this.PersonalityPrimeng.getMaxResultCount(this.PersonalityPaginator, event),
      this.PersonalityPrimeng.getSkipCount(this.PersonalityPaginator, event)
    ).pipe(finalize(() => {
      this.PersonalityPrimeng.hideLoadingIndicator();
    })).subscribe(result => {
      this.PersonalityPrimeng.totalRecordsCount = result.totalCount;
      this.PersonalityPrimeng.records = result.items;
    });
  }

  //批量删除个性信息
  deletePersonalList() {
    if (this.PersonalCheckedList.length === 0) {
      this.message.warn(this.l('selectOneWarn'));
    } else {
      this.message.confirm(this.l('deleteMetaQuestion'), this.l('AreYouSure'), (r) => {
        if (r) {
          this.primengTableHelper.showLoadingIndicator();
          console.log(this.PersonalCheckedList);
          var personalCheckedIdList = [];
          for (var value of this.PersonalCheckedList) {
            personalCheckedIdList.push(value.id);
          }
          console.log(personalCheckedIdList);
          this._metaService.deleteMetaphysicsList(personalCheckedIdList)
            .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
            .subscribe(result => {
              this.notify.info(this.l('success'));
              this.getPersonalityInformation();
              this.PersonalCheckedList = [];
            })
          // this.primengTableHelper.hideLoadingIndicator();
        }

      })

    }
  }
  //新增个性信息
  createPersonality() {
    this.PersonalityModal.show();
  }
  //修改个性信息
  editPersonality(record) {
    this.PersonalityModal.show(record);
  }
  //删除个性信息
  deletePersonality(record) {
    this.message.confirm(this.l("DeleteThisPersonalityInformation"), this.l('AreYouSure'), (r) => {
      if (r) {
        this._metaService.deleteMetaphysics(record.id).subscribe(result => {
          this.notify.info(this.l('success'));
          this.getPersonalityInformation();
          this.PersonalCheckedList = [];
        })
      }
    })
  }

  //导入个性信息
  importData() {
    this.message.confirm(this.l('SynchronousData'), this.l('AreYouSure'), (r) => {
      if (r) {
        this.primengTableHelper.showLoadingIndicator();
        this._metaService.importMetaphysics()
          .pipe(finalize(() => {
            this.primengTableHelper.hideLoadingIndicator();
          }))
          .subscribe(() => {
            this.notify.info(this.l('success'));
            this.getPersonalityInformation();
          })
      }
    })

  }

  //前往运势
  goFortune(name) {
    $('.fortuneTabset tab').eq(0).removeClass('active');
    $('.fortuneTabset tab').eq(1).addClass('active');
    $('.fortuneTabset>ul>li>a').eq(0).removeClass('active');
    $('.fortuneTabset>ul>li>a').eq(1).addClass('active');
    this.metaName2 = name;
    this.getFortuneInformation();
  }



  /**
   * tab 运势信息
   */

  //获取运势信息列表
  getFortuneInformation(event?: LazyLoadEvent) {
    if (this.FortunePrimeng.shouldResetPaging(event)) {
      this.FortunePaginator.changePage(0);
      return;
    }
    this.FortuneCheckedList = [];

    var StartTime = this.StartTime ? moment(this.StartTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h') : undefined;
    var EndTime = this.EndTime ? moment(this.EndTime.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's') : undefined;
    this.FortunePrimeng.showLoadingIndicator();
    this._dateMetaService.getDateMetaphysicsList(
      StartTime,
      EndTime,
      this.metaTypeSelect2,
      undefined,
      this.metaName2,
      this.FortunePrimeng.getSorting(this.FortuneDataTable),
      this.FortunePrimeng.getMaxResultCount(this.FortunePaginator, event) || 10,
      this.FortunePrimeng.getSkipCount(this.FortunePaginator, event)
    ).pipe(finalize(() => {
      this.FortunePrimeng.hideLoadingIndicator();
    })).subscribe(result => {
      this.FortunePrimeng.totalRecordsCount = result.totalCount;
      this.FortunePrimeng.records = result.items;
    });
  }


  //新增运势信息
  createFortune() {
    this.FortuneModal.show();
  }
  //批量删除运势信息
  deleteFortuneList() {
    if (this.FortuneCheckedList.length === 0) {
      this.message.warn(this.l('selectOneWarn'));
    } else {
      this.message.confirm(this.l('deleteFortuneQuestion'), this.l('AreYouSure'), (r) => {
        if (r) {
          this.primengTableHelper.showLoadingIndicator();
          console.log(this.FortuneCheckedList);
          var metaCheckedIdList = [];
          for (var value of this.FortuneCheckedList) {
            metaCheckedIdList.push(value.id);
          }
          this._dateMetaService.deleteDateMetaphysicsList(metaCheckedIdList)
            .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
            .subscribe(result => {
              this.notify.info(this.l('success'));
              this.getFortuneInformation();
              this.FortuneCheckedList = [];
            })
          // this.primengTableHelper.hideLoadingIndicator();
        }

      })

    }
  }

  //修改运势信息
  editFortune(record) {
    this.FortuneModal.show(record);
  }
  //删除运势信息
  deleteFortune(record) {
    this.message.confirm(this.l("DeleteThisFortuneInformation"), this.l('AreYouSure'), (r) => {
      if (r) {
        this._dateMetaService.deleteDateMetaphysics(record.id).subscribe(result => {
          this.notify.info(this.l('success'));
          this.getFortuneInformation();
          this.FortuneCheckedList = []
        })
      }
    })
  }
  //导入运势信息
  importDateData() {
    this.message.confirm(this.l('SynchronousData by screening conditions on the left'), this.l('AreYouSure'), (r) => {
      if (r) {
        this.FortunePrimeng.showLoadingIndicator();
        this._dateMetaService.importDateMetaphysics(new GetImportDateMetaPhysicsInput(
          {
            startTime: this.StartTime,
            endTime: this.EndTime,
            typeId: this.metaTypeSelect2,
            metaPhysicsId: undefined,
            filter: this.metaName2,
            sorting: undefined,
            maxResultCount: undefined,
            skipCount: undefined
          }
        )).pipe(finalize(() => {
          this.FortunePrimeng.hideLoadingIndicator();
        }))
          .subscribe(() => {
            this.notify.info(this.l('success'));
            this.getFortuneInformation();
          })
      }
    })
  }


  //转换序列
  transIndex(i, p, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(p, event);
  }
  //同步数据
  synchronousData(type) {
    console.log(type.id)
    this._metaService.getCopyMetaPhysics(undefined, undefined, type.id, undefined, undefined, undefined, undefined).subscribe(() => {
      this.notify.info(type.name + this.l('success'));
      this.getFortuneInformation();
      this.getPersonalityInformation();
    })
  }

  goImport() {
    this.router.navigate(['app', 'admin','import', 'import', 'recommend']);
  }


}
