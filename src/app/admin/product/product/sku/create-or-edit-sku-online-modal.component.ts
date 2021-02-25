import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked, Input } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { ProductServiceProxy, CreateSkuOnlineInfoInput, UpdateSkuOnlineInfoInput, } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';


@Component({
    selector: 'createOrEditSkuOnlineModal',
    templateUrl: './create-or-edit-sku-online-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditSkuOnlineModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput',{static:true}) nameInput: ElementRef;
    @ViewChild('llllll',{static:false}) llllll: ElementRef;
    @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;


    @Input('editable') editable: boolean = true;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    onlineStore: any = {};
    storeTypes: any[] = [];
    createInput: CreateSkuOnlineInfoInput;
    updateInput: UpdateSkuOnlineInfoInput;
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
            this.onlineStore.skuId = id;
        } else {
            this.operationType = "add";
            this.onlineStore = {};
            this.onlineStore.skuId = id;
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
            this.createInput = new CreateSkuOnlineInfoInput(this.onlineStore);
            this._prodService.addSkuOnlinestoreInfo(this.createInput).pipe(finalize(() => {
                this.saving = false;
            })).subscribe((result) => {
                this.modalSave.emit();
                this.notify.info(this.l('success'));
                this.modal.hide();
            })
        } else if (this.operationType == "edit") {
            this.updateInput = new UpdateSkuOnlineInfoInput(this.onlineStore);
            this._prodService.updateSkuOnlinestoreInfo(this.updateInput).pipe(finalize(() => {
                this.saving = false;
            })).subscribe((result) => {
                this.modalSave.emit();
                this.notify.info(this.l('success'));
                this.modal.hide();
            })
        }

    }

    modalChange() {
        console.log(123)
    }
    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
