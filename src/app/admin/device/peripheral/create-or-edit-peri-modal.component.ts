import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { PeripheralDto,PeripheralServiceProxy,CreatePeripheralInput,UpdatePeripheralInput } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';


import * as _ from 'lodash';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'createOrEditPerModal',
    templateUrl: './create-or-edit-peri-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditPerModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput',{static:true}) nameInput: ElementRef;
    @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;


    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    ToResource:boolean=true;
    uploadUrl: string;
    uploadedFiles: any[] = [];
    operation:string = "add";
    peripheral:any;
    createPeripheral: CreatePeripheralInput;
    updatePeripheral: UpdatePeripheralInput;


    memberedOrganizationUnits: string[];

    constructor(
        injector: Injector,
        private _periService: PeripheralServiceProxy
    ) {
        super(injector);
        this.uploadUrl = AppConsts.remoteServiceBaseUrl + '/DemoUiComponents/UploadFiles';
    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(peripheral?:any): void {
        this.active = true;
        if (peripheral) {
            this.operation = "edit";
            this.peripheral = peripheral;
        }else{
            this.operation = "add";
            this.peripheral = {};
        }
        this.modal.show();
    }

    onShown(): void {
        if(this.nameInput){
            $(this.nameInput.nativeElement).focus()
        }
    }

    save(): void {
        if(this.operation=="add"){
            this.createPeripheral = this.peripheral as CreatePeripheralInput;
            this._periService.createPeripheral(this.createPeripheral)
            .pipe(finalize(() => {this.saving = false; }))
            .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
            });
        }else{
            this.updatePeripheral = this.peripheral as UpdatePeripheralInput;
            this._periService.updatePeripheral(this.updatePeripheral)
            .pipe(finalize(() => {this.saving = false; }))
            .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
            });
        }   
    }

    close(): void {
        this.active = false;
        this.peripheral = {};
        this.modal.hide();
    }

    
    // upload completed event
    onUpload(result): void {
        this.peripheral.iconUrl = result.fileUri;
    }

    onBeforeSend(event): void {

    }
}
