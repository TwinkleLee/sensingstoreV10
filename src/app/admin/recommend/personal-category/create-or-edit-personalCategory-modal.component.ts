import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { MetaPhysicsServiceProxy } from '@shared/service-proxies/service-proxies4';

@Component({
    selector: 'createOrEditCatModal',
    templateUrl: './create-or-edit-personalCategory-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditCatModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput',{static:true}) nameInput: ElementRef;
    @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;


    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    uploadUrl: string;
    uploadedFiles: any[] = [];
    operation:string = "add";
    metaType:any;
    ToResource=true;


    memberedOrganizationUnits: string[];

    constructor(
        injector: Injector,
        private _metaPhysicsService: MetaPhysicsServiceProxy
    ) {
        super(injector);
        this.uploadUrl = AppConsts.remoteServiceBaseUrl + '/DemoUiComponents/UploadFiles';
    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        // $('tabset ul.nav').addClass('m-tabs-line');
        // $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(metaType?:any): void {
        this.active = true;
        if (metaType) {
            this.operation = "edit";
            this.metaType = metaType;
        }else{
            this.operation = "add";
            this.metaType = {};
        }
        this.modal.show();
    }

    onShown(): void {
        if(this.nameInput){
            $(this.nameInput.nativeElement).focus()
        }
    }

    save(): void {
        this.saving = true;
        if(this.operation=="add"){
            console.log(this.metaType);
            this._metaPhysicsService.createMetaPhysicsType(this.metaType)
            .pipe(finalize(() => {this.saving = false; }))
            .subscribe(result=>{
                console.log(result)
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
            })
        }else{
            console.log(this.metaType);
            this._metaPhysicsService.updateMetaphysicsType(this.metaType)
            .pipe(finalize(() => {this.saving = false; }))
            .subscribe(result=>{
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
        this.modal.hide();
    }

    
    // upload completed event
    onUpload(result): void {
        this.metaType.iconUrl = result.fileUri;
    }

    onBeforeSend(event): void {
    }
}
