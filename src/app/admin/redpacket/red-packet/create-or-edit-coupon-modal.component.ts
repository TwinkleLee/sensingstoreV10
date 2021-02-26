import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { CouponServiceProxy, CreateCouponInput, UpdateCouponInput } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'createOrEditCouponModal',
    templateUrl: './create-or-edit-coupon-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditCouponModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput',{static:true}) nameInput: ElementRef;
    @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;


    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    ToResource: boolean = true;
    uploadUrl: string;
    uploadedFiles: any[] = [];
    operation: string = "add";
    coupon: any;
    createCoupon: CreateCouponInput;
    updateCoupon: UpdateCouponInput;


    memberedOrganizationUnits: string[];

    constructor(
        injector: Injector,
        private _couponService: CouponServiceProxy
    ) {
        super(injector);
    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(coupon?: any): void {
        this.active = true;
        if (coupon) {
            this.operation = "edit";
            this.coupon = coupon;
        } else {
            this.operation = "add";
            this.coupon = {
                'start_time': new Date(),
                'end_time': new Date()
            };
        }
        this.modal.show();
    }

    onShown(): void {
        if (this.nameInput) {
            $(this.nameInput.nativeElement).focus()
        }
    }

    save(): void {
        if (this.operation == "add") {
            this.createCoupon = this.coupon as CreateCouponInput;
            this._couponService.createCoupon(this.createCoupon)
            .pipe(finalize(() => {this.saving = false; }))
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        } else {
            this.updateCoupon = this.coupon as UpdateCouponInput;
            this._couponService.updateCoupon(this.updateCoupon)
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
        this.coupon = {
            'start_time': new Date(),
            'end_time': new Date()
        };
        this.modal.hide();
    }


    // upload completed event
    onUpload(result): void {
        this.coupon.pictures = result.fileUri;
    }

    onBeforeSend(event): void {

    }
}
