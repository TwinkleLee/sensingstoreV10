import { Component, ViewChild, Injector, Output, EventEmitter, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';
import { SnsMsgBeforeGameDto, SnsMsgAfterGameDto, ActionShareDto, ActivityServiceProxy, ActivityGameSettingsInput, HtmlTemplateServiceProxy, TemplateEnum, DeviceActivityServiceProxy, CreateDeviceActivityGameInput, UpdateDeviceActivityGameInput, UserActionServiceProxy } from '@shared/service-proxies/service-proxies5';

import { ActivatedRoute } from '@angular/router';
import {  SoftwareServiceProxy } from '@shared/service-proxies/service-proxies-ads';


@Component({
  selector: 'createOrEditGameModal',
  templateUrl: './create-or-edit-game.component.html',
  styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
  ]
})
export class CreateOrEditGameModalComponent extends AppComponentBase implements AfterViewChecked {

  @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

  @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

  active = false;
  saving = false;
  operation: string = "add";
  Game: any = {};
  softwareType: any = '';
  filterText = '';
  gameList = [];
  templateList = [];
  deviceId;


  BeforeNotUseTemplate = false;
  AfterNotUseTemplate = false;

  informQrcodeImage = null;
  informUsers = [];
  constructor(
    injector: Injector,
    private _activatedRoute: ActivatedRoute,
    private _softwareService: SoftwareServiceProxy,
    private _ActivityServiceProxy: ActivityServiceProxy,
    private _HtmlTemplateServiceProxy: HtmlTemplateServiceProxy,
    private _DeviceActivityServiceProxy: DeviceActivityServiceProxy,
    private _UserActionServiceProxy: UserActionServiceProxy
  ) {
    super(injector);
    this._activatedRoute.queryParams.subscribe(queryParams => {
      if (queryParams.deviceId) this.deviceId = queryParams.deviceId;
    })
    this._HtmlTemplateServiceProxy.getHtmlTemplates(
      TemplateEnum['Action'],
      void 0,
      void 0,
      99,
      0
    ).subscribe(r => {
      this.templateList = r.items;
    })
  }

  ngAfterViewChecked(): void {
    //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
    $('tabset ul.nav').addClass('m-tabs-line');
    $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
  }

  GetSnsUserInform() {
    this._UserActionServiceProxy.getSnsUserInform(
      this.Game.id, void 0, void 0, 999, 0
    ).subscribe(r => {
      console.log(r)
      this.informUsers = r.items;
    })

  }
  CreateActionInform() {
    this._UserActionServiceProxy.createActionInform(
      this.Game.id, "https://m.sensingstore.com/other/V3/PYJ_Inform.html",""
    ).subscribe(result => {
      this.informQrcodeImage = result.qrCodeImage;
    })
  }

  DeleteSnsUserInform(user) {
    this.message.confirm(this.l('deletethisselected'), this.l('AreYouSure'), (r) => {
      if (r) {
        this._UserActionServiceProxy.deleteSnsUserInform(user.id).subscribe(r => {
          this.GetSnsUserInform();
          this.notify.info(this.l('success'));
        })
      }
    })
  }

  PacketOnUpload(r): void {
    this.Game.materialPacketUrl = r.fileUri;
  }
  BeforeOnUpload(r): void {
    this.Game.beforeGameMessage.picUrl = r.fileUri;
  }
  AfterOnUpload(r): void {
    this.Game.afterGameMessage.picUrl = r.fileUri;
  }
  ShareOnUpload(r): void {
    this.Game.actionShare.imageLink = r.fileUri;
  }
  show(Template?: any): void {
    this.active = true;
    if (Template) {
      this.operation = "edit";
      if (this.deviceId) {
        this.Game = new UpdateDeviceActivityGameInput(Template);
      } else {
        this.Game = new ActivityGameSettingsInput(Template);
      }
      if (!this.Game.beforeGameMessage) this.Game.beforeGameMessage = new SnsMsgBeforeGameDto()
      if (!this.Game.afterGameMessage) this.Game.afterGameMessage = new SnsMsgAfterGameDto()
      if (!this.Game.actionShare) this.Game.actionShare = new ActionShareDto()

      if (this.Game.beforeGameMessage.htmlTemplateID) {
        this.BeforeNotUseTemplate = false;
      } else {
        this.BeforeNotUseTemplate = true;
      }
      if (this.Game.afterGameMessage.htmlTemplateID) {
        this.AfterNotUseTemplate = false;
      } else {
        this.AfterNotUseTemplate = true;
      }

      console.log(this.Game)
    } else {
      this.operation = "add";
      if (this.deviceId) {
        this.Game = new CreateDeviceActivityGameInput();
        this.Game.deviceId = this.deviceId;
      } else {
        this.Game = new ActivityGameSettingsInput();
      }
      this.Game.beforeGameMessage = new SnsMsgBeforeGameDto()
      this.Game.afterGameMessage = new SnsMsgAfterGameDto()
      this.Game.actionShare = new ActionShareDto()
      console.log(this.Game)
    }

    this._softwareService.getAuthorizedSoftwares(
      void 0,
      this.softwareType,
      this.filterText,
      void 0,
      99,
      0
    ).subscribe(result => {
      console.log(result.items)
      result.items = result.items.filter(item => {
        return !item.isExpired
      })
      this.gameList = result.items;
      this.modal.show();
    });
  }

