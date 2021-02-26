import { Component, Injector, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { TagServiceProxy, TagType as Type } from '@shared/service-proxies/service-proxies';
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
  tagType: any = '';
  Type2s = Object.keys(Type).filter(f => !isNaN(Number(f)));
  Type = Type;

  filterText: string;
  constructor(injector: Injector, private _TagService: TagServiceProxy) {
    super(injector);
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
    console.log(Type)
    console.log(Type[0])
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.primengTableHelper.showLoadingIndicator();
    this._TagService.getTagsByType(
      this.filterText,
      this.primengTableHelper.getSorting(this.dataTable),
      this.primengTableHelper.getMaxResultCount(this.paginator, event),
      this.primengTableHelper.getSkipCount(this.paginator, event),
      this.tagType || undefined
    )
      .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
      .subscribe(result => {
        this.primengTableHelper.totalRecordsCount = result.totalCount;
        this.primengTableHelper.records = result.items;
        // this.primengTableHelper.hideLoadingIndicator();
      });
  }
  //编辑标签
  editTag(record) {
    this.createOrEditTagModal.show(Object.assign({}, record));
  }
  //删除设备类型
  deleteTag(record) {
    this.message.confirm(this.l('deletethistag'), this.l('AreYouSure'), r => {
      if (r) {
        this._TagService.deleteTag(record.id).subscribe(result => {
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
}
