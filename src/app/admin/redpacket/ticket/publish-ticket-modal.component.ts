import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { TicketServiceProxy, GrantTicketByMemberLevelsInput } from '@shared/service-proxies/service-proxies2';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'publishTicketModal',
  templateUrl: './publish-ticket-modal.component.html',
  styles: [`.user-edit-dialog-profile-image {
           margin-bottom: 20px;
      }`
  ]
})

export class PublishTicketModalComponent extends AppComponentBase implements AfterViewChecked {
  @ViewChild('publishTicket',{static:true}) modal: ModalDirective;
  @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

  active = false;
  saving = false;

  memberList: any = [];
  ticketList: any = [];
  objItem: any = {};

  constructor(
    injector: Injector,
    private _TicketServiceProxy: TicketServiceProxy
  ) {
    super(injector);
  }

  ngAfterViewChecked(): void {
    //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
    $('tabset ul.nav').addClass('m-tabs-line');
    $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
  }

  show(memberList, ticketList): void {
    console.log(memberList, ticketList)
    this.ticketList = ticketList;
    this.memberList = memberList;
    this.memberList.forEach(item => {
      this.objItem[item.value] = false;
    })

    this.active = true;
    this.modal.show();
  }

  onShown(): void {

  }

  close(): void {
    this.active = false;
    this.saving = false;
    this.modal.hide();
  }

  publish() {
    console.log(this.objItem)
    var memberLevels = [];
    for (var key in this.objItem) {
      if (this.objItem[key]) {
        memberLevels.push(key);
      }
    }
    this.saving = true;
    this._TicketServiceProxy.grantTicketByMemberLevels({
      "ticketIds": this.ticketList,
      "memberLevels": memberLevels
    } as GrantTicketByMemberLevelsInput)
    .pipe(finalize(() => { this.saving = false; }))
    .subscribe(r => {
      this.notify.info(this.l('success'));
      this.close();
    })
  }

}
