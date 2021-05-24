import { AbpMultiTenancyService } from 'abp-ng2-module';
import { Injectable } from '@angular/core';
import { ApplicationInfoDto, GetCurrentLoginInformationsOutput, SessionServiceProxy, TenantLoginInfoDto, UserLoginInfoDto, UiCustomizationSettingsDto, OrganizationUnitDto } from '@shared/service-proxies/service-proxies';

//V3
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';


@Injectable()
export class AppSessionService {

    private _user: UserLoginInfoDto;
    private _impersonatorUser: UserLoginInfoDto;
    private _tenant: TenantLoginInfoDto;
    private _impersonatorTenant: TenantLoginInfoDto;
    private _application: ApplicationInfoDto;
    private _theme: UiCustomizationSettingsDto;

    //V3
    private _ou: OrganizationUnitDto;
    private _isAdmin: boolean;

    constructor(
        private _sessionService: SessionServiceProxy,
        private _abpMultiTenancyService: AbpMultiTenancyService,

        //V3
        private _tokenService: TokenAuthServiceProxy,
    ) {
    }

    get application(): ApplicationInfoDto {
        return this._application;
    }

    set application(val: ApplicationInfoDto) {
        this._application = val;
    }

    get user(): UserLoginInfoDto {
        return this._user;
    }

    get userId(): number {
        return this.user ? this.user.id : null;
    }

    get tenant(): TenantLoginInfoDto {
        return this._tenant;
    }

    get tenancyName(): string {
        return this._tenant ? this.tenant.tenancyName : '';
    }

    get tenantId(): number {
        return this.tenant ? this.tenant.id : null;
    }

    //V3
    get ou() {
        return this._ou;
    }
    get ouId() {
        return this._ou ? this._ou.id : null;
    }
    get isAdmin() {
        return this._isAdmin;
    }
    set isAdmin(val) {
        this._isAdmin = val;
    }

    getShownLoginName(): string {
        const userName = this._user.userName;
        if (!this._abpMultiTenancyService.isEnabled) {
            return userName;
        }

        return (this._tenant ? this._tenant.tenancyName : '.') + '\\' + userName;
    }

    get theme(): UiCustomizationSettingsDto {
        return this._theme;
    }

    set theme(val: UiCustomizationSettingsDto) {
        this._theme = val;
    }

    //V3
    ouList: any = '';

    init(): Promise<UiCustomizationSettingsDto> {
        return new Promise<UiCustomizationSettingsDto>((resolve, reject) => {
            this._sessionService.getCurrentLoginInformationsWithOrganizationUnits().toPromise().then((result:any) => {
                this._application = result.application;
                this._user = result.user;
                this._tenant = result.tenant;
                this._theme = result.theme;
                this._impersonatorTenant = result.impersonatorTenant;
                this._impersonatorUser = result.impersonatorUser;

                //V3
                this._isAdmin = result.isAdmin;

                if (result.organization && result.organization.organizationUnits && result.organization.organizationUnits.length > 0) {
                    var ouList = result.organization.organizationUnits
                    var record: any = ouList[0]
                    this._tokenService.setOrganizationUnitId(record.value).subscribe((result) => {
                        abp.utils.setCookieValue(
                            'Abp.OrganizationUnitId',
                            String(record.value),
                            new Date(new Date().getTime() + 1 * 86400000), //1 day
                            abp.appPath
                        );
                        
                        this.setCurrentOu(record.name, record.value);
                    })

                    abp.utils.setCookieValue(
                        'Abp.OrganizationUnitIdList',
                        JSON.stringify(ouList),
                        new Date(new Date().getTime() + 1 * 86400000), //1 day
                        abp.appPath
                    );
                    this.ouList = ouList;
                } else {
                    abp.utils.setCookieValue(
                        'Abp.OrganizationUnitId',
                        '',
                        new Date(new Date().getTime() + 1 * 86400000), //1 day
                        abp.appPath
                    );
                    abp.utils.setCookieValue(
                        'Abp.OrganizationUnitIdList',
                        '',
                        new Date(new Date().getTime() + 1 * 86400000), //1 day
                        abp.appPath
                    );
                    this.ouList = '';
                }

                resolve(result.theme);
            }, (err) => {
                reject(err);
            });
        });
    }

    changeTenantIfNeeded(tenantId?: number): boolean {
        if (this.isCurrentTenant(tenantId)) {
            return false;
        }

        abp.multiTenancy.setTenantIdCookie(tenantId);
        location.reload();
        return true;
    }

    private isCurrentTenant(tenantId?: number) {
        let isTenant = tenantId > 0;

        if (!isTenant && !this.tenant) { // this is host
            return true;
        }

        if (!tenantId && this.tenant) {
            return false;
        } else if (tenantId && (!this.tenant || this.tenant.id !== tenantId)) {
            return false;
        }

        return true;
    }

    get impersonatorUser(): UserLoginInfoDto {
        return this._impersonatorUser;
    }
    get impersonatorUserId(): number {
        return this.impersonatorUser ? this.impersonatorUser.id : null;
    }
    get impersonatorTenant(): TenantLoginInfoDto {
        return this._impersonatorTenant;
    }
    get impersonatorTenancyName(): string {
        return this.impersonatorTenant ? this.impersonatorTenant.tenancyName : '';
    }
    get impersonatorTenantId(): number {
        return this.impersonatorTenant ? this.impersonatorTenant.id : null;
    }


    // V3
    /**设置当前ou */
    setCurrentOu(name, id) {
        this._ou = new OrganizationUnitDto();
        this._ou.id = id;
        this._ou.displayName = name;
        console.log(this._ou, 'hellohello')
    }
    /** 重置ou */
    resetOu() {
        this._ou = null;
    }
}
