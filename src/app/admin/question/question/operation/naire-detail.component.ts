import { Component, ViewChild, Injector, Output, Input, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';


import { UserPaperServiceProxy } from '@shared/service-proxies/service-proxies5';

@Component({
    selector: 'naireDetail',
    templateUrl: './naire-detail.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }
        .checkbox{
          touch-action: none;
        }
        .form-12 {
          height: auto !important;
        }
        `
    ]
})
export class NaireDetailComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput', { static: true }) nameInput: ElementRef;
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    objItem: any = {};
    headimgurl: any = {};
    nickname: any = {};
    displayName: any = {};
    opinion: any = {};

    constructor(
        injector: Injector,
        private _UserPaperServiceProxy: UserPaperServiceProxy
    ) {
        super(injector);
    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        // $('tabset ul.nav').addClass('m-tabs-line');
        // $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(id: any): void {
      this._UserPaperServiceProxy.getSingleUserPaperDetail(id)
      .subscribe(r => {
        this.objItem = r;
        this.headimgurl = r.snsUserInfo&&r.snsUserInfo.headimgurl;
        this.nickname = r.snsUserInfo&&r.snsUserInfo.nickname;
        this.displayName = r.userPaper.paper.displayName;
        this.opinion = r.userPaper.opinion;
        console.log(this.objItem.questionItems[0].id);
        this.objItem.questions.forEach(question => {
          question.questionItems.forEach(item => {
            this.objItem.questionItems.forEach(ques => {
              if (ques.id == item.id) {
                item.isChoosed = true
              }
            });
          });
        });
        
        this.modal.show();
      })
      
    }

    onShown(): void {
      
    }

    save(): void {
    }


    close(): void {
      this.objItem = {};
      this.modal.hide();
    }

}
