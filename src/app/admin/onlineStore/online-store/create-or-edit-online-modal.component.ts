import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { CreateExternalAccessInput, UpdateExternalAccessInput, ExternalAccessServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';


@Component({
    selector: 'createOrEditExternalAccessModal',
    templateUrl: './create-or-edit-online-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditExternalAccessModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput',{static:false}) nameInput: ElementRef;
    @ViewChild('createOrEditModal',{static:false}) modal: ModalDirective;


    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    operation: string = "add";
    onlinestore: any = {};
    createonlinestore: CreateExternalAccessInput;
    editonlinestore: UpdateExternalAccessInput;

    constructor(
        injector: Injector,
        private _externalaccessService: ExternalAccessServiceProxy
    ) {
        super(injector);
    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(onlinestore?: any): void {
        this.active = true;
        if (onlinestore) {
            this.operation = "edit";
            this.onlinestore = onlinestore;
        } else {
            this.operation = "add";
            this.onlinestore = {};
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
            this.createonlinestore = new CreateExternalAccessInput(this.onlinestore);
            this._externalaccessService.addExternalAccess(this.createonlinestore)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        } else {
            this.editonlinestore = new UpdateExternalAccessInput(this.onlinestore)
            this._externalaccessService.updateExternalAccess(this.editonlinestore)
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
        this.modal.hide();
    }
}
