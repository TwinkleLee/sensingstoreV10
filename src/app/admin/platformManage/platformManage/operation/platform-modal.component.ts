import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';
import { TaobaoOpenPlatformServiceProxy } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'platformModal',
    templateUrl: './platform-modal.component.html'
})
export class PlatformModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput',{static:true}) nameInput: ElementRef;
    @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    operation: string = "add";
    Platform: any;

    constructor(
        injector: Injector,
        private _TaobaoOpenPlatformServiceProxy: TaobaoOpenPlatformServiceProxy
    ) {
        super(injector);
    }


    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(Platform?: any): void {
        this.modal.show();
        if (Platform) {
            this.operation = "edit";
            this.Platform = Object.assign({}, Platform);
        } else {
            this.Platform = {};
            this.operation = "add";
        }
        this.active = true;
    }


    onShown(): void {

    }


    save(): void {
        this.saving = true;
        if (this.operation == "add") {
            this._TaobaoOpenPlatformServiceProxy.createTaobaoOpenPlatform(this.Platform)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        } else {
            this._TaobaoOpenPlatformServiceProxy.updateTaobaoOpenPlatform(this.Platform)
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
        this.saving = false;
        this.Platform = {};
        this.modal.hide();
    }


    imageOnUpload(result): void {
        this.Platform.icon = result.fileUri;
    }
}
