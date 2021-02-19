import {
    PermissionCheckerService,
    FeatureCheckerService,
    LocalizationService,
    MessageService,
    AbpMultiTenancyService,
    NotifyService,
    SettingService
} from 'abp-ng2-module';
import { Component, Injector } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { AppUrlService } from '@shared/common/nav/app-url.service';
import { AppSessionService } from '@shared/common/session/app-session.service';
import { AppUiCustomizationService } from '@shared/common/ui/app-ui-customization.service';
import { PrimengTableHelper } from 'shared/helpers/PrimengTableHelper';
import { UiCustomizationSettingsDto } from '@shared/service-proxies/service-proxies';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgxSpinnerTextService } from '@app/shared/ngx-spinner-text.service';

//V3
import { finalize } from 'rxjs/operators';

export abstract class AppComponentBase {

    localizationSourceName = AppConsts.localization.defaultLocalizationSourceName;

    localization: LocalizationService;
    permission: PermissionCheckerService;
    feature: FeatureCheckerService;
    notify: NotifyService;
    setting: SettingService;
    message: MessageService;
    multiTenancy: AbpMultiTenancyService;
    appSession: AppSessionService;
    primengTableHelper: PrimengTableHelper;
    ui: AppUiCustomizationService;
    appUrlService: AppUrlService;
    spinnerService: NgxSpinnerService;
    private ngxSpinnerTextService: NgxSpinnerTextService;

    //V3
    myFinalize = finalize;
    EmptyHolder: string = AppConsts.appBaseUrl + "/assets/common/images/holderimg.png";
    LoadingHolder: string = AppConsts.appBaseUrl + "/assets/common/images/timg.gif";
    EmptyTdText: string = '-';
    constructor(injector: Injector) {
        this.localization = injector.get(LocalizationService);
        this.permission = injector.get(PermissionCheckerService);
        this.feature = injector.get(FeatureCheckerService);
        this.notify = injector.get(NotifyService);
        this.setting = injector.get(SettingService);
        this.message = injector.get(MessageService);
        this.multiTenancy = injector.get(AbpMultiTenancyService);
        this.appSession = injector.get(AppSessionService);
        this.ui = injector.get(AppUiCustomizationService);
        this.appUrlService = injector.get(AppUrlService);
        this.primengTableHelper = new PrimengTableHelper();
        this.spinnerService = injector.get(NgxSpinnerService);
        this.ngxSpinnerTextService = injector.get(NgxSpinnerTextService);
    }

    flattenDeep(array) {
        return array.reduce((acc, val) =>
            Array.isArray(val) ?
                acc.concat(this.flattenDeep(val)) :
                acc.concat(val),
            []);
    }

    l(key: string, ...args: any[]): string {
        args.unshift(key);
        args.unshift(this.localizationSourceName);
        return this.ls.apply(this, args);
    }

    ls(sourcename: string, key: string, ...args: any[]): string {
        let localizedText = this.localization.localize(key, sourcename);

        if (!localizedText) {
            localizedText = key;
        }

        if (!args || !args.length) {
            return localizedText;
        }

        args.unshift(localizedText);
        return abp.utils.formatString.apply(this, this.flattenDeep(args));
    }

    isGranted(permissionName: string): boolean {
        return this.permission.isGranted(permissionName);
    }

    isGrantedAny(...permissions: string[]): boolean {
        if (!permissions) {
            return false;
        }

        for (const permission of permissions) {
            if (this.isGranted(permission)) {
                return true;
            }
        }

        return false;
    }

    s(key: string): string {
        return abp.setting.get(key);
    }

    appRootUrl(): string {
        return this.appUrlService.appRootUrl;
    }

    get currentTheme(): UiCustomizationSettingsDto {
        return this.appSession.theme;
    }

    get containerClass(): string {
        if (this.appSession.theme.baseSettings.layout.layoutType === 'fluid') {
            return 'container-fluid';
        }

        return 'container';
    }

    showMainSpinner(text?: string): void {
        this.ngxSpinnerTextService.setText(text);
        this.spinnerService.show();
    }

    hideMainSpinner(text?: string): void {
        this.spinnerService.hide();
    }

    //V3
    clearInput(e) {
        $(e.target).val('');
    }
    fixPic(e) {
        $(e.target).attr('src', this.EmptyHolder);
    }

    fixFileUrl(url) {
        var u;
        if (!url) {
            u = this.EmptyHolder;
        } else if (url.indexOf('http:') > -1 || url.indexOf('https:') > -1 || url.indexOf('data:') > -1) {
            u = url;
        } else {
            u = AppConsts.remoteServiceBaseUrl + '\\' + url;
        }
        return u;
    }
    get avalibleHeight() {
        var body_height = $(".m-grid.m-grid--hor.m-grid--root.m-page").height(),
            head_height = $("#m_header_nav").height() + $('.m-subheader').height();
        return (body_height - head_height) + "px";
    }

    toggleParentTrStyle(event?: Event) {
        $(event.target).closest("tr").toggleClass(".ui-state-highlight");
    }
    juggeChosen(recordList: any[]) {
        $("tr[trid]").removeClass("ui-state-highlight");
        recordList.forEach((record) => {
            let tr = $("tr[trid=" + record.id + "]:visible");
            tr.addClass("ui-state-highlight");
            tr.find("span.ui-clickable").addClass('pi pi-check');
        })
    }


    isJson(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    checkJson(str) {
        if (str && str.indexOf("{") == 0) {
            if (this.isJson(str)) {
                console.log(true);
                return true
            } else {
                this.message.warn(this.l('JsonNotPattern'))
                console.log(false);
                return false
            }
        } else {
            return true
        }
    }
}
