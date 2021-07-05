# [Sensingstore](http://sensingstore.com/)前端说明文档</center>
* [ASP.Net ZERO官方说明文档链接](https://aspnetzero.com/Documents/Developing-Step-By-Step-Angular#adding-a-new-menu-item)
* [Git仓库地址](https://github.com/wulixu/SensingStore.Site)

## 目录介绍:
1. src/account   登陆注册等界面
2. src/app 登陆后主界面
    1. src/app/admin   业务模块
    2. src/app/main  主要为报表界面
    3. src/app.shared  公用组件或者服务目录
    4. src\app\shared\layout\nav\app-navigation.service.ts 菜单配置
3. src/assets  静态资源存放目录
    1. src/assets/common 图片/字体/组件样式/批量模板等
    2. src/assets/metronic/src/vendors/flaticon [icon引入](http://www.iconfont.cn/) 
    3. src/assets/metronic/dist/html 主题样式的存放
    4. src/assets/appconfig.json     调试模式配置文件
    5. src/assets/appconfig.production.json     生产模式配置文件
4. src/environments cli环境配置
5. src/shared  一些全局的常量/方法/基类等
    1. src/shared/helpers  一些项目需要用到的服务(框架自带)
        tip:其中LocalizedResourcesHelper.ts 用于国际化以及动态加载资源
    2. src/shared/service-proxies 用于存放swagger生成的api服务
    3. src/shared/utils  一些小的指令/过滤器工具
    4. src/shared/AppConsts.ts  整个项目的全局常量声明
    5. src/shared/AppEnums.ts  全局枚举声明
    6. src/shared/animations  配置动画效果的(目前只有配置切换路由动画)
    7. src/shared/common    项目组件基类定义等
6. src/AppPreBootstrap.ts 项目初始化渲染配置
7. src/index.html 引入自定义js和css
8. nswag  swagger配置与生成api的启动脚本



## 引用插件:
##### 框架自身引用插件
* [momentjs(格式化时间对象)](http://momentjs.cn)
* [primeng(表格,下拉等)](https://www.primefaces.org/primeng/#/)
* [swagger(api生成工具)](https://swagger.io/)
* [abp(abp-ng2-module)](https://www.cnblogs.com/farb/p/ABPTheory.html) 包括message弹窗等
* [Metronic](https://keenthemes.com/metronic/preview/angular/default/material/form-controls/formfield) 整体样式
* [ngx-bootstrap](https://valor-software.com/ngx-bootstrap/#/dropdowns) 包括dropdown等 [(中文文档)](https://www.cnblogs.com/farb/p/ABPJavascriptAPI.html) 
* lodash 主要用于深拷贝

##### 额外引用插件
* [amcharts图表插件](https://www.amcharts.com)
* [百度地图](http://lbsyun.baidu.com/cms/jsapi/reference/jsapi_reference.html#a3b0)
* [heatmap.js(热力图)](https://www.patrick-wied.at/static/heatmapjs/)
* [阿里OSS](https://help.aliyun.com/document_detail/131103.html?spm=a2c4g.11186623.6.1373.16076e282u31L1)
* [生成微信公众平台授权登录二维码](https://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js)

##### 框架已弃用但项目中保留的插件
* bootstrap-daterangepicker
* jquery

## 个性化通用组件:
* FileuploadComponent 文件上传组件
* ImageGridComponent 图片列表组件
* MyMapComponent 封装百度地图组件
* MyAddressComponent 地址选择组件
    * 此组件引用到了`src/assets/common/address.json`，由[百度地图-开发资源-百度地图行政区划adcode映射表](http://lbsyun.baidu.com/index.php?title=open/dev-res)下载得到的excel(修改名称为area.xlsx))经过[脚本](:\\TRONCELLNAS\SensingStore\99_其他\troncell\V3文档)处理得到
* MyTreeComponent 多选树组件
* HighTreeComponent 基于MyTreeComponent的加强版多选树组件
* ChartsComponent 图表组件

## 拉取接口
##### 调用api的swagger地址:
* [基础 s](https://s.api.troncell.com/swagger/index.html)
* [订单/会员 o](https://o.api.troncell.com/swagger/index.html)
* [big-data d](https://d.api.troncell.com/swagger/index.html)
* [星座 r](https://r.api.troncell.com/swagger/index.html)
* [活动 g](https://g.api.troncell.com/swagger/index.html)
* [货道 e](https://e.api.troncell.com/swagger/index.html)
* [自定义营销页 p](https://p.api.troncell.com/swagger/v1/swagger.json)
* [同步 sync](https://sync.api.troncell.com/swagger/v1/swagger.json)
##### 调用方式
1. 进入nswag目录 `cd nswag`
2. 调用指令拉取目标站点的service，如拉取s站点: `refresh s`
3. 等待拉取完毕，恢复配置文件名 `refresh s r`
* 注意，部分站点因接口命名问题会出现同名service，应按照以下方式删去重名service
    * s CouponServiceProxy=>删第二个 ProductServiceProxy=>删第一个
    * o MemberServiceProxy=>删第二个 OrderServiceProxy=>删第二个


## 打包与发布:
* 测试站点位于139.196.240.230的D/troncell7.1下，在该目录下git pull并npm start即可通过139.196.240.230:4200访问

##### 发布步骤：
1. `npm run product` 编译打包
    * 在package.json中配置`--source-map=false`以加快打包速度
2. 使用FileZilla连接`139.224.15.28`并将dist下内容全上传进入`/mnt/mount/nginx/html`(注意保留`9677316755.txt`文件，`assets`目录通常不需要重新上传)


* [ssh工具](https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html)
* [ftp工具](https://filezilla-project.org/download.php?type=client">https://filezilla-project.org/download.php?type=client)
* [文档地址](https://github.com/wulixu/SensingStoreCloud/wiki/How-to-deploy-sensingstore-website%3F)

#### 新增环境：
angular.json中配置build 以及 configurations 例如eco
```js
build > configurations下
"eco": {
    // 若是打包指令请使用 注释内容
    // "optimization": true,
    // "outputHashing": "all",
    // "sourceMap": false,
    // "extractCss": true,
    // "namedChunks": false,
    // "aot": true,
    // "extractLicenses": true,
    // "vendorChunk": false,
    // "buildOptimizer": true,
    "fileReplacements": [
    {
        "replace": "src/environments/environment.ts",
        "with": "src/environments/environment.eco.ts" // src/environments新建environment.eco.ts
    }
    ]
}

serve下
"eco": {
    "browserTarget": "abp-zero-template:build:eco"
}

packege > scripts下新增运行指令
"eco": "gulp buildDev && ng serve --host 0.0.0.0 --port 4200 --configuration=eco",// npm run eco
打包指令
"eco": "ng build --prod --aot --build-optimizer --source-map=false --configuration=eco",
```

#### 请求添加header：
* `node_modules` 中搜索 `AbpHttpInterceptor` 改造方式类似 tenantId
* 类同 `addTenantIdHeader` 


### 常用demo
##### 1.超级输入搜索框
(商品的语言/区域 组织机构详情里的KPI类型)
```
<div class="col-6">
  <label>{{l('CheckType')}}</label>
  <div class="form-group ">
    <div class="input-group">
        <select #TypeCombobox class="form-control typeSelect" [(ngModel)]="metaType.name"
        name="TypeSelectInput" [attr.data-live-search]="true" jq-plugin="selectpicker" (change)="typeChange()">
          <option value="">{{l('All')}}</option>
          <option [value]="item" *ngFor="let item of typeList">{{item}}</option>
        </select>
    </div>
  </div>
</div>

@ViewChild('TypeCombobox') typeComboboxElement: ElementRef;
//获取下拉list
this._GroupKPIServiceProxy.getKpiNames(this.metaType.organizationUnitId).subscribe(r => {
    this.typeList = r;
    //刷新
    setTimeout(() => {
        $(this.typeComboboxElement.nativeElement).selectpicker('refresh');
    })
    //不断获取搜索框中值,并更新到界面上的input
    this.interval = setInterval(() => {
        if ($('.typeSelect .bs-searchbox input').val()) {
            this.metaType.name = $('.typeSelect .bs-searchbox input').val();
            $('.typeSelect>button>span.filter-option').html(this.metaType.name)
        }
    }, 500)
})

//下拉选中后,也更新进搜索框中
typeChange(){
    $('.typeSelect .bs-searchbox input').val(this.metaType.name);
}

//close或destroy时结束计时器
if (this.interval) {
    clearInterval(this.interval);
}
</pre>

```


##### 2.列表和编辑页(可参考pay-center模块)
```
<div class="row">
    <form class="horizontal-form" autocomplete="off">
        <div class="m-form m-form--label-align-right">
            <div class="row align-items-center m--margin-bottom-10">
                <div class="col-4">
                    <div class="form-group m-form__group align-items-center">
                        <div class="input-group">
                            <input [(ngModel)]="demoFilter" name="demoFilter" autoFocus class="form-control m-input"
                                [placeholder]="l('SearchWithThreeDot')" type="text">
                        </div>
                    </div>
                </div>
                <div class="col-1">
                    <div class="form-group m-form__group align-items-center">
                        <div class="input-group">
                            <button type="button" class="btn btn-primary" [buttonBusy]="demoPrimeng.isLoading"
                                (click)="getDemos()">
                                <i class="la la-refresh"></i>
                                {{l("search")}}
                            </button>
                        </div>
                    </div>
                </div>
                <div class="col-7 text-right">
                    <button type="button" (click)="deleteDemoList()" class="btn btn-primary blue">
                        <i class="icon-piliangcaozuo"></i> {{l("deleteBatch")}}</button>
                    <button type="button" (click)="createDemo()" class="btn btn-primary blue">
                        <i class="fa fa-plus"></i>{{l("add")}}{{l("Demo")}}</button>
                </div>
            </div>
        </div>
    </form>
</div>

<div class="row align-items-center">
    <div class="primeng-datatable-container" [busyIf]="demoPrimeng.isLoading">
        <p-table #demoTable (onLazyLoad)="getDemos($event)" [value]="demoPrimeng.records" rows="{{demoPrimeng.defaultRecordsCountPerPage}}"
            [paginator]="false" [lazy]="false" [(selection)]="demoCheckedList"
            [resizableColumns]="demoPrimeng.resizableColumns" responsive="demoPrimeng.isResponsive">
            <ng-template pTemplate="header">
                <tr>
                    <th>{{l('Actions')}}</th>
                    <th style="width: 5.0em">
                        <p-tableHeaderCheckbox></p-tableHeaderCheckbox>
                    </th>
                    <th style="width:5%">{{l('RecordId')}}</th>
                    <th>
                        {{l('name')}}
                    </th>
                    <th>
                        {{l('Picture')}}
                    </th>
                    <th>{{l('type')}}</th>
                    <th>
                        {{l('URL')}}
                    </th>
                </tr>
            </ng-template>
            <ng-template pTemplate="body" let-record let-i="rowIndex">
                <tr [pSelectableRow]="record" [attr.trid]="record.id">
                    <td>
                        <div class="btn-group dropdown" dropdown normalizePosition>
                            <button class="dropdown-toggle btn btn-sm btn-primary" data-toggle="dropdown"
                                dropdownToggle aria-haspopup="true" aria-expanded="false">
                                <i class="fa fa-cog"></i>
                                <span class="caret"></span> {{l("Actions")}}
                            </button>
                            <ul class="dropdown-menu" *dropdownMenu>
                                <li>
                                    <a class="icon-bianji" (click)="editDemo(record)">{{l('Edit')}}</a>
                                </li>
                                <li>
                                    <a class="icon-icon-test" (click)="deleteDemo(record)">{{l('Delete')}}</a>
                                </li>
                            </ul>
                        </div>
                    </td>
                    <th style="width: 5.0em">
                        <p-tableHeaderCheckbox></p-tableHeaderCheckbox>
                    </th>
                    <td> {{transIndex(i,demoPaginator,demoPrimeng)}}</td>
                    <td>
                        <span>{{record.demoName}}</span>
                    </td>
                    <td>
                        <img [src]="fixFileUrl(record.pictureUrl)" />
                    </td>
                    <td>
                        <span *ngIf="record.shopDemo==0">{{l("left")}}</span>
                        <span *ngIf="record.shopDemo==1">{{l("top")}}</span>
                        <span *ngIf="record.shopDemo==2">{{l("bottom")}}</span>
                    </td>
                    <td>
                        <span>{{record.turnUrl}}</span>
                    </td>
                </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage" let-records>
                <tr *ngIf="demoPrimeng.records">
                    <td colspan="5">
                        <img class="emptymessage" src="/assets/common/images/placeholder/productinfoHolder.png" />
                    </td>
                </tr>
            </ng-template>
        </p-table>
        <div class="primeng-paging-container">
            <p-paginator rows="{{demoPrimeng.defaultRecordsCountPerPage}}" #demoPaginator
                (onPageChange)="getDemos($event)" [totalRecords]="demoPrimeng.totalRecordsCount"
                [rowsPerPageOptions]="demoPrimeng.predefinedRecordsCountPerPage">
            </p-paginator>
            <span class="total-records-count">
                {{l('TotalRecordsCount', demoPrimeng.totalRecordsCount)}}
            </span>
        </div>
    </div>
    <!--<Primeng-Datatable-End>-->
</div>
```

##### 3.自定义message弹窗
(参考brand-center模块通过isHtml配置删除/上下线广告弹窗)

##### 4.接口的错误处理回调
```
.subscribe({
  next: (result: AuthenticateResultModel) => {
    this.processAuthenticateResult(result, redirectUrl);
    finallyCallback();
  },
  error: (err: any) => {
    finallyCallback();
  }
});
```

## 版本升级(当前版本8.1)
1. 迁移icon-font(`src/assets/flaction`),并在angular.json的styles中引用`"src/assets/flaticon/css/flaticon.css"`
2. 换用新的nswag,生成新service,并更新`src\shared\service-proxies\service-proxy.module.ts`以及各个`service-proxies`,并修改以下文件以支持各个service的调用
    * `src/AppPreBootstrap.ts`
    * `src/root.module.ts`
    * `src/shared/AppConsts.ts`
3. 替换`appconfig.json`和`appconfig.product.json`
4. package.json新增    `"product": "ng build --prod --aot --build-optimizer --source-map=false"`
5. 安装jquery和bootstrap-daterangepicker `npm install --save jquery`、`npm install --save @types/jquery`、`npm install bootstrap-daterangepicker --save`,并在`angular.json`的scripts中加入相关内容。复制`\src\app\shared\common\timing\date-range-picker.component.ts`文件,并在`app-common.module.ts`中引用
`ngx-bootstrap-locale-mapping.service.ts`中加入`'zh-CN': 'zh-cn'`和`'zh-CN': 'zhCn'`
6. 复制`\src\app\shared\charts`目录,并在`app-common.module.ts`中引用，复制`\src\app\shared\services`目录,并在app.module.ts中引入`MachineService`
7. `angular/src/styles.css` 中更新100行之后来自V3的内容
8. 替换各主题的defaultLogo:全局搜索`images/app-logo`,把svg换成png
9. 复制`src/assets/common`文件夹里的excel模板、`address.json`和`src/assets/common/images/`下的图片、`placeholder`、`wx`、`chart`
10. 更新`index.html`中引用的插件
11. 更换favicon

12. 更新`app-component-base.ts`、`typings.d.ts`、`app-session.service.ts`、`moment-format.pipe.ts`、`utils.module.ts`里带V3的内容
13. 使用`default admin 123qwe`账号对比框架自带的模块的变更
14. `account.component.html`里改变登录页的描述
15. 替换admin-routing.module.ts、admin.module.ts、main-routing.module.ts、main.module.ts
16. 引入`fileupload`,`resource-pool`,`image-grid`,`my-map`,`my-tree`,`high-tree`,`my-address`组件,并在`app-common.module.ts`中注册
17. `appconfig(.production).json`中配置语言,并`angular\node_modules\ngx-bootstrap\chronos\esm5\i18n`中加入对应语言的js。当前`angular\node_modules\ngx-bootstrap\chronos\fesm5\ngx-bootstrap-chronos.js`中做了"特殊处理"(需要处理各个语言的config)。搜索`defineLocale`可以找到导入js的位置
18. 更改/新增以下文件实现`switch-ou-modal`(参考2200224git提交记录)
    * app.component.html
    * app.component.ts
    * app.module.ts
    * topbar.component.html
    * topbar.component.ts
    * app-session.service.ts
    * switch-ou-modal.component.html
    * switch-ou-modal.component.ts
19. (存疑)`app-common.module.ts`中`imports TabsModule.forRoot()`以使组件中也能用tab
20. 因`entitystore`模块包含`organization-detail`，应最后更新
* login模块
* `/node_modules/ngx-bootstrap/chronos/esm5/i18n/` 下需要新增 `zh-hk.js`

##### 新版本提供但未使用的一些新语法(不保证后续版本可用)

* `[hidden]="!isGrantedAny('Pages.Administration.Roles.Edit', 'Pages.Administration.Roles.Delete')"`
* `*ngIf="'Pages.Administration.Roles.Create' | permission"`
* ngModelChange
* input ng-minlength
* `p-table scrollable="true" ScrollWidth="100%"`
* abp.ui
    * abp.ui.block();
    * abp.ui.unblock();
    * abp.ui.setBusy();
    * abp.ui.clearBusy();
* `@HostListener`、`@HostBinding`
* dropdown1.hide
* this.dateranger.refresh();




#### 10.2升级更改
import { ModalDirective } from 'ngx-bootstrap/modal'
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';

bsModal=>appBsModal

```
 this._userService.resetUserSpecificPermissions(input).subscribe({
    next: () => {
        this.notify.info(this.l('ResetSuccessfully'));
        this._userService.getUserPermissionsForEdit(this.userId).subscribe(result => {
            this.permissionTree.editData = result;
        });
    },
    complete: () => {
        this.resettingPermissions = false;
    }
});
```