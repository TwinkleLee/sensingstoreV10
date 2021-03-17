import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import {ProductServiceProxy,CreatePropertyInput} from '@shared/service-proxies/service-proxies-product';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';


@Component({
    selector: 'propertyAddModal',
    templateUrl: './property-add-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class PropertyAddComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput',{static:true}) nameInput: ElementRef;
    @ViewChild('createModal',{static:true}) modal: ModalDirective;


    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    Property:any;
    CreatePropertyInput:CreatePropertyInput;
    memberedOrganizationUnits: string[];
    tagSelectList:any[];
    tagSuggestion:any[];



    constructor(
        injector: Injector,
        private _ProductServiceProxy: ProductServiceProxy
    ) {
        super(injector);
    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(): void {
            this.active = true;
            this.Property = new CreatePropertyInput();
            this.modal.show();
    }

    onShown(): void {
        if(this.nameInput){
            $(this.nameInput.nativeElement).focus()
        }
    }
    save(): void {
            this.CreatePropertyInput = new CreatePropertyInput(this.Property);
            this._ProductServiceProxy.createProperty(this.CreatePropertyInput)
            .pipe(finalize(() => {this.saving = false; }))
            .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
            });
    }

    close(): void {
        this.active = false;
        this.CreatePropertyInput = null;
        this.modal.hide();
    }
    // upload completed event
    onUpload(result): void {
        this.Property.iconUrl = result.fileUri;
    }

}
