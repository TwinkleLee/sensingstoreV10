import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { OperationKnowledgeServiceProxy } from '@shared/service-proxies/service-proxies3';
import { TenantServiceProxy } from '@shared/service-proxies/service-proxies';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'createOrEditSolCatModal',
    templateUrl: './create-or-edit-solutionCategory-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditSolCatModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput',{static:true}) nameInput: ElementRef;
    @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;


    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    operation: string = "add";
    metaType: any;


    categoryId;
    categorys: any = [];

    questionTypeIdWhenAdd;
    tenantList: any = [];

    constructor(
        injector: Injector,
        private _KnowledgeCategoryServiceProxy: OperationKnowledgeServiceProxy,
        private _tenantService: TenantServiceProxy,
        private _activatedRoute: ActivatedRoute,


    ) {
        super(injector);
    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(metaType?: any): void {
        this.active = true;
        if (metaType) {
            this.operation = "edit";
            this.metaType = metaType;
        } else {

            this.operation = "add";
            this.metaType = {};

            this._activatedRoute.queryParams.subscribe(queryParams => {
                // this.tenantId = queryParams.tenantId;
                console.log('tenantId', queryParams.tenantId)
                this.metaType.tenantId = queryParams.tenantId;
            })

        }
        this._tenantService.getTenants("", undefined, undefined, undefined, undefined, 0, false, undefined, 1000, 0).subscribe(result => {
            this.tenantList = result.items;
        })
        this.getQuestionCategories()
        this.modal.show();
    }

    onShown(): void {
        if (this.nameInput) {
            $(this.nameInput.nativeElement).focus()
        }
    }
    getQuestionCategories() {
        this._KnowledgeCategoryServiceProxy.getQuestionCategories(this.metaType.tenantId, undefined, undefined, 999, 0).subscribe(r => {
            this.categorys = r.items;
            if (this.metaType.categoryId) {
                this.categoryId = this.metaType.categoryId;
            }
            if (this.questionTypeIdWhenAdd) {
                this.categoryId = this.questionTypeIdWhenAdd;
            }

        })
    }

    save(): void {
        this.saving = true;
        this.metaType.categoryId = this.categoryId;
        if (this.operation == "add") {
            console.log(this.metaType);
            this._KnowledgeCategoryServiceProxy.createOptKnowledge(this.metaType)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(result => {
                    console.log(result)
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                })
        } else {
            console.log(this.metaType);
            this._KnowledgeCategoryServiceProxy.updateOptKnowledge(this.metaType)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(result => {
                    console.log(result)
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                })
        }
    }

    close(): void {
        this.active = false;
        this.metaType = {};
        this.saving = false;
        this.categoryId = '';
        this.categorys = [];
        this.questionTypeIdWhenAdd = null;
        this.modal.hide();
    }


    onBeforeSend(event): void {
    }
}
