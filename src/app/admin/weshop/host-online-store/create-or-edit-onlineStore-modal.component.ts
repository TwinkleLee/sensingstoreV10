import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { ExternalAccessServiceProxy } from '@shared/service-proxies/service-proxies';
import { TenantServiceProxy } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'hostOnlineStoreModal',
    templateUrl: './create-or-edit-onlineStore-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class HostOnlineStoreModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput',{static:true}) nameInput: ElementRef;
    @ViewChild('createOrEditModal',{static:false}) modal: ModalDirective;


    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    operation: string = "add";
    shopItem: any;


    memberedOrganizationUnits: string[];

    tenantList: any = [];

    tenant: any = '';


    constructor(
        injector: Injector,
        private _ExternalAccessServiceProxy: ExternalAccessServiceProxy,
        private _tenantService: TenantServiceProxy
    ) {
        super(injector);
    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        // $('tabset ul.nav').addClass('m-tabs-line');
        // $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    filterTenant(event) {
        console.log(event.query);

        //获取标签下拉
        this._tenantService.getTenants(
            event.query,
            void 0,
            void 0,
            void 0,
            void 0,
            void 0,
            void 0,
            void 0,
            999,
            0).subscribe((result) => {
            this.tenantList = result.items;
        })
    }

    assignTenant () {
        this.shopItem.tenantId = this.tenant.id;
    }

    show(shopItem?: any): void {
        this.active = true;
        if (shopItem) {
            this.operation = "edit";
            this.shopItem = shopItem;
        } else {
            this.operation = "add";
            this.shopItem = {};
        }
        this.modal.show();
    }

    onShown(): void {

    }

    save(): void {
        this.saving = true;
        if (this.operation == "add") {
            console.log(this.shopItem);
            this._ExternalAccessServiceProxy.createShopForHost(this.shopItem)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(result => {
                    console.log(result)
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                })
        } else {
            // console.log(this.shopItem);
            // this._metaPhysicsService.updateMetaphysicsType(this.shopItem)
            // .pipe(finalize(() => {this.saving = false; }))
            // .subscribe(result=>{
            //     console.log(result)
            //     this.notify.info(this.l('SavedSuccessfully'));
            //     this.close();
            //     this.modalSave.emit(null);
            // })
        }
    }

    close(): void {
        this.active = false;
        this.shopItem = {};
        this.saving = false;
        this.modal.hide();
    }

}
