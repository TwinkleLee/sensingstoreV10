import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked, AfterViewInit } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { PropertyValueServiceProxy, CreatePropertyValueInput, UpdatePropertyValueInput } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';

@Component({
    selector: 'PropertyValueAlertModal',
    templateUrl: './selection-modal.component.html',
    styles: []
})
export class PropertyValueAlertModalComponent extends AppComponentBase {
    @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;
    saving: boolean = false;
    operation = 'add';
    propertyValue: any = {};
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    constructor(injecor: Injector, private proValueService: PropertyValueServiceProxy) {
        super(injecor);
    }

    save() {
        if (this.operation == 'add') {
            this.proValueService.create(new CreatePropertyValueInput(this.propertyValue)).subscribe((result) => {
                this.notify.info(this.l('success'));
                this.modalSave.emit(null);
            })
        } else {
            this.proValueService.update(new UpdatePropertyValueInput(this.propertyValue)).subscribe((result) => {
                this.notify.info(this.l('success'));
                this.modalSave.emit(null);
            })
        }
        this.modal.hide();
    }
    close(): void {
        this.modal.hide();
    }
    //弹出显示方法
    show(record?, id?) {
        if (record) {
            this.operation = 'edit';
            this.propertyValue = Object.assign({}, record);
        } else {
            this.operation = 'add';
            this.propertyValue = new CreatePropertyValueInput();
            this.propertyValue.propertyId = id;
        }
        this.modal.show()
    }
    //监听显示事件
    onShown() {

    }
    // upload completed event
    onUpload(result): void {
        this.propertyValue.iconUrl = result.fileUri;
    }


}
