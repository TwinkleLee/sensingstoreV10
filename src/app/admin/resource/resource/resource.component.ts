import { Component, OnInit, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Table, TableCheckbox } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { CreateOrEditResourceModalComponent } from '@app/admin/resource/resource/create-or-edit-resource-modal.component';
import { ResourceFileDto, ResourceFileServiceProxy, TagServiceProxy, SetResourceTagsDto, FileType } from '@shared/service-proxies/service-proxies';
import { AppConsts } from '@shared/AppConsts';
import { MyTreeComponent } from '@app/shared/common/my-tree/my-tree.component';
import { Router } from '@angular/router';

export enum FileArea2 {
  Common = "Common",
  Users = "Users",
  Apps = "Apps",
  Products = "Products",
  Matchs = "Matchs",
  Likes = "Likes",
  Ads = "Ads",
  Coupon = "Coupon",
  Peripheral = "Peripheral",
  DeviceCategory = "DeviceCategory",
  ProductCategory = "ProductCategory",
  DeviceType = "DeviceType",
  Staffs = "Staffs",
  Devices = "Devices",
}
export enum Type {
  Resource = "Resource",
  Device = "Device",
  Product = "Product",
  Ads = "Ads",
  Other = "Other",
  Brand = "Brand",
  Question = "Question",
  Counter = "Counter",
  WechatPublicMessage = "WechatPublicMessage",
}

@Component({
  selector: 'app-resource',
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})
export class ResourceManagementComponent extends AppComponentBase {

  @ViewChild('createOrEditResourceModal', { static: true }) createOrEditResourceModal: CreateOrEditResourceModalComponent;
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;
  @ViewChild('tagTree', { static: false }) tagTree: MyTreeComponent;
  @ViewChild('TableCheckbox', { static: true }) TableCheckbox: TableCheckbox;


  filterText: string;
  resourceType: any = '';
  resourceSelectionList = [];
  get tagIds() {
    return this.tagTree ? this.tagTree.getchosenIds() : [];
  }
  tags: any[] = [];
  tagConfig = {
    'name': 'value'
  };
  tagFilter: string = '';
  Type = Type;
  resourceCate: any = '';
  FileArea2s = Object.keys(FileArea2);
  Types = Object.keys(FileType).filter(f => isNaN(Number(f)));

  constructor(injector: Injector,
    private _resourceService: ResourceFileServiceProxy,
    private _tagService: TagServiceProxy,
    private router: Router) {
    super(injector);
  }

  //获取资源列表
  getResources(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.resourceSelectionList = [];

    this.primengTableHelper.showLoadingIndicator();
    this._resourceService.getResources(
      undefined,
      this.resourceType,
      this.resourceCate,
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
      // setTimeout(() => {
      //   this.juggeChosen(this.resourceSelectionList);
      // },0)
    });
  }
  //新增资源
  createResource() {
    this.createOrEditResourceModal.show();
  }
  //修改资源
  editResource(record) {
    this.createOrEditResourceModal.show(Object.assign({}, record));
  }
  //删除资源
  deleteResource(record: ResourceFileDto) {
    this.message.confirm(this.l('deletethisresource'), this.l('AreYouSure'), r => {
      if (r) {
        this._resourceService.deleteResource(record.id).subscribe(result => {
          this.getResources();
        })
      }
    })
  }
  //切换显示模式
  toggle(f) {
    if (f) {
      $("#tableShow").show();
      $("#gridShow").hide();
      $(".icon-liebiao").addClass("active");
      $(".icon-weibiaoti2010102-copy").removeClass("active");
    } else {
      $("#tableShow").hide();
      $("#gridShow").show();
      $(".icon-weibiaoti2010102-copy").addClass("active");
      $(".icon-liebiao").removeClass("active");
    }
    // this.TableCheckbox.tableService.onSelectionChange();
  }
  onOperate(e) {
    if (e.action == 'info') {
      this.editResource(e.image);
    } else {
      this.deleteResource(e.image);
    }
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
  //判断是否选中商品
  judgeSelection(callback) {
    if (this.resourceSelectionList.length == 0) {
      return this.notify.info(this.l('atLeastChoseOneItem'));
    }
    var ary = [];
    this.resourceSelectionList.forEach((v, i) => {
      ary.push(v.id);
    })
    callback && callback(ary);
  }
  //获取标签
  getTags(f?) {
    if (f && this.tags.length != 0) {
      return;
    }
    this._tagService.getTagsByType(this.tagFilter, undefined, 100, 0, 0).subscribe((result) => {
      this.tags = result.items;
    })
  }
  //选中或者取消选中标签
  setTag() {
    this.judgeSelection((ary) => {
      var ids = this.tagTree.getchosenIds();
      if (ids.length == 0) {
        return this.notify.warn(this.l('atleastonetag'));
      }
      var input = new SetResourceTagsDto({
        'tagIds': ids,
        'resourceIds': ary,
        'action': 'add'
      });
      this._resourceService.setTags(input).subscribe((result) => {
        this.notify.info(this.l('success'));
        this.getResources();
      })
    })
  }
  //清除标签
  clearTag() {
    this.judgeSelection((ary) => {
      var ids = this.tagTree.getchosenIds();
      var input = new SetResourceTagsDto({
        'tagIds': ids,
        'resourceIds': ary,
        'action': 'delete'
      });
      this._resourceService.setTags(input).subscribe((result) => {
        this.notify.info(this.l('success'));
        this.getResources();
      })
    })
  }
  //前往管理标签
  goTag(f?) {
    f !== undefined ? this.router.navigate(['app', 'admin','tags', 'tags'], { queryParams: { "type": f } }) : this.router.navigate(['app', 'admin','tags', 'tags']);
  }

}


