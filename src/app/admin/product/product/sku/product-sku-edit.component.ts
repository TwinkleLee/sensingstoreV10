import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked, HostListener } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { ProductServiceProxy, ProductDto, AddOrUpdateProductInput, TagServiceProxy, UpdateSkuInput, PropertyServiceProxy, AuditStatus, MatchInfoServiceProxy, LikeInfoServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { Router } from '@angular/router';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';

import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import { CreateOrEditSkuOnlineModalComponent } from '@app/admin/product/product/sku/create-or-edit-sku-online-modal.component';
import { CreateOrEditSkuResourceModalComponent } from '@app/admin/product/product/sku/create-or-edit-sku-resource-modal.component';
import { Table } from 'primeng/table';
import { ConnectorService } from '@app/shared/services/connector.service';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'ProductSkuEdit',
    templateUrl: './product-sku-edit.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class ProductSkuEditComponent extends AppComponentBase {
    //sku
    @ViewChild('paginatorSku', { static: true }) paginator: Paginator;
    //电商平台
    @ViewChild('paginatorOnline', { static: true }) paginatorOnline: Paginator;
    @ViewChild('dataTableOnline', { static: true }) dataTableOnline: Table;
    @ViewChild('createOrEditSkuOnlineModal', { static: true }) createOrEditSkuOnlineModal: CreateOrEditSkuOnlineModalComponent;
    onlinePrimeg: PrimengTableHelper = new PrimengTableHelper();
    //搭配
    @ViewChild('paginatorMatch', { static: true }) paginatorMatch: Paginator;
    matchPrimeg: PrimengTableHelper = new PrimengTableHelper();
    //猜你喜欢
    @ViewChild('paginatorLikes', { static: true }) paginatorLikes: Paginator;
    likePrimeg: PrimengTableHelper = new PrimengTableHelper();
    //资源列表
    @ViewChild('paginatorRes', { static: true }) paginatorRes: Paginator;
    resourcePrimeg: PrimengTableHelper = new PrimengTableHelper();
    @ViewChild('createOrEditSkuResourceModal', { static: true }) createOrEditSkuResourceModal: CreateOrEditSkuResourceModalComponent;
    resourceSelection: any[] = [];
    saving = false;
    ToResource: boolean = true;
    uploadUrl: string;
    uploadedFiles: any[] = [];
    operation: string = "add";
    sku: any = {};
    productId;
    addOrEditInput: UpdateSkuInput;
    //标签下拉
    tagSuggestion;
    filterText;
    tags: any[] = [];
    //电商平台信息
    onlineStoreInfos: any[] = [];
    //资源列表
    resourceList: any[] = [];
    propertyList: any[] = [];
    mainProperty: any = {
        'propertyValues': []
    };
    selectProperty: any;
    addPropertyList: any[] = [];
    mainPropertyIds: any = [];
    currentPropertyIds = [];
    constructor(
        injector: Injector,
        private _productsService: ProductServiceProxy,
        private router: Router,
        private _tagService: TagServiceProxy,
        private connector: ConnectorService,
        private _propertyService: PropertyServiceProxy,
        private _matchInfoService: MatchInfoServiceProxy,
        private _likeInfoService: LikeInfoServiceProxy,
    ) {
        super(injector);
        this.initSkuMessage();
        //获取标签下拉
        _tagService.getTags(undefined, undefined, 100, 0).subscribe((result) => {
            this.tagSuggestion = result.items;
        })
        /**
         * 待优化 : 当前使用获取1000条格式 然后过滤出是否显图属性
         */
        _productsService.getPropertiesByProductId(this.productId).subscribe((result) => {


            // console.log(result, 'getPropertiesByProductId')
            // result[0].isDefaultDecideImage = true;


            this.initProperty(result);
        })
    }
    initSkuMessage() {
        var urls = location.pathname.split("\/"), id;
        id = urls[urls.length - 1];
        this.productId = urls[urls.length - 3];
        var skuQuery = this.connector.getCache('skuQuery');
        this.saving = true;
        abp.ui.setBusy();
        //通过sku的id获取sku基础信息
        this._productsService.getSingleSku(
            this.productId,
            id,
            skuQuery.filterText,
            undefined,
            skuQuery.maxResultCount,
            skuQuery.skipCount
        ).pipe(finalize(() => {
            this.saving = false;
            abp.ui.clearBusy();
        })).subscribe((result) => {
            this.sku = result;
            this.sku.productId = this.productId;
            this.sku.promPrice = result.promPrice ? Number(result.promPrice) : undefined;
            this.tags = this.sku.skuTags ? this.sku.skuTags.map((item) => {
                return {
                    'id': item.id,
                    'value': item.name
                }
            }) : [];
            var currentPropertyIds = [];
            this.mainPropertyIds = this.sku.currentSkuPropertyValues.map((item) => {
                currentPropertyIds.push(item.propertyId);
                return item.propertyValueId;
            }) || [];
            this.initProperty(currentPropertyIds);
        });
    }

    initProperty(list: any[]) {
        if (!list || list.length == 0) { return; }
        if (typeof list[0] == 'number') {
            this.currentPropertyIds = list;
        } else if (typeof list[0] == 'object') {
            this.propertyList = list;
        } else {
            return;
        }
        if (!this.propertyList || this.propertyList.length == 0) {
            return;
        }
        if (this.currentPropertyIds && this.currentPropertyIds.length > 0) {
            this.propertyList = this.propertyList.filter((item) => {
                if (item.isDefaultDecideImage && this.mainProperty.propertyId == undefined) {
                    this.mainProperty = item;
                    return false;
                }
                if (this.currentPropertyIds.indexOf(item.propertyId) + 1 > 0) {
                    this.addPropertyList.push(item);
                    return false;
                }
                return true;
            })
        }
        // setTimeout(() => {
        //     var arr = [];
        //     for (var i = 0; i < this.addPropertyList.length; i++) {
        //         arr.push(this.addPropertyList[i])
        //     }
        //     this.addPropertyList = [];
        //     this.addPropertyList = arr;
        // }, 1000)
        console.log(list, '000', this.propertyList, '111', this.currentPropertyIds)
    }

    @HostListener('window:keyup', ['$event'])
    keyEvent(event: KeyboardEvent) {
        if (event.ctrlKey && event.keyCode === 39) {
            this.switchSku(true);
        }

        if (event.ctrlKey && event.keyCode === 37) {
            this.switchSku(false);
        }
    }

    switchSku(f) {
        if (this.saving) { return; }
        if (!f && this.sku.preSkuId) {
            window.history.pushState('', null, location.href.replace(/sku\/\d+/, 'sku\/' + this.sku.preSkuId));
            this.initSkuMessage();
        } else if (f && this.sku.nextSkuId) {
            window.history.pushState('', null, location.href.replace(/sku\/\d+/, 'sku\/' + this.sku.nextSkuId));
            this.initSkuMessage();
        }
    }
    //跟随主要属性值变化改变图片
    changeImage() {
        if (!this.mainProperty) { return; }
        console.log(this.mainProperty.propertyValues)
        var mainProperty = this.mainProperty.propertyValues.filter((item) => {
            return item.id == this.mainPropertyIds[0];
        })[0];
        console.log(mainProperty)
        this.sku.picUrl = mainProperty ? mainProperty.defaultImage : "";
    }
    //将添加的property返回可选列表
    deleteProperty(index) {
        this.mainPropertyIds.splice(index + 1, 1);
        this.propertyList = this.propertyList.concat(this.addPropertyList.splice(index, 1));
    }
    //选中property
    addProperty() {
        var index, select;
        this.propertyList.forEach((property, i) => {
            if (property.propertyId == this.selectProperty) {
                index = i;
            }
        });
        select = this.propertyList.splice(index, 1)[0];
        this.addPropertyList.push(select);
        select.propertyValues[0] && this.mainPropertyIds.push(select.propertyValues[0].id);
    }
    //筛选标签
    filter(event) {
        //获取标签下拉
        this._tagService.getTags(event.query, undefined, 100, 0).subscribe((result) => {
            this.tagSuggestion = result.items;
        })
    }
    assignTags() {
        var tagString = [];
        this.tags.forEach((items) => {
            tagString.push(items.id);
        })
        this.sku.tags = tagString;
    }
    //返回
    back() {
        this.router.navigate(['app', 'admin','product', 'product', 'operation', this.productId], { queryParams: { backFromSku: true } });
    }
    //保存
    save(): void {
        this.saving = true;
        this.sku.propertyValueIds = this.mainPropertyIds.filter((id) => {
            return id != undefined;
        }).map((id) => {
            return Number(id);
        });
        this.addOrEditInput = new UpdateSkuInput(this.sku);
        this.addOrEditInput.auditStatus = this.sku.auditStatus == "Online" ? 1 : 0;

        console.log(this.addOrEditInput.propertyValueIds)
        //此处是为了修复一个bug
        this.addOrEditInput.propertyValueIds.reverse();

        this._productsService.updateSku(this.addOrEditInput)
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.back();
            });
    }
    // upload completed event
    onUpload(result): void {
        this.sku.picUrl = result.fileUri;
    }
    onBeforeSend(event): void {

    }
    //转换序列
    transIndex(i, primengTableHelper, paginator, event?: LazyLoadEvent) {
        return i + 1 + primengTableHelper.getSkipCount(paginator, event);
    }
    /**
     * 电商平台 tab页
     */
    getOnlineBySkuId(event?: LazyLoadEvent) {
        if (this.onlinePrimeg.shouldResetPaging(event)) {
            this.paginatorOnline.changePage(0);
            return;
        }
        this.onlinePrimeg.showLoadingIndicator();
        this._productsService.getSkuOnlinestoreInfos(
            this.sku.id,
            this.filterText,
            this.onlinePrimeg.getSorting(this.dataTableOnline),
            this.onlinePrimeg.getMaxResultCount(this.paginatorOnline, event),
            this.onlinePrimeg.getSkipCount(this.paginatorOnline, event)
        )
            .pipe(this.myFinalize(() => { this.onlinePrimeg.hideLoadingIndicator(); }))
            .subscribe(result => {
                this.onlinePrimeg.totalRecordsCount = result.totalCount;
                this.onlinePrimeg.records = result.items;
                this.onlinePrimeg.hideLoadingIndicator();
            });
    }
    //新增
    createOnline() {
        this.createOrEditSkuOnlineModal.show(this.sku.id);
    }
    //编辑
    editOnline(record) {
        this.createOrEditSkuOnlineModal.show(this.sku.sku_id, record);
    }
    //删除
    deleteOnline(record) {
        this.message.confirm(this.l('deleteOnlineStoreMsgQuestion'), this.l('AreYouSure'), (r) => {
            if (r) {
                this._productsService.deleteSkuOnlinestoreInfo(record.id).subscribe((result) => {
                    this.notify.info(this.l('success'));
                    this.getOnlineBySkuId();

                })
            }
        });
    }
    /***
     * 搭配
     */
    getMatchBySkuId(event?: LazyLoadEvent) {
        if (this.matchPrimeg.shouldResetPaging(event)) {
            this.paginatorMatch.changePage(0);
            return;
        }
        this.matchPrimeg.showLoadingIndicator();
        this._matchInfoService.gets(
            this.sku.id,
            undefined,
            undefined,
            this.matchPrimeg.getMaxResultCount(this.paginatorMatch, event),
            this.matchPrimeg.getSkipCount(this.paginatorMatch, event)
        )
        .pipe(this.myFinalize(() => { this.matchPrimeg.hideLoadingIndicator(); }))
        .subscribe(result => {
            this.matchPrimeg.totalRecordsCount = result.totalCount;
            this.matchPrimeg.records = result.items;
            this.matchPrimeg.hideLoadingIndicator();
        });
    }
    onOperateMatch(e) {
        if (e.action == 'info') {
            this.router.navigate(['app', 'admin','product', 'match', 'operation', e.image.id]);
        }
    }
    /**
     * 猜你喜欢
     */
    getLikesBySkuId(event?: LazyLoadEvent) {
        if (this.likePrimeg.shouldResetPaging(event)) {
            this.paginatorLikes.changePage(0);
            return;
        }
        this.likePrimeg.showLoadingIndicator();
        this._likeInfoService.gets(
            this.sku.id,
            undefined,
            undefined,
            this.likePrimeg.getMaxResultCount(this.paginatorLikes, event),
            this.likePrimeg.getSkipCount(this.paginatorLikes, event)
        )
        .pipe(this.myFinalize(() => { this.likePrimeg.hideLoadingIndicator(); }))
        .subscribe(result => {
            this.likePrimeg.totalRecordsCount = result.totalCount;
            this.likePrimeg.records = result.items;
            this.likePrimeg.hideLoadingIndicator();
        });
    }
    onOperateLikes(e) {
        if (e.action == 'info') {
            this.router.navigate(['app', 'admin','product', 'like', 'operation', e.image.id]);
        }
    }

    /**
     * 资源
     */
    getResBySkuId(event?: LazyLoadEvent) {
        if (this.resourcePrimeg.shouldResetPaging(event)) {
            this.paginatorRes.changePage(0);
            return;
        }
        this.resourcePrimeg.showLoadingIndicator();
        this._productsService.getSkuResources(
            this.sku.id,
            undefined,
            undefined,
            this.resourcePrimeg.getMaxResultCount(this.paginatorRes, event),
            this.resourcePrimeg.getSkipCount(this.paginatorRes, event)
        )
        .pipe(this.myFinalize(() => { this.resourcePrimeg.hideLoadingIndicator(); }))
        .subscribe(result => {
            this.resourcePrimeg.totalRecordsCount = result.totalCount;
            this.resourcePrimeg.records = result.items;
            this.resourcePrimeg.hideLoadingIndicator();
        });
    }
    onOperateResource(event) {
        if (event.action == "info") {
            this.createOrEditSkuResourceModal.show(this.sku.id, Object.assign({}, event.image));
        } else {
            this.message.confirm(this.l('deletethisresource'), this.l('AreYouSure'), (r) => {
                if (r) {
                    this._productsService.deleteSkuResource(event.image.id).subscribe((result) => {
                        this.notify.info(this.l('success'));
                        this.getResBySkuId();
                    })

                }
            })
        }
    }
    createResource(e?) {
        this.createOrEditSkuResourceModal.show(this.sku.id);
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
                this._productsService.deleteSkuResources(ids).subscribe((result) => {
                    this.notify.info(this.l('success'));
                    this.getResBySkuId();
                    this.resourceSelection = []
                })
            }
        })
    }

}
