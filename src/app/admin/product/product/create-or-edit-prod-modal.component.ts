import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { ProductServiceProxy, RedeemType,TagServiceProxy, CreateProductInput, ProductCategoryServiceProxy, TagType as Type, ProductPointRule, RedeemRule, AwardRule } from '@shared/service-proxies/service-proxies-product';

import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { TokenService } from 'abp-ng2-module';
import { MyTreeComponent } from '@app/shared/common/my-tree/my-tree.component';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'createOrEditProdModal',
    templateUrl: './create-or-edit-prod-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`, `.input-group-prepend span:hover{
            color:#308bd0;
        }`
    ]
})
export class CreateOrEditProModalComponent extends AppComponentBase implements AfterViewChecked, OnDestroy {

    @ViewChild('nameInput', { static: true }) nameInput: ElementRef;
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @ViewChild('tree', { static: false }) tree: MyTreeComponent;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    ToResource: boolean = true;
    uploadUrl: string;
    product: CreateProductInput = new CreateProductInput();
    tagSuggestion;
    tags: any[] = [];
    progress: number = 0;
    categoryList: any[] = [];
    categoryName: string = '';
    isDetail: boolean = false;
    areaMode: boolean = false;

    RedeemType = RedeemType;

    
    treeConfig: any = {
        'selectable': true,
        'singleSelect': false,
        'showIcon': true,
        'menu': false,
        'selecionMode': 2
    }
    clearBindFun = this.hideCateTree();
    constructor(
        injector: Injector,
        private _prodService: ProductServiceProxy,
        private _tagService: TagServiceProxy,
        private _tokenService: TokenService,
        private _cateService: ProductCategoryServiceProxy,
        private ref: ChangeDetectorRef
    ) {
        super(injector);
        // this._cateService.getCategoryTrees().subscribe((result) => {
        //     this.categoryList = result;
        // })
    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }
    ngOnDestroy() {
        this.clearBind();
    }
    show(): void {
        this.active = true;
        this.product.categorys = [];
        this.product.auditStatus = 0;
        this.product.pointRule = new ProductPointRule({
            "redeemRule": new RedeemRule({
                "pointRedeemable": false,
                "redeemType": RedeemType[0],
                "redeemAmount": 0,
                "cashAmount": 0
            }),
            "awardRule": new AwardRule({
                "pointAwardable": false,
                "awardAmount": 0
            })
        });
        this.modal.show();
    }
    clearBind() {
        $(document).off('click', this.clearBindFun);
    }
    onShown(): void {
        this.tags = [];
        if (this.nameInput) {
            $(this.nameInput.nativeElement).focus()
        }
        $(document).on('click', this.clearBindFun);
        this.hideCateTree()
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
                    str += (str ? ' | ' : '') + item.text;
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
    //筛选标签
    filter(event) {
        //获取标签下拉
        this._tagService.getTagsByType(event.query, void 0, 100, 0, Type.Product).subscribe((result) => {
            this.tagSuggestion = result.items;
        })
    }
    assignTags() {
        var tagString = [];
        this.tags.forEach((items) => {
            tagString.push(items.id);
        })
        this.product.tags = tagString;
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
                    self.product.material3DUrl = result.result.fileUri;
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
        this.product.material3DUrl = '';
    }
    save(): void {
        if (this.product.price2 && this.product.price2 < this.product.price) {
            return this.notify.warn(this.l('price2LessThenPrice'));
        }
        this._prodService.createProduct(this.product)
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
            });
    }
    close(): void {
        this.active = false;
        this.product = new CreateProductInput();
        this.modal.hide();
    }

    // upload completed event
    onUpload(result): void {
        this.product.picUrl = result.fileUri;
    }

    onBeforeSend(event): void {

    }
    showCateTree() {
        $("#ProductCategory>ul.dropdown-menu").show();
    }
}
