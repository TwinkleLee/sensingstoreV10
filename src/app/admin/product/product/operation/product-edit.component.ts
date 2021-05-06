import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ModalDirective,  } from '@node_modules/ngx-bootstrap/modal';
import { TabsetComponent } from '@node_modules/ngx-bootstrap/tabs';


import { ProductServiceProxy, RedeemType,UpdateProductInput, TagServiceProxy, ApplyServiceProxy, CreateApplyFormInput, ApplyFormType as CreateApplyFormInputApplyType, ApplyWanted as CreateApplyFormInputWanted, ProductCategoryServiceProxy, TagType as Type,ProductPointRule,RedeemRule,AwardRule } from '@shared/service-proxies/service-proxies-product';


import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { ConnectorService } from '@app/shared/services/connector.service';
import { Router, ActivatedRoute } from '@angular/router';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';

import { CreateOrEditSkuModalComponent } from '@app/admin/product/product/operation/create-or-edit-sku-modal.component';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import { CreateOrEditOnlineModalComponent } from '@app/admin/product/product/operation/create-or-edit-online-modal.component';
import { CreateOrEditCommentsModalComponent } from '@app/admin/product/product/operation/create-or-edit-comments-modal.component';
import { CreateOrEditProductResourceModalComponent } from '@app/admin/product/product/operation/create-or-edit-resource-modal.component';
import { TokenService } from 'abp-ng2-module';
import { Table, TableCheckbox } from 'primeng/table';
import { MyTreeComponent } from '@app/shared/common/my-tree/my-tree.component';
import { finalize } from 'rxjs/operators';

import { ShopServiceProxy } from '@shared/service-proxies/service-proxies-product';

import { BrandServiceProxy } from '@shared/service-proxies/service-proxies-devicecenter';


