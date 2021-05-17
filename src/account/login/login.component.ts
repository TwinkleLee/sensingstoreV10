import { AbpSessionService } from 'abp-ng2-module';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { accountModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { SessionServiceProxy, UpdateUserSignInTokenOutput } from '@shared/service-proxies/service-proxies';
import { UrlHelper } from 'shared/helpers/UrlHelper';
import { ExternalLoginProvider, LoginService } from './login.service';
import { ReCaptchaV3Service } from 'ngx-captcha';
import { AppConsts } from '@shared/AppConsts';


//V3 
import { AccountServiceProxy, IsTenantAvailableInput, IsTenantAvailableOutput } from '@shared/service-proxies/service-proxies';

@Component({
    templateUrl: './login.component.html',
    animations: [accountModuleAnimation()],
    styleUrls: ['./login.component.less']
})
export class LoginComponent extends AppComponentBase implements OnInit {
    submitting = false;
    isMultiTenancyEnabled: boolean = this.multiTenancy.isEnabled;
    recaptchaSiteKey: string = AppConsts.recaptchaSiteKey;

    //troncell
    customTheme = AppConsts.customTheme;

    constructor(
        injector: Injector,
        public loginService: LoginService,
        private _router: Router,
        private _sessionService: AbpSessionService,
        private _sessionAppService: SessionServiceProxy,
        private _reCaptchaV3Service: ReCaptchaV3Service,

        //V3
        private _activatedRoute: ActivatedRoute,
        private _accountService: AccountServiceProxy

    ) {
        super(injector);
    }

    get multiTenancySideIsTeanant(): boolean {
        return this._sessionService.tenantId > 0;
    }

    get isTenantSelfRegistrationAllowed(): boolean {
        return this.setting.getBoolean('App.TenantManagement.AllowSelfRegistration');
    }

    get isSelfRegistrationAllowed(): boolean {
        if (!this._sessionService.tenantId) {
            return false;
        }

        return this.setting.getBoolean('App.UserManagement.AllowSelfRegistration');
    }

    //V3
    unionid = "";

    ngOnInit(): void {
        this.loginService.init();

        //V3
        if (AppConsts.customTheme == 'yayi' && !this.appSession.tenantId) {
            let input = new IsTenantAvailableInput();
            input.tenancyName = "yayi";

            this._accountService.isTenantAvailable(input)
                .subscribe((result: IsTenantAvailableOutput) => {
                    abp.multiTenancy.setTenantIdCookie(result.tenantId);
                    location.reload();
                    return;
                });
        }

        if (this._sessionService.userId > 0 && UrlHelper.getReturnUrl() && UrlHelper.getSingleSignIn()) {
            this._sessionAppService.updateUserSignInToken()
                .subscribe((result: UpdateUserSignInTokenOutput) => {
                    const initialReturnUrl = UrlHelper.getReturnUrl();
                    const returnUrl = initialReturnUrl + (initialReturnUrl.indexOf('?') >= 0 ? '&' : '?') +
                        'accessToken=' + result.signInToken +
                        '&userId=' + result.encodedUserId +
                        '&tenantId=' + result.encodedTenantId;

                    location.href = returnUrl;
                });
        }

        this.handleExternalLoginCallbacks();
    }

    handleExternalLoginCallbacks(): void {
        let state = UrlHelper.getQueryParametersUsingHash().state;
        let queryParameters = UrlHelper.getQueryParameters();

        if (state && state.indexOf('openIdConnect') >= 0) {
            this.loginService.openIdConnectLoginCallback({});
        }

        if (queryParameters.twitter && queryParameters.twitter === '1') {
            let parameters = UrlHelper.getQueryParameters();
            let token = parameters['oauth_token'];
            let verifier = parameters['oauth_verifier'];
            this.loginService.twitterLoginCallback(token, verifier);
        }

        //V3
        this._activatedRoute.queryParams.subscribe(queryParams => {
            var code = queryParams.code;
            var state = queryParams.state;
            if (code) {
                this.showMainSpinner();
                this.submitting = true;
                //V3 todo
                this.loginService.wxAuthenticate(
                    code,
                    state,
                    (unionid) => {
                        // this.message.error('请使用账号密码登录', '未绑定账号');
                        this.unionid = unionid;
                        this.hideMainSpinner();
                        console.log(unionid);
                    },
                    () => {
                        this.submitting = false;
                        this.hideMainSpinner();
                    },
                    null,
                    null
                );
            }
        })
    }

    login(): void {
        let recaptchaCallback = (token: string) => {
            this.showMainSpinner();

            this.submitting = true;
            this.loginService.authenticate(
                () => {
                    this.submitting = false;
                    this.hideMainSpinner();
                },
                null,
                token
            );
        };

        if (this.useCaptcha) {
            this._reCaptchaV3Service.execute(this.recaptchaSiteKey, 'login', (token) => {
                recaptchaCallback(token);
            });
        } else {
            recaptchaCallback(null);
        }
    }

    externalLogin(provider: ExternalLoginProvider) {
        this.loginService.externalAuthenticate(provider);
    }

    get useCaptcha(): boolean {
        return this.setting.getBoolean('App.UserManagement.UseCaptchaOnLogin');
    }


    //V3 todo
    showLoginQrCode() {

        this.message.info(`
        <div class="form-group" id="login_container"></div>
        `, "", { isHtml: true });
        // this.l("ScanBelowQrCodeWithWechat");
        setTimeout(() => {
            new window.WxLogin({
                // self_redirect:true,
                id: "login_container",
                appid: "wx992b1a4b0a7ef35b",
                scope: "snsapi_login",
                redirect_uri: encodeURIComponent(`http://test5.sensingstore.com/account/login`),
                // state: "",
                // style: "",
                // href: "" //为一个css文件的地址，或直接对CSS进行base64加密：格式：href: "data:text/css;base64,base64加密后的字符串"
            });
            $("iframe").prop("sandbox", "allow-scripts allow-top-navigation allow-same-origin")
        })

    }
}
