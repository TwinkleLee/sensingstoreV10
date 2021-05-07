import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { StoreServiceProxy, UpdateStoreKpiDtoInput, OrganizationUnitServiceProxy,UpdateOUKpiDtoInput } from '@shared/service-proxies/service-proxies-devicecenter';
import * as moment from 'moment';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'kpiModal',
    templateUrl: './kpi-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class KPIModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput', { static: true }) nameInput: ElementRef;
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    uploadUrl: string;
    uploadedFiles: any[] = [];
    operation: string = "add";
    metaType: any;
    ToResource = true;
    typeList = [];

    memberedOrganizationUnits: string[];
    interval;
    isStore = false;

    constructor(
        injector: Injector,
        private _StoreServiceProxy: StoreServiceProxy,
        private _OrganizationUnitServiceProxy: OrganizationUnitServiceProxy,
        private router: Router,
        private route: ActivatedRoute
    ) {
        super(injector);
        this.uploadUrl = AppConsts.remoteServiceBaseUrl + '/DemoUiComponents/UploadFiles';
    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(create, metaType?: any): void {
        console.log(metaType)

        this.route.queryParams.subscribe(queryParams => {
            if (queryParams.isStore) {
                this.isStore = true
            } else {
                this.isStore = false
            }
        })

        this.active = true;
        if (!create) {
            this.operation = "edit";
            this.metaType = metaType;

            if (this.metaType.kpiScale == 'Year') {
                this.metaType.scaleTime = moment(this.metaType.scaleTime).format('YYYY');
            } else if (this.metaType.kpiScale == 'Month') {
                this.metaType.scaleTime = moment(this.metaType.scaleTime).format('YYYY-MM');
            } else if (this.metaType.kpiScale == 'Day') {
                this.metaType.scaleTime = moment(this.metaType.scaleTime).format('YYYY-MM-DD');
            }

        } else {
            this.operation = "add";
            this.metaType = {};
            if (this.isStore) {
                console.log(1111);
                
                this.metaType.storeId = metaType.id;
                this.metaType.storeName = metaType.name
            } else {
                this.metaType.organizationUnitId = metaType.id;
            }
            this.metaType.ouOrStoreName = metaType.name;
            this.metaType.kpiScale = "Year";
        }



        if (this.isStore) {
            this._StoreServiceProxy.getKpiNames(this.metaType.storeId).subscribe(r => {
                this.typeList = r;
                // this.interval = setInterval(() => {
                //     if ($('.typeSelect .bs-searchbox input').val()) {
                //         this.metaType.name = $('.typeSelect .bs-searchbox input').val();
                //         $('.typeSelect>button>span.filter-option').html(this.metaType.name)
                //     }
                // }, 500)
            })
        } else {
            this._OrganizationUnitServiceProxy.getOrganizationUintKpiNames(this.metaType.organizationUnitId).subscribe(r => {
                this.typeList = r;
                // this.interval = setInterval(() => {
                //     if ($('.typeSelect .bs-searchbox input').val()) {
                //         this.metaType.name = $('.typeSelect .bs-searchbox input').val();
                //         $('.typeSelect>button>span.filter-option').html(this.metaType.name)
                //     }
                // }, 500)
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
        this.saving = true;
        if (this.operation == "add") {
            console.log(this.metaType);
            if (this.isStore) {
                this._StoreServiceProxy.createStoreKPI(this.metaType)
                    .pipe(finalize(() => { this.saving = false; }))
                    .subscribe(result => {
                        console.log(result)
                        this.notify.info(this.l('SavedSuccessfully'));
                        this.close();
                        this.modalSave.emit(null);
                    })
            } else {
                this._OrganizationUnitServiceProxy.createOrganizationUnitKPI(this.metaType)
                    .pipe(finalize(() => { this.saving = false; }))
                    .subscribe(result => {
                        console.log(result)
                        this.notify.info(this.l('SavedSuccessfully'));
                        this.close();
                        this.modalSave.emit(null);
                    })
            }

        } else {
            if (this.isStore) {
                this._StoreServiceProxy.updateStoreKPI(new UpdateStoreKpiDtoInput({
                    id: this.metaType.id,
                    storeId: this.metaType.organizationUnitId,
                    scaleTime: this.metaType.scaleTime,
                    kpiScale: this.metaType.kpiScale,
                    name: this.metaType.name,
                    value: this.metaType.value,
                    description: this.metaType.description
                }))
                    .pipe(finalize(() => { this.saving = false; }))
                    .subscribe(result => {
                        console.log(result)
                        this.notify.info(this.l('SavedSuccessfully'));
                        this.close();
                        this.modalSave.emit(null);
                    })
            } else {
                this._OrganizationUnitServiceProxy.updateOrganizationUnitKPI(new UpdateOUKpiDtoInput({
                    id: this.metaType.id,
                    organizationUnitId: this.metaType.organizationUnitId,
                    scaleTime: this.metaType.scaleTime,
                    kpiScale: this.metaType.kpiScale,
                    name: this.metaType.name,
                    value: this.metaType.value,
                    description: this.metaType.description
                }))
                    .pipe(finalize(() => { this.saving = false; }))
                    .subscribe(result => {
                        console.log(result)
                        this.notify.info(this.l('SavedSuccessfully'));
                        this.close();
                        this.modalSave.emit(null);
                    })
            }

        }
    }

    close(): void {
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.active = false;
        this.metaType = {};
        this.saving = false;
        this.modal.hide();
    }


    // upload completed event
    onUpload(result): void {
        this.metaType.iconUrl = result.fileUri;
    }

    onBeforeSend(event): void {
    }
}
