import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { SkuRfidServiceProxy, CreateSkuRfidInput, UpdateSkuRfidInput } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { StoreServiceProxy as NewStoreServiceProxy,GetStorseListInput} from '@shared/service-proxies/service-proxies-devicecenter';


@Component({
    selector: 'createOrEditSkuRfidModal',
    templateUrl: './create-or-edit-skurfid-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditSkuRfidModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput', { static: true }) nameInput: ElementRef;
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('paginatorRes', { static: false }) paginatorRes: Paginator;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    operation: string = "add";
    skuRfid: any = {};
    UpdateSkuRfidInput: UpdateSkuRfidInput;
    CreateSkuRfidInput: CreateSkuRfidInput;
    showPreview = false;
    storeList: any = [];
    constructor(
        injector: Injector,
        private _skuRfidServiceProxy: SkuRfidServiceProxy,
        private _NewStoreServiceProxy: NewStoreServiceProxy,
    ) {
        super(injector);
        this._NewStoreServiceProxy.getStoresList(new GetStorseListInput({
            storeStatus: undefined,
            organizationUnitId: undefined,
            areas: undefined,
            filter: undefined,
            sorting: undefined,
            maxResultCount: 999,
            skipCount: 0
        }))
            .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
            .subscribe((result) => {
                this.storeList = result.items;
                if (this.storeList.length > 0) {
                    this.skuRfid.storeId = this.storeList[0].storeId;
                }
            })
    }


    ngOnInit(): void {

    }

    ngOnDestroy() {

    }


    ngAfterViewChecked(): void {
    }


    show(skuRfid?: any): void {
        this.active = true;
        if (skuRfid) {
            this.operation = "edit";
            this.skuRfid = skuRfid;
            console.log(this.skuRfid);
        } else {
            this.operation = "add";
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
            this.CreateSkuRfidInput =  new CreateSkuRfidInput(this.skuRfid);
            this._skuRfidServiceProxy.create(this.CreateSkuRfidInput)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        } else {
            this.UpdateSkuRfidInput = new UpdateSkuRfidInput(this.skuRfid);
            console.log(this.UpdateSkuRfidInput);
            this._skuRfidServiceProxy.update(this.UpdateSkuRfidInput)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        }
    }

    close(): void {
        this.active = false;
        // this.CreateSkuRfidInput = null;
        // this.UpdateSkuRfidInput = null;
        this.skuRfid = {};
        this.modal.hide();
    }




    onBeforeSend(event): void {

    }


}
