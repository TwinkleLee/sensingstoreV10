import { Component, Injector, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';

import { TagServiceProxy, TagType as Type } from '@shared/service-proxies/service-proxies';

import { TagServiceProxy as ProductTagServiceProxy } from '@shared/service-proxies/service-proxies-product'

import { TagServiceProxy as AdsTagServiceProxy, TagType } from '@shared/service-proxies/service-proxies-ads'

import { TagServiceProxy as DeviceTagServiceProxy } from '@shared/service-proxies/service-proxies-devicecenter'


import { CreateOrEditTagModalComponent } from '@app/admin/tags/tags/create-or-edit-tags-modal.component';
import * as moment from 'moment';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.css'],
  animations: [appModuleAnimation()]
})

export class TagsComponent extends AppComponentBase implements AfterViewInit {

  @ViewChild('createOrEditTagModal', { static: true }) createOrEditTagModal: CreateOrEditTagModalComponent;

  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;
  tagType: any = 0;
  Type2s = Object.keys(Type).filter(f => !isNaN(Number(f)));
  Type = Type;

  ServiceProxy: any = '';

  filterText: string;
  constructor(
    injector: Injector,
    private _TagService: TagServiceProxy,
    private _DeviceTagServiceProxy: DeviceTagServiceProxy,
    private _AdsTagServiceProxy: AdsTagServiceProxy,
    private _ProductTagServiceProxy: ProductTagServiceProxy,
  ) {
    super(injector);
    this.tabChange(0);
  }
  ngAfterViewInit() {
    var autoCreate = window.location.search != '';
    if (autoCreate) {
      setTimeout(() => {
        this.createOrEditTagModal.show(null, window.location.search.replace("?type=", ''));
      }, 500);
    }
  }
  createTag() {
    this.createOrEditTagModal.show();
  }

  getTags(event?: LazyLoadEvent) {
    // if (this.primengTableHelper.shouldResetPaging(event)) {
    //   // this.paginator.changePage(0);
    //   return;
    // }
    // this.primengTableHelper.showLoadingIndicator();
    setTimeout(() => {
      this.ServiceProxy.getTagsByType(
        this.filterText,
        this.primengTableHelper.getSorting(this.dataTable),
        this.primengTableHelper.getMaxResultCount(this.paginator, event),
        this.primengTableHelper.getSkipCount(this.paginator, event),
        this.tagType
      )
        .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
        .subscribe(result => {
          this.primengTableHelper.totalRecordsCount = result.totalCount;
          this.primengTableHelper.records = result.items;
          // this.primengTableHelper.hideLoadingIndicator();
        });
    }, 500)

  }
  //编辑标签
  editTag(record) {
    this.createOrEditTagModal.show(Object.assign({}, record));
  }
  //删除设备类型
  deleteTag(record) {
    this.message.confirm(this.l('deletethistag'), this.l('AreYouSure'), r => {
      if (r) {
        this.ServiceProxy.deleteTag(record.id).subscribe(result => {
          this.notify.info(this.l('success'));
          this.getTags();
        })
      }
    })
  }
  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }


  tabChange(tagType?) {
    this.tagType = tagType;

    if (this.tagType == 0 || this.tagType == 6 || this.tagType == 8 || this.tagType == 7 || this.tagType == 4) {
      this.ServiceProxy = this._TagService
    }

    if (this.tagType == 1 || this.tagType == 5) {
      this.ServiceProxy = this._DeviceTagServiceProxy
    }

    if (this.tagType == 2) {
      this.ServiceProxy = this._ProductTagServiceProxy
    }

    if (this.tagType == 3) {
      this.ServiceProxy = this._AdsTagServiceProxy
    }

    this.getTags()
  }
}
