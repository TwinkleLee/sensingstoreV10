import { Component, OnInit, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Table } from 'primeng/components/table/table';
import { Paginator } from 'primeng/components/paginator/paginator';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { CreateOrEditCouponModalComponent } from '@app/redpacket/red-packet/create-or-edit-coupon-modal.component';
import { AppConsts } from '@shared/AppConsts';
import { ActivatedRoute, Router } from '@angular/router';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import { ActivityServiceProxy, HtmlTemplateServiceProxy, ActivityFlowSettingsInput, ActivityShareSettingsInput, TemplateEnum, FlowType, ActivityFlowSettingsInputFlowType } from '@shared/service-proxies/service-proxies5';

@Component({
    selector: 'activity-advanced',
    templateUrl: './activity-advanced.component.html',
    styleUrls: ['./activity-advanced.component.css'],
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class ActivityAdvancedComponent extends AppComponentBase {

    @ViewChild('createOrEditCouponModal',{static:true}) createOrEditCouponModal: CreateOrEditCouponModalComponent;
    @ViewChild('prizeDataTable',{static:true}) dataTable: Table;
    @ViewChild('prizePaginator',{static:true}) paginator: Paginator;
    PrizePrimeng: PrimengTableHelper = new PrimengTableHelper();

    filterText: string = "";
    publishType = 'add';
    couponPublishList = [];
    Personality: any = {};
    activityId;
    Flow0: any = {};
    Flow1: any = {};
    Flow2: any = {};
    Flow3: any = {};
    Flow4: any = {};
    Share: any = {};

    list0;
    list1;
    list2;
    list3;
    list4;

    BusyList = [false, false, false, false, false, false]

    saving = false;
    activityName;
    deviceId;
    constructor(injector: Injector,
        private router: Router,
        private _HtmlTemplateServiceProxy: HtmlTemplateServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _acitvityService: ActivityServiceProxy) {
        super(injector);
        this._activatedRoute.queryParams.subscribe(queryParams => {
            this.activityId = queryParams.id;
            this.activityName = queryParams.name;
            this.deviceId = queryParams.deviceId;

        })
        this.getActivityFlow(0);
    }


    stopPropagation(event) {
        event.stopPropagation();
    }


    getActivityFlow(i) {
        this.BusyList[i] = true;
        var flowArr = ['ActivityIntroduction', 'Register', 'GameOnLine', 'GameResult', 'Award']
        this._HtmlTemplateServiceProxy.getHtmlTemplates(TemplateEnum[flowArr[i]], undefined, undefined, 99, 0).subscribe(r1 => {
            var List = 'list' + i;
            var Flow = 'Flow' + i;
            this[List] = r1.items;
            var flowArr2 = ['Introduction', 'Register', 'Sign', 'GameResult', 'Reward']
            this._acitvityService.getActivityFlow(this.activityId, FlowType[flowArr2[i]]).subscribe(r2 => {
                this.BusyList[i] = false;
                console.log(r2, 'get')
                this[Flow] = r2;
            })
        })

    }
    getActivityShare() {
        this.BusyList[5] = true;
        this._acitvityService.getActivityShareSettings(this.activityId).subscribe(r => {
            console.log(r)
            this.BusyList[5] = false;
            this.Share = r;
        })
    }

    ngAfterViewChecked(): void {

    }

    save(i?: any) {
        this.saving = true;
        if (i == 0 || i) {
            var Flow = 'Flow' + i;
            console.log(this[Flow])
            if (this[Flow].isUseOutside) {
                this[Flow].htmlTemplateId = undefined
            } else {
                this[Flow].outsideLink = undefined
            }
            this[Flow].activityId = this.activityId;
            var flowArr3 = ['Introduction', 'Register', 'Sign', 'GameResult', 'Reward']
            this[Flow].flowType = ActivityFlowSettingsInputFlowType[flowArr3[i]];
            this._acitvityService.activityFlowSettings(new ActivityFlowSettingsInput(this[Flow])).subscribe(r => {
                console.log(r, 'update')
                this.saving = false;
                this.notify.info(this.l('SavedSuccessfully'));
            })
        } else {
            this.Share.activityId = this.activityId;
            this._acitvityService.activityShareSettings(new ActivityShareSettingsInput(this.Share)).subscribe(r => {
                console.log(r, 'update')
                this.saving = false;
                this.notify.info(this.l('SavedSuccessfully'));
            })
        }

    }

    //返回
    goBack() {
        if (this.deviceId) {
            this.router.navigate(['app', 'device', 'deviceList', 'operation', this.deviceId], { queryParams: { initTab: 'activity' } });
        } else {
            this.router.navigate(['app', 'activity', 'activity']);
        }
    }

    changeSetup(e) {
        if (e == 'game' && this.deviceId) {
            this.router.navigate(['app', 'device', 'deviceList', 'game'], { queryParams: { id: this.activityId, deviceId: this.deviceId,name:this.activityName } });
        } else if (this.deviceId) {
            this.router.navigate(['app', 'activity', 'activity', e], { queryParams: { id: this.activityId, deviceId: this.deviceId,name:this.activityName } });
        } else {
            this.router.navigate(['app', 'activity', 'activity', e], { queryParams: { id: this.activityId,name:this.activityName } });
        }
    }

    imageOnUpload(result): void {
        this.Share.imageLink = result.fileUri;
    }


    //转换图片路径
    transfileUrl(fileUrl) {
        var url;
        if (!fileUrl) {
            url = './assets/common/images/holderimg.png';
        } else if (fileUrl.indexOf('http:') > -1 || fileUrl.indexOf('https:') > -1 || fileUrl.indexOf('data:') > -1) {
            url = fileUrl;
        } else {
            url = AppConsts.remoteServiceBaseUrl + '\\' + fileUrl;
        }
        return url;
    }


}


