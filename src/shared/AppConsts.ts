export class AppConsts {

    static readonly tenancyNamePlaceHolderInUrl = '{TENANCY_NAME}';

    static remoteServiceBaseUrl: string;
    static remoteServiceBaseUrlFormat: string;
    static appBaseUrl: string;
    static appBaseHref: string; // returns angular's base-href parameter value if used during the publish
    static appBaseUrlFormat: string;
    static recaptchaSiteKey: string;
    static subscriptionExpireNootifyDayCount: number;

    //V3
    static remoteOnlineServiceUrl: string;
    static remoteBigDataServiceUrl: string;
    static remoteMetaServiceUrl: string;
    static remoteActivityServiceUrl: string;
    static remoteCargoServiceUrl: string;
    static remoteSYNCServiceUrl: string;
    static remotePaperServiceUrl: string;
    static remoteUserServiceUrl: string;
    static remoteFloorServiceUrl: string;
    static remoteOKRServiceUrl: string;

    static remoteDeviceCenterUrl: string;
    static remoteSmartDeviceUrl: string;
    static remoteAdserviceUrl: string;
    // V3 for ecovacs
    static deploymentList: any;
    static customTheme: any;


    static localeMappings: any = [];

    static readonly userManagement = {
        defaultAdminUserName: 'admin'
    };

    static readonly localization = {
        defaultLocalizationSourceName: 'SensingStoreCloud'
    };

    static readonly authorization = {
        encrptedAuthTokenName: 'enc_auth_token'
    };

    static readonly grid = {
        defaultPageSize: 10
    };

    static readonly MinimumUpgradePaymentAmount = 1;

    /// <summary>
    /// Gets current version of the application.
    /// It's also shown in the web page.
    /// </summary>
    static readonly WebAppGuiVersion = '10.2.0';
}
