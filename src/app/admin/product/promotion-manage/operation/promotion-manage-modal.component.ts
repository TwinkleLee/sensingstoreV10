import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';
import { PromotionServiceProxy } from '@shared/service-proxies/service-proxies';
import * as moment from 'moment';

@Component({
    selector: 'promotionManageModal',
    templateUrl: './promotion-manage-modal.component.html'
})
export class PromotionManageModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    operation: string = "add";
    Program: any = {};
    content: any = {};


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
        private _PromotionServiceProxy: PromotionServiceProxy
    ) {
        super(injector);
    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }



    show(Program?: any): void {
        this.active = true;
        if (Program) {
            this.operation = "edit";
            this.Program = Object.assign({}, Program);
            this.content = this.Program.attribute;
            console.log(this.Program)
            this.weekList.forEach(item => {
                if (this.Program.attribute.weekdayList.indexOf(item.value) > -1) {
                    item.result = true;
                }
            })
        } else {
            this.operation = "add";
            this.Program = {
                promotionType: 0,
                discountType: 0,
                startTime: moment().utc().subtract(29, 'days').startOf('day'),
                endTime: moment().utc().endOf('day')
            };

            this.content.model = "1";
            this.content.startTime = "00:00";
            this.content.endTime = "23:59";
        }
        this.modal.show();
    }

    onShown(): void {

    }

    save(): void {


        this.content.weekdayList = this.weekList.filter(item => {
            return item.result
        }).map(item => {
            return item.value
        })

        if (this.Program.startTime) {
            try {
                this.Program.startTime = moment(this.Program.startTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h')
            } catch (e) {

            }
        }
        if (this.Program.endTime) {
            try {
                this.Program.endTime = moment(this.Program.endTime.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's')
            } catch (e) {

            }
        }
        if (this.Program.promotionType == 2) {
            this.Program.discountType = undefined;
            this.Program.discountAmount = undefined;
        }
        this.Program.attribute = this.content;

        this.saving = true;

        this._PromotionServiceProxy.addOrUpdatePromotion(this.Program)
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe(() => {
                this.modalSave.emit(null);
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
            });
    }

    close(): void {
        this.active = false;
        this.saving = false;
        this.Program = {};
        this.content = {};
        this.weekList = [
            { name: 'Sun', value: '0', result: false },
            { name: 'Mon', value: '1', result: false },
            { name: 'Tue', value: '2', result: false },
            { name: 'Wed', value: '3', result: false },
            { name: 'Thu', value: '4', result: false },
            { name: 'Fri', value: '5', result: false },
            { name: 'Sat', value: '6', result: false }
        ]
        this.modal.hide();
    }


}
