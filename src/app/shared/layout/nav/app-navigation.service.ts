import { PermissionCheckerService } from 'abp-ng2-module';
import { AppSessionService } from '@shared/common/session/app-session.service';

import { Injectable } from '@angular/core';
import { AppMenu } from './app-menu';
import { AppMenuItem } from './app-menu-item';

@Injectable()
export class AppNavigationService {

    constructor(
        private _permissionCheckerService: PermissionCheckerService,
        private _appSessionService: AppSessionService
    ) {

    }

    getMenu(): AppMenu {
        return new AppMenu('MainMenu', 'MainMenu', [
            // new AppMenuItem('Dashboard', 'Pages.Administration.Host.Dashboard', 'flaticon-line-graph', '/app/admin/hostDashboard'),
            // new AppMenuItem('Dashboard', 'Pages.Tenant.Dashboard', 'flaticon-line-graph', '/app/main/dashboard'),
            // new AppMenuItem('Tenants', 'Pages.Tenants', 'flaticon-list-3', '/app/admin/tenants'),
            // new AppMenuItem('Editions', 'Pages.Editions', 'flaticon-app', '/app/admin/editions'),
            // new AppMenuItem('Administration', '', 'flaticon-interface-8', '', [], [
            //     new AppMenuItem('OrganizationUnits', 'Pages.Administration.OrganizationUnits', 'flaticon-map', '/app/admin/organization-units'),
            //     new AppMenuItem('Roles', 'Pages.Administration.Roles', 'flaticon-suitcase', '/app/admin/roles'),
            //     new AppMenuItem('Users', 'Pages.Administration.Users', 'flaticon-users', '/app/admin/users'),
            //     new AppMenuItem('Languages', 'Pages.Administration.Languages', 'flaticon-tabs', '/app/admin/languages', ['/app/admin/languages/{name}/texts']),
            //     new AppMenuItem('AuditLogs', 'Pages.Administration.AuditLogs', 'flaticon-folder-1', '/app/admin/auditLogs'),
            //     new AppMenuItem('Maintenance', 'Pages.Administration.Host.Maintenance', 'flaticon-lock', '/app/admin/maintenance'),
            //     new AppMenuItem('Subscription', 'Pages.Administration.Tenant.SubscriptionManagement', 'flaticon-refresh', '/app/admin/subscription-management'),
            //     new AppMenuItem('VisualSettings', 'Pages.Administration.UiCustomization', 'flaticon-medical', '/app/admin/ui-customization'),
            //     new AppMenuItem('WebhookSubscriptions', 'Pages.Administration.WebhookSubscription', 'flaticon2-world', '/app/admin/webhook-subscriptions'),
            //     new AppMenuItem('DynamicProperties', 'Pages.Administration.DynamicProperties', 'flaticon-interface-8', '/app/admin/dynamic-property'),
            //     new AppMenuItem('Settings', 'Pages.Administration.Host.Settings', 'flaticon-settings', '/app/admin/hostSettings'),
            //     new AppMenuItem('Settings', 'Pages.Administration.Tenant.Settings', 'flaticon-settings', '/app/admin/tenantSettings')
            // ]),
            // new AppMenuItem('DemoUiComponents', 'Pages.DemoUiComponents', 'flaticon-shapes', '/app/admin/demo-ui-components'),

            new AppMenuItem('Dashboard', 'Pages.Administration.Host.Dashboard', 'icon-dashboard', '', [], [
                new AppMenuItem('Dashboard', 'Pages.Administration.Host.Dashboard', 'icon-dashboard', '/app/admin/hostDashboard'),
                new AppMenuItem('DashboardManage', 'Pages.Administration.Host.Dashboard', 'flaticon-line-graph', '/app/main/dashboardManage'),
            ]),
            new AppMenuItem('Dashboard', 'Pages.Tenant.Dashboard', 'icon-dashboard', '', [], [
                new AppMenuItem('Dash-board', 'Pages.Tenant.Dashboard.Dashboard', 'icon-baobiao', '/app/main/dashboard'),
                // new AppMenuItem('Dash-board2', 'Pages.Tenant.Dashboard.Dashboard', 'icon-baobiao', '/app/main/dashboard2'),
                new AppMenuItem('SalesInfo', 'Pages.Tenant.Dashboard.SalesInformation', 'icon-xiaoshoue', '/app/main/salesinfo'),
                new AppMenuItem('SalesChart', 'Pages.Tenant.Dashboard.SalesChart', 'icon-artboard13', '/app/main/saleschart'),
                new AppMenuItem('productRank', 'Pages.Tenant.Dashboard.ProductRank', 'icon-shangpinliebiao', '/app/main/product-rank'),
                new AppMenuItem('StoreInfo', 'Pages.Tenant.Dashboard.StoreInformation', 'icon-yuyan', '/app/main/storeinfo'),
                new AppMenuItem('PassengerDashboard', 'Pages.Tenant.Dashboard.MyDashboard', 'flaticon-line-graph', '/app/main/myDashboard'),
                new AppMenuItem('行为报表', 'Pages.Tenant.Dashboard.HaierDashboard', 'icon-tuijian1', '/app/main/haierDashboard'),
                new AppMenuItem('ItemDetail', 'Pages.Tenant.Dashboard.ItemSaleDashboard', 'icon-tuijian1', '/app/main/itemSaleDashboard'),
            ]),
            new AppMenuItem('Editions', 'Pages.Editions', 'flaticon-app', '/app/admin/editions'),

            new AppMenuItem('Device', '', 'icon-devices', '', [], [
                new AppMenuItem('DeviceTable', 'Pages.Tenant.Devices', 'icon-devices', '/app/admin/device/deviceList'),
                new AppMenuItem('DeviceType', 'Pages.DeviceTypes', 'icon-renlianshibie', '/app/admin/device/deviceType'),
                new AppMenuItem('Peripherals', 'Pages.Peripherals', 'icon-shexiangtou', '/app/admin/device/peripheral'),
                new AppMenuItem('DeviceReview', 'Pages.Tenant.Devices.Audit', 'icon-shenhe1', '/app/admin/device/deviceReview'),
            ]),


            //店铺管理
            new AppMenuItem('ElectronicCommerce', 'Pages.Tenant.StoreMenu', 'icon-shop', '', [], [
                new AppMenuItem('EntityStore', 'Pages.Tenant.Stores', 'icon-shop', '/app/admin/entityStore/entityStore'),
                new AppMenuItem('OnlineStore', 'Pages.Tenant.OnlineStores', 'icon-iconfontshangcheng', '/app/admin/onlineStore/onlineStore'),
            ]),

            new AppMenuItem('Order', 'Pages.Tenant.Order', 'icon-dingdan1', '/app/admin/order/order'),

            // 会员
            new AppMenuItem('Membership', 'Pages.Tenant.Member', 'icon-huiyuanguanli', '', [], [
                new AppMenuItem('Membership', 'Pages.Tenant.Member', 'icon-huiyuanguanli', '/app/admin/memberShip/memberShip'),
                new AppMenuItem('feedback', 'Pages.Tenant.PageStatistics', 'icon-nav-entry', '/app/admin/user/feedback'),
                new AppMenuItem('UserAppointment', 'Pages.Tenant.PageStatistics', 'icon-nav-entry', '/app/admin/user/appointment'),
            ]),

            //host建立商城
            new AppMenuItem('WeShop', 'Pages.Administration.Host.MaintainRecord', 'icon-iconfontshangcheng', '/app/admin/weshop/hostOnlineStore'),

            //广告管理
            new AppMenuItem('Advertisement', 'Pages.Tenant.Ads', 'icon-guanggao1', '', [], [
                new AppMenuItem('AdvertisementList', 'Pages.Tenant.Ads', 'icon-guanggao1', '/app/admin/advertisement/adsList'),
                new AppMenuItem('AdvertisementReview', 'Pages.Tenant.Ads.Audit', 'icon-shenhe1', '/app/admin/advertisement/adsReview'),
                new AppMenuItem('AdsPackage', 'Pages.Tenant.Ads.AdsPackage', 'icon-yingyong', '/app/admin/advertisement/adsPackage'),
            ]),

            //自定义营销页模块设置
            new AppMenuItem('CustomComponent', 'Pages.Administration.Host.Settings', 'icon-ziyuanguanli', '/app/admin/customComponent/customComponent'),


            //应用管理
            new AppMenuItem('Software', 'Pages.Softwares', 'icon-app', '', [], [
                new AppMenuItem('App', 'Pages.Softwares', 'icon-app', '/app/admin/software/software'),
                new AppMenuItem('AppPod', 'Pages.Administration.Host.AppPod', 'icon-yemian', '/app/admin/apppod/apppod'),
            ]),

            //节目(AdPackage & App)排程
            new AppMenuItem('Scheduling', 'Pages.Tenant.Scheduling', 'icon-paiban', '', [], [
                new AppMenuItem('24HTimeline', 'Pages.Tenant.Scheduling', 'icon-shijuan', '/app/admin/advertisement/24htimeline'),
                new AppMenuItem('DateScheduling', 'Pages.Tenant.Scheduling', 'icon-paiban', '/app/admin/advertisement/schedule'),
            ]),

            //Floor
            new AppMenuItem('Floor', 'Pages.Tenant.FloorGuide', 'icon-loufang', '', [], [
                new AppMenuItem('Building', 'Pages.Tenant.FloorGuide', 'icon-shop', '/app/admin/floor/building'),
                new AppMenuItem('Floor', 'Pages.Tenant.FloorGuide', 'icon-louceng', '/app/admin/floor/floor'),
                new AppMenuItem('Room', 'Pages.Tenant.FloorGuide', 'icon-fangjianshu', '/app/admin/floor/room'),
            ]),

            // 品牌
            new AppMenuItem('Brand', 'Pages.Tenant.Products', 'icon-brand', '', [], [
                new AppMenuItem('BrandCenter', 'Pages.Tenant.Products', 'icon-brand', '/app/admin/brandcenter'),
                new AppMenuItem('BrandCategory', 'Pages.Tenant.Products', 'icon-brand', '/app/admin/category/brandCate'),
            ]),

            //商品管理
            new AppMenuItem('Product', 'Pages.Tenant.Products', 'icon-product', '', [], [
                new AppMenuItem('ProductList', 'Pages.Tenant.Products', 'icon-product', '/app/admin/product/product'),
                new AppMenuItem('ProductInfo', 'Pages.Tenant.Products', 'icon-1311shangpinfenleipicishuxing', '/app/admin/product/prodInfo'),
                new AppMenuItem('ProductCategory', 'Pages.Tenant.Products', 'icon-shangpinguanli', '/app/admin/category/category'),
                new AppMenuItem('ProductReview', 'Pages.Tenant.Products.Audit', 'icon-shenhe1', '/app/admin/product/reviewProduct'),
                new AppMenuItem('Likes', 'Pages.Tenant.Products.Like', 'icon-xin', '/app/admin/product/like'),
                new AppMenuItem('Match', 'Pages.Tenant.Products.Match', 'icon-dapei', '/app/admin/product/match'),
                new AppMenuItem('QuantityManage', 'Pages.Tenant.Products', 'icon-xunhuan', '/app/admin/product/outputin'),
                new AppMenuItem('QuantityList', 'Pages.Tenant.Products', 'icon-tuijian', '/app/admin/product/skuList'),
                new AppMenuItem('PromotionManage', 'Pages.Tenant.Products', 'icon-qian', '/app/admin/product/promotionManage'),
            ]),



            //推荐
            new AppMenuItem('Recommend', 'Pages.Tenant.Recommends', 'icon-tuijian1', '', [], [
                new AppMenuItem('PersonalRecommend', 'Pages.Tenant.Recommends', 'icon-tuijian', '/app/admin/recommend/recommend'),
                new AppMenuItem('PersonalCategory', 'Pages.Tenant.Recommends', 'icon-fenlei1', '/app/admin/recommend/personalCategory'),
                new AppMenuItem('FaceRecommend', 'Pages.Tenant.Recommends', 'icon-renlianshibie', '/app/admin/recommend/faceRecommend')
            ]),


            //问卷
            new AppMenuItem('AnswerQuestion', 'Pages.Tenant.Question', 'icon-nav-entry', '', [], [
                new AppMenuItem('QuestionManage', 'Pages.Tenant.Question', 'icon-shitiku', '/app/admin/question/question'),
                new AppMenuItem('NaireManage', 'Pages.Tenant.Question', 'icon-shijuan', '/app/admin/question/naire'),
            ]),

            //红包管理
            new AppMenuItem('Coupon', 'Pages.Tenant.Coupons', 'icon-hongbao', '', [], [
                new AppMenuItem('RedPacket', 'Pages.Tenant.Coupons', 'icon-hongbao', '/app/admin/redpacket/coupon'),
                new AppMenuItem('CouponReview', 'Pages.Tenant.Coupons.Audit', 'icon-shenhe1', '/app/admin/redpacket/reviewCoupon'),
                new AppMenuItem('Ticket', 'Pages.Tenant.Coupons', 'icon-biaoqian', '/app/admin/redpacket/ticket'),
            ]),

            //活动管理
            new AppMenuItem('Activities', 'Pages.Tenant.Activities', 'icon-huodong', '', [], [
                new AppMenuItem('ActivityList', 'Pages.Tenant.Activities', 'icon-huodongliebiao', '/app/admin/activity/activity'),
                new AppMenuItem('ActivityData', 'Pages.Tenant.Activities', 'icon-huodongshuju1', '/app/admin/activity/activities/playerdata'),
                new AppMenuItem('PageTemplate', 'Pages.Tenant.Activities', 'icon-moban', '/app/admin/activity/activities/pagetemplate')
            ]),

            //Traning
            new AppMenuItem('Training', 'Pages.Tenant.Training', 'icon-peixun', '', [], [
                new AppMenuItem('Course', 'Pages.Tenant.Training', 'icon-kecheng', '/app/admin/training/course'),
                new AppMenuItem('TrainingList', 'Pages.Tenant.Training', 'icon-peixunjihua', '/app/admin/training/training'),
                new AppMenuItem('MyTraining', 'Pages.Tenant.Training', 'icon-peixunguanli', '/app/admin/training/my-training'),
                // new AppMenuItem('TrainingAudit', 'Pages.Tenant.Training.Audit', 'icon-renlianshibie', '/app/training/training-audit')
            ]),

            //平台管理
            new AppMenuItem('PlatformManage', 'Pages.Administration.Host.Platform', 'icon-leixing1', '/app/admin/platformManage/platformManage'),

            // OKR管理
            // new AppMenuItem('OKRManage', '', 'icon-leixing1', '/app/admin/objective/objective'),

            //支付中心
            new AppMenuItem('PayCenter', 'Pages.Tenant.PayCenter', 'icon-qian', '', [], [
                new AppMenuItem('PayCenter', 'Pages.Tenant.PayCenter', 'icon-qian', '/app/admin/paycenter/payCenter'),
                new AppMenuItem('PayRecord', 'Pages.Tenant.PayCenter', 'icon-artboard13', '/app/admin/paycenter/payRecord'),
            ]),

            //维护信息
            new AppMenuItem('MaintainRecord', 'Pages.Administration.Host.MaintainRecord', 'icon-houtaiweihu', '', [], [
                new AppMenuItem('MaintainRecord', 'Pages.Administration.Host.MaintainRecord', 'icon-houtaiweihu', '/app/admin/maintainInfo/maintainInfo'),
                new AppMenuItem('manageCate', 'Pages.Administration.Host.MaintainRecord', 'icon-fenlei1', '/app/admin/category/maintain/questionType'),
            ]),

            // 页面统计
            new AppMenuItem('PageStatistics', 'Pages.Tenant.PageStatistics', 'icon-shijuan', '/app/admin/user/application'),


            // IndependentDeployment
            new AppMenuItem('Deployment', 'Pages.Administration.Host.MaintainRecord', 'icon-qiu', '/app/admin/deployment/deployment'),

            //系统管理
            new AppMenuItem('System', 'Pages.Administration', 'icon-jichushezhi', '', [], [
                new AppMenuItem('TagManagement', 'Pages.Tenant.Tags', 'icon-biaoqian', '/app/admin/tags/tags'),
                new AppMenuItem('ResourceManagement', 'Pages.Tenant.Resources', 'icon-ziyuanguanli', '/app/admin/resource/resource'),
                new AppMenuItem('PublicAccount', 'Pages.Tenant.PublicAccount', 'icon-gongzhonghao', '/app/admin/publicaccount/publicaccount'),
                new AppMenuItem('Tenants', 'Pages.Tenants', 'icon-kehuguanli', '/app/admin/tenants'),
                new AppMenuItem('OrganizationUnits', 'Pages.Administration.OrganizationUnits', 'icon-zuzhijigou', '/app/admin/organization-units'),
                new AppMenuItem('Roles', 'Pages.Administration.Roles', 'icon-yonghu', '/app/admin/roles'),
                new AppMenuItem('Users', 'Pages.Administration.Users', 'icon-jiaose', '/app/admin/users'),
                new AppMenuItem('Languages', 'Pages.Administration.Languages', 'icon-zhongwenyuyan', '/app/admin/languages'),
                new AppMenuItem('DownloadLogs', 'Pages.Tenant.Dashboard.Dashboard.DeviceOnlineDuration', 'icon-config-audit', '/app/admin/downloadLogs/downloadLogs'),
                new AppMenuItem('Maintenance', 'Pages.Administration.Host.Maintenance', 'icon-houtaiweihu', '/app/admin/maintenance'),
                new AppMenuItem('Subscription', 'Pages.Administration.Tenant.SubscriptionManagement', 'icon-21', '/app/admin/subscription-management'),
                new AppMenuItem('VisualSettings', 'Pages.Administration.UiCustomization', 'icon-xunhuan', '/app/admin/ui-customization'),
                new AppMenuItem('AppVersion', '', 'icon-1311shangpinfenleipicishuxing', '/app/admin/appversion/appVersion'),
                new AppMenuItem('Settings', 'Pages.Administration.Host.Settings', 'icon-xitongguanli', '/app/admin/hostSettings'),
                new AppMenuItem('Settings', 'Pages.Administration.Tenant.Settings', 'icon-xitongguanli', '/app/admin/tenantSettings'),
            ]),



        ]);
    }

