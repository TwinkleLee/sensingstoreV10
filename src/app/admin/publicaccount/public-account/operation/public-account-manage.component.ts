import { Component, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table, TableCheckbox } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { PublicAccountManageModalComponent } from '@app/admin/publicaccount/public-account/operation/public-account-manage-modal.component';
import { WechatManageServiceProxy, SetMediaTagsInput, TagServiceProxy, TagType as Type, Type4 } from '@shared/service-proxies/service-proxies5';
import { Router, ActivatedRoute } from '@angular/router';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import * as moment from 'moment';

import { MyTreeComponent } from '@app/shared/common/my-tree/my-tree.component';

@Component({
  templateUrl: './public-account-manage.component.html',
  animations: [appModuleAnimation()]
})
export class PublicAccountManageComponent extends AppComponentBase {

  @ViewChild('publicAccountManageModal', { static: true }) publicAccountManageModal: PublicAccountManageModalComponent;
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) MenuPaginator: Paginator;
  MenuPrimengTableHelper: PrimengTableHelper = new PrimengTableHelper();


  @ViewChild('PersonalityDataTable', { static: true }) PersonalityDataTable: Table;
  @ViewChild('PersonalityPaginator', { static: true }) PersonalityPaginator: Paginator;
  MediaPrimeng: PrimengTableHelper = new PrimengTableHelper();
  @ViewChild('TableCheckbox', { static: true }) TableCheckbox: TableCheckbox;

  //公用信息
  weixinAppID;
  nickName;

  //媒体搜索入参
  startTime: any = moment().utc().subtract(365, 'days').startOf('day');
  endTime: any = moment().utc().endOf('day');
  // tagId: any = "";
  tagIdfilter: any = [];
  @ViewChild('highTree', { static: true }) highTree;

  //媒体设置tag
  Tags = [];
  tagList: any = [];
  tagFilter: string = '';
  PersonalCheckedList: any = [];
  tagConfig = {
    'name': 'value'
  };
  //媒体列表
  showImage = false;

  @ViewChild('tagTree', { static: false }) tagTree: MyTreeComponent;

  get tagIds() {
    return this.tagTree ? this.tagTree.getchosenIds() : [];//null
  }
  SyncingData = false;


  constructor(injector: Injector,
    private _WechatManageServiceProxy: WechatManageServiceProxy,
    private _activeRouter: ActivatedRoute,
    private _TagService: TagServiceProxy,
    private router: Router,
  ) {
    super(injector);

    this._activeRouter.queryParams.subscribe(params => {
      this.weixinAppID = params.weixinAppID;
      this.nickName = params.nickName;
    })
    this.getTags();
  }

  goBack() {
    this.router.navigate(['app', 'admin', 'publicaccount', 'publicaccount']);
  }
  clickContainer() {
    if (this.highTree && this.highTree.showStore) {
      this.highTree.clickInput()
    }
  }
  onTreeUpdate(e) {
    this.tagIdfilter = e.map(item => {
      return item.id
    })
  }

  //获取标签下拉数据
  getTags() {
    this._TagService.getTagsByType(void 0, void 0, 1000, 0, Type4.WechatPublicMessage).subscribe((result) => {
      this.Tags = result.items;
      this.tagList = Object.assign([], this.Tags);
    });
  }
  filterTags() {
    this.tagList = this.Tags.filter(item => {
      if (item.value) {
        return item.value.indexOf(this.tagFilter) > -1
      } else {
        return false
      }
    })
  }
  //前往管理标签
  goTag(f?) {
    f !== void 0 ? this.router.navigate(['app', 'admin','tags', 'tags'], { queryParams: { "type": f } }) : this.router.navigate(['app', 'admin','tags', 'tags']);
  }
  //选中或者取消选中标签
  setTag() {
    this.judgeSelection((ary) => {
      var ids = this.tagTree.getchosenIds();
      if (ids.length == 0) {
        return this.notify.warn(this.l('atleastonetag'));
      }
      var input = new SetMediaTagsInput({
        'tagIds': ids,
        'wechatMediaIds': ary,
        'action': 'add'
      });
      this._WechatManageServiceProxy.setMediaTags(input).subscribe((result) => {
        this.notify.info(this.l('success'));
        this.getMedia();
      })
    })
  }
  //清除标签
  clearTag() {
    this.judgeSelection((ary) => {
      var ids = this.tagTree.getchosenIds();
      var input = new SetMediaTagsInput({
        'tagIds': ids,
        'wechatMediaIds': ary,
        'action': 'delete'
      });
      this._WechatManageServiceProxy.setMediaTags(input).subscribe((result) => {
        this.notify.info(this.l('success'));
        this.getMedia();
      })
    })
  }
  //判断是否选中
  judgeSelection(callback) {
    if (this.PersonalCheckedList.length == 0) {
      return this.notify.info(this.l("atLeastChoseOneItem"));
    }
    var ary = [];
    this.PersonalCheckedList.forEach((v, i) => {
      ary.push(v.id);
    })
    callback && callback(ary);
  }
  //创建
  createItem() {
    this.publicAccountManageModal.nickName = this.nickName;
    this.publicAccountManageModal.show();
  }

  //获取列表
  getList(event?: LazyLoadEvent) {
    if (this.MenuPrimengTableHelper.shouldResetPaging(event)) {
      this.MenuPaginator.changePage(0);
      return;
    }

    this.MenuPrimengTableHelper.showLoadingIndicator();
    this._WechatManageServiceProxy.getWechatMenus(
      this.weixinAppID,
      void 0,
      this.MenuPrimengTableHelper.getSorting(this.dataTable),
      this.MenuPrimengTableHelper.getMaxResultCount(this.MenuPaginator, event),
      this.MenuPrimengTableHelper.getSkipCount(this.MenuPaginator, event)
    )
      .pipe(this.myFinalize(() => { this.MenuPrimengTableHelper.hideLoadingIndicator(); }))
      .subscribe(result => {
        this.MenuPrimengTableHelper.totalRecordsCount = result.totalCount;
        this.MenuPrimengTableHelper.records = result.items;
        // this.MenuPrimengTableHelper.hideLoadingIndicator();
      })
  }
  //修改
  editItem(record) {
    this.publicAccountManageModal.nickName = this.nickName;
    this.publicAccountManageModal.show(JSON.parse(JSON.stringify(record)))
  }
  //应用
  publishItem(record) {
    this.message.confirm(this.l('isPublishChosen'), this.l('AreYouSure'), (r) => {
      if (r) {
        this._WechatManageServiceProxy.activeWechatMenu(record.id).subscribe(result => {
          this.notify.info(this.l('success'));
          this.getList();
        })
      }
    })
  }

  SynchronousData() {
    this.SyncingData = true;
    this._WechatManageServiceProxy.syncMedias(
      this.weixinAppID,
      true
    ).subscribe(result => {
      this.notify.info(this.l('success'));
      this.SyncingData = false;
    })
  }


  //删除
  deleteItem(record) {
    this.message.confirm(this.l('deletethisselected'), this.l('AreYouSure'), (r) => {
      if (r) {
        this._WechatManageServiceProxy.deleteWechatMenu([record.id]).subscribe(result => {
          this.notify.info(this.l('success'));
          this.getList();
        })
      }
    })
  }


  getMedia(event?) {
    this.MediaPrimeng.showLoadingIndicator();

    this._WechatManageServiceProxy.getWechatMedias(
      this.weixinAppID,
      this.startTime ? moment(this.startTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h') : void 0,
      this.endTime ? moment(this.endTime.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's') : void 0,
      this.tagIdfilter,
      void 0,
      this.MediaPrimeng.getSorting(this.PersonalityDataTable),
      this.MediaPrimeng.getMaxResultCount(this.PersonalityPaginator, event),
      this.MediaPrimeng.getSkipCount(this.PersonalityPaginator, event)
    )
      .pipe(this.myFinalize(() => { this.MediaPrimeng.hideLoadingIndicator(); }))
      .subscribe(result => {
        console.log(result)
        // result.items.forEach(item => {
        //   item.thumb_url = item.thumb_url.replace('http://', 'https://');
        // })
        this.MediaPrimeng.totalRecordsCount = result.totalCount;
        this.MediaPrimeng.records = result.items;
        this.MediaPrimeng.hideLoadingIndicator();
      })
  }

  goWeb(record) {
    window.open(record.url);
  }

  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.MenuPrimengTableHelper.getSkipCount(this.MenuPaginator, event);
  }
  //转换序列
  transIndex2(i, event?: LazyLoadEvent) {
    return i + 1 + this.MediaPrimeng.getSkipCount(this.PersonalityPaginator, event);
  }


  //图片操作
  onOperate(event) {
    this.goWeb(event.image);
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
    if (this.TableCheckbox) this.TableCheckbox.tableService.onSelectionChange();
  }

}
