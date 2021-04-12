import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { UserActionServiceProxy, MakeUserToSpecialInput, SpecialUserServiceProxy, CreateSpecialUserInput, UpdateSpecialUserInput, AwardServiceProxy } from '@shared/service-proxies/service-proxies5';

@Component({
  selector: 'changeWhiteListModal',
  templateUrl: './change-white-list.component.html',
  styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
  ]
})
export class ChangeWhiteListModalComponent extends AppComponentBase implements AfterViewChecked {

  @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;

  @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

  active = false;
  saving = false;
  operation: string = "add";
  WhiteList: any = {};
  activityId;
  AwardList = [];

  constructor(
    injector: Injector,
    private _activatedRoute: ActivatedRoute,
    private _AwardServiceProxy: AwardServiceProxy,
    private _UserActionServiceProxy: UserActionServiceProxy,
    private _SpecialUserServiceProxy: SpecialUserServiceProxy
  ) {
    super(injector);
  }

  ngAfterViewChecked(): void {
    $('tabset ul.nav').addClass('m-tabs-line');
    $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
  }

  show(record, type): void {
    console.log(record)
    this.active = true;
    this._activatedRoute.queryParams.subscribe(queryParams => {
      this.activityId = queryParams.id;
    })

    this.WhiteList = new MakeUserToSpecialInput();
    this.WhiteList.userId = record.id;
    this.WhiteList.type = type;

    if (type == '0') {
      this._SpecialUserServiceProxy.getWhiteInfoByUser(
        this.activityId,
        record.id
      ).subscribe(r => {
        if (r.id) {
          this.WhiteList.address = r.address;
          this.WhiteList.companyName = r.companyName;
          this.WhiteList.description = r.description;
          this.WhiteList.identityID = r.identityID;
          this.WhiteList.name = r.name;
          this.WhiteList.openID = r.openID;
          this.WhiteList.phone = r.phone;
          this.WhiteList.awardSeqs = r.awardSeqs;
          console.log(this.WhiteList)
          this.editLogic();
        } else {
          this.addLogic();
        }
      })
    } else if (type == '1') {
      this._SpecialUserServiceProxy.getBlackInfoByUser(
        this.activityId,
        record.id
      ).subscribe(r => {
        if (r.id) {
          this.WhiteList.address = r.address;
          this.WhiteList.companyName = r.companyName;
          this.WhiteList.description = r.description;
          this.WhiteList.identityID = r.identityID;
          this.WhiteList.name = r.name;
          this.WhiteList.openID = r.openID;
          this.WhiteList.phone = r.phone;
          this.WhiteList.awardSeqs = r.awardSeqs;
          console.log(this.WhiteList)
          this.editLogic();
        } else {
          this.addLogic();
        }
      })
    }

  }

  addLogic() {
    this._AwardServiceProxy.getAwards(
      this.activityId,
      void 0,
      void 0,
      void 0,
      10,
      0
    ).subscribe(result => {
      this.AwardList = Array.from(
        new Set(
          result.items.map(item => {
            return item.awardSeq
          })
        )
      )
      this.AwardList = this.AwardList.map(item => {
        return {
          chosen: true,
          seq: item
        }
      })
      console.log(this.AwardList)
      function sortNumber(a, b) {
        return a.seq - b.seq
      }
      this.AwardList.sort(sortNumber)
      this.modal.show();
    });
  }

  editLogic() {
    var arr = this.WhiteList.awardSeqs.split(',').map(item => {
      return Number(item)
    });
    this._AwardServiceProxy.getAwards(
      this.activityId,
      void 0,
      void 0,
      void 0,
      10,
      0
    ).subscribe(result => {
      this.AwardList = Array.from(
        new Set(
          result.items.map(item => {
            return item.awardSeq
          })
        )
      )
      console.log(this.AwardList)
      this.AwardList = this.AwardList.map(item => {
        console.log(arr, item)
        return {
          chosen: arr.indexOf(item) > -1 ? true : false,
          seq: item
        }
      })



      function sortNumber(a, b) {
        return a.seq - b.seq
      }
      this.AwardList.sort(sortNumber)


      this.modal.show();
    });
  }


  onShown(): void {

  }

  save(): void {
    this.saving = true;

    var newList = [];
    for (var i = 0; i < this.AwardList.length; i++) {
      if (this.AwardList[i].chosen) {
        newList.push(this.AwardList[i])
      }
    }
    this.WhiteList.awardSeqs = newList.map(item => {
      return item.seq
    }).join(',');

    this.WhiteList.activityId = this.activityId;
    this._UserActionServiceProxy.makeUserToSpecial(this.WhiteList)
      .subscribe(r => {
        console.log(r)
        this.notify.info(this.l('success'));
        this.close();
      })

  }

  close(): void {
    this.active = false;
    this.WhiteList = null;
    this.saving = false;
    this.modal.hide();
  }

}
