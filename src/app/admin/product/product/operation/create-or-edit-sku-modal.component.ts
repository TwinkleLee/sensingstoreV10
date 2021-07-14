import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked, ChangeDetectorRef, OnInit, Input } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { ProductServiceProxy, TagServiceProxy, CreateSkuInput } from '@shared/service-proxies/service-proxies-product';

import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';


@Component({
    selector: 'createOrEditSkuModal',
    templateUrl: './create-or-edit-sku-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`, `.input-group-prepend span:hover{
            color:#308bd0;
        }`
    ]
})
export class CreateOrEditSkuModalComponent extends AppComponentBase implements AfterViewChecked, OnInit {

    @ViewChild('nameInput', { static: true }) nameInput: ElementRef;
    @ViewChild('createOrEditModal', { static: false }) modal: ModalDirective;

    @Input("editable") editable: boolean = true;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    ToResource: boolean = true;
    uploadUrl: string;
    sku: any = {};
    addOrEditInput: CreateSkuInput;
    tagSuggestion;
    tags: any[] = [];
    propertyList: any[] = [];
    mainProperty: any = {
        'propertyValues': []
    };
    haveMainProperty: boolean = false;
    selectProperty: any = '';
    addPropertyList: any[] = [];
    mainPropertyIds: any[] = [];
    areaMode: boolean = false;
    isDetail: boolean = false;
    constructor(
        injector: Injector,
        private _prodService: ProductServiceProxy,
        private _tagService: TagServiceProxy,
        private _ref: ChangeDetectorRef

    ) {
        super(injector);

    }
    ngOnInit(): void {

    }
    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(id): void {
        this.active = true;
        this.sku = {};
        this.sku.productId = id;
        /**
        * 待优化 : 当前使用获取1000条格式 然后过滤出是否显图属性
        */


        this._prodService.getPropertiesByProductId(this.sku.productId).subscribe((result) => {
            this.propertyList = result;
            this.propertyList.filter((item, index, ary) => {
                if (item.isDefaultDecideImage && this.mainProperty.id == void 0) {
                    this.mainProperty = ary.splice(index, 1)[0];
                    this.haveMainProperty = true;
                }
            })
        })

        this.mainPropertyIds = [];
        this.addPropertyList = [];
        this.selectProperty = '';
        this.modal.show();
    }

    onShown(): void {
        this.tags = [];
        if (this.nameInput) {
            $(this.nameInput.nativeElement).focus()
        }
    }
    //
    changeImage(v) {
        if (!this.mainProperty) { return; }
        this.mainPropertyIds;
        var mainProperty = this.mainProperty.propertyValues.filter((item) => {
            return item.id == v;
        })[0];
        this.sku.picUrl = mainProperty ? mainProperty.defaultImage : "";
    }
    //将添加的property返回可选列表
    deleteProperty(index) {
        this.propertyList = this.propertyList.concat(this.addPropertyList.splice(index, 1));
        this.mainPropertyIds.splice(index + 1, 1);
    }

    handleSelect() {
    }

    //选中property
    addProperty() {
        var select, index;
        if (!this.selectProperty) return;

        select = this.propertyList.find(i => i.propertyId == this.selectProperty);
        this.propertyList = this.propertyList.filter(i => i.propertyId != this.selectProperty)
        //固定添加sku  颜色  尺码  包装的顺序
        //54645      54646        54687

        if(this.addPropertyList.length!=0){//addlist不为空时判断
            if(select!=null&& select.propertyId==54645)//添加进来得id为 54645  即颜色时无条件放置数列首位
            {
                this.addPropertyList.unshift(select);
            }
            if(select!=null&& select.propertyId==54646)//添加进来得id为 54646  即尺码时
            {
                if(this.addPropertyList[0].propertyId==54645)//判断addlist 第一个是否为 54645  即颜色时插入到第二位
                {
                    this.addPropertyList.splice(1,0,select);
                }else{                                        //否则放置数组首位
                    this.addPropertyList.unshift(select);
                }
            }
            if(select!=null&& select.propertyId==54687)//添加进来得id为 54687  即包装时无条件放置数列末尾
            {
                this.addPropertyList.push(select);
            }
            this.mainPropertyIds=[]
        }else{
            this.addPropertyList.push(select);
            this.mainPropertyIds=[]
        }
        
        this.selectProperty = this.propertyList[0] && this.propertyList[0].propertyId;
        select.propertyValues[0] && this.mainPropertyIds.push(select.propertyValues[0].id);
    }


    //筛选标签
    filter(event) {
        //获取标签下拉
        this._tagService.getTags(event.query, void 0, 100, 0).subscribe((result) => {
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
    save(): void {
        this.sku.propertyValueIds = this.mainPropertyIds.filter((id) => {
            return id != void 0;
        }).map((id) => {
            return Number(id);
        });
        this.addOrEditInput = new CreateSkuInput(this.sku);

        console.log("this.addOrEditInput:",this.addOrEditInput);
        this._prodService.createSku(this.addOrEditInput)
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
            });
    }
    close(): void {
        this.propertyList = [];
        this.mainPropertyIds = [];
        this.selectProperty = '';
        this.mainProperty.propertyValues = [];


        this.active = false;
        this.sku = new CreateSkuInput();
        this.modal.hide();
    }

    // upload completed event
    onUpload(result): void {
        this.sku.picUrl = result.fileUri;
    }

    onBeforeSend(event): void {

    }
}
