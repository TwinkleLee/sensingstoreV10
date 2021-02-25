import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';


import { PlanServiceProxy, CreatePlanInput, CreateScheduleInput, CreateSyncOptionInput } from '@shared/service-proxies/service-proxies-sync';
import * as moment from 'moment';


@Component({
    selector: 'createOrEditPlanModal',
    templateUrl: './create-or-edit-plan-modal.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }
        .m-radio,.m-checkbox{
            margin-right:30px;
        }`
    ]
})
export class CreateOrEditPlanModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('createOrEditModal',{static:false}) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    operation: string = "add";


    plan;
    basic;



    syncFieldsList = [
        { name: 'productName', value: 'title', result: false },
        { name: 'subTitle', value: 'subTitle', result: false },
        { name: 'Picture', value: 'picUrl', result: false },
        { name: 'productPrice', value: 'price', result: false },
        { name: 'productStock', value: 'quantity', result: false },
        { name: 'Resource', value: 'fileUrl', result: false },
        { name: 'ProductCategory', value: 'categorys', result: false },
        { name: 'productSalesVolume', value: 'salesVolume', result: false },
        { name: 'description', value: 'description', result: false },

        { name: 'price', value: 'sku.price', result: false },
        { name: 'stock', value: 'sku.quantity', result: false },
        { name: 'salesVolume', value: 'sku.salesVolume', result: false },

    ]

    weekList = [
        { name: 'Sun', value: '0', result: false },
        { name: 'Mon', value: '1', result: false },
        { name: 'Tue', value: '2', result: false },
        { name: 'Wed', value: '3', result: false },
        { name: 'Thu', value: '4', result: false },
        { name: 'Fri', value: '5', result: false },
        { name: 'Sat', value: '6', result: false }
    ]

    constructor(
        injector: Injector,
        private _PlanServiceProxy: PlanServiceProxy

    ) {
        super(injector);
    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(basic, plan?: any): void {
        this.active = true;
        this.basic = basic;
        console.log(this.basic)
        if (plan) {
            this.operation = "edit";
            this.plan = plan;

            this.plan.schedule.model = String(plan.schedule.model);
            this.plan.syncOption.syncType = String(plan.syncOption.syncType);

            console.log(this.plan)

            if (!this.plan.syncOption.syncFields) this.plan.syncOption.syncFields = ''
            var syncFieldsArr = this.plan.syncOption.syncFields.split(",");
            for (var i = 0; i < syncFieldsArr.length; i++) {
                for (var j = 0; j < this.syncFieldsList.length; j++) {
                    if (syncFieldsArr[i] == this.syncFieldsList[j].value) {
                        this.syncFieldsList[j].result = true;
                    }
                }
            }

            if (!this.plan.schedule.weeDay) this.plan.schedule.weeDay = ''
            var weekArr = this.plan.schedule.weeDay.split(",");
            for (var i = 0; i < weekArr.length; i++) {
                for (var j = 0; j < this.weekList.length; j++) {
                    if (weekArr[i] == this.weekList[j].value) {
                        this.weekList[j].result = true;
                    }
                }
            }
        } else {
            this.operation = "add";
            this.plan = new CreatePlanInput(this.plan);
            this.plan.schedule = new CreateScheduleInput();
            this.plan.schedule.model = '1';
            this.plan.syncOption = new CreateSyncOptionInput();
            this.plan.syncOption.syncType = '0';
            this.plan.isEnabled = true;

            this.plan.schedule.statDate = moment();
            this.plan.schedule.endDate = moment();

            console.log(this.plan)
        }
        this.modal.show();

    }

    onShown(): void {

    }

    save(): void {
        this.saving = true;
        console.log(this.syncFieldsList)
        var syncFieldsArr = [];
        for (var i = 0; i < this.syncFieldsList.length; i++) {
            if (this.syncFieldsList[i].result) {
                syncFieldsArr.push(this.syncFieldsList[i].value)
            }
        }
        this.plan.syncOption.syncFields = syncFieldsArr.join(",");


        var weekArr = [];
        for (var i = 0; i < this.weekList.length; i++) {
            if (this.weekList[i].result) {
                weekArr.push(this.weekList[i].value)
            }
        }
        this.plan.schedule.weeDay = weekArr.join(",");


        if (this.plan.schedule.statDate) {
            this.plan.schedule.statDate = this.plan.schedule.statDate.add(-(new Date().getTimezoneOffset() / 60), 'h');
        }
        if (this.plan.schedule.endDate) {
            this.plan.schedule.endDate = this.plan.schedule.endDate.add(-(new Date().getTimezoneOffset() / 60), 'h');
        }



        this.plan.externalAccessTokenInfoId = this.basic.id;
        if (this.operation == "add") {
            this._PlanServiceProxy.createPlan(this.plan)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        } else {
            this._PlanServiceProxy.updatePlan(this.plan)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        }

    }

    close(): void {
        this.active = false;
        this.plan = {};
        this.saving = false;
        this.modal.hide();
        this.syncFieldsList = [
            { name: 'productName', value: 'title', result: false },
            { name: 'subTitle', value: 'subTitle', result: false },
            { name: 'Picture', value: 'picUrl', result: false },
            { name: 'price', value: 'price', result: false },
            { name: 'stock', value: 'quantity', result: false },
            { name: 'Resource', value: 'fileUrl', result: false },
            { name: 'ProductCategory', value: 'categorys', result: false },
            { name: 'salesVolume', value: 'salesVolume', result: false },
            { name: 'description', value: 'description', result: false },
        ]

        this.weekList = [
            { name: 'Sun', value: '0', result: false },
            { name: 'Mon', value: '1', result: false },
            { name: 'Tue', value: '2', result: false },
            { name: 'Wed', value: '3', result: false },
            { name: 'Thu', value: '4', result: false },
            { name: 'Fri', value: '5', result: false },
            { name: 'Sat', value: '6', result: false }
        ]
    }
}
