import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityServiceProxy, UpdateBasicActivityInput, WeixinMpServiceProxy, ActivityFromTemplateInput } from '@shared/service-proxies/service-proxies5';
import { ExternalAccessServiceProxy } from '@shared/service-proxies/service-proxies';
import { DateRangePickerComponent } from '@app/shared/common/timing/date-range-picker.component';


@Component({
    selector: 'activity-basic',
    templateUrl: './activity-basic.component.html',
    styleUrls: ['./activity-basic.component.css']
})


export class ActivityBasicComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild("Dateranger1",{static:true}) Dateranger1: DateRangePickerComponent;
    @ViewChild("Dateranger2",{static:true}) Dateranger2: DateRangePickerComponent;

    saving = false;
    Activity: any = {};
    activityId;
    busy = true;
    showPicker = false;
    //下拉
    wxList: any[] = [];
    tbList: any[] = [];
    deviceId;
    activityName;
    constructor(
        injector: Injector,
        private router: Router,
        private _activatedRoute: ActivatedRoute,
        private _acitvityService: ActivityServiceProxy,
        private _weixinMpService: WeixinMpServiceProxy,
        private _externalaccessService: ExternalAccessServiceProxy,
    ) {
        super(injector);
        this._activatedRoute.queryParams.subscribe(queryParams => {
            this.activityId = queryParams.id;
            this.deviceId = queryParams.deviceId;
            this.activityName = queryParams.name;

        })

    }

    ngAfterViewChecked(): void {
        
    }

    //返回
    goBack() {
        if (this.deviceId) {
            this.router.navigate(['app', 'admin','device', 'deviceList', 'operation', this.deviceId], { queryParams: { initTab: 'activity' } });
        } else {
            // this.router.navigate(['app', 'admin','activity', 'activity']);
            window.history.back();
        }
    }
    changeSetup(e) {
        if (e == 'game' && this.deviceId) {
            this.router.navigate(['app', 'admin','device', 'deviceList', 'game'], { queryParams: { id: this.activityId, deviceId: this.deviceId,name:this.activityName } });
        } else if (this.deviceId) {
            this.router.navigate(['app', 'admin','activity', 'activity', e], { queryParams: { id: this.activityId, deviceId: this.deviceId,name:this.activityName } });
        } else {
            this.router.navigate(['app', 'admin','activity', 'activity', e], { queryParams: { id: this.activityId,name:this.activityName } });
        }
    }


    ngOnInit(): void {
        this._acitvityService.getActivityById(this.activityId).subscribe((r) => {
            this.Activity = r;
            this.busy = false;
            this.showPicker = true;
            console.log(r)
        })

        this._weixinMpService.getWeixinMps(
            void 0,
            void 0,
            999,
            0
        ).subscribe(result => {
            console.log(result);
            this.wxList = result.items;
        })
        this._externalaccessService.getAll(
            void 0,
            void 0,
            999,
            0
        ).subscribe(result => {
            console.log(result);
            this.tbList = result.items;
        });
    }

    saveAsTemplate() {
        var activityTemplate = new ActivityFromTemplateInput({
            id: this.activityId,
            name: this.Activity.name + ' (模板)',
            isPublic: true,
            isTemplate: true
        })
        console.log(activityTemplate)
        this._acitvityService.createActivityFromTemplate(activityTemplate)
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe(result => {
                this.notify.info(this.l('SavedSuccessfully'));
            })

    }
    save(): void {
        this.saving = true;
        this.Activity.id = this.activityId;
        if (this.Activity.activityExcutedDate) {
            this.Activity.activityExcutedDate = this.Activity.activityExcutedDate.add(-(new Date().getTimezoneOffset() / 60), 'h');
        }
        if (this.Activity.openDate) {
            this.Activity.openDate = this.Activity.openDate.add(-(new Date().getTimezoneOffset() / 60), 'h');
        }
        if (this.Activity.endDate) {
            this.Activity.endDate = this.Activity.endDate.add(-(new Date().getTimezoneOffset() / 60), 'h');
        }

        
        if (this.Activity.weChatAppID) {
            this.wxList.map(item=>{
                if(item.weixinAppID==this.Activity.weChatAppID){
                    this.Activity.weixinPublicAccountInfoId = item.id;
                }
            })
        }
        if(this.Activity.taobaoSellerID){
            this.tbList.map(item=>{
                if(item.taobao_user_id==this.Activity.taobaoSellerID){
                    this.Activity.externalAccessTokenInfoId = item.id;
                }
            })
        }
        console.log(this.Activity)
        this._acitvityService.updateActivity(new UpdateBasicActivityInput(this.Activity)).
            pipe(finalize(() => { this.saving = false; }))
            .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
            });

    }

    imageOnUpload(result): void {
        this.Activity.imagePath = result.fileUri;
    }
    logoOnUpload(result): void {
        this.Activity.activityLogoPath = result.fileUri;
    }
}
