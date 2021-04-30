import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';
import { ProductAlertModalComponent } from '@app/admin/device/device-list/tabAlert/product-selection-modal.component';
import { AdServiceProxy, ProgramItem, AdOrAppItem, SchedulingContentInput, SchedulingContent, AddOrUpdateAdSchedulingInput, AdsPackageServiceProxy } from '@shared/service-proxies/service-proxies-ads';
import * as moment from 'moment';
import * as _ from 'lodash';
// 空 id0 type-1
// 广告组 id-1 type0
// 软件 id具体 type1
@Component({
    selector: 'programModal',
    templateUrl: './program-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }
        .timelineItem{
            cursor:pointer;
            user-select: none;
            width:100%;
            height:100%;
            overflow:hidden;
            text-overflow:ellipsis;
            white-space: nowrap;
            position:absolute;
            word-break: break-all;
            font-weight:bold;
        }
        .invalid{
            outline:2px solid #f00 !important;
        }
        .selected{
            outline:4px solid #00f !important;
            z-index:10;
        }
        .hovered{
            outline:4px solid yellow !important;
            z-index:11;
        }
        .selected2{
            z-index:10;
        }
        .contextmenuContainer{
            position:fixed;
            background:#fff;
            box-shadow: 0.5rem 0.5rem 1rem #888888;
            z-index:20;
        }
        .contextmenuItem{
            width:100%;
            border:1px solid #000;
            height:2.5rem;
            line-height:2.5rem;
            padding:0 1.5rem;
            cursor:pointer;
        }
        .contextmenuItem:hover{
            border-color:#00f;
            outline:2px solid #00f;
        }
        /deep/ p-inputMask{
            display:inline-block;
        }
        /deep/ .myPInputMask{
            width:5rem;
            text-align:center;
            padding:0 !important;
        }
        /deep/ #startTime{
            position: absolute;
            left:0;
            top:120%;
            transform: translateX(-50%);
        }
        #table {
            border-collapse: collapse;
            width: 100%;
            text-align:center;
        }
          
        #table,#table td {
            border: 1px solid #ccc;
            position: relative;
            line-height:3rem;
        }`
    ]
})
export class ProgramModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('createOrEditModal', { static: false }) modal: ModalDirective;
    @ViewChild('confirmModal', { static: false }) confirmModal: ModalDirective;
    @ViewChild('childrenModal', { static: false }) childrenModal: ModalDirective;
    @ViewChild('ProductAlertModal', { static: false }) ProductAlertModal: ProductAlertModalComponent;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    operation: string = "add";
    Program: any = {};
    content: any = {};
    deviceId;
    nowSelectedItemIndex: any;

    targetIndex;
    originIndex;

    input = {
        AuditStatus: 'Online',
        Sorting: 'lastModificationTime DESC'
    }

    contextmenuConfig = {
        show: false,
        left: 0,
        top: 0,
        nowSelectedIndexList: [],
        permitCombine: false,
        permitSplit: false
    }

    weekList = [
        { name: 'Sun', value: '0', result: false },
        { name: 'Mon', value: '1', result: false },
        { name: 'Tue', value: '2', result: false },
        { name: 'Wed', value: '3', result: false },
        { name: 'Thu', value: '4', result: false },
        { name: 'Fri', value: '5', result: false },
        { name: 'Sat', value: '6', result: false }
    ]

    isFromCalender = false;
    calenderId;
    showButtonContext = false;
    bgColorList = ["#19CAAD", "#A0EEE1", "#D1BA74", "#D6D5B7", "#F4606C", "#BEEDC7"];
    parseFloat = parseFloat;
    hourList = [];
    nowHoveredIndex = -1;
    childrenModalItem: any = {};
    constructor(
        injector: Injector,
        private _AdServiceProxy: AdServiceProxy,
        private _adsPackageSvc: AdsPackageServiceProxy
    ) {
        super(injector);
    }

    ngAfterViewChecked(): void {

    }


    colorReverse(oldColor) {
        return "#fff";
        if (oldColor.indexOf("rgb") == -1) {
            var oldColor2: any = '0x' + oldColor.replace(/#/g, '');
            var str = '000000' + (0xFFFFFF - oldColor2).toString(16);
            return "#" + str.substring(str.length - 6, str.length);
        } else {
            var rgb = oldColor.split(',');
            var r = parseInt(rgb[0].split('(')[1]);
            var g = parseInt(rgb[1]);
            var b = parseInt(rgb[2].split(')')[0]);
            var hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
            return hex;
        }
    }

    showFromCalender(date, adForModal, softwareForModal, calenderId): void {
        console.log(date, adForModal);
        this.isFromCalender = true;
        this.calenderId = calenderId;
        var program = {
            adList: adForModal,
            softwareList: softwareForModal,
            ads: JSON.stringify(date.adGroups.filter(adGroup => adGroup.type != -1).map(adGroup => {
                return {
                    "ScheduleStartTime": adGroup.scheduleStartTime,
                    "ScheduleEndTime": adGroup.scheduleEndTime,
                    "IdleAble": adGroup.idleAble,
                    "Children": adGroup.children.map(child => ({
                        Id: child.id,
                        Duration: child.timeSpanNum,
                        Transition: child.transition,
                        StartPointName: child.startPointName,
                        StopPointName: child.stopPointName,
                    })),
                    "Type": adGroup.type,
                    "PackageName": adGroup.packageName,
                    "Unstoppable": adGroup.unstoppable
                }
            })),
            content: { "model": "0", "playModel": date.playModel, "priority": date.priority, "startTime": date.date, "endTime": date.date, weekdayList: [] },
            startTime: date.startTime,
            endTime: date.endTime
        }
        console.log("programFromCalender", JSON.parse(program.ads));
        this.show(program);
    }


    show(Program?: any): void {
        this.active = true;
        if (Program) {
            this.operation = "edit";
            this.Program = {
                startTime: Program.startTime,
                endTime: Program.endTime,
                name: Program.name,
                id: Program.id,
            }
            var Program = _.clone(Program);

            Program.ads = JSON.parse(Program.ads);
            //插入空白时间段
            if (Program.ads[0].ScheduleStartTime != 0) {
                Program.ads.splice(0, 0, {
                    scheduleStartTime: 0,
                    scheduleEndTime: Program.ads[0].ScheduleStartTime,
                    ScheduleStartTime: 0,
                    ScheduleEndTime: Program.ads[0].ScheduleStartTime,
                    id: 0,
                    invalid: false,
                    type: -1,
                    name: this.l("EmptyTimeSlot"),
                    timeSpan: this.secondToTime(Program.ads[0].ScheduleStartTime),
                    timeSpanNum: Program.ads[0].ScheduleStartTime,
                })
            }
            for (let i = 1; i < Program.ads.length; i++) {
                if (Program.ads[i - 1].ScheduleEndTime != Program.ads[i].ScheduleStartTime) {
                    Program.ads.splice(i, 0, {
                        scheduleStartTime: Program.ads[i - 1].ScheduleEndTime,
                        scheduleEndTime: Program.ads[i].ScheduleStartTime,
                        ScheduleStartTime: Program.ads[i - 1].ScheduleEndTime,
                        ScheduleEndTime: Program.ads[i].ScheduleStartTime,
                        id: 0,
                        invalid: false,
                        type: -1,
                        name: this.l("EmptyTimeSlot"),
                        timeSpan: this.secondToTime(Program.ads[i - 1].ScheduleEndTime - Program.ads[i].ScheduleStartTime),
                        timeSpanNum: Program.ads[i - 1].ScheduleEndTime - Program.ads[i].ScheduleStartTime,
                    })
                }
            }
            //插入空白时间段结束
            console.log(Program.ads);
            this.Program.ads = Program.ads.map(item => {
                if (item.type == -1) return item
                var newItem: any = {
                    scheduleStartTime: item.ScheduleStartTime,
                    scheduleEndTime: item.ScheduleEndTime,
                    // id: item.Children.length == 1 ? item.Children[0].Id : -1,
                    id: -1,//FIXME 不再考虑单个广告
                    invalid: false,
                    type: item.Type,
                    name: "",
                    timeSpan: "",
                    timeSpanNum: 0,
                    unstoppable: item.Unstoppable
                }

                if (newItem.id != -1) {//是单个广告//软件则使用子的名字/timeSpan
                    if (newItem.type == 0) {
                        var ele = Program.adList.find(ele => ele.id == item.Children[0].Id);
                    } else if (newItem.type == 1) {
                        var ele = Program.softwareList.find(ele => ele.id == item.Children[0].Id);
                    }
                    newItem.name = ele.name;
                    if (!ele.timeSpan || ele.timeSpan == "00:00:00") ele.timeSpan = "00:00:01";
                    newItem.timeSpan = ele.timeSpan;
                    newItem.timeSpanNum = this.timeToSecond(newItem.timeSpan);
                } else {//是广告组则使用各个子timeSpanNum之和
                    newItem.name = item.PackageName;
                    item.Children.forEach((initChild, i) => {
                        // if (newItem.type == 0) {
                        //     var child = Program.adList.find(ele => ele.id == initChild.Id);
                        // } else if (newItem.type == 1) {
                        //     var child = Program.softwareList.find(ele => ele.id == initChild.Id);
                        // }
                        // newItem.name += child.name + ' ';
                        newItem.timeSpanNum += initChild.Duration;
                    })
                    newItem.timeSpan = this.secondToTime(newItem.timeSpanNum);
                    newItem.children = item.Children.map((initChild, i) => {
                        if (newItem.type == 0) {
                            var child = Program.adList.find(ad => ad.id == initChild.Id);
                        } else if (newItem.type == 1) {
                            var child = Program.softwareList.find(ad => ad.id == initChild.Id);
                        }
                        // console.log("Program.adList",Program.adList)
                        // console.log("initChild",initChild)
                        // console.log("child",child)

                        if (!child.timeSpan || child.timeSpan == "00:00:00") child.timeSpan = "00:00:01";
                        return {
                            id: initChild.Id,
                            name: child.name,
                            timeSpan: child.timeSpan,
                            timeSpanNum: this.timeToSecond(child.timeSpan),
                            totalTimeSpanNum: initChild.Duration,
                            transition: initChild.Transition,
                            startPointName: initChild.StartPointName,
                            stopPointName: initChild.StopPointName,
                        };
                    })
                }
                console.log("newItem", newItem);
                return newItem
            })
            console.log("Program", Program, this.Program)
            Program.content.startTime = moment(Program.content.startTime);
            Program.content.endTime = moment(Program.content.endTime);
            this.content = Program.content;
            if (!this.content.playModel) this.content.playModel = 0;
            this.weekList.forEach(item => {
                if (this.content.weekdayList.indexOf(item.value) > -1) {
                    item.result = true;
                }
            })
            this.generateHourList();
            this.refreshAdList();
        } else {
            this.operation = "add";
            this.Program = {
                startTime: "10:00:00",
                endTime: "20:00:00"
            };
            this.content.model = "0";
            this.content.playModel = 0;
            this.content.startTime = moment().utc().startOf('day');
            this.content.endTime = moment().utc().add(29, 'days').endOf('day');
            this.Program.ads = [];
            this.generateHourList();
        }
        this.modal.show();
    }

    onShown(): void {

    }

    setAd(i) {
        this.nowSelectedItemIndex = i;
        // this.ProductAlertModal.cargoType = 'ads';
        this.ProductAlertModal.cargoType = 'adsPackage';
        this.ProductAlertModal.show();
    }
    setSoftware(i) {
        this.nowSelectedItemIndex = i;
        this.ProductAlertModal.cargoType = 'software';
        this.ProductAlertModal.show();
    }

    setNone(i) {
        this.nowSelectedItemIndex = i;
        var nowSelectedItem = this.Program.ads[this.nowSelectedItemIndex];
        console.log(nowSelectedItem);
        if (nowSelectedItem.id === 0) {//将空时间段置空 无事发生
            return
        } else {

            if (nowSelectedItem.id) {//将广告/软件置空

            } else {//新增空时间段
                nowSelectedItem.timeSpan = "01:00:00";
                nowSelectedItem.timeSpanNum = this.timeToSecond(nowSelectedItem.timeSpan);
                nowSelectedItem.scheduleEndTime = Number(nowSelectedItem.scheduleStartTime) + nowSelectedItem.timeSpanNum;
            }
            nowSelectedItem.id = 0;//空
            nowSelectedItem.name = this.l("EmptyTimeSlot");
            nowSelectedItem.type = -1;//空
        }

        this.refreshAdList();
    }
    changeAd(record) {
        var nowSelectedItem = this.Program.ads[this.nowSelectedItemIndex];
        console.log("changeAd", record, nowSelectedItem)
        if (record.selection.length == 0) {//没选择
            this.Program.ads.splice(this.nowSelectedItemIndex, 1);
        } else if (record.cargoType == "ads" || record.cargoType == "software") {
            if (record.cargoType == "ads") {
                nowSelectedItem.id = record.selection[0].id;
                nowSelectedItem.name = record.selection[0].name;

            } else if (record.cargoType == "software") {
                nowSelectedItem.id = record.selection[0].software.id;
                nowSelectedItem.name = record.selection[0].alias || record.selection[0].software.name;
            }

            // if (!record.selection[0].timeSpan || record.selection[0].timeSpan == "00:00:00") record.selection[0].timeSpan = "01:00:00";
            record.selection[0].timeSpan = "01:00:00";


            var oldCounts = 0;
            if (nowSelectedItem.type == 0) {//原本是广告则计算原本重复次数
                oldCounts = (Number(nowSelectedItem.scheduleEndTime) - Number(nowSelectedItem.scheduleStartTime)) / nowSelectedItem.timeSpanNum;
            }
            if (record.cargoType == "ads") {
                nowSelectedItem.type = 0;
            } else if (record.cargoType == "software") {
                nowSelectedItem.type = 1;
            }
            nowSelectedItem.timeSpan = record.selection[0].timeSpan;
            nowSelectedItem.timeSpanNum = this.timeToSecond(record.selection[0].timeSpan);

            //原结束时间不存在
            if (!nowSelectedItem.scheduleEndTime || nowSelectedItem.scheduleStartTime == nowSelectedItem.scheduleEndTime) {
                console.log("重新生成结束时间", Number(nowSelectedItem.scheduleStartTime), nowSelectedItem.timeSpanNum)
                nowSelectedItem.scheduleEndTime = Number(nowSelectedItem.scheduleStartTime) + nowSelectedItem.timeSpanNum;
            }
            //  else if (this.content.playModel == 1 && oldCounts && nowSelectedItem.type == 0) {//原本和现在都是广告,且次数优先则保留原次数
            //     console.log("保留原播放次数")
            //     nowSelectedItem.scheduleEndTime = Number(nowSelectedItem.scheduleStartTime) + nowSelectedItem.timeSpanNum * oldCounts;
            // }
            else if (this.content.playModel == 0 || !oldCounts || nowSelectedItem.type == 1) {//时间优先则保留原时间
                console.log("保留原结束时间")
            }
            this.refreshAdList();

        } else if (record.cargoType == "adsPackage") {
            this._adsPackageSvc.getAdInfosInSamePackage(record.selection[0].id,
                void 0,
                'OrderNumber',
                999,
                0)
                .pipe(this.myFinalize(() => { }))
                .subscribe(result => {
                    console.log(result.items);
                    console.log("原目标", nowSelectedItem);
                    nowSelectedItem.id = -1;
                    nowSelectedItem.name = record.selection[0].name;
                    nowSelectedItem.type = 0;

                    if (!nowSelectedItem.timeSpanNum) {
                        nowSelectedItem.timeSpanNum = result.items.reduce((total, currentValue) => {
                            return total + currentValue.playDuration
                        }, 0);
                        nowSelectedItem.timeSpan = this.secondToTime(nowSelectedItem.timeSpanNum);
                        // var selfTimeSpanNum = result.items.reduce((total, currentValue) => {
                        //     return total + currentValue.playDuration
                        // }, 0);

                        // if (selfTimeSpanNum > this.timeToSecond("01:00:00")) {
                        //     nowSelectedItem.timeSpanNum = selfTimeSpanNum;
                        // } else {
                        //     nowSelectedItem.timeSpanNum = this.timeToSecond("01:00:00");
                        // }
                        // nowSelectedItem.timeSpan = this.secondToTime(nowSelectedItem.timeSpanNum);
                        nowSelectedItem.scheduleEndTime = Number(nowSelectedItem.scheduleStartTime) + Math.max(nowSelectedItem.timeSpanNum, this.timeToSecond("01:00:00"));
                    }

                    nowSelectedItem.children = result.items.reduce((total, currentValue) => {
                        total.push({
                            "id": currentValue.adId,
                            // "name": currentValue.ad.name,
                            "timeSpan": this.secondToTime(currentValue.playDuration),
                            "timeSpanNum": currentValue.playDuration,
                            "totalTimeSpanNum": currentValue.playDuration,
                            "transition": currentValue.playTransition,
                            "startPointName": currentValue.startPointName,
                            "stopPointName": currentValue.stopPointName
                        })
                        return total
                    }, []);

                    this.refreshAdList();
                });
        }


    }

    dragstart(e, index) {
        e.dataTransfer.setData("text/plain", String(index));
    }
    dragover(e, index) {
        e.preventDefault();
        this.nowHoveredIndex = index;
    }
    drop(e, targetIndex) {
        console.log(targetIndex);
        e.preventDefault();
        this.nowHoveredIndex = -1;
        let originIndex = e.dataTransfer.getData("text");
        console.log(originIndex, targetIndex);
        if (originIndex == targetIndex) {

        } else {
            this.confirmModal.show();
            this.originIndex = originIndex;
            this.targetIndex = targetIndex;
        }
        return
    }
    dropBefore() {
        let originItem = this.Program.ads.splice(this.originIndex, 1)[0];
        if (this.originIndex < this.targetIndex) {
            this.Program.ads.splice(this.targetIndex - 1, 0, originItem);
        } else {
            this.Program.ads.splice(this.targetIndex, 0, originItem);
        }
        this.refreshAdList();
        this.confirmModal.hide();
    }
    dropAfter() {
        let originItem = this.Program.ads.splice(this.originIndex, 1)[0];
        if (this.originIndex < this.targetIndex) {
            this.Program.ads.splice(this.targetIndex, 0, originItem);
        } else {
            this.Program.ads.splice(this.targetIndex + 1, 0, originItem);
        }
        this.refreshAdList();
        this.confirmModal.hide();
    }
    dropEX() {
        let originItem = _.cloneDeep(this.Program.ads[this.originIndex]);
        let targetItem = _.cloneDeep(this.Program.ads[this.targetIndex]);
        this.Program.ads[this.targetIndex] = originItem;
        this.Program.ads[this.originIndex] = targetItem;
        this.refreshAdList();
        this.confirmModal.hide();
    }

    showChildrenModal(item) {
        this.childrenModalItem = item;
        this.childrenModal.show();
    }
    refreshAdList() {
        if (this.Program.ads.length) {
            //重新计算每个广告开始/结束时间
            for (let i = 0; i < this.Program.ads.length; i++) {
                var item = this.Program.ads[i];
                var timeSpan = item.scheduleEndTime - item.scheduleStartTime;
                if (i == 0) {
                    item.scheduleStartTime = 0;
                } else {
                    item.scheduleStartTime = Number(this.Program.ads[i - 1].scheduleEndTime);
                }
                item.formatScheduleStartTime = this.secondToTime(item.scheduleStartTime, true);

                item.scheduleEndTime = item.scheduleStartTime + timeSpan;
                item.formatScheduleEndTime = this.secondToTime(item.scheduleEndTime, true);

                //校验广告结束时间是否超过了时间轴结束时间
                if (item.scheduleEndTime >= (this.timeToSecond(this.Program.endTime) - this.timeToSecond(this.Program.startTime))) {
                    item.formatScheduleEndTime = this.Program.endTime;
                    item.scheduleEndTime = this.timeToSecond(item.formatScheduleEndTime, true);
                    this.Program.ads.splice(i + 1, this.Program.ads.length - i - 1);
                }
                //校验广告结束时间是否超过了时间轴结束时间结束
                item.formatTotalTimeSpan = this.secondToTime(item.scheduleEndTime - item.scheduleStartTime);
                if ((item.scheduleEndTime - item.scheduleStartTime) % item.timespanNum) {//不为整数次
                    item.invalid = true;
                } else {
                    item.invalid = false;
                }
                console.log(this.Program.ads);
            }


            //计算广告在时间轴中宽度
            var totalTime = this.timeToSecond(this.Program.endTime) - this.timeToSecond(this.Program.startTime);
            for (let i = 0; i < this.Program.ads.length; i++) {
                var item = this.Program.ads[i];
                var timeSpan = item.scheduleEndTime - item.scheduleStartTime;
                item.styleWidthPercent = timeSpan / totalTime * 100 + "%";
            }


        }
    }

    generateHourList() {//计算小时刻度
        var totalTime = this.timeToSecond(this.Program.endTime) - this.timeToSecond(this.Program.startTime);
        var hourList = [];
        var startHour = Number(this.Program.startTime.slice(0, 2));

        for (let i = 1; i <= Number(this.Program.endTime.slice(0, 2)) - startHour; i++) {
            if (this.timeToSecond(startHour + i - 1 + ":30:00") > this.timeToSecond(this.Program.startTime)) {
                hourList.push({
                    hour: startHour + i - 1 + ":30:00",
                    posPercent: (Number(this.timeToSecond(startHour + i - 1 + ":30:00")) - this.timeToSecond(this.Program.startTime)) / totalTime,
                    type: "small"
                });
            }
            hourList.push({
                hour: startHour + i + ":00",
                posPercent: (Number(this.timeToSecond(startHour + i + ":00:00")) - this.timeToSecond(this.Program.startTime)) / totalTime,
                type: "big"
            });

            //最后一个
            if (i + 1 > Number(this.Program.endTime.slice(0, 2)) - startHour && this.timeToSecond(startHour + i + ":30:00") < this.timeToSecond(this.Program.endTime)) {
                hourList.push({
                    hour: startHour + i + ":30:00",
                    posPercent: (Number(this.timeToSecond(startHour + i + ":30:00")) - this.timeToSecond(this.Program.startTime)) / totalTime,
                    type: "small"
                });
            }
        }


        this.hourList = hourList;
    }

    secondToTime(totalSeconds, hasStartTime = false) {
        if (hasStartTime) {//距离Program.startTime的时间
            totalSeconds += this.timeToSecond(this.Program.startTime);
        }
        var hour = ("0" + String(totalSeconds / 3600 >> 0)).substr(-2);
        var minute = ("0" + String(totalSeconds % 3600 / 60 >> 0)).substr(-2);
        var second = ("0" + String(totalSeconds % 3600 % 60 >> 0)).substr(-2);
        return `${hour}:${minute}:${second}`;
    }

    timeToSecond(time, hasStartTime = false) {//用于将formatSchduleTime转回scheduleTime
        var hour = time.split(":")[0];
        var minute = time.split(":")[1];
        var second = time.split(":")[2];
        if (hasStartTime) {//和Program.startTime做差后的秒数
            return Number(hour) * 3600 + Number(minute) * 60 + Number(second) - this.timeToSecond(this.Program.startTime);
        } else {//绝对秒数
            return Number(hour) * 3600 + Number(minute) * 60 + Number(second)
        }
    }

    save(): void {
        console.log(this.Program);
        if (this.Program.ads.every(item => item.type == -1)) {
            return this.message.warn(this.l("atleast1AdOrAppTimespan"));
        }
        var schedulingContent = _.cloneDeep(this.Program);
        this.content.weekdayList = this.weekList.filter(item => {
            return item.result
        }).map(item => {
            return item.value
        })

        console.log("content.monthDay",this.content.monthDay)
        this.content.monthDay && (this.content.monthDay = String(this.content.monthDay).split(','))
        //时间轴开始结束日期
        if (this.content.model != "0") {
            this.content.startTime = void 0;
            this.content.endTime = void 0;
        } else {
            if (this.content.startTime) {
                try {
                    this.content.startTime = moment(this.content.startTime.format("YYYY/MM/DD")).startOf('day')
                } catch (e) { }
            }
            if (this.content.endTime) {
                try {
                    this.content.endTime = moment(this.content.endTime.format("YYYY/MM/DD")).startOf('day')
                } catch (e) { }
            }
        }

        schedulingContent.content = JSON.stringify(this.content);

        for (var i = 0; i < this.Program.ads.length; i++) {
            var children = [];
            if (this.Program.ads[i].id != -1) {
                children.push(new AdOrAppItem({
                    id: this.Program.ads[i].id,
                    duration: this.Program.ads[i].scheduleEndTime - this.Program.ads[i].scheduleStartTime,
                    transition: void 0,
                    startPointName: void 0,
                    stopPointName: void 0,
                }))
            } else {
                this.Program.ads[i].children.forEach(item => {
                    children.push(new AdOrAppItem({
                        id: item.id,
                        duration: item.totalTimeSpanNum,
                        transition: item.transition,
                        startPointName: item.startPointName,
                        stopPointName: item.stopPointName,
                    }))
                })
            }

            schedulingContent.ads[i] = new ProgramItem({
                scheduleStartTime: this.Program.ads[i].scheduleStartTime,
                scheduleEndTime: this.Program.ads[i].scheduleEndTime,
                idleAble: true,
                packageName: this.Program.ads[i].id == -1 ? this.Program.ads[i].name : "",
                children,
                type: this.Program.ads[i].type,
                unstoppable: this.Program.ads[i].unstoppable
            });
        }
        //将广告组和软件加入(即不为EmptyTimeSlot的)
        schedulingContent.ads = schedulingContent.ads.filter(item => item.type != -1);

        console.log(schedulingContent);
        this.saving = true;
        if (this.isFromCalender) {
            this._AdServiceProxy.updateScheduleCalendar(new SchedulingContentInput({
                id: this.calenderId,
                schedulingContent: new SchedulingContent(schedulingContent)
            }))
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(() => {
                    this.modalSave.emit(null);
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                });
        } else {
            this._AdServiceProxy.addOrUpdateScheDulingContent(new SchedulingContent(schedulingContent))
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(() => {
                    this.modalSave.emit(null);
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                });
        }

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
        ];
        this.isFromCalender = false;
        this.nowHoveredIndex = -1;
        this.targetIndex = void 0;
        this.originIndex = void 0;
        this.modal.hide();
    }

    deleteThing(listOrIndex) {
        if (listOrIndex instanceof Array) {
            for (var i = 0; i < listOrIndex.length; i++) {
                this.Program.ads.splice(listOrIndex, 1);
            }
        } else {
            this.Program.ads.splice(listOrIndex, 1);
        }
        this.refreshAdList();
    }

    addThing(type) {
        this.Program.ads.push({
            scheduleStartTime: this.Program.ads.length ? this.Program.ads[this.Program.ads.length - 1].scheduleEndTime : 0,
            scheduleEndTime: this.Program.ads.length ? this.Program.ads[this.Program.ads.length - 1].scheduleEndTime : 0,
            formatScheduleEndTime: this.Program.ads.length ? this.Program.ads[this.Program.ads.length - 1].formatScheduleEndTime : this.Program.startTime
        });
        if (type == 'ad') {
            this.setAd(this.Program.ads.length - 1);
        } else if (type == 'software') {
            this.setSoftware(this.Program.ads.length - 1);
        } else if (type == 'none') {
            this.setNone(this.Program.ads.length - 1);
        }
    }

    showContextmenu(event, i) {
        event.preventDefault();
        //如果没有已选中的 则当前的加入已选中
        //如果存在已选中的 且不包括当前目标 则当前的加入已选中
        if (this.contextmenuConfig.nowSelectedIndexList.length == 0 || this.contextmenuConfig.nowSelectedIndexList.indexOf(i) == -1) {
            this.contextmenuConfig.nowSelectedIndexList.push(i);
        }
        //如果仅有一个已选中的 且选中的即为当前目标 则没有变化
        //如果有多个已选中的 且已包括当前目标 则没有变化
        this.contextmenuConfig.show = true;


        //如果选中了多个,且type相同,且都是不是group,且全是连号,则允许合并,否则不允许
        if (this.contextmenuConfig.nowSelectedIndexList.length > 1 && this.contextmenuConfig.nowSelectedIndexList.sort((a, b) => a - b).every((item, i) => {
            if (this.Program.ads[item].id == -1) return false;
            if (this.Program.ads[item + 1] && this.Program.ads[item].type != this.Program.ads[item + 1].type) return false;
            if (i == this.contextmenuConfig.nowSelectedIndexList.length - 1 || this.contextmenuConfig.nowSelectedIndexList[i + 1] - item == 1) {
                return true
            } else {
                return false
            }
        })) {
            this.contextmenuConfig.permitCombine = true;
        } else {
            this.contextmenuConfig.permitCombine = false;
        }


        //如果只选中一个,且选中的为group,且当前能被整除，则允许拆分,否则不允许
        if (this.contextmenuConfig.nowSelectedIndexList.length == 1 && this.Program.ads[this.contextmenuConfig.nowSelectedIndexList[0]].id == -1 && (this.Program.ads[this.contextmenuConfig.nowSelectedIndexList[0]].scheduleEndTime - this.Program.ads[this.contextmenuConfig.nowSelectedIndexList[0]].scheduleStartTime) % this.Program.ads[this.contextmenuConfig.nowSelectedIndexList[0]].timeSpanNum == 0) {
            this.contextmenuConfig.permitSplit = true;
        } else {
            this.contextmenuConfig.permitSplit = false;
        }


        this.contextmenuConfig.left = event.pageX || (event.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft));
        this.contextmenuConfig.top = event.pageY || (event.clientY + (document.documentElement.scrollTop || document.body.scrollTop));
        console.log(this.contextmenuConfig);
    }

    selectItem(event, i, canCancel?) {
        event.stopPropagation();
        this.contextmenuConfig.show = false;
        var index = this.contextmenuConfig.nowSelectedIndexList.indexOf(i);
        if (index == -1) {
            this.contextmenuConfig.nowSelectedIndexList.push(i);
        } else if (canCancel) {
            this.contextmenuConfig.nowSelectedIndexList.splice(index, 1);
        }
    }

    myFormatScheduleStartTimeChange(e, target, inList?, targetIndex?) {
        var initValue = target.formatScheduleStartTime;
        var reset = (msg?) => {
            if (msg) {
                this.message.warn(this.l(msg));
            }
            target.formatScheduleStartTime = "";
            setTimeout(() => {
                target.formatScheduleStartTime = initValue;
            })
        }
        //校验格式
        var hour = e.target.value.split(":")[0];
        var minute = e.target.value.split(":")[1];
        var second = e.target.value.split(":")[2];

        if (this.checkTimeFormat(hour, minute, second, e)) {
            if (this.timeToSecond(e.target.value, true) >= target.scheduleEndTime) {
                reset("开始时间必须小于自身结束时间");
            } else if (this.timeToSecond(e.target.value) < this.timeToSecond(this.Program.startTime)) {
                reset("请勿超出时间轴开始时间");
            } else {
                let callback = () => {
                    target.scheduleStartTime = this.timeToSecond(e.target.value, true);
                    this.refreshAdList();
                }

                if (inList) {
                    if (this.timeToSecond(e.target.value, true) > target.scheduleStartTime) {//开始延后 需要新增空白时间段
                        this.Program.ads.splice(targetIndex, 0, {
                            id: 0,
                            name: this.l("EmptyTimeSlot"),
                            type: -1,
                            scheduleStartTime: target.scheduleStartTime,
                            scheduleEndTime: this.timeToSecond(e.target.value, true)
                        })
                        callback();
                    } else {//开始提前 需要占用前者时间
                        if (this.timeToSecond(e.target.value, true) > this.Program.ads[targetIndex - 1].scheduleStartTime) {
                            this.Program.ads[targetIndex - 1].scheduleEndTime = this.timeToSecond(e.target.value, true);
                            callback();
                        }
                        else {
                            var lastName = this.Program.ads[targetIndex - 1].name;
                            var coverCount = this.Program.ads.filter((item, i) => i < targetIndex && item.scheduleStartTime >= this.timeToSecond(e.target.value, true)).length;
                            this.message.confirm(`该操作将会覆盖${lastName}${coverCount > 1 ? '等共' + coverCount + '个节目' : ''}`, this.l('AreYouSure'), (r) => {
                                if (r) {
                                    this.Program.ads.splice(targetIndex - coverCount, coverCount);
                                    if (this.Program.ads[targetIndex - coverCount - 1]) {
                                        this.Program.ads[targetIndex - coverCount - 1].scheduleEndTime = this.timeToSecond(e.target.value, true);
                                    }
                                    callback();
                                }
                                else {
                                    reset();
                                }
                            })
                        }
                    }
                } else {
                    callback();
                }
            }
        } else {
            reset("时间格式不符合要求");
        }
    }

    myFormatScheduleEndTimeChange(e, target, inList?, targetIndex?) {
        var reset = (msg?) => {
            if (msg) {
                this.message.warn(this.l(msg));
            }
            target.formatScheduleEndTime = "";
            setTimeout(() => {
                target.formatScheduleEndTime = this.secondToTime(target.scheduleStartTime + this.timeToSecond(target.formatTotalTimeSpan), true);
            })
        }
        //校验格式
        var hour = e.target.value.split(":")[0];
        var minute = e.target.value.split(":")[1];
        var second = e.target.value.split(":")[2];

        if (this.checkTimeFormat(hour, minute, second, e)) {
            if (this.timeToSecond(e.target.value, true) <= target.scheduleStartTime) {
                reset("结束时间必须大于自身开始时间");
            } else if (this.timeToSecond(e.target.value) > this.timeToSecond(this.Program.endTime)) {
                reset("请勿超出时间轴结束时间");
            } else {
                let callback = () => {
                    target.scheduleEndTime = this.timeToSecond(e.target.value, true);
                    this.refreshAdList();
                }
                if (inList && targetIndex != this.Program.ads.length - 1) {
                    if (this.timeToSecond(e.target.value, true) < target.scheduleEndTime) {//结束提前 需要新增空白时间段
                        this.Program.ads.splice(targetIndex + 1, 0, {
                            id: 0,
                            name: this.l("EmptyTimeSlot"),
                            type: -1,
                            scheduleStartTime: this.timeToSecond(e.target.value, true),
                            scheduleEndTime: target.scheduleEndTime
                        })
                        callback();
                    }
                    else {//结束延后 需要占用后者时间
                        if (this.timeToSecond(e.target.value, true) < this.Program.ads[targetIndex + 1].scheduleEndTime) {
                            this.Program.ads[targetIndex + 1].scheduleStartTime = this.timeToSecond(e.target.value, true);
                            callback();
                        }
                        else {
                            var nextName = this.Program.ads[targetIndex + 1].name;
                            var coverCount = this.Program.ads.filter((item, i) => i > targetIndex && item.scheduleEndTime <= this.timeToSecond(e.target.value, true)).length;
                            this.message.confirm(`该操作将会覆盖${nextName}${coverCount > 1 ? '等共' + coverCount + '个节目' : ''}`, this.l('AreYouSure'), (r) => {
                                if (r) {
                                    this.Program.ads.splice(targetIndex + 1, coverCount);
                                    if (this.Program.ads[targetIndex + 1]) {
                                        this.Program.ads[targetIndex + 1].scheduleStartTime = this.timeToSecond(e.target.value, true);
                                    }
                                    callback();
                                }
                                else {
                                    reset();
                                }
                            })
                        }
                    }
                } else {
                    callback();
                }
            }
        } else {
            reset("时间格式不符合要求");
        }
    }
    checkTimeFormat(hour, minute, second, e) {
        if (hour + ":" + minute + ":" + second == e.target.value
            && Number(hour) < 24 && Number(minute) < 60 && Number(second) < 60
            && hour.length == 2 && minute.length == 2 && second.length == 2
            && hour[0] == Number(hour[0]) && hour[1] == Number(hour[1]) && minute[0] == Number(minute[0])
            && minute[1] == Number(minute[1]) && second[0] == Number(second[0]) && second[1] == Number(second[1])) {
            return true
        } else {
            return false
        }
    }


    startTimeChange(e) {
        var initValue = this.Program.startTime;
        var reset = (msg) => {
            this.message.warn(this.l(msg));
            this.Program.startTime = "";
            setTimeout(() => {
                this.Program.startTime = initValue;
            })
        }
        //校验格式
        var hour = e.target.value.split(":")[0];
        var minute = e.target.value.split(":")[1];
        var second = e.target.value.split(":")[2];

        if (this.checkTimeFormat(hour, minute, second, e)) {
            if (this.timeToSecond(e.target.value) >= this.timeToSecond(this.Program.endTime)) {
                reset("开始时间必须小于结束时间");
            } else {
                this.Program.startTime = e.target.value;
                this.generateHourList();
                this.refreshAdList();
            }
        } else {
            reset("时间格式不符合要求");
        }
    }
    endTimeChange(e) {
        var initValue = this.Program.endTime;
        var reset = (msg) => {
            this.message.warn(this.l(msg));
            this.Program.endTime = "";
            setTimeout(() => {
                this.Program.endTime = initValue;
            })
        }
        //校验格式
        var hour = e.target.value.split(":")[0];
        var minute = e.target.value.split(":")[1];
        var second = e.target.value.split(":")[2];

        if (this.checkTimeFormat(hour, minute, second, e)) {
            if (this.timeToSecond(e.target.value) <= this.timeToSecond(this.Program.startTime)) {
                reset("结束时间必须大于开始时间");
            }
            //  else if (this.Program.ads.some(ad => ad.ScheduleEndTime > this.timeToSecond(e.target.value))) {
            //     reset("时间轴结束时间不能小于广告结束时间");
            // }
            else {
                this.Program.endTime = e.target.value;
                this.generateHourList();
                this.refreshAdList();
            }
        } else {
            reset("时间格式不符合要求");
        }
    }


    reduceEndTime(item) {
        if (item.scheduleEndTime - item.scheduleStartTime <= item.timeSpanNum) return
        item.scheduleEndTime -= item.timeSpanNum;
        this.refreshAdList();
    }
    addEndTime(item) {
        item.scheduleEndTime += item.timeSpanNum;
        this.refreshAdList();
    }


    // mergeAsAdsGroup() {
    //     var arrToCombine = [];
    //     this.contextmenuConfig.nowSelectedIndexList.sort((a, b) => b - a);
    //     var groupInsertIndex = this.contextmenuConfig.nowSelectedIndexList[this.contextmenuConfig.nowSelectedIndexList.length - 1];
    //     this.contextmenuConfig.nowSelectedIndexList.forEach(index => {
    //         arrToCombine.push(...this.Program.ads.splice(index, 1));
    //     })
    //     arrToCombine.sort((a, b) => a.scheduleStartTime - b.scheduleStartTime);
    //     console.log(arrToCombine);
    //     var group = {
    //         children: [],
    //         id: -1,
    //         invalid: false,
    //         name: "",
    //         scheduleStartTime: arrToCombine[0].scheduleStartTime,
    //         scheduleEndTime: arrToCombine[arrToCombine.length - 1].scheduleEndTime,
    //         timeSpan: this.secondToTime(arrToCombine[arrToCombine.length - 1].scheduleEndTime - arrToCombine[0].scheduleStartTime),
    //         timeSpanNum: arrToCombine[arrToCombine.length - 1].scheduleEndTime - arrToCombine[0].scheduleStartTime,
    //         type: arrToCombine[0].type
    //     }
    //     arrToCombine.forEach(item => {
    //         group.name += item.name + ' ';
    //         group.children.push({
    //             id: item.id,
    //             name: item.name,
    //             timeSpan: item.timeSpan,
    //             timeSpanNum: item.timeSpanNum,
    //             totalTimeSpanNum: item.scheduleEndTime - item.scheduleStartTime
    //         });
    //     })
    //     console.log(group);
    //     this.Program.ads.splice(groupInsertIndex, 0, group);
    //     console.log(this.Program.ads);
    //     this.refreshAdList();
    // }

    // splitAdsGroup() {
    //     var groupIndex = this.contextmenuConfig.nowSelectedIndexList[0];
    //     var group2Split = this.Program.ads.splice(groupIndex, 1)[0];
    //     var newList = [];
    //     for (var i = 0; i < (group2Split.scheduleEndTime - group2Split.scheduleStartTime) / group2Split.timeSpanNum * group2Split.children.length; i++) {
    //         var item = group2Split.children[i % group2Split.children.length];
    //         var newItem = {
    //             type: group2Split.type,
    //             timeSpan: item.timeSpan,
    //             timeSpanNum: item.timeSpanNum,
    //             name: item.name,
    //             id: item.id,
    //             formatTotalTimeSpan: this.secondToTime(item.totalTimeSpanNum),
    //             invalid: false,

    //             formatScheduleEndTime: "",
    //             scheduleEndTime: 0,
    //             scheduleStartTime: 0
    //         }
    //         if (i == 0) {
    //             newItem.scheduleStartTime = group2Split.scheduleStartTime;
    //         } else {
    //             newItem.scheduleStartTime = newList[i - 1].scheduleEndTime;
    //         }
    //         newItem.scheduleEndTime = newItem.scheduleStartTime + newItem.timeSpanNum;
    //         newItem.formatScheduleEndTime = this.secondToTime(newItem.scheduleEndTime, true);
    //         newList.push(newItem);
    //     }
    //     console.log(newList);
    //     this.Program.ads.splice(groupIndex, 0, ...newList);
    //     this.refreshAdList();
    // }


    // mousewheelTimeline(event) {//通过鼠标滚轮移动时间轴
    //     event.preventDefault();
    //     if (event.deltaY < 0) {//向上
    //         document.getElementById("overflowContainer").scrollBy(-$('#timelineContainer').width() / 10, 0);
    //     } else {
    //         document.getElementById("overflowContainer").scrollBy($('#timelineContainer').width() / 10, 0);
    //     }
    // }

    // getRealTimelineWidth() {
    //     return (this.Program.ads[this.Program.ads.length - 1].scheduleEndTime) / (this.timeToSecond(this.Program.endTime) - this.timeToSecond(this.Program.startTime)) * 100 + "%";
    // }

}
