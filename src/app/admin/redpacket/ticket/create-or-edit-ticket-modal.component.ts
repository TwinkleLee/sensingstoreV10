import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked, Input } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { TicketServiceProxy, AddOrUpdateTicketInput, TakeType, TicketType } from '@shared/service-proxies/service-proxies2';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
    selector: 'ticketModal',
    templateUrl: './create-or-edit-ticket-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditTicketModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('tagTree', { static: false }) tagTree;
    @ViewChild('typeTree', { static: false }) typeTree;
    @ViewChild('memberTree', { static: false }) memberTree;

    @Input() storeList;

    active = false;
    saving = false;

    TakeType = TakeType;

    TicketType = TicketType;

    operation: string = "add";
    objItem: any = {
        useCondition: {
            "amount": void 0,
            "tagIds": [
            ],
            "categoryIds": [
            ]
        },
        takeCondition: [],
        ticketType: 'Voucher',
        takeType: 'UserTake',
        usage: 'weishop',
        repeatTakeTimes: 1,
        mergeUse: false,
        ticketStatus: 'Online'
    };

    memberTypeList: any = [];
    memberInitArray: any = [];
    typeList: any = [];
    typeInitArray: any = [];
    tagList: any = [];
    tagInitArray: any = [];

    constructor(
        injector: Injector,
        private _TicketServiceProxy: TicketServiceProxy,
    ) {
        super(injector);
    }


    clickContainer() {
        if (this.tagTree && this.tagTree.showStore) {
            this.tagTree.clickInput()
        }
        if (this.typeTree && this.typeTree.showStore) {
            this.typeTree.clickInput()
        }
        if (this.memberTree && this.memberTree.showStore) {
            this.memberTree.clickInput()
        }
    }

    onTreeUpdate1(e) {
        this.objItem.useCondition.tagIds = e.map(item => {
            return item.id
        })
    }
    onTreeUpdate2(e) {
        this.objItem.useCondition.categoryIds = e.map(item => {
            return item.id
        })
    }
    onTreeUpdate3(e) {
        this.objItem.takeCondition = e.map(item => {
            return item.value
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
            this.objItem = _.cloneDeep(objItem);
            console.log(objItem);

            if (!this.objItem.color) {
                this.objItem.color = '#f85007'
            }

            this.memberInitArray = this.objItem.takeCondition.map(item => {
                return { id: item }
            })
            this.tagInitArray = this.objItem.useCondition.tagIds.map(item => {
                return { id: item }
            })
            this.typeInitArray = this.objItem.useCondition.categoryIds.map(item => {
                return { id: item }
            })

            console.log('typeInitArray', this.typeInitArray)

        } else {
            this.operation = "add";
            this.objItem = {
                useCondition: {
                    "amount": void 0,
                    "tagIds": [
                    ],
                    "categoryIds": [
                    ]
                },
                takeCondition: [],
                ticketType: 'Voucher',
                takeType: 'UserTake',
                usage: 'weishop',
                repeatTakeTimes: 1,
                mergeUse: false,
                ticketStatus: 'Online',
                color: '#0000ff'
            };

        }
        this.modal.show();
    }


    onShown(): void {

    }

    save(): void {
        if (this.objItem.startTime) {
            this.objItem.startTime = moment(this.objItem.startTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h')
        }
        if (this.objItem.endTime) {
            this.objItem.endTime = moment(this.objItem.endTime.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's')
        }
        if (!this.objItem.picUrl) {
            this.objItem.picUrl = "http://sensingstore.oss-cn-shanghai.aliyuncs.com/Uploads/Tenants/5056/Common/coupon_2019070317452483755658.png";
        }
        this.saving = true;
        this._TicketServiceProxy.addOrUpdateTicket(this.objItem as AddOrUpdateTicketInput)
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe(result => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
            })
    }

    close(): void {
        this.active = false;
        this.objItem = {
            useCondition: {
                "amount": void 0,
                "tagIds": [
                ],
                "categoryIds": [
                ]
            },
            takeCondition: [],
            ticketType: 'Voucher',
            takeType: 'UserTake',
            usage: 'weishop',
            repeatTakeTimes: 1,
            mergeUse: false,
            ticketStatus: 'Online'

        };
        this.saving = false;
        this.modal.hide();
    }


    logoOnUpload(result): void {
        this.objItem.picUrl = result.fileUri;
    }


}
