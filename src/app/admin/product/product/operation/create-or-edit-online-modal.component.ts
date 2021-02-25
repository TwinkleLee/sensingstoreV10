import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked, Input } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { ProductServiceProxy, CreateProductOnlineInfoInput, UpdateProductOnlineInfoInput, } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';


@Component({
    selector: 'createOrEditOnlineModal',
    templateUrl: './create-or-edit-Online-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditOnlineModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput',{static:true}) nameInput: ElementRef;
    @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;
    @ViewChild('llllll',{static:false}) llllll: ElementRef;

    @Input("editable") editable: boolean = true;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    onlineStore: any = {};
    storeTypes: any[] = [];
    createInput: CreateProductOnlineInfoInput;
    updateInput: UpdateProductOnlineInfoInput;
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

    show(id, onlineStore?): void {
        this.active = true;
        if (onlineStore) {
            this.operationType = "edit";
            this.onlineStore = onlineStore;

        } else {
            this.operationType = "add";
            this.onlineStore = {};
            this.onlineStore.productId = id;
        }
        this.modal.show();
    }

    onShown(): void {
        if (this.nameInput) {
            $(this.nameInput.nativeElement).focus()
        }
    }
    save(): void {
        this.onlineStore.onlineStoreName = this.llllll.nativeElement.value

        this.saving = true;
        if (this.operationType == "add") {
            this.createInput = new CreateProductOnlineInfoInput(this.onlineStore);
            this._prodService.addProductOnlinestoreInfo(this.createInput).pipe(finalize(() => {
                this.saving = false;
            })).subscribe((result) => {
                this.modalSave.emit();
                this.notify.info(this.l('success'));
                this.modal.hide();
            })
        } else if (this.operationType == "edit") {
            this.updateInput = new UpdateProductOnlineInfoInput(this.onlineStore);
            this._prodService.updateProductOnlinestoreInfo(this.updateInput).pipe(finalize(() => {
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
