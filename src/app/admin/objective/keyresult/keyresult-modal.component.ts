import { Component, ViewChild, Injector, Output, Input, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';


import * as moment from 'moment'
import { OKRServiceProxy, Status, Category, Charge, CreateObjectiveInput, UpdateObjectiveInput, AddOrUpdateKeyResultInput } from '@shared/service-proxies/service-proxies-okr';

@Component({
    selector: 'keyresultModal',
    templateUrl: './keyresult-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditKeyResultModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput', { static: true }) nameInput: ElementRef;
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    operation: string = "add";
    objItem: any = {};
    objName: string = '';
    objectiveId: any = "";

    headerUsers: any = [];
    joinUsers: any = [];
    headerUserSuggestion: any = [];
    joinUserSuggestion: any = [];

    constructor(
        injector: Injector,
        private _OKRServiceProxy: OKRServiceProxy,
        private _ActivatedRoute: ActivatedRoute
    ) {
        super(injector);
        this._ActivatedRoute.params.subscribe(data => {
            this.objectiveId = data.id
          })
    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        // $('tabset ul.nav').addClass('m-tabs-line');
        // $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(objItem?: any): void {
        this.active = true;
        if (objItem) {
            this.operation = "edit";
            this.objItem = objItem;

            this.objName = objItem.displayName;

            this.headerUsers = []
            this.joinUsers = []

            this._OKRServiceProxy.getUsersForKeyResult(this.objectiveId)
                .subscribe(r => {
                    (r || []).forEach(e => {
                        if (Array.isArray(this.objItem.joinUserIds) && (this.objItem.joinUserIds.indexOf(e.userId) != -1)) {
                            this.joinUsers.push({
                                'id': e.userId,
                                'value': e.userName
                            })
                        }
                    });

                    (r || []).forEach(e => {
                        if (Array.isArray(this.objItem.headerUserIds) && (this.objItem.headerUserIds.indexOf(e.userId)!= -1)) {
                            this.headerUsers.push({
                                'id': e.userId,
                                'value': e.userName
                            })
                        }
                    });
                })
        } else {
            this.operation = "add";
            this.objItem = {};
            this.objItem.startTime =  moment().utc();
            this.objItem.endTime = moment().utc();
        }
        this.modal.show();
    }

    onShown(): void {
    }

    save(): void {
      this.objItem.objectiveId = this.objectiveId
        this.saving = true;
        if (this.objItem.startTime) {
            this.objItem.startTime = moment(this.objItem.startTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h')
        }
        if (this.objItem.endTime) {
            this.objItem.endTime = moment(this.objItem.endTime.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's')
        }
        console.log(this.objItem);
        if (!this.objItem.id) {
            this._OKRServiceProxy.addOrUpdateKeyResult(new AddOrUpdateKeyResultInput(this.objItem))
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(result => {
                    console.log(result)
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                })
        } else {
            this._OKRServiceProxy.addOrUpdateKeyResult(new AddOrUpdateKeyResultInput(this.objItem))
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(result => {
                    console.log(result)
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                })
        }
    }

    headerUserFilter (event) {
        this._OKRServiceProxy.getUsersForKeyResult(this.objectiveId)
            .subscribe((result) => {
                this.headerUserSuggestion = (result || []).map((item) => {
                    return {
                        'id': item.userId,
                        'value': item.userName
                    }
                })
            })
    }
    joinUserFilter () {
        this._OKRServiceProxy.getUsersForKeyResult(this.objectiveId)
            .subscribe((result) => {
                this.joinUserSuggestion = (result || []).map((item) => {
                    return {
                        'id': item.userId,
                        'value': item.userName
                    }
                })
            })
    }

    assignHeaderUser() {
        var userArr = []
        this.headerUsers.forEach(i => {
            userArr.push(i.id)
        });
        this.objItem.headerUserIds = userArr
    }

    assignJoinUsers () {
        var userArr = []
        this.joinUsers.forEach(i => {
            userArr.push(i.id)
        });
        this.objItem.joinUserIds = userArr
    }
    


    close(): void {
        this.active = false;
        this.objItem = {};
        this.objName = '';

        this.headerUsers = [];
        this.joinUsers = [];

        this.headerUserSuggestion = [];
        this.joinUserSuggestion = [];

        this.saving = false;
        this.modal.hide();
    }

}
