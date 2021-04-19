import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked, Input } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AdServiceProxy, AdDto, CreateAdInput, UpdateAdInput, TagServiceProxy, TagType as Type } from '@shared/service-proxies/service-proxies-ads';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import { CreateOrEditAdResourceModalComponent } from '@app/admin/advertisement/advertisement/create-or-edit-ad-resource-modal.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { RobotServiceProxy } from '@shared/service-proxies/service-proxies-floor'


var that;

@Component({
    selector: 'createOrEditAdModal',
    templateUrl: './create-or-edit-ad-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditAdModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput', { static: true }) nameInput: ElementRef;
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('paginatorRes', { static: false }) paginatorRes: Paginator;
    @ViewChild('createOrEditAdResourceModal', { static: true }) createOrEditAdResourceModal: CreateOrEditAdResourceModalComponent;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    @Input() mapList;

    mapPointList: any = [];
    active = false;
    saving = false;
    operation: string = "add";
    Ad: any;
    UpdateAdInput: UpdateAdInput;
    CreateAdInput: CreateAdInput;
    memberedOrganizationUnits: string[];
    tagSelectList: any[];
    tagSuggestion: any[];
    resourceSelection: any[] = [];
    tags: any[] = [];
    resPrimeng: PrimengTableHelper = new PrimengTableHelper();

    // troncell 
    customTheme = AppConsts.customTheme;

    showPreview = false;
    // isLocal = AppConsts.appBaseUrl != 'https://sensingstore.com' ? true : false;
    // isLocal = window.location.href.indexOf("localhost") > -1 ? true : false;
    isLocal = (window.location.href.indexOf("localhost") > -1 || window.location.href.indexOf("127.0.0.1") > -1) ? true : false;


    // editorUrl;
    constructor(
        injector: Injector,
        private _AdService: AdServiceProxy,
        private _TagServiceProxy: TagServiceProxy,
        private _RobotServiceProxy: RobotServiceProxy,
        private sanitizer: DomSanitizer
    ) {
        super(injector);
        that = this;
        // console.log(AppConsts.editorUrl + '/editor.html');
        // this.editorUrl =this.sanitizer.bypassSecurityTrustHtml(AppConsts.editorUrl + '/editor.html');
        // this.editorUrl =this.sanitizer.bypassSecurityTrustResourceUrl(AppConsts.editorUrl + '/editor.html');
    }


    ngOnInit(): void {
        window.addEventListener('message', this.messageListener);
    }
    messageListener(e) {
        //有时会收到来自框架的其他非JSON信息导致报错 因此catch不做处理
        if (e.data) {
            try {
                that.Ad.customContent = JSON.stringify(JSON.parse(e.data), null, 4);
            } catch (error) {
                // that.message.warn(that.l('JsonNotPattern1'))
                return
            }
        }

        that.showPreview = false;
    }

    ngOnDestroy() {
        window.removeEventListener('message', this.messageListener);
    }

    //获取广告资源
    getResByAdId(event?: LazyLoadEvent) {
        if (this.resPrimeng.shouldResetPaging(event)) {
            this.paginatorRes.changePage(0);
            return;
        }
        this.resPrimeng.showLoadingIndicator();
        this._AdService.getAdResources(
            this.Ad.id,
            void 0,
            void 0,
            this.resPrimeng.getMaxResultCount(this.paginatorRes, event),
            this.resPrimeng.getSkipCount(this.paginatorRes, event)
        )
            .pipe(this.myFinalize(() => { this.resPrimeng.hideLoadingIndicator(); }))
            .subscribe(result => {
                this.resPrimeng.totalRecordsCount = result.totalCount;
                this.resPrimeng.records = result.items;
                // this.resPrimeng.hideLoadingIndicator();
            });
    }

    /**
     * 资源
     */
    createResource(e?) {
        this.createOrEditAdResourceModal.show(this.Ad.id);
    }
    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }



    onOperateResource(e?) {
        console.log(e);
        if (e.action == "info") {
            this.createOrEditAdResourceModal.show(this.Ad.id, Object.assign({}, e.image));
        } else {
            this.message.confirm(this.l('deletethisresource'), this.l('AreYouSure'), (r) => {
                if (r) {
                    this._AdService.deleteAdResources([e.image.id]).subscribe((result) => {
                        this.notify.info(this.l('success'));
                        this.getResByAdId();
                        this.resourceSelection = [];
                    })

                }
            })
        }
    }

    //批量删除资源
    deleteResources() {
        if (this.resourceSelection.length == 0) {
            return this.notify.warn('atLeastChoseOneItem');
        }
        this.message.confirm(this.l('deletethisresources'), this.l('AreYouSure'), (r) => {
            if (r) {
                var ids = [];
                ids = this.resourceSelection.map((item) => {
                    return item.id;
                })
                this._AdService.deleteAdResources(ids).subscribe((result) => {
                    this.notify.info(this.l('success'));
                    this.getResByAdId();
                    this.resourceSelection = []
                })
            }
        })
    }

    show(Ad?: any): void {
        this.active = true;
        if (Ad) {
            this.operation = "edit";
            this.Ad = Ad;
            this._AdService.getSingleAd(Ad.id).pipe(finalize(() => {
                this.modal.show();
            })).subscribe((result) => {
                this.Ad = result;
                console.log(this.Ad)
                this.Ad.robotMapName && this.getMapPointList();

                this.tags = (result.adsTags || []).map((item) => {
                    return {
                        'id': item.id,
                        'value': item.name
                    }
                });
                this.Ad.resourceItemId = result.resourceId;
            })
        } else {
            this.operation = "add";
            this.Ad = new CreateAdInput();
            this.tags = [];
            this.modal.show();
        }

    }

    onShown(): void {
        if (this.nameInput) {
            $(this.nameInput.nativeElement).focus()
        }
    }

    save(): void {

        this.Ad.tags = this.tags.map((item) => {
            return Number(item.id);
        })

        if (this.Ad.customContent) {
            try {
                this.Ad.customContent = JSON.stringify(JSON.parse(this.Ad.customContent), null, 4);
            } catch (error) {
                this.message.warn(this.l('JsonNotPattern2'))
                return
            }
        }

        if (this.operation == "add") {
            if (!this.Ad.resourceItemId) {
                this.message.warn(this.l('atLeastChoseOneItem') + this.l('Image'));
                return
            }
            console.log(this.Ad);
            this.CreateAdInput = new CreateAdInput(this.Ad);
            this._AdService.createAd(this.CreateAdInput)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        } else {

            if (!this.Ad.fileUrl) {
                this.message.warn(this.l('atLeastChoseOneItem') + this.l('Image'));
                return
            }
            this.UpdateAdInput = new UpdateAdInput(this.Ad);
            this._AdService.updateAd(this.UpdateAdInput)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        }
    }

    close(): void {
        this.mapPointList = [];
        this.active = false;
        this.CreateAdInput = null;
        this.UpdateAdInput = null;
        this.modal.hide();
    }
    //筛选tags
    //筛选标签
    filter(event) {
        //获取标签下拉
        this._TagServiceProxy.getTagsByType(event.query, void 0, 100, 0, Type.Ads).subscribe((result) => {
            this.tagSuggestion = result.items;
        })
    }
    assignTags() {
        var tagString = [];
        this.tags.forEach((items) => {
            tagString.push(items.id);
        })
        this.Ad.tags = tagString;
    }

    // upload completed event
    onUpload(result): void {
        this.Ad.resourceItemId = Number(result.resourceId);
        this.Ad.fileUrl = result.fileUrl;
    }

    onBeforeSend(event): void {

    }

    preview() {
        this.showPreview = true;
    }

    iframeLoad() {
        try {
            var customContent = this.Ad.customContent ? JSON.parse(this.Ad.customContent) : {};
            // if (customContent.basicData.type != 'basic') {
            //     throw 'err'
            // }
            //考虑到也可能为空等,因此不做判断
        } catch (error) {
            this.message.warn(this.l('JsonNotPattern3'))
            this.showPreview = false;
            return
        }
        var token = 'Bearer ' + abp.utils.getCookieValue(abp.auth.tokenCookieName),
            tenantId = abp.utils.getCookieValue('Abp.TenantId'),
            serverConfig = {
                s: AppConsts.remoteServiceBaseUrl,
                g: AppConsts.remoteActivityServiceUrl,
                p: AppConsts.remoteAdserviceUrl
            },
            input = JSON.stringify(Object.assign(customContent, { token, tenantId, serverConfig, grantedActivity: this.isGranted('Pages.Tenant.Activities') }));

        var a: any = document.getElementById("iframe");
        // a.contentWindow.postMessage(input, AppConsts.editorUrl);
        a.contentWindow.postMessage(input, this.isLocal ? 'http://localhost:8081' : 'https://m.sensingstore.com');

    }

    formatting() {
        try {
            this.Ad.customContent = JSON.stringify(JSON.parse(this.Ad.customContent), null, 4);
        } catch (error) {
            this.message.warn(this.l('JsonNotPattern4'))
        }
    }

    getMapPointList() {
        let map = this.mapList.find(i => i.value == this.Ad.robotMapName);
        this._RobotServiceProxy.getMapPoints(map.id)
            .subscribe(r => {
                this.mapPointList = (r || []).map(i => {
                    return {
                        'id': i.id,
                        'value': i.name
                    }
                })
            })
    }

}
