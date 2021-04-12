import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';

import { ProductCategoryServiceProxy, CreateProductCategoryInput, UpdateProductCategoryInput } from '@shared/service-proxies/service-proxies-product';

import { OperationKnowledgeServiceProxy, CreateQuestionCategoryInput, UpdateQuestionCategoryInput } from '@shared/service-proxies/service-proxies3';
import { TenantServiceProxy } from '@shared/service-proxies/service-proxies';
import { ActivatedRoute, Router } from '@angular/router';

import { BrandServiceProxy,UpdateBrandCategoryInput,CreateBrandCategoryInput } from '@shared/service-proxies/service-proxies-devicecenter';

@Component({
    selector: 'createOrEditCateModal',
    templateUrl: './create-or-edit-cate-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})

export class CreateOrEditCateModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput',{static:true}) nameInput: ElementRef;
    @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;


    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    ToResource: boolean = true;
    uploadUrl: string;
    uploadedFiles: any[] = [];
    operation: string = "add";
    category: any = {};
    createProductCategory: CreateProductCategoryInput;
    updateProductCategory: UpdateProductCategoryInput;
    createQuestionCategoryInput: CreateQuestionCategoryInput;
    updateQuestionCategoryInput: UpdateQuestionCategoryInput;
    createBrandCategoryInput: CreateBrandCategoryInput;
    updateBrandCategoryInput: UpdateBrandCategoryInput;
    pCates: any[] = [];


    memberedOrganizationUnits: string[];


    type = '';
    tenantList: any = [];

    constructor(
        injector: Injector,
        private _cateService: ProductCategoryServiceProxy,
        private _OperationKnowledgeServiceProxy: OperationKnowledgeServiceProxy,
        private _tenantService: TenantServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _brandServiceProxy: BrandServiceProxy
    ) {

        super(injector);
    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(category?: any, f?): void {

        var urls = window.location.pathname.split('\/');
        this.type = urls[urls.length - 1]
        console.log(this.type)


        if (this.type == 'questionType') {
            this._tenantService.getTenants("", void 0, void 0, void 0, void 0, 0, false, void 0, 1000, 0).subscribe(result => {
                this.tenantList = result.items;
            })
        }

        this.active = true;
        if (f) {
            this.operation = "edit";

            if (this.type == 'category') {
                this._cateService.getSingleProductCategory(category.id).subscribe((result) => {
                    this.category = result;
                    this.category.parentCategoryName = this.category.parentCategoryName || 'None';
                })
            } else if (this.type == 'questionType') {
                // this.category = Object.assign({}, category);
                // this.category.parentCategoryName = this.category.parentCategoryName || 'None';
                this._OperationKnowledgeServiceProxy.getSingleQuestionCategory(category.id).subscribe((result) => {
                    this.category = result;
                    this.category.parentCategoryName = this.category.parentCategoryName || 'None';
                })
            } else if (this.type == 'brandCate') {
                this._brandServiceProxy.getSingleBrandCategory(category.id).subscribe((result) => {
                    this.category = result;
                    this.category.parentCategoryName = this.category.parentCategoryName || 'None';
                })
            }
        } else {
            this.operation = "add";
            this.category = {
                'parentCategoryId': category ? category.id : void 0,
                'parentCategoryName': category && category.text ? category.text : 'None'
            };


            this._activatedRoute.queryParams.subscribe(queryParams => {
                console.log('tenantId', queryParams.tenantId)
                this.category.tenantId = queryParams.tenantId;
            })
        }
        this.modal.show();
    }

    onShown(): void {
        if (this.nameInput) {
            $(this.nameInput.nativeElement).focus()
        }
    }

    save(): void {
        if (this.operation == "add") {
            if (this.type == 'category') {
                this.createProductCategory = new CreateProductCategoryInput(this.category);
                this._cateService.createProductCategory(this.createProductCategory)
                    .pipe(finalize(() => { this.saving = false; }))
                    .subscribe(() => {
                        this.notify.info(this.l('SavedSuccessfully'));
                        this.close();
                        this.modalSave.emit(null);
                    });
            } else if (this.type == 'questionType') {
                this.createQuestionCategoryInput = new CreateQuestionCategoryInput(this.category);
                this._OperationKnowledgeServiceProxy.createQuestionCategory(this.createQuestionCategoryInput)
                    .pipe(finalize(() => { this.saving = false; }))
                    .subscribe(() => {
                        this.notify.info(this.l('SavedSuccessfully'));
                        this.close();
                        this.modalSave.emit(null);
                    });
            } else if (this.type == 'brandCate') {
                this.createBrandCategoryInput = new CreateBrandCategoryInput(this.category);
                this._brandServiceProxy.createBrandCategory(this.createBrandCategoryInput)
                    .pipe(finalize(() => { this.saving = false; }))
                    .subscribe(() => {
                        this.notify.info(this.l('SavedSuccessfully'));
                        this.close();
                        this.modalSave.emit(null);
                    });
            }

        } else {
            if (this.type == 'category') {
                this.updateProductCategory = new UpdateProductCategoryInput(this.category);
                this._cateService.updateProductCategory(this.updateProductCategory)
                    .pipe(finalize(() => { this.saving = false; }))
                    .subscribe(() => {
                        this.notify.info(this.l('SavedSuccessfully'));
                        this.close();
                        this.modalSave.emit(null);
                    });
            } else if (this.type == 'questionType') {
                this.updateQuestionCategoryInput = new UpdateQuestionCategoryInput(this.category);
                this._OperationKnowledgeServiceProxy.updateQuestionCategory(this.updateQuestionCategoryInput)
                    .pipe(finalize(() => { this.saving = false; }))
                    .subscribe(() => {
                        this.notify.info(this.l('SavedSuccessfully'));
                        this.close();
                        this.modalSave.emit(null);
                    });

            } else if (this.type == 'brandCate') {
                this.updateBrandCategoryInput = new UpdateBrandCategoryInput(this.category);
                this._brandServiceProxy.updateBrandCategory(this.updateBrandCategoryInput)
                    .pipe(finalize(() => { this.saving = false; }))
                    .subscribe(() => {
                        this.notify.info(this.l('SavedSuccessfully'));
                        this.close();
                        this.modalSave.emit(null);
                    });
            }
        }
    }

    close(): void {
        this.active = false;
        this.category = {};
        this.modal.hide();
    }


    // upload completed event
    PictureOnUpload(result): void {
        this.category.imageUrl = result.fileUri;
    }
    IconOnUpload(result): void {
        this.category.iconUrl = result.fileUri;
    }
}
