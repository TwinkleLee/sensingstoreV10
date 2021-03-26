import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';
import { AdServiceProxy } from '@shared/service-proxies/service-proxies-ads';
import * as moment from 'moment';
import * as _ from 'lodash';
import { DateRangePickerComponent } from '@app/shared/common/timing/date-range-picker.component';
import { ProgramModalComponent } from '@app/admin/advertisement/schedule/operation/program-modal.component';

@Component({
    selector: 'calendarModal',
    templateUrl: './calendar-modal.component.html',
    styles: [`
    .timeList{
        padding-top:calc(2rem - 0.5rem);
        text-align:center;
        position:relative;
    }
    .timeList>div{
        position:relative;
    }
    .dateItem {
        flex-grow:1;outline:1px solid #000;text-align: center;
        position:relative;
        line-height: 2rem;
        flex-shrink: 0;
        width:10rem;
        height:fit-content;
    }
    .dateItem .topDate{
        outline:1px solid #000;
        height: 2rem;
        position:sticky;
        top:0;
        background:#fff;
        z-index:10;
    }
    .dateItem .adList{
        position:absolute;
        width:100%;
        color:#000;
        background:#eee;
    }
    
    .modeSmall{
        height: 6rem;
    }
    
    .modeBig{
        height: 60rem;
    }`
    ]
})
export class CalendarModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild("dateranger", { static: false }) dateranger: DateRangePickerComponent;
    @ViewChild('programModal', { static: true }) ProgramModalComponent: ProgramModalComponent;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    Schedule: any = {};
    minDate: any = null;
    maxDate: any = null;
    searchStartDate: any = null;
    searchEndDate: any = null;

    calenderId: any = null;
    dateList = [];
    modeSmall = true;
    heightRem1S = 6 / 60 / 60;//为bigMode时为60 / 60 / 60
    seconds1D = 24 * 60 * 60;
    bgColorList = ["#19CAAD", "#A0EEE1", "#D1BA74", "#D6D5B7", "#F4606C", "#BEEDC7"];

    adListForModal = [];
    softwaresForModal = [];
    fromDevice: Boolean = false;
    constructor(
        injector: Injector,
        private _AdServiceProxy: AdServiceProxy
    ) {
        super(injector);
    }


    ngAfterViewChecked(): void {

    }

    show(record): void {
        if (record.adSchedulingId) {
            this.fromDevice = true;
        } else {
            this.fromDevice = false;
        }
        this.calenderId = record.id;
        this.minDate = record.activeTime;
        this.maxDate = record.endTime;
        this.modal.show();
        this.Schedule = Object.assign({}, record);
        var nowTime = moment(moment().utc().format("YYYY/MM/DD")).startOf('day');
        if (nowTime.isBefore(this.minDate)) {
            this.searchStartDate = this.minDate.clone();
        } else {
            this.searchStartDate = nowTime.clone();
        }

        if (this.searchStartDate.clone().add(7, 'days').isBefore(this.maxDate)) {
            this.searchEndDate = this.searchStartDate.clone().add(7, 'days');
        } else {
            this.searchEndDate = this.maxDate.clone();
        }

        setTimeout(() => { this.dateranger.refresh(); });
        this.getScheduleCalendar();
        this.active = true;
    }
    getScheduleCalendar() {
        this._AdServiceProxy.getScheduleCalendar(this.calenderId, this.searchStartDate, this.searchEndDate)
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe(res => {
                res.scheduleContents = res.scheduleContents.filter(item => item.adIds);
                var adList = [];
                if (res.ads) {
                    adList = res.ads.map(ad => ({
                        id: ad.id,
                        name: ad.name
                    }))
                }

                this.adListForModal = res.ads;
                var softwareList = [];
                if (res.softwares) {
                    softwareList = res.softwares.map(app => ({
                        id: app.id,
                        name: app.name
                    }))
                }

                this.softwaresForModal = res.softwares;

                this.dateList = res.scheduleContents.map(item => ({
                    playModel: item.scheduleModel.playModel,
                    priority: item.scheduleModel.priority,
                    date: item.scheduleModel.startTime,
                    startTime: item.startTime,
                    endTime: item.endTime,
                    adGroups: item.adIds.map(item2 => {
                        return {
                            children: item2.children.map((child) => ({
                                id: child.id,
                                name: item2.type == 0 ? adList.find(ad => ad.id == child.id).name : softwareList.find(app => app.id == child.id).name,
                                timeSpanNum: child.duration,
                                transition: child.transition,
                                startPointName: child.startPointName,
                                stopPointName: child.stopPointName,
                            })),
                            idleAble: item2.idleAble,
                            scheduleEndTime: item2.scheduleEndTime,
                            scheduleStartTime: item2.scheduleStartTime,
                            packageName: item2.packageName,
                            type: item2.type,
                            unstoppable: item2.unstoppable
                        }
                    })
                }))
                this.dateList.forEach(date => {
                    //添加空
                    if (date.adGroups[0].scheduleStartTime != 0) {
                        date.adGroups.splice(0, 0, {
                            children: [],
                            scheduleEndTime: date.adGroups[0].scheduleStartTime,
                            scheduleStartTime: 0,
                            type: -1,
                        })
                    }
                    for (let i = 1; i < date.adGroups.length; i++) {
                        if (date.adGroups[i - 1].scheduleEndTime != date.adGroups[i].scheduleStartTime) {
                            date.adGroups.splice(i, 0, {
                                children: [],
                                scheduleStartTime: date.adGroups[i - 1].scheduleEndTime,
                                scheduleEndTime: date.adGroups[i].scheduleStartTime,
                                type: -1,
                            })
                        }
                    }

                    if (this.secondToTime(date.adGroups[date.adGroups.length - 1].scheduleEndTime, date.startTime) != date.endTime) {
                        date.adGroups.splice(date.adGroups.length, 0, {
                            children: [],
                            scheduleEndTime: this.timeToSecond(date.endTime, date.startTime),
                            scheduleStartTime: date.adGroups[date.adGroups.length - 1].scheduleEndTime,
                            type: -1,
                        })
                    }
                    //添加空完成

                    date.adGroups.forEach((adGroup, adGroupIndex) => {
                        adGroup.title = adGroup.children.reduce((total, currentValue) => {
                            return total + currentValue.name + " "
                        }, "");
                        adGroup.height = (adGroup.scheduleEndTime - adGroup.scheduleStartTime) * this.heightRem1S;
                        if (adGroupIndex == 0) {
                            adGroup.marginTop = adGroup.scheduleStartTime * this.heightRem1S;
                        } else {
                            adGroup.marginTop = (adGroup.scheduleStartTime - date.adGroups[adGroupIndex - 1].scheduleEndTime) * this.heightRem1S;
                        }
                        adGroup.bgColor = adGroup.type == -1 ? "#ccc" : this.bgColorList[adGroupIndex % this.bgColorList.length];
                        adGroup.formatStartTime = this.secondToTime(adGroup.scheduleStartTime, date.startTime);
                        adGroup.formatEndTime = this.secondToTime(adGroup.scheduleEndTime, date.startTime);
                    })

                })
                if (this.dateList.length) {
                    setTimeout(() => {
                        var dom = document.getElementById("overflowContainer");
                        dom.scrollTop = dom.scrollHeight * this.timeToSecond(this.dateList[0].startTime) / this.timeToSecond("24:00:00");
                        console.log(dom.scrollTop);
                    })
                }


                console.log("dateList", this.dateList);
            });
    }
    changeMode() {
        this.modeSmall = !this.modeSmall;
        if (this.modeSmall) {
            this.heightRem1S = 6 / 60 / 60;
        } else {
            this.heightRem1S = 60 / 60 / 60;
        }
        this.dateList.forEach(date => {
            date.adGroups.forEach((adGroup, adGroupIndex) => {
                adGroup.height = (adGroup.scheduleEndTime - adGroup.scheduleStartTime) * this.heightRem1S;
            })
        })
    }

    timeToSecond(time, startTime?) {//用于将formatSchduleTime转回scheduleTime
        var hour = time.split(":")[0];
        var minute = time.split(":")[1];
        var second = time.split(":")[2];
        if (startTime) {//和Program.startTime做差后的秒数
            return Number(hour) * 3600 + Number(minute) * 60 + Number(second) - this.timeToSecond(startTime);
        } else {//绝对秒数
            return Number(hour) * 3600 + Number(minute) * 60 + Number(second)
        }
    }
    secondToTime(totalSeconds, startTime?) {
        totalSeconds = Number(totalSeconds);
        if (startTime) {//距离Program.startTime的时间
            totalSeconds += this.timeToSecond(startTime);
        }
        var hour = ("0" + String(totalSeconds / 3600 >> 0)).substr(-2);
        var minute = ("0" + String(totalSeconds % 3600 / 60 >> 0)).substr(-2);
        var second = ("0" + String(totalSeconds % 3600 % 60 >> 0)).substr(-2);
        return `${hour}:${minute}:${second}`;
    }
    editDate(date) {
        if (this.fromDevice) return;
        console.log("data",date, this.adListForModal, this.softwaresForModal, this.calenderId)
        this.ProgramModalComponent.showFromCalender(date, this.adListForModal, this.softwaresForModal, this.calenderId);
    }

    onShown(): void {

    }

    close(): void {
        this.active = false;
        this.saving = false;
        this.modal.hide();
    }
    save () {}
}
