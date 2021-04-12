import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';
import { AwardServiceProxy, CreateAwardInput, UpdateAwardInput } from '@shared/service-proxies/service-proxies5';
import { ActivatedRoute, Router } from '@angular/router';
import { CouponServiceProxy } from '@shared/service-proxies/service-proxies-product';


@Component({
  selector: 'createOrEditPrizeModal',
  templateUrl: './create-or-edit-prize.component.html',
  styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
  ]
})
export class CreateOrEditPrizeModalComponent extends AppComponentBase implements AfterViewChecked {

  @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;

  @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

  active = false;
  saving = false;
  operation: string = "add";
  Prize: any = {};
  couponList = [];


  constructor(
    injector: Injector,
    private _AwardServiceProxy: AwardServiceProxy,
    private _activatedRoute: ActivatedRoute,
    private _CouponServiceProxy: CouponServiceProxy
  ) {
    super(injector);
    var online: any = 1;
    this._CouponServiceProxy.getCoupons(
      void 0,
      void 0,
      void 0,
      void 0,
      999,
      0
    ).subscribe(result => {
      this.couponList = result.items;
    });
  }

  ngAfterViewChecked(): void {
    //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
    $('tabset ul.nav').addClass('m-tabs-line');
    $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
  }


  show(Template?: any): void {
    this.active = true;
    if (Template) {
      this.operation = "edit";
      this.Prize = new UpdateAwardInput(Template);
      if (this.Prize.type == 0) {
        var coupon = this.couponList.find(item => item.url == this.Prize.couponUrl);
        this.Prize.couponUrl = coupon && coupon.id;
      }
      console.log(this.Prize)
    } else {
      this.operation = "add";
      this.Prize = new CreateAwardInput();
      this.Prize.awardSeq = 1;
    }
    this.modal.show();
  }

  onShown(): void {

  }

  save(): void {
    if (this.Prize.maxScore - this.Prize.minScore < 0) {
      this.message.warn(this.l('maxScoreWarn'));
      return
    }
    this.saving = true;

    if (this.operation == "add") {
      this._activatedRoute.queryParams.subscribe(queryParams => {
        this.Prize.activityId = queryParams.id;
      })

      console.log(this.Prize)
      this._AwardServiceProxy.createAward(this.Prize).pipe(finalize(() => { this.saving = false; }))
        .subscribe(() => {
          this.modalSave.emit(null);
          this.notify.info(this.l('SavedSuccessfully'));
          this.close();
        });
    } else {
      this._AwardServiceProxy.updateAward(this.Prize).pipe(finalize(() => { this.saving = false; }))
        .subscribe(() => {
          this.modalSave.emit(null);
          this.notify.info(this.l('SavedSuccessfully'));
          this.close();
        });
    }

  }

  close(): void {
    this.active = false;
    this.Prize = null;
    this.saving = false;
    this.modal.hide();
  }

  logoOnUpload(r): void {
    this.Prize.awardImagePath = r.fileUri;
  }

}
