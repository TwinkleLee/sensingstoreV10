import { Component, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/components/table/table';
import { LazyLoadEvent } from 'primeng/primeng';
import { Paginator } from 'primeng/components/paginator/paginator';
import { AppConsts } from '@shared/AppConsts';
import { PageTemplateModalComponent } from '@app/activity/activity-template/operation/create-or-edit-pageTemplate.component';
import { HtmlTemplateServiceProxy } from '@shared/service-proxies/service-proxies5';


@Component({
  selector: 'page-template',
  templateUrl: './page-template.component.html',
  animations: [appModuleAnimation()]
})
export class PageTemplateComponent extends AppComponentBase {

  @ViewChild('pageTemplateModalComponent',{static:true}) pageTemplateModalComponent: PageTemplateModalComponent;
  @ViewChild('dataTable',{static:true}) dataTable: Table;
  @ViewChild('paginator',{static:true}) paginator: Paginator;
  filterText: string;
  MetaCheckedList: any = [];
  constructor(injector: Injector,
    private _htmlTemplateService: HtmlTemplateServiceProxy
  ) {
    super(injector);

  }


  createHtmlTemplate() {
    this.pageTemplateModalComponent.show();
  }

  //获取列表
  getHtmlTemplateList(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.MetaCheckedList = [];

    this.primengTableHelper.showLoadingIndicator();

    this._htmlTemplateService.getHtmlTemplates(
      undefined,
      this.filterText,
      this.primengTableHelper.getSorting(this.dataTable) || '',
      this.primengTableHelper.getMaxResultCount(this.paginator, event),
      this.primengTableHelper.getSkipCount(this.paginator, event)
    )
    .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
    .subscribe(result => {
      this.primengTableHelper.totalRecordsCount = result.totalCount;
      this.primengTableHelper.records = result.items;
    })

  }


  editDeviceType(record) {
    this.pageTemplateModalComponent.show(Object.assign({}, record))
  }


  deleteTemplate(record) {
    this.message.confirm(this.l('deletethisTemplate'),this.l('AreYouSure'), (r) => {
      console.log(record)
      if (r) {
        this._htmlTemplateService.deleteHtmlTemplate(record.id).subscribe(result => {
          this.notify.info(this.l('success'));
          this.getHtmlTemplateList();
        })
      }
    })
  }



  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }

}