@Component({
    selector: 'ProductEdit',
    templateUrl: './product-edit.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class ProductEditComponent extends AppComponentBase implements OnDestroy, OnInit {
    // @ViewChild('RegionCombobox') regionComboboxElement: ElementRef;
    // @ViewChild('LanguageCombobox2') languageComboboxElement2: ElementRef;

    //sku
    @ViewChild('paginatorSku',{static:true}) paginator: Paginator;
    @ViewChild('createOrEditSkuModal',{static:false}) createOrEditSkuModal: CreateOrEditSkuModalComponent;
    // @ViewChild('BrandCombobox') brandComboboxElement: ElementRef;
    @ViewChild('TableCheckbox',{static:true}) TableCheckbox: TableCheckbox;
    skuPrimeng: PrimengTableHelper = new PrimengTableHelper();
    skuSelection: any[] = [];
    skuFilterText: string = '';
    applySaving: boolean = false;
    //审核
    apply: CreateApplyFormInput = new CreateApplyFormInput();
    //电商平台
    @ViewChild('paginatorOnline',{static:true}) paginatorOnline: Paginator;
    @ViewChild('dataTableOnline',{static:true}) dataTableOnline: Table;
    @ViewChild('createOrEditOnlineModal',{static:true}) createOrEditOnlineModal: CreateOrEditOnlineModalComponent;
    onlinePrimeng: PrimengTableHelper = new PrimengTableHelper();
    onlineStoreInfos: any[] = [];
    //评价
    @ViewChild('paginatorComment',{static:true}) paginatorComment: Paginator;
    @ViewChild('dataTableComment',{static:true}) dataTableComment: Table;
    @ViewChild('createOrEditCommentsModal',{static:true}) createOrEditCommentsModal: CreateOrEditCommentsModalComponent;
    commentPrimeng: PrimengTableHelper = new PrimengTableHelper();
    commentSelection: any[] = [];
    //资源列表
    @ViewChild('paginatorRes',{static:true}) paginatorRes: Paginator;
    @ViewChild('createOrEditProductResourceModal',{static:true}) createOrEditProductResourceModal: CreateOrEditProductResourceModalComponent;
    resPrimeng: PrimengTableHelper = new PrimengTableHelper();
    resourceSelection: any[] = [];
    resourceList: any[] = [];
    @ViewChild('tree',{static:false}) tree: MyTreeComponent;
    @ViewChild('tabset',{static:true}) tabset: TabsetComponent;
    saving = false;
    ToResource: boolean = true;
    uploadUrl: string;
    uploadedFiles: any[] = [];
    operation: string = "add";
    product: any = {};
    addOrEditInput: UpdateProductInput;
    tags: any[] = [];
    brands: any[] = [];
    tagSuggestion;
    progress = 0;
    categoryList: any[] = [];
    categoryName: string = '';
    backFromSku: boolean = false;
    busy = false;
    treeConfig: any = {
        'selectable': true,
        'singleSelect': false,
        'showIcon': true,
        'menu': false,
        'selecionMode': 2
    }
    clearBindFun = this.hideCateTree();
    regionList: any = [];
    languageList: any = [];
    interval1;
    interval2;

    freightList: any = [];

    constructor(
        injector: Injector,
        private _productsService: ProductServiceProxy,
        private router: Router,
        private route: ActivatedRoute,
        private connector: ConnectorService,
        private _tagService: TagServiceProxy,
        private _applyService: ApplyServiceProxy,
        private _tokenService: TokenService,
        private _cateService: ProductCategoryServiceProxy,
        private _brandService: BrandServiceProxy,
        private _ShopServiceProxy: ShopServiceProxy
    ) {
        super(injector);
        this.apply.applyType = CreateApplyFormInputApplyType.Sku;
        this.apply.itemids = [];
        this.apply.options = '';
        this.initProductMessage();
        $(document).on('click', this.clearBindFun);
        //获取标签下拉
        this._tagService.getTags(void 0, void 0, 100, 0).subscribe((result) => {
            this.tagSuggestion = result.items;
            console.log(this.tagSuggestion)
        })
        this.setRegion();
        this.setLanguage();
        this.getFreight();
    }

    //初始化请求商品信息
    initProductMessage() {
        var urls = location.pathname.split("\/"), id;
        id = urls[urls.length - 1];
        this.product.id = id;
        var productQuery = this.connector.getCache('productQuery');
        this.saving = true;
        abp.ui.setBusy();
        this._productsService.getSingleProduct(
            id,
            productQuery.startTime,
            productQuery.endTime,
            productQuery.auditStatus,
            productQuery.tagId ? [productQuery.tagId] : void 0,
            productQuery.cateoryIds,
            productQuery.price1,
            productQuery.price2,
            productQuery.stock ? productQuery.stockOperator + productQuery.stock : void 0,
            productQuery.salesVolume ? productQuery.salesVolumeOperator + productQuery.salesVolume : void 0,
            productQuery.sortStatus,
            productQuery.isSearchSku,
            void 0,
            void 0,
            void 0,
            void 0,
            void 0,
            productQuery.filterText,
            productQuery.sort,
            productQuery.maxResultCount,
            productQuery.skipCount
        ).pipe(finalize(() => {
            this.saving = false;
            this.tabset.tabs.filter((tab) => {
                return tab.active
            })[0].elementRef.nativeElement.click();
            abp.ui.clearBusy();
        })).subscribe((result) => {
            this.product = result;
            // this.product.auditStatus = this.product.auditStatus == "Offline" ? 0 : 1;
            this.product.auditStatusForShow = this.product.auditStatus == 'Offline' ? this.l('Offline') : this.l('Online');
            var chosen = [];
            this.product.p_ProductCategories.forEach((item) => {
                chosen.push(item.id);
                this.categoryName += (this.categoryName ? " | " : "") + item.name;
            })
            var brand: any = result.brand ? result.brand : {};
            this.product.brandId = brand.id;
            this.product.categorys = chosen;
            if(!this.product.pointRule){
                this.product.pointRule = new ProductPointRule({
                    "redeemRule": new RedeemRule( {
                        "pointRedeemable": false,
                        "redeemType": RedeemType['Full'],
                        "redeemAmount": 0,
                        "cashAmount": 0
                      }),
                      "awardRule":new AwardRule( {
                        "pointAwardable": false,
                        "awardAmount": 0
                      })
                });
            }
            console.log("this.product",this.product);
            this.tree.initSelection(chosen);
            this.tags = this.product.productTags.map((item) => {
                return {
                    'id': item.id,
                    'value': item.name
                }
            }) || [];
        });
    }

    getFreight() {
        this._ShopServiceProxy.getShopFreights(
            void 0,
            void 0,
            void 0,
            999, 0
        ).subscribe(r => {
            this.freightList = r.items;
        })
    }

    ngOnInit() {
        if (window.location.search !== '') {
            var skuQuery = this.connector.getCache('skuQuery');
            this.skuFilterText = skuQuery.filterText;
            this.paginator.rows = skuQuery.maxResultCount;
            this.paginator.first = skuQuery.skipCount;
        }
        this.getBrands();
        this.backFromSku = location.search != '';
        this._cateService.getCategoryTrees().subscribe((result) => {
            this.categoryList = result;
            this.tree.initSelection(this.product.categorys || [], this.categoryList);
        })
    }
    ngOnDestroy() {
        $(document).off('click', this.clearBindFun);
        clearInterval(this.interval1);
        clearInterval(this.interval2);
    }

    @HostListener('window:keyup', ['$event'])
    keyEvent(event: KeyboardEvent) {
        if (event.ctrlKey && event.keyCode === 39) {
            this.switchProduct(true);
        }

        if (event.ctrlKey && event.keyCode === 37) {
            this.switchProduct(false);
        }
    }

    //获取品牌
    getBrands() {
        this._brandService.getBrands(void 0, void 0, void 0, void 0, 999, 0).subscribe((result) => {
            this.brands = result.items;
        })
    }
    //筛选标签
    filter(event) {
        //获取标签下拉
        this._tagService.getTagsByType(event.query, void 0, 100, 0, Type.Product).subscribe((result) => {
            this.tagSuggestion = result.items;
            console.log(this.tagSuggestion)
        })
    }

    setRegion() {
        this._productsService.getRegions().subscribe(r => {
            console.log(r, 'region')
            this.regionList = r;
            this.interval2 = setInterval(() => {
                // if ($('.regionSelect .bs-searchbox input').length == 0) return
                if ($('.regionSelect .bs-searchbox input').val()) {
                    this.product.region = $('.regionSelect .bs-searchbox input').val();
                    $('.regionSelect>button>span.filter-option').html(this.product.region)
                }
            }, 500)
        })
    }

    setLanguage() {
        this._productsService.getLanguages().subscribe(r => {
            console.log(r, 'language')
            this.languageList = r;
            this.interval2 = setInterval(() => {
                // if ($('.languageSelect .bs-searchbox input').length == 0) return
                if ($('.languageSelect .bs-searchbox input').val()) {
                    this.product.language = $('.languageSelect .bs-searchbox input').val();
                    $('.languageSelect>button>span.filter-option').html(this.product.language)
                }
            }, 2000)

        })
    }


    assignTags() {
        var tagString = [];
        this.tags.forEach((items) => {
            tagString.push(items.id);
        })
        this.product.tags = tagString;
    }
    showCateTree() {
        $("#ProductCategory>ul.dropdown-menu").show();
    }
    hideCateTree() {
        return function (e) {
            if (e.target.id != 'categoryName' && $(e.target).closest('ul.dropdown-menu').length == 0) {
                if (!$("#ProductCategory>ul.dropdown-menu").is(":visible")) {
                    return true;
                }
                $("#ProductCategory>ul.dropdown-menu").hide();
                var chosen = this.tree.getchosen(), str = '',
                    ids = this.tree.getchosenIds();
                chosen.forEach((item) => {
                    str += (str ? " | " : "") + item.text;
                })
                if (chosen) {
                    setTimeout(() => {
                        this.categoryName = str;
                    }, 0)
                    this.product.categorys = ids;
                } else {
                    setTimeout(() => {
                        this.categoryName = '';
                    }, 0)
                    this.product.categorys = [];
                }
            }
        }.bind(this);
    }
    //返回
    back() {
        this.router.navigate(['app', 'admin','product', 'product'], { queryParams: { useQuery: true } });
    }
    //选中文件
    uploadFile(e) {
        var form = document.forms.namedItem('qrCodeForm');
        var formData = new FormData(form);
        formData.append('ToResource ', 'true');
        formData.append('CreateThumbnail ', 'true');
        formData.append('IsLocal ', 'true');
        var tenantId = this.appSession.tenantId;
        var token = this._tokenService.getToken();
        var url = AppConsts.remoteServiceBaseUrl + "/api/File/UploadSingleBigFile?fileArea=Products";
        var self = this;
        $.ajax({
            'type': 'POST',
            'url': url,
            'contentType': false,
            'beforeSend': function (request) {
                request.setRequestHeader("Authorization", "Bearer " + token);
                request.setRequestHeader("Abp.TenantId", tenantId + '');
            },
            'xhr': function () {
                var xhr = $.ajaxSettings.xhr();
                xhr.upload.onprogress = function (event) {
                    var loaded = event.loaded;
                    var total = event.total;
                    self.progress = Math.floor(100 * loaded / total);
                };
                return xhr;
            },
            'processData': false,
            'data': formData,
            'dataType': "json",
            'success': function (result, status, xhr) {
                if (result.success) {
                    self.product.qrCodeUrl = result.result.fileUri;
                    self.notify.info(self.l('success'));
                    setTimeout(function () {
                        self.progress = 0;
                    }, 500)
                }
            },
            'error': function (xhr, status, error) {
                self.notify.warn(error);
            }
        })
    }
    //清空资源
    resetResource() {
        this.product.qrCodeUrl = '';
    }
    //保存
    save(): void {

        if (this.product.price2 && this.product.price2 < this.product.price) {
            return this.notify.warn(this.l('price2LessThenPrice'));
        }
        this.product.tags = this.tags.map((item) => {
            return Number(item.id);
        })
        this.saving = true;
        this.addOrEditInput = new UpdateProductInput(this.product);
        this.addOrEditInput.brandId = this.product.brandId ? Number(this.product.brandId) : null;

        console.log(this.addOrEditInput)



        this._productsService.updateProduct(this.addOrEditInput)
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.back();
            });
    }
    // upload completed event
    onUpload(result): void {
        this.product.picUrl = result.fileUri;
    }

    onBeforeSend(event): void {

    }
    //切换product
    switchProduct(f: boolean) {
        if (this.saving) { return; }
        if (!f && this.product.preProductId) {
            window.history.pushState('', null, location.href.replace(/operation\/\d+/, 'operation\/' + this.product.preProductId));
            this.initProductMessage();
        } else if (f && this.product.nextProductId) {
            window.history.pushState('', null, location.href.replace(/operation\/\d+/, 'operation\/' + this.product.nextProductId));
            this.initProductMessage();
        }
    }

    //转换序列
    transIndex(i, primengTableHelper, paginator, event?: LazyLoadEvent) {
        return i + 1 + primengTableHelper.getSkipCount(paginator, event);
    }
    /**
     * sku  tab页
     */
    //通过productid获取skus
    getSkuByProductId(event?: LazyLoadEvent) {
        this.skuPrimeng.showLoadingIndicator();
        this._productsService.getProductSkus(
            this.product.id,
            void 0,
            this.skuFilterText,
            void 0,
            this.skuPrimeng.getMaxResultCount(this.paginator, event) || 10,
            this.skuPrimeng.getSkipCount(this.paginator, event)
        ).pipe(finalize(() => {
            this.skuPrimeng.hideLoadingIndicator();
        })).subscribe((result) => {
            this.skuPrimeng.totalRecordsCount = result.totalCount;
            this.skuPrimeng.records = result.items;
            // setTimeout(() => {
            //     this.juggeChosen(this.skuSelection);
            //   },0)
        })
    }
    toggleSkuGrid(f) {
        if (f) {
            $("#skuTableShow").show();
            $("#skuGridShow").hide();
        } else {
            $("#skuTableShow").hide();
            $("#skuGridShow").show();
        }
        this.TableCheckbox.tableService.onSelectionChange();
    }
    //操作skus
    onOperateSku(e) {
        if (e && e.action == 'info') {
            window.history.pushState('', null, window.location.href + '?backFromSku=true');
            this.editSku(e.image);
        } else {
            this.deleteSku(e.image.id);
        }
    }
    //删除sku
    deleteSku(id) {
        this.message.confirm(this.l('deleteThisSkuQuestion'),this.l('AreYouSure'), (r) => {
            if (r) {
                this._productsService.deleteSku(id).subscribe((result) => {
                    this.notify.info("success");
                    this.skuSelection = [];
                    this.getSkuByProductId();
                })
            }
        })
    }
    //批量删除sku
    deleteSkus() {
        this.checkSelection(true, (ary) => {
            this.message.confirm(this.l('deletethisskus'), this.l('AreYouSure'),(r) => {
                if (r) {
                    if (ary.length == 0) {
                        return this.notify.warn('atLeastChoseOneItem');
                    }
                    this._productsService.deleteSkuByIds(ary).subscribe((result) => {
                        this.notify.info(this.l('success'));
                        this.getSkuByProductId();
                        this.skuSelection = [];
                    })
                }
            })
        })
    }
    //新增sku
    createSku() {
        this.createOrEditSkuModal.show(this.product.id);
    }
    //编辑sku
    editSku(record) {
        this.connector.setCache("skuQuery", {
            'filterText': this.skuFilterText,
            'maxResultCount': this.skuPrimeng.getMaxResultCount(this.paginator, null),
            'skipCount': this.skuPrimeng.getSkipCount(this.paginator, null)
        });
        window.history.pushState('', null, window.location.href + '?useQuery=true');
        this.router.navigate(['sku', record.id], { relativeTo: this.route });
    }
    //取消
    no() {
        $("#review").hide();
    }
    //确定
    ok() {
        this.busy = true;
        this.applySaving = true;
        this._applyService.createApplyForm(this.apply).pipe(finalize(() => {
            this.applySaving = false;
        })).subscribe((result) => {
            this.skuSelection = [];
            this.getSkuByProductId();
            $("#review").hide();
            this.busy = false;
        })
    }
    //筛选商品sku上下线
    filterProductSku() {
        var upNum = [], upNumIds = [], downNum = [], downNumIds = [];
        this.skuSelection.forEach((v, index, array) => {
            if (v.auditStatus == "Offline") {
                downNum.push(v);
                downNumIds.push(v.id);
            } else {
                upNum.push(v);
                upNumIds.push(v.id);
            }
        })
        return {
            upNum: upNum,
            upNumIds: upNumIds,
            downNum: downNum,
            downNumIds: downNumIds
        }
    }
    //检测选中商品sku上下线情况
    // f -> bool  代表上下线操作  true表示需要上线  则筛去已上线
    //all ->bool 表示是否操作全部
    checkSelection(f, callback, all?) {
        var upNum = this.filterProductSku().upNum, downNum = this.filterProductSku().downNum,
            upNumIds = this.filterProductSku().upNumIds, downNumIds = this.filterProductSku().downNumIds;
        if (all) {
            return callback && callback([]);
        }
        if (f) {
            if (downNum.length == 0) {
                return this.notify.info(this.l('noneOfflineSkuGotten'));
            }
            if (upNum.length != 0) {
                this.message.confirm(this.l('autoFilterOnlineStuff', upNum.length), this.l('AreYouSure'),(r) => {
                    if (r) {
                        this.skuSelection = downNum;
                    }
                })
            }
        } else {
            if (upNum.length == 0) {
                return this.notify.info(this.l('noneOnlineSkuGotten'));
            }
            if (downNum.length != 0) {
                this.message.confirm(this.l('autoFilterOfflineStuff', downNum.length),this.l('AreYouSure'), (r) => {
                    if (r) {
                        this.skuSelection = upNum;
                    }
                })
            }
        }
        callback && callback(f ? downNumIds : upNumIds);
    }
    //审核
    review(f, ary?) {
        this.apply.options = ary ? "" : "all";
        this.apply.itemids = ary ? ary : [this.product.id];
        this.apply.reason = '';
        this.apply.wanted = f ? CreateApplyFormInputWanted.Online : CreateApplyFormInputWanted.Offline;
        $("#review").show();
    }
    //下线所有商品sku
    offlineAll() {
        this.review(false);
    }
    //下线商品sku
    offline() {
        this.checkSelection(false, (ary) => {
            this.review(false, ary);
        })
    }
    //上线商品sku
    online() {
        this.checkSelection(true, (ary) => {
            this.review(true, ary);
        })
    }
    //上线所有商品sku
    onlineAll() {
        this.review(true);
    }

    /**
     * 电商平台 tab页
     */
    getOnlineByProductId(event?: LazyLoadEvent) {
        if (this.onlinePrimeng.shouldResetPaging(event)) {
            this.paginatorOnline.changePage(0);
            return;
        }
        this.onlinePrimeng.showLoadingIndicator();
        this._productsService.getProductOnlinestoreInfos(
            this.product.id,
            void 0,
            this.onlinePrimeng.getSorting(this.dataTableOnline),
            this.onlinePrimeng.getMaxResultCount(this.paginatorOnline, event),
            this.onlinePrimeng.getSkipCount(this.paginatorOnline, event)
        )
        .pipe(this.myFinalize(() => { this.onlinePrimeng.hideLoadingIndicator(); }))
        .subscribe(result => {
            this.onlinePrimeng.totalRecordsCount = result.totalCount;
            this.onlinePrimeng.records = result.items;
            // this.onlinePrimeng.hideLoadingIndicator();
        });
    }
    //新增
    createOnline() {
        this.createOrEditOnlineModal.show(this.product.id);
    }
    //编辑
    editOnline(record) {
        this.createOrEditOnlineModal.show(this.product.id, Object.assign({}, record));
    }
    //删除
    deleteOnline(record) {
        this.message.confirm(this.l('deleteOnlineStoreMsgQuestion'), this.l('AreYouSure'),(r) => {
            if (r) {
                this._productsService.deleteProductOnlinestoreInfo(record.id).subscribe((result) => {
                    this.notify.info(this.l('success'));
                    this.getOnlineByProductId();
                })
            }
        })
    }
    /**
     * 资源
     */
    createResource(e?) {
        this.createOrEditProductResourceModal.show(this.product.id);
    }
    getResByProductId(event?: LazyLoadEvent) {
        if (this.resPrimeng.shouldResetPaging(event)) {
            this.paginatorRes.changePage(0);
            return;
        }
        this.resPrimeng.showLoadingIndicator();
        this._productsService.getProductResources(
            this.product.id,
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
    onOperateResource(e?) {
        if (e.action == "info") {
            this.createOrEditProductResourceModal.show(this.product.id, Object.assign({}, e.image));
        } else {
            this.message.confirm(this.l('deletethisresource'),this.l('AreYouSure'), (r) => {
                if (r) {
                    this._productsService.deleteProductResource(e.image.id).subscribe((result) => {
                        this.notify.info(this.l('success'));
                        this.getResByProductId();
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
        this.message.confirm(this.l('deletethisresources'),this.l('AreYouSure'), (r) => {
            if (r) {
                var ids = [];
                ids = this.resourceSelection.map((item) => {
                    return item.id;
                })
                this._productsService.deleteProductResources(ids).subscribe((result) => {
                    this.notify.info(this.l('success'));
                    this.getResByProductId();
                    this.resourceSelection = []
                })
            }
        })
    }

    //返回
    goBack() {
        this.router.navigate(['app', 'admin', 'product', 'product']);
    }
    /**
     * 评价
     */
    createComment() {
        this.createOrEditCommentsModal.show(this.product.id);
    }
    editComment(record) {
        this.createOrEditCommentsModal.show(this.product.id, Object.assign({}, record));
    }
    deleteComment(record) {
        this.message.confirm(this.l('deletethiscomment'), this.l('AreYouSure'),(r) => {
            if (r) {
                this._productsService.deleteProductComment(record.id).subscribe((result) => {
                    this.notify.info(this.l('success'));
                    this.getCommentsByProductId();
                })
            }
        })
    }
    deleteComments() {
        var ids = this.commentSelection.map((item) => {
            return item.id;
        }) || [];
        if (ids.length == 0) {
            return this.notify.warn(this.l('noCommentSelected'));
        }
        this.message.confirm(this.l('deletethiscomments'),this.l('AreYouSure'), (r) => {
            if (r) {
                this._productsService.deleteProductCommentByIds(ids).subscribe((result) => {
                    this.notify.info(this.l('success'));
                    this.getCommentsByProductId();
                })
            }
        })
    }
    getCommentsByProductId(event?: LazyLoadEvent) {
        if (this.commentPrimeng.shouldResetPaging(event)) {
            this.paginatorComment.changePage(0);
            return;
        }
        this.commentSelection = [];

        this.commentPrimeng.showLoadingIndicator();
        this._productsService.getProductComments(
            this.product.id,
            void 0,
            this.commentPrimeng.getSorting(this.dataTableComment),
            this.commentPrimeng.getMaxResultCount(this.paginatorComment, event),
            this.commentPrimeng.getSkipCount(this.paginatorComment, event)
        )
        .pipe(this.myFinalize(() => { this.commentPrimeng.hideLoadingIndicator(); }))
        .subscribe(result => {
            this.commentPrimeng.totalRecordsCount = result.totalCount;
            this.commentPrimeng.records = result.items;
            // this.commentPrimeng.hideLoadingIndicator();
            // setTimeout(() => {
            //     this.juggeChosen(this.commentSelection);
            //   },0)
        });
    }

}
