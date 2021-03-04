import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { SpecialUserServiceProxy, CreateSpecialUserInput, UpdateSpecialUserInput, AwardServiceProxy } from '@shared/service-proxies/service-proxies5';

@Component({
  selector: 'createOrEditWhiteListModal',
  templateUrl: './create-or-edit-white-list.component.html',
  styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
  ]
})
export class CreateOrEditWhiteListModalComponent extends AppComponentBase implements AfterViewChecked {

  @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

  @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

  active = false;
  saving = false;
  operation: string = "add";
  WhiteList: any = {
    forAward: true,
    forLottery: true,
    forUseTicket: true
  };
  activityId;
  AwardList = [];
  constructor(
    injector: Injector,
    private _activatedRoute: ActivatedRoute,
    private _AwardServiceProxy: AwardServiceProxy,
    private _WhiteUserServiceProxy: SpecialUserServiceProxy
  ) {
    super(injector);
  }

  ngAfterViewChecked(): void {
    //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
    $('tabset ul.nav').addClass('m-tabs-line');
    $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
  }

  show(Template?: any): void {
    this.active = true;
    this._activatedRoute.queryParams.subscribe(queryParams => {
      this.activityId = queryParams.id;
    })
    if (Template) {
      this.operation = "edit";
      this.WhiteList = new UpdateSpecialUserInput(Template);
      var arr = this.WhiteList.awardSeqs.split(',').map(item => {
        return Number(item)
      });
      this._AwardServiceProxy.getAwards(
        this.activityId,
        undefined,
        undefined,
        undefined,
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
    } else {
      this.operation = "add";
      this.WhiteList = new CreateSpecialUserInput();
      this._AwardServiceProxy.getAwards(
        this.activityId,
        undefined,
        undefined,
        undefined,
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
        function sortNumber(a, b) {
          return a.seq - b.seq
        }
        this.AwardList.sort(sortNumber)
        this.modal.show();
      });
    }

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


    if (this.operation == "add") {
      this._activatedRoute.queryParams.subscribe(queryParams => {
        this.WhiteList.activityId = queryParams.id;
      })
      this._WhiteUserServiceProxy.createUser(this.WhiteList).pipe(finalize(() => { this.saving = false; }))
        .subscribe(() => {
          this.modalSave.emit(null);
          this.notify.info(this.l('SavedSuccessfully'));
          this.close();
        });
    } else {
      this._WhiteUserServiceProxy.updateUser(this.WhiteList).pipe(finalize(() => { this.saving = false; }))
        .subscribe(() => {
          this.modalSave.emit(null);
          this.notify.info(this.l('SavedSuccessfully'));
          this.close();
        });
    }

  }

  close(): void {
    this.active = false;
    this.WhiteList = null;
    this.saving = false;
    this.modal.hide();
  }

}
