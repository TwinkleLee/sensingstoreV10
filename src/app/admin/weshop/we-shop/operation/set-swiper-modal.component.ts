import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { ShopServiceProxy, CreateShopSliderInput, UpdateShopSliderInput } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'SwiperModal',
    templateUrl: './set-swiper-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class SwiperModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput' ,{static:true}) nameInput: ElementRef;
    @ViewChild('createOrEditModal' ,{static:true}) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    operation: string = "add";
    swiper: any;

    constructor(
        injector: Injector,
        private _ShopServiceProxy: ShopServiceProxy
    ) {
        super(injector);
    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }


    show(swiper?: any): void {
        this.active = true;
        if (swiper) {
            this.operation = "edit";
            this.swiper = swiper;
        } else {
            this.operation = "add";
            this.swiper = {};

        }
        this.modal.show();
    }

    onShown(): void {

    }

    save(): void {
        this.saving = true;
        if (this.operation == "add") {
            this._ShopServiceProxy.createShopSlider(new CreateShopSliderInput(this.swiper))
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        }
        else {
            this._ShopServiceProxy.updateShopSlider(this.swiper as UpdateShopSliderInput)
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
        this.swiper = {};
        this.modal.hide();
    }


    // upload completed event
    onUpload(result): void {
        this.swiper.pictureUrl = result.fileUri;
    }

    onBeforeSend(event): void {
    }
}
