import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { WeixinMpServiceProxy, WeixinOpenPlatformServiceProxy } from '@shared/service-proxies/service-proxies5';

@Component({
  selector: 'createPublicAccountModal',
  templateUrl: './create-public-account.component.html',
  styles: [`.user-edit-dialog-profile-image {
           margin-bottom: 20px;
      }`
  ]
})

export class CreatePublicAccountComponent extends AppComponentBase implements AfterViewChecked {
  @ViewChild('createPublicAccountModal',{static:true}) modal: ModalDirective;
  @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

  active = false;
  saving = false;
  href;
  list;
  id;
  profilePicture1 = AppConsts.appBaseUrl + '/assets/common/images/wx/wxOP1.png';
  profilePicture2 = AppConsts.appBaseUrl + '/assets/common/images/wx/wxOP2.png';
  profilePicture3 = AppConsts.appBaseUrl + '/assets/common/images/wx/wxOP3.png';

  memberedOrganizationUnits: string[];

  constructor(
    injector: Injector,
    private _weixinOpenService: WeixinMpServiceProxy,
    private _WeixinOpenPlatformServiceProxy: WeixinOpenPlatformServiceProxy
  ) {
    super(injector);
  }

  ngAfterViewChecked(): void {
    //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
    $('tabset ul.nav').addClass('m-tabs-line');
    $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
  }

  show(metaType?: any): void {
    this.active = true;
    this.modal.show();
    this.authorizate();
  }

  onShown(): void {

  }

  close(): void {
    this.active = false;
    this.saving = false;
    this.modal.hide();
  }
  authorizate() {
    this._WeixinOpenPlatformServiceProxy.getWeixinOpenPlatformList().subscribe(r => {
      console.log(r)
      this.list = r;
    })
  }

  chooseAccount() {
    this.href = null;
    this._weixinOpenService.getMpAuthorzieUrl(this.id).subscribe(result => {
      console.log(result.url);
      this.href = 'https://g.api.troncell.com/transmit/index.html?url=' + result.url
      // console.log(this.appSession)
    })
  }

}
