import { AbpHttpInterceptor, RefreshTokenService, AbpHttpConfigurationService } from 'abp-ng2-module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import * as ApiServiceProxies from './service-proxies';
import { ZeroRefreshTokenService } from '@account/auth/zero-refresh-token.service';
import { ZeroTemplateHttpConfigurationService } from './zero-template-http-configuration.service';


import * as BigDataApiServiceProxies from './service-proxies3';
import * as OnlineApiServiceProxies from './service-proxies2';
import * as MetaApiServiceProxies from './service-proxies4';
import * as ActivityServiceProxies from './service-proxies5';
import * as CargoServiceProxies from './service-proxies-cargo';//e
import * as SYNCServiceProxies from './service-proxies-sync';
// import * as PagerServiceProxies from './service-proxies-pager';
import * as UserServiceProxies from './service-proxies-user';
import * as FloorServiceProxies from './service-proxies-floor';//floor
import * as OKRServiceProxies from './service-proxies-okr';//okr


import * as DEVICECENTERServiceProxies from './service-proxies-devicecenter';//device center
import * as SMARTDEVICEServiceProxies from './service-proxies-smartdevice';//对应原e站点(cargo)
import * as AdsServiceProxies from './service-proxies-ads';//ads
import * as ProductServiceProxies from './service-proxies-product';// product