  onShown(): void {

  }

  save(): void {

    if (this.Game.actionShare.imageLink && this.Game.actionShare.imageLink.indexOf('http') < 0) {
      this.Game.actionShare.imageLink = ('https://s.api.troncell.com/' + this.Game.actionShare.imageLink).replace(/\\/g, '/')
    }
    if (this.Game.beforeGameMessage.picUrl && this.Game.beforeGameMessage.picUrl.indexOf('http') < 0) {
      this.Game.beforeGameMessage.picUrl = ('https://s.api.troncell.com/' + this.Game.beforeGameMessage.picUrl).replace(/\\/g, '/')
    }
    if (this.Game.afterGameMessage.picUrl && this.Game.afterGameMessage.picUrl.indexOf('http') < 0) {
      this.Game.afterGameMessage.picUrl = ('https://s.api.troncell.com/' + this.Game.afterGameMessage.picUrl).replace(/\\/g, '/')
    }

    if (this.BeforeNotUseTemplate) {
      this.Game.beforeGameMessage.htmlTemplateID = void 0;
    } else {
      this.Game.beforeGameMessage.url = void 0;
    }

    if (this.AfterNotUseTemplate) {
      this.Game.afterGameMessage.htmlTemplateID = void 0;
    } else {
      this.Game.afterGameMessage.url = void 0;
    }

    this.saving = true;
    this._activatedRoute.queryParams.subscribe(queryParams => {
      this.Game.activityId = queryParams.id;
    })
    if (this.Game.dispatchedSoftwareId) {
      for (var i = 0; i < this.gameList.length; i++) {
        if (this.gameList[i].id == this.Game.dispatchedSoftwareId) {
          this.Game.softwareId = this.gameList[i].software.id;
        }
      }
    }
    if (this.deviceId) {//在设备下
      if (this.operation == "add") {
        this._DeviceActivityServiceProxy.createDeviceActivityGame(this.Game).pipe(finalize(() => { this.saving = false; }))
          .subscribe(() => {
            this.modalSave.emit(null);
            this.notify.info(this.l('SavedSuccessfully'));
            this.close();
          });
      } else {
        console.log(this.Game)
        this._DeviceActivityServiceProxy.updateDeviceActivityGame(this.Game).pipe(finalize(() => { this.saving = false; }))
          .subscribe(() => {
            this.modalSave.emit(null);
            this.notify.info(this.l('SavedSuccessfully'));
            this.close();
          });
      }
    } else {//在活动下
      if (this.operation == "add") {
        this._ActivityServiceProxy.createOrUpdateActivityGame(this.Game).pipe(finalize(() => { this.saving = false; }))
          .subscribe(() => {
            this.modalSave.emit(null);
            this.notify.info(this.l('SavedSuccessfully'));
            this.close();
          });
      } else {
        this._ActivityServiceProxy.createOrUpdateActivityGame(this.Game).pipe(finalize(() => { this.saving = false; }))
          .subscribe(() => {
            this.modalSave.emit(null);
            this.notify.info(this.l('SavedSuccessfully'));
            this.close();
          });
      }
    }

  }

  close(): void {
    this.active = false;
    this.Game = null;
    this.gameList = [];
    this.saving = false;
    this.modal.hide();
  }

}
