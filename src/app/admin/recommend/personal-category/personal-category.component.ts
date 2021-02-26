import { Component, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { CreateOrEditCatModalComponent } from '@app/admin/recommend/personal-category/create-or-edit-personalCategory-modal.component';

import { MetaPhysicsServiceProxy } from '@shared/service-proxies/service-proxies4';

@Component({
  selector: 'app-personal-category',
  templateUrl: './personal-category.component.html',
  animations: [appModuleAnimation()]
})
export class PersonalCategoryComponent extends AppComponentBase {

  @ViewChild('createOrEditCatModal', { static: true }) createOrEditCatModal: CreateOrEditCatModalComponent;
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;
  filterText: string;
  MetaCheckedList: any = [];
  constructor(injector: Injector,
    private _metaPhysicsService: MetaPhysicsServiceProxy,
  ) {
    super(injector);

  }

  //创建新玄学类型
  createMetaphysicsType() {
    this.createOrEditCatModal.show();
  }

  //获取玄学类型列表
  getMetaPhysicsTypeList(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.MetaCheckedList = [];

    this.primengTableHelper.showLoadingIndicator();
    this._metaPhysicsService.getMetaPhysicsTypes(
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
      })
  }
  //修改玄学类型
  editDeviceType(record) {
    this.createOrEditCatModal.show(Object.assign({}, record))
  }


  //删除玄学类型
  deleteMetaType(record) {
    this.message.confirm(this.l('deletethismetatype'), this.l('AreYouSure'), (r) => {
      if (r) {
        this._metaPhysicsService.deleteMetaphysicsType(record.id).subscribe(result => {
          this.notify.info(this.l('success'));
          this.getMetaPhysicsTypeList();
        })
      }
    })
  }


  //批量删除玄学类型
  deleteMetaTypeList() {
    if (this.MetaCheckedList.length === 0) {
      this.message.warn(this.l('selectOneWarn'));
    } else {
      this.message.confirm(this.l('deleteMetaQuestion'), this.l('AreYouSure'), (r) => {
        if (r) {
          this.primengTableHelper.showLoadingIndicator();
          console.log(this.MetaCheckedList);
          var metaCheckedIdList = [];
          for (var value of this.MetaCheckedList) {
            metaCheckedIdList.push(value.id);
          }
          console.log(metaCheckedIdList);
          this._metaPhysicsService.deleteMetaphysicsTypeList(metaCheckedIdList)
            .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
            .subscribe(result => {
              this.notify.info(this.l('success'));
              this.getMetaPhysicsTypeList();
            })
          // this.primengTableHelper.hideLoadingIndicator();
        }

      })

    }


  }


  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }

}
