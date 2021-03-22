import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { ToolBoxServiceProxy } from '@shared/service-proxies/service-proxies-ads';

@Component({
    selector: 'createOrEditCustomComponentModal',
    templateUrl: './create-or-edit-customComponent-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditCustomComponentModalComponent extends AppComponentBase {

    @ViewChild('nameInput', { static: true }) nameInput: ElementRef;
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    operation: string = "add";
    customItem: any;

    memberedOrganizationUnits: string[];

    constructor(
        injector: Injector,
        private _ToolBoxServiceProxy: ToolBoxServiceProxy
    ) {
        super(injector);
    }

    show(customItem?: any): void {
        this.active = true;
        if (customItem) {
            this.operation = "edit";
            this.customItem = customItem;
        } else {
            this.operation = "add";
            this.customItem = {
                category: 1,
                enabled: true
            };
        }
        this.modal.show();
    }

    onShown(): void {

    }

    changeCategory() {
        return
        // this.customItem.category = 1 - this.customItem.category;
    }

    save(): void {
        this.saving = true;
        console.log(this.customItem);
        this._ToolBoxServiceProxy.createOrUpdateTool(this.customItem.id, this.customItem)
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe(result => {
                console.log(result)
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
            })
    }

    close(): void {
        this.active = false;
        this.customItem = {};
        this.saving = false;
        this.modal.hide();
    }


    // upload completed event
    onUpload(result, attr): void {
        this.customItem[attr] = result.fileUri;
    }

}
