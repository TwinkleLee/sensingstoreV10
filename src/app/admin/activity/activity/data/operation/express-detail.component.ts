import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { UpdateSnsUserAwardExpressInput, ActivityServiceProxy } from '@shared/service-proxies/service-proxies5';

@Component({
  selector: 'expressDetailModal',
  templateUrl: './express-detail.component.html',
  styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
  ]
})
export class ExpressDetailModalComponent extends AppComponentBase implements AfterViewChecked {

  @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;

  @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

  active = false;
  saving = false;
  operation: string = "add";
  Express: any = {};
  activityId;

  constructor(
    injector: Injector,
    private _activatedRoute: ActivatedRoute,
    private _ActivityServiceProxy: ActivityServiceProxy
  ) {
    super(injector);
  }

  ngAfterViewChecked(): void {
    $('tabset ul.nav').addClass('m-tabs-line');
    $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
  }

  show(record): void {
    console.log(record)
    this.active = true;
    this._activatedRoute.queryParams.subscribe(queryParams => {
      this.activityId = queryParams.id;
    })

    this.modal.show();

    this.Express = new UpdateSnsUserAwardExpressInput();

    this.Express.id = record.id;
  }

  onShown(): void {

  }
  save(): void {
    this.saving = true;
    this._ActivityServiceProxy.updateUserAwardExpressInfo(this.Express)
      .subscribe(r => {
        console.log(r)
        this.notify.info(this.l('success'));
        this.close();
      })

  }

  close(): void {
    this.active = false;
    this.Express = null;
    this.saving = false;
    this.modal.hide();
  }

}