@NgModule({
    providers: [
        ApiServiceProxies.AuditLogServiceProxy,
        ApiServiceProxies.CachingServiceProxy,
        ApiServiceProxies.ChatServiceProxy,
        ApiServiceProxies.CommonLookupServiceProxy,
        ApiServiceProxies.EditionServiceProxy,
        ApiServiceProxies.FriendshipServiceProxy,
        ApiServiceProxies.HostSettingsServiceProxy,
        ApiServiceProxies.InstallServiceProxy,
        ApiServiceProxies.LanguageServiceProxy,
        ApiServiceProxies.NotificationServiceProxy,
        ApiServiceProxies.OrganizationUnitServiceProxy,
        ApiServiceProxies.PermissionServiceProxy,
        ApiServiceProxies.ProfileServiceProxy,
        ApiServiceProxies.RoleServiceProxy,
        ApiServiceProxies.SessionServiceProxy,
        ApiServiceProxies.TenantServiceProxy,
        ApiServiceProxies.TenantDashboardServiceProxy,
        ApiServiceProxies.TenantSettingsServiceProxy,
        ApiServiceProxies.TimingServiceProxy,
        ApiServiceProxies.UserServiceProxy,
        ApiServiceProxies.UserLinkServiceProxy,
        ApiServiceProxies.UserLoginServiceProxy,
        ApiServiceProxies.WebLogServiceProxy,
        ApiServiceProxies.AccountServiceProxy,
        ApiServiceProxies.TokenAuthServiceProxy,
        ApiServiceProxies.TenantRegistrationServiceProxy,
        ApiServiceProxies.HostDashboardServiceProxy,
        ApiServiceProxies.PaymentServiceProxy,
        ApiServiceProxies.DemoUiComponentsServiceProxy,
        ApiServiceProxies.InvoiceServiceProxy,
        ApiServiceProxies.SubscriptionServiceProxy,
        ApiServiceProxies.InstallServiceProxy,
        ApiServiceProxies.UiCustomizationSettingsServiceProxy,
        ApiServiceProxies.PayPalPaymentServiceProxy,
        ApiServiceProxies.StripePaymentServiceProxy,
        ApiServiceProxies.DashboardCustomizationServiceProxy,
        ApiServiceProxies.WebhookEventServiceProxy,
        ApiServiceProxies.WebhookSubscriptionServiceProxy,
        ApiServiceProxies.WebhookSendAttemptServiceProxy,
        ApiServiceProxies.UserDelegationServiceProxy,
        ApiServiceProxies.DynamicPropertyServiceProxy,
        ApiServiceProxies.DynamicEntityPropertyDefinitionServiceProxy,
        ApiServiceProxies.DynamicEntityPropertyServiceProxy,
        ApiServiceProxies.DynamicPropertyValueServiceProxy,
        ApiServiceProxies.DynamicEntityPropertyValueServiceProxy,
        ApiServiceProxies.TwitterServiceProxy,

        //V3
        OnlineApiServiceProxies.OrderServiceProxy,
        OnlineApiServiceProxies.CommonServiceProxy,
        OnlineApiServiceProxies.ReportServiceProxy,
        OnlineApiServiceProxies.MemberServiceProxy,
        OnlineApiServiceProxies.SensingShopManageServiceProxy,
        OnlineApiServiceProxies.PayCenterServiceProxy,
        OnlineApiServiceProxies.TicketServiceProxy,
        OnlineApiServiceProxies.SensingShopServiceProxy,
        OnlineApiServiceProxies.SensingShopManageServiceProxy,
        OnlineApiServiceProxies.SensingTicketServiceProxy,


        BigDataApiServiceProxies.SensingDeviceServiceProxy,
        BigDataApiServiceProxies.DeviceBehaviorServiceProxy,
        BigDataApiServiceProxies.DeviceOperationsServiceProxy,
        BigDataApiServiceProxies.OperationKnowledgeServiceProxy,
        BigDataApiServiceProxies.ReportServiceProxy,



        MetaApiServiceProxies.DateMetaPhysicsServiceProxy,
        MetaApiServiceProxies.MetaPhysicsServiceProxy,
        MetaApiServiceProxies.FaceTagsServiceProxy,


        CargoServiceProxies.CargoRoadServiceProxy,
        CargoServiceProxies.ImportServiceProxy,
        CargoServiceProxies.SensingDeviceServiceProxy,
        CargoServiceProxies.AppPodServiceProxy,
        CargoServiceProxies.DeviceAppPodVersionServiceProxy,
        CargoServiceProxies.CounterAnalysisServiceProxy,
        CargoServiceProxies.FileServiceProxy,
        CargoServiceProxies.ReportServiceProxy,
        CargoServiceProxies.ShelfServiceProxy,



        ActivityServiceProxies.ActivityServiceProxy,
        ActivityServiceProxies.QuestionServiceProxy,
        ActivityServiceProxies.PaperServiceProxy,
        ActivityServiceProxies.DeviceActivityServiceProxy,
        ActivityServiceProxies.WeixinMpServiceProxy,
        ActivityServiceProxies.HtmlTemplateServiceProxy,
        ActivityServiceProxies.CommonServiceProxy,
        ActivityServiceProxies.AwardServiceProxy,
        ActivityServiceProxies.SpecialUserServiceProxy,
        ActivityServiceProxies.UserActionServiceProxy,
        ActivityServiceProxies.WeixinOpenPlatformServiceProxy,
        ActivityServiceProxies.ReportServiceProxy,
        ActivityServiceProxies.StoreActivityServiceProxy,
        ActivityServiceProxies.WechatManageServiceProxy,
        ActivityServiceProxies.UserPaperServiceProxy,
        ActivityServiceProxies.WeixinOAuth2ServiceProxy,
        ActivityServiceProxies.TrainingServiceProxy,
        ActivityServiceProxies.ImportTrainingsServiceProxy,
        ActivityServiceProxies.CourseServiceProxy,
        ActivityServiceProxies.ImportQuestionsServiceProxy,

        SYNCServiceProxies.PlanServiceProxy,
        SYNCServiceProxies.BatchTaskLogServiceProxy,
        SYNCServiceProxies.WeimobServiceProxy,
        SYNCServiceProxies.TaobaoServiceProxy,
        SYNCServiceProxies.MonecityServiceProxy,

        CargoServiceProxies.CargoRoadServiceProxy,
        CargoServiceProxies.ImportServiceProxy,
        CargoServiceProxies.SensingDeviceServiceProxy,
        CargoServiceProxies.AppPodServiceProxy,
        CargoServiceProxies.DeviceAppPodVersionServiceProxy,
        CargoServiceProxies.CounterAnalysisServiceProxy,
        CargoServiceProxies.FileServiceProxy,
        CargoServiceProxies.ReportServiceProxy,

        // PagerServiceProxies.ToolBoxServiceProxy,


        UserServiceProxies.ApplicationServiceProxy,
        UserServiceProxies.AppointmentServiceProxy,
        UserServiceProxies.IdentityServiceProxy,
        UserServiceProxies.PageExtraServiceProxy,
        UserServiceProxies.UserDataServiceProxy,


        FloorServiceProxies.FloorServiceProxy,
        FloorServiceProxies.BuildingServiceProxy,
        FloorServiceProxies.IdentityServiceProxy,
        FloorServiceProxies.RoomServiceProxy,
        FloorServiceProxies.RobotServiceProxy,

        OKRServiceProxies.OKRServiceProxy,

        ApiServiceProxies.LoginServiceProxy,
        ApiServiceProxies.TagServiceProxy,
        ApiServiceProxies.FileServiceProxy,
        ApiServiceProxies.ResourceFileServiceProxy,
        ApiServiceProxies.OrganizationUnitTypeServiceProxy,
        ApiServiceProxies.OnlineStoreProfileServiceProxy,
        ApiServiceProxies.BatchTaskLogServiceProxy,
        // ApiServiceProxies.ThirdParyServiceProxy,
        // ApiServiceProxies.TaobaoServiceProxy,
        ApiServiceProxies.TaobaoOpenPlatformServiceProxy,
        ApiServiceProxies.ExternalAccessServiceProxy,
        ApiServiceProxies.ProductServiceProxy,
        ApiServiceProxies.CouponServiceProxy,
        ApiServiceProxies.ApplyServiceProxy,
        ApiServiceProxies.DeviceServiceProxy,
        ApiServiceProxies.DeviceTypeServiceProxy,
        ApiServiceProxies.SoftwareServiceProxy,
        ApiServiceProxies.AdServiceProxy,
        ApiServiceProxies.AdsPackageServiceProxy,
        ApiServiceProxies.ReportServiceProxy,
        ApiServiceProxies.MatchInfoServiceProxy,
        ApiServiceProxies.LikeInfoServiceProxy,
        ApiServiceProxies.BrandServiceProxy,
        ApiServiceProxies.ProductCategoryServiceProxy,
        ApiServiceProxies.PropertyServiceProxy,
        ApiServiceProxies.DeviceCategoryServiceProxy,
        ApiServiceProxies.PeripheralServiceProxy,
        ApiServiceProxies.DeviceActionServiceProxy,
        ApiServiceProxies.GroupKPIServiceProxy,
        ApiServiceProxies.StoreServiceProxy,
        ApiServiceProxies.PropertyValueServiceProxy,
        ApiServiceProxies.StoreAdsServiceProxy,
        ApiServiceProxies.StoreCouponsServiceProxy,
        ApiServiceProxies.StoreProductServiceProxy,
        ApiServiceProxies.StoreSoftwareServiceProxy,
        ApiServiceProxies.StoreKPIServiceProxy,
        ApiServiceProxies.ShopServiceProxy,
        ApiServiceProxies.SensingShopServiceProxy,
        ApiServiceProxies.BackendDownloadTaskServiceProxy,
        ApiServiceProxies.OutPutInStorageServiceProxy,
        ApiServiceProxies.ImportSkuRfidsServiceProxy,
        ApiServiceProxies.PromotionServiceProxy,
        ApiServiceProxies.DeviceHeatmapDataServiceProxy,
        ApiServiceProxies.ImportStorageCheckServiceProxy,
        ApiServiceProxies.OssServerServiceProxy,
        ApiServiceProxies.SensingDeviceServiceProxy,
        ApiServiceProxies.AppVersionServiceProxy,
        ApiServiceProxies.SkuRfidServiceProxy,
        ApiServiceProxies.IndependentDeploymentServiceProxy,
        ApiServiceProxies.ImportFloorGuideRoomAndStoreServiceProxy,



        //2021 新版本 device center ads Product
        DEVICECENTERServiceProxies.StoreServiceProxy,
        DEVICECENTERServiceProxies.OrganizationUnitServiceProxy,
        DEVICECENTERServiceProxies.DeviceServiceProxy,
        DEVICECENTERServiceProxies.DeviceCategoryServiceProxy,
        DEVICECENTERServiceProxies.SensingDeviceServiceProxy,
        DEVICECENTERServiceProxies.TagServiceProxy,
        DEVICECENTERServiceProxies.BrandServiceProxy,
        DEVICECENTERServiceProxies.ApplyServiceProxy,
        DEVICECENTERServiceProxies.IdentityServiceProxy,
        DEVICECENTERServiceProxies.AppPodServiceProxy,

        SMARTDEVICEServiceProxies.AppPodServiceProxy,
        SMARTDEVICEServiceProxies.SensingDeviceServiceProxy,
        SMARTDEVICEServiceProxies.ShelfDeviceServiceProxy,
        SMARTDEVICEServiceProxies.CounterDeviceServiceProxy,
        SMARTDEVICEServiceProxies.CounterReportServiceProxy,
        SMARTDEVICEServiceProxies.CustomizeReportServiceProxy,
        SMARTDEVICEServiceProxies.ImportCargoRoadsServiceProxy,
        SMARTDEVICEServiceProxies.SensorAgreementServiceProxy,
        // SMARTDEVICEServiceProxies.TagServiceProxy,


        
        AdsServiceProxies.AdServiceProxy,
        AdsServiceProxies.AdsPackageServiceProxy,
        AdsServiceProxies.SoftwareServiceProxy,
        AdsServiceProxies.DeviceAdsServiceProxy,
        AdsServiceProxies.DeviceSoftwareServiceProxy,
        AdsServiceProxies.ApplyServiceProxy,
        AdsServiceProxies.StoreAdsServiceProxy,
        AdsServiceProxies.StoreSoftwareServiceProxy,
        AdsServiceProxies.TagServiceProxy,
        AdsServiceProxies.UXPageServiceProxy,
        AdsServiceProxies.ToolBoxServiceProxy,


        ProductServiceProxies.DeviceServiceProxy,
        ProductServiceProxies.StoreServiceProxy,
        ProductServiceProxies.ProductCategoryServiceProxy,
        ProductServiceProxies.OutPutInStorageServiceProxy,
        ProductServiceProxies.CouponServiceProxy,
        ProductServiceProxies.ProductServiceProxy,
        ProductServiceProxies.ApplyServiceProxy,
        ProductServiceProxies.LikeInfoServiceProxy,
        ProductServiceProxies.LikeInfoExcelImporterServiceProxy,
        ProductServiceProxies.MatchInfoServiceProxy,
        ProductServiceProxies.ReportServiceProxy,
        ProductServiceProxies.TagServiceProxy,
        ProductServiceProxies.BackendDownloadTaskServiceProxy,
        ProductServiceProxies.SensingDeviceServiceProxy,
        ProductServiceProxies.SensingSkuRfidServiceProxy,
        ProductServiceProxies.SkuRfidServiceProxy,
        ProductServiceProxies.PriceTagServiceProxy,


        { provide: RefreshTokenService, useClass: ZeroRefreshTokenService },
        { provide: AbpHttpConfigurationService, useClass: ZeroTemplateHttpConfigurationService },
        { provide: HTTP_INTERCEPTORS, useClass: AbpHttpInterceptor, multi: true }
    ]
})
export class ServiceProxyModule { }