    checkChildMenuItemPermission(menuItem): boolean {

        for (let i = 0; i < menuItem.items.length; i++) {
            let subMenuItem = menuItem.items[i];

            if (subMenuItem.permissionName === '' || subMenuItem.permissionName === null) {
                if (subMenuItem.route) {
                    return true;
                }
            } else if (this._permissionCheckerService.isGranted(subMenuItem.permissionName)) {
                return true;
            }

            if (subMenuItem.items && subMenuItem.items.length) {
                let isAnyChildItemActive = this.checkChildMenuItemPermission(subMenuItem);
                if (isAnyChildItemActive) {
                    return true;
                }
            }
        }
        return false;
    }

    showMenuItem(menuItem: AppMenuItem): boolean {
        if (menuItem.permissionName === 'Pages.Administration.Tenant.SubscriptionManagement' && this._appSessionService.tenant && !this._appSessionService.tenant.edition) {
            return false;
        }

        let hideMenuItem = false;

        if (menuItem.requiresAuthentication && !this._appSessionService.user) {
            hideMenuItem = true;
        }

        if (menuItem.permissionName && !this._permissionCheckerService.isGranted(menuItem.permissionName)) {
            hideMenuItem = true;
        }

        if (this._appSessionService.tenant || !abp.multiTenancy.ignoreFeatureCheckForHostUsers) {
            if (menuItem.hasFeatureDependency() && !menuItem.featureDependencySatisfied()) {
                hideMenuItem = true;
            }
        }

        if (!hideMenuItem && menuItem.items && menuItem.items.length) {
            return this.checkChildMenuItemPermission(menuItem);
        }

        return !hideMenuItem;
    }

    /**
     * Returns all menu items recursively
     */
    getAllMenuItems(): AppMenuItem[] {
        let menu = this.getMenu();
        let allMenuItems: AppMenuItem[] = [];
        menu.items.forEach(menuItem => {
            allMenuItems = allMenuItems.concat(this.getAllMenuItemsRecursive(menuItem));
        });

        return allMenuItems;
    }

    private getAllMenuItemsRecursive(menuItem: AppMenuItem): AppMenuItem[] {
        if (!menuItem.items) {
            return [menuItem];
        }

        let menuItems = [menuItem];
        menuItem.items.forEach(subMenu => {
            menuItems = menuItems.concat(this.getAllMenuItemsRecursive(subMenu));
        });

        return menuItems;
    }
}
