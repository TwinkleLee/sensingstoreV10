import { Component, OnInit, Injector, ViewChild, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { appModuleAnimation } from '@shared/animations/routerTransition';

import { SoftwareServiceProxy, SoftwareDto,ApplyServiceProxy,ApplyWanted as CreateApplyFormInputWanted, ApplyFormType as CreateApplyFormInputApplyType, CreateApplyFormInput,PublishEntitiesInput,IdTypeDto } from '@shared/service-proxies/service-proxies-ads';


import { MyTreeComponent } from '@app/shared/common/my-tree/my-tree.component';
import { Table,TableCheckbox } from 'primeng/table';

import { ActivatedRoute, Router } from '@angular/router';

import { ConnectorService } from '@app/shared/services/connector.service';


@Component({
  selector: 'app-software',
  templateUrl: './softwarelist.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})
export class SoftwareListComponent extends AppComponentBase {

  AuthorizedSoftwaresList = [];

  constructor(injector: Injector,
    private _softwareService: SoftwareServiceProxy,
    private router: Router,
    private route: ActivatedRoute,
    private connector: ConnectorService
  ) {
    super(injector);

   this.getSoftwares()
  }

  //host获取app列表
  getSoftwares() {
    setTimeout(() => {
      this._softwareService.getSoftwares4Host(
        void 0,
        true,
        void 0,
        void 0,
        999,
        0
      )
        .subscribe(result => {
          this.AuthorizedSoftwaresList = result.items;
        });

    }, 500)

  }

  showEmpty(e) {
    var target = $(e.target);
    target.attr("src", AppConsts.appBaseUrl + "/assets/common/images/holderimg.png")
  }


}
