import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked, Input } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { ProductServiceProxy, CreateProductCommentInput, UpdateProductCommentInput } from '@shared/service-proxies/service-proxies-product';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
// import { moment } from 'ngx-bootstrap/chronos/test/chain';
import * as moment from 'moment';
import { finalize } from 'rxjs/operators';


@Component({
    selector: 'createOrEditCommentsModal',
    templateUrl: './create-or-edit-comments-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditCommentsModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput',{static:true}) nameInput: ElementRef;
    @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;

    // @ViewChild('SampleDatePicker') sampleDatePicker: ElementRef;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    @Input("editable") editable: boolean = true;
    active = false;
    saving = false;
    comment: any = {};
    createInput: CreateProductCommentInput;
    updateInput: UpdateProductCommentInput;
    operationType = "add";

    constructor(
        injector: Injector,
        private _prodService: ProductServiceProxy
    ) {
        super(injector);

    }
    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(id, comment?): void {
        this.active = true;
        if (comment) {
            this.operationType = "edit";
            this.comment = comment;
        } else {
            this.operationType = "add";
            this.comment = {};
            this.comment.productId = id;
            this.comment.commentDateTime = moment().utc();
        }
        this.modal.show();
    }

    onShown(): void {
        if (this.nameInput) {
            $(this.nameInput.nativeElement).focus()
        }
        // default date picker
        // $(this.sampleDatePicker.nativeElement).datetimepicker({
        //     locale: abp.localization.currentLanguage.name,
        //     format: 'L'
        // });
    }
    save(): void {
        this.saving = true;
        // this.comment.commentDateTime = moment($(this.sampleDatePicker.nativeElement).data('DateTimePicker').date().format('YYYY-MM-DDTHH:mm:ssZ'));
        this.comment.commentDateTime= this.comment.commentDateTime ? moment(this.comment.commentDateTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h') : void 0;
        if (this.operationType == "add") {
            this.createInput = new CreateProductCommentInput(this.comment);
            this._prodService.addProductComments(this.createInput).pipe(finalize(() => {
                this.saving = false;
            })).subscribe((result) => {
                this.modalSave.emit();
                this.notify.info(this.l('success'));
                this.modal.hide();
            })
        } else if (this.operationType == "edit") {
            this.updateInput = new UpdateProductCommentInput(this.comment);
            this._prodService.updateProductComment(this.updateInput).pipe(finalize(() => {
                this.saving = false;
            })).subscribe((result) => {
                this.modalSave.emit();
                this.notify.info(this.l('success'));
                this.modal.hide();
            })
        }
    }
    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
