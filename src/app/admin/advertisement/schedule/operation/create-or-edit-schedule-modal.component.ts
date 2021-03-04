import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';
import { AdServiceProxy, AddOrUpdateAdSchedulingInput, PublishContentToAdScheduling } from '@shared/service-proxies/service-proxies';
import * as moment from 'moment';

import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';

@Component({
    selector: 'scheduleModal',
    templateUrl: './create-or-edit-schedule-modal.component.html'
})
export class ScheduleModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild('UserDataTable', { static: false }) UserDataTable: Table;
    @ViewChild('UserPaginator', { static: false }) UserPaginator: Paginator;
    UserPrimeng: PrimengTableHelper = new PrimengTableHelper();

    active = false;
    saving = false;
    operation: string = "add";
    Schedule: any = {};
    AdInput: AddOrUpdateAdSchedulingInput;

    programId: any = "";
    programList = [];
    constructor(
        injector: Injector,
        private _AdServiceProxy: AdServiceProxy
    ) {
        super(injector);
        this._AdServiceProxy.getProgramsIn24HoursList(
            undefined,
            "",
            undefined,
            999,
            0
        ).subscribe(result => {
            this.programList = result.items;
            console.log("programList", this.programList);
        })
    }


    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(record?: any): void {
        this.modal.show();
        if (record) {
            this.operation = "edit";
            this.Schedule = Object.assign({}, record);
        } else {
            this.operation = "add";
            var nowTime = moment(moment().utc().format("YYYY/MM/DD")).startOf('day');
            // this.Schedule.activeTime = nowTime.clone();
            // this.Schedule.endTime = nowTime.clone().add(30, 'd');
            this.Schedule = {
                activeTime: nowTime.clone(),
                endTime: nowTime.clone().add(30, 'd')
            }
            // this.Schedule.activeTime = nowTime.clone();
            // this.Schedule.endTime = nowTime.clone().add(30, 'd');
        }
        this.active = true;
    }

    onShown(): void {

    }

    save(): void {
        this.saving = true;
        if (this.Schedule.activeTime) {
            this.Schedule.activeTime = moment(this.Schedule.activeTime.format("YYYY/MM/DD")).startOf('day');
            // .add(-(new Date().getTimezoneOffset() / 60), 'h')
        }
        if (this.Schedule.endTime) {
            this.Schedule.endTime = moment(this.Schedule.endTime.format("YYYY/MM/DD")).startOf('day');
            // .add(-(new Date().getTimezoneOffset() / 60), 'h')
        }
        this.AdInput = new AddOrUpdateAdSchedulingInput(this.Schedule);
        this._AdServiceProxy.addOrUpdateScheduling(this.AdInput)
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe(result => {
                if (this.programId) {
                    this.saving = true;
                    var input = new PublishContentToAdScheduling({
                        "adSchedulingContentIds": [this.programId],
                        "adschedulingId": result,
                        "action": 'add'
                    })

                    this._AdServiceProxy.addContentToScheduling(input)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe(r => {
                            this.notify.info(this.l('SavedSuccessfully'));
                            this.close();
                            this.modalSave.emit(null);
                        })
                } else {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                }
            });
    }

    close(): void {
        this.active = false;
        this.AdInput = null;
        this.saving = false;
        this.programId = "";
        this.modal.hide();
    }
    imageOnUpload(result): void {
        this.Schedule.iconUrl = result.fileUri;
    }

    getSchedule(event) {
        setTimeout(() => {
            this.UserPrimeng.showLoadingIndicator();
            if (this.UserPrimeng.shouldResetPaging(event)) {
                this.UserPaginator.changePage(0);
                return;
            }
        
            this.UserPrimeng.showLoadingIndicator();
            this._AdServiceProxy.getProgramsIn24HoursList(
                undefined,
                undefined,
                this.UserPrimeng.getSorting(this.UserDataTable),
                this.UserPrimeng.getMaxResultCount(this.UserPaginator, event),
                this.UserPrimeng.getSkipCount(this.UserPaginator, event)
            )
                .pipe(this.myFinalize(() => { this.UserPrimeng.hideLoadingIndicator(); }))
                .subscribe(result => {
                var list = Object.assign({}, result);
                list.items.forEach((element,index) => {
                    element.content = JSON.parse(element.content);
                    if(index==0){
                    if(!element.adList)element.adList=[];
                    if(!element.softwareList)element.softwareList=[];
                    }else{
                    element.adList = list.items[0].adList;
                    element.softwareList = list.items[0].softwareList;
                    }
                });
                this.UserPrimeng.totalRecordsCount = result.totalCount;
                this.UserPrimeng.records = list.items;
                })
        })
    }

//转换序列
  transIndex(i, event) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.UserPaginator, event);
  }

}
