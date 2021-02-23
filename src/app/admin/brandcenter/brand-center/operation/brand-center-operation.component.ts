import { Component, ViewChild, Injector, EventEmitter, Output, ElementRef, ChangeDetectorRef, } from '@angular/core';
import { UpdateBrandInput, CreateBrandInput, BrandServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { Router } from '@angular/router';
import { BrandResourceModalComponent } from '@app/admin/brandcenter/brand-center/operation/brand-res-modal.component';
import { finalize } from 'rxjs/operators';
import { TagServiceProxy, TagType as Type } from '@shared/service-proxies/service-proxies';

import { MyTreeComponent } from '@app/shared/common/my-tree/my-tree.component';


@Component({
    selector: 'BrandOperation',
    templateUrl: './brand-center-operation.component.html',
    styleUrls: ['./brand-center-operation.component.css']
})
export class BrandOperationComponent extends AppComponentBase {

    @ViewChild('codeInput', { static: true }) codeInput: ElementRef;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    @ViewChild('BrandResourceModal', { static: true }) BrandResourceModal: BrandResourceModalComponent;
    @ViewChild('tree', { static: false }) tree: MyTreeComponent;


    active = false;
    saving = false;
    operation: string = "add";
    brand: any = {};
    UpdateBrandInput: UpdateBrandInput;
    CreateBrandInput: CreateBrandInput;
    resourceSelection: any[] = [];
    resFilter: string = '';

    categoryList: any[] = [];
    categoryName: string = '';
    isDetail: boolean = false;
    areaMode: boolean = false;
    treeConfig: any = {
        'selectable': true,
        'singleSelect': false,
        'showIcon': true,
        'menu': false,
        'selecionMode': 2
    }

    clearBindFun = this.hideCateTree();


    tags: any[] = [];
    tagSuggestion;

    constructor(
        injector: Injector,
        private _brandService: BrandServiceProxy,
        private router: Router,
        private _ref: ChangeDetectorRef,
        private _tagService: TagServiceProxy,
    ) {
        super(injector);
        this.initMessage();
        //获取标签下拉
        this._tagService.getTagsByType(undefined, undefined, 100, 0, Type['Brand']).subscribe((result) => {
            this.tagSuggestion = result.items;
        })
        
    }

    ngOnInit () {
        this._brandService.getBrandCategoryTrees().subscribe((result) => {
            console.log(result)
            this.categoryList = result;
            this.tree.initSelection(this.brand.categorys || [], this.categoryList);
        })
        $(document).on('click', this.clearBindFun);
    }

    ngOnDestroy() {
        $(document).off('click', this.clearBindFun);
    }


    //初始化
    initMessage() {
        var urls = location.pathname.split('\/'), id;
        id = urls[urls.length - 1];
        if (!(/\d+/.test(id))) {
            this.operation = "add";
            this.brand = new CreateBrandInput();
            this.brand.mainColor = "#aaa";
            return;
        }
        this.operation = "edit";
        this.brand.id = id;
        abp.ui.setBusy();

        this._brandService.getSingle(id, undefined).pipe(finalize(() => {
            abp.ui.clearBusy();
        })).subscribe((result) => {

            this.brand = result;
            var chosen = [];
            this.brand.b_BrandCategories.forEach((item) => {
                chosen.push(item.id);
                this.categoryName += (this.categoryName ? " | " : "") + item.name;
            })

            this.brand.categorys = chosen;
 
            this.tree.initSelection(chosen);

            this.tags = this.brand.brandTags.map((item) => {
                return {
                    'id': item.id,
                    'value': item.name
                }
            }) || [];
        })
    }

    //筛选标签
    filter(event) {
        //获取标签下拉
        this._tagService.getTagsByType(event.query, undefined, 100, 0, Type.Brand).subscribe((result) => {
            this.tagSuggestion = result.items;
        })
    }
    assignTags() {
        console.log(this.tags)
        var tagString = [];
        this.tags.forEach((items) => {
            tagString.push(items.id);
            // tagString.push({ id: items.id, name: items.value });

        })
        // this.brand.brandTags = tagString;
        this.brand.tagIds = tagString;
        console.log(this.brand.brandTags)
    }

    hideCateTree() {
        return function (e) {
            if (e.target.id != 'categoryName' && $(e.target).closest('ul.dropdown-menu').length == 0) {
                if (!$("#BrandCategory>ul.dropdown-menu").is(":visible")) {
                    return true;
                }
                $("#BrandCategory>ul.dropdown-menu").hide();
                var chosen = this.tree.getchosen(), str = '',
                    ids = this.tree.getchosenIds();
                chosen.forEach((item) => {
                    str += (str ? ' | ' : '') + item.text;
                })
                if (chosen) {
                    setTimeout(() => {
                        this.categoryName = str;
                    }, 0)
                    this.brand.categorys = ids;
                } else {
                    setTimeout(() => {
                        this.categoryName = '';
                    }, 0)
                    this.brand.categorys = [];
                }
            }
        }.bind(this);
    }


    back() {
        this.router.navigate(['app', 'admin', 'brandcenter', 'brandCenter']);
    }
    save() {
        console.log(this.brand)
        this.saving = true;
        if (this.operation == "add") {
            this.CreateBrandInput = new CreateBrandInput(this.brand);
            this._brandService.create(this.CreateBrandInput).pipe(finalize(() => {
                this.saving = false;
            })).subscribe((result) => {
                this.notify.info(this.l('success'));
                this.back();
            })
        } else {
            this.UpdateBrandInput = new UpdateBrandInput(this.brand);
            this._brandService.update(this.UpdateBrandInput).pipe(finalize(() => {
                this.saving = false;
            })).subscribe((result) => {
                this.notify.info(this.l('success'));
                this.back();
            })
        }
    }
    onUploadLogo(e) {
        this.brand.logoUrl = e.fileUri;
    }
    onUploadImage(e) {
        this.brand.imageUrl = e.fileUri;
    }
    //资源列表
    getResByBrandId(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }
        this.primengTableHelper.showLoadingIndicator();
        this._brandService.getBrandResources(
            this.brand.id,
            this.resFilter,
            undefined,
            this.primengTableHelper.getMaxResultCount(this.paginator, event),
            this.primengTableHelper.getSkipCount(this.paginator, event)
        ).pipe(finalize(() => {
            this.primengTableHelper.hideLoadingIndicator();
        })).subscribe(result => {
            this.primengTableHelper.totalRecordsCount = result.totalCount;
            this.primengTableHelper.records = result.items;
            this.primengTableHelper.hideLoadingIndicator();
        });
    }
    createResource() {
        this.BrandResourceModal.show(this.brand.id);
    }
    deleteResource(record) {
        this.message.confirm(this.l('deletethisresource'), this.l('AreYouSure'), (r) => {
            if (r) {
                this._brandService.deleteBrandResource(record.id).subscribe(() => {
                    this.notify.success(this.l('success'));
                    this.getResByBrandId();
                })
            }
        })
    }
    deleteResources() {
        var ids = this.resourceSelection.map((item) => {
            return item.id;
        })
        if (ids.length == 0) {
            return this.notify.warn(this.l('atLeastChoseOneItem'));
        }
        this.message.confirm(this.l('deletethisresources'), this.l('AreYouSure'), (r) => {
            if (r) {
                this._brandService.deleteBrandResources(ids).subscribe(() => {
                    this.notify.success(this.l('success'));
                    this.getResByBrandId();
                })
            }
        })
    }
    onOperateResource(e) {
        if (e.action == "info") {
            this.BrandResourceModal.show(this.brand.id, e.image);
        } else {
            this.deleteResource(e.image);
        }
    }

    showCateTree() {
        $("#BrandCategory>ul.dropdown-menu").show();
    }
}
