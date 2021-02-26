import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';
import { MetaPhysicsServiceProxy, DateMetaPhysicsServiceProxy, CreateRecommendInput } from '@shared/service-proxies/service-proxies4';
import { FaceTagsServiceProxy, CreateFaceTagInput, UpdateFaceTagInput } from '@shared/service-proxies/service-proxies4';

@Component({
    selector: 'faceModal',
    templateUrl: './face-modal.component.html',
    styleUrls: ['./face-modal.component.css']
})
export class FaceModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput',{static:true}) nameInput: ElementRef;
    @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;
    @ViewChild('SampleDatePicker',{static:true}) sampleDatePicker: ElementRef;
    @ViewChild('TypeCombobox',{static:true}) typeComboboxElement: ElementRef;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    operation: string = "add";
    Fortune: any;
    metaNameSelectList = [];

    UpdateFaceTagInput: UpdateFaceTagInput;
    CreateFaceTagInput: CreateFaceTagInput;

    constructor(
        injector: Injector,
        private _metaService: MetaPhysicsServiceProxy,
        private _fortuneService: DateMetaPhysicsServiceProxy,
        private _FaceTagsServiceProxy: FaceTagsServiceProxy
    ) {
        super(injector);

    }


    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(FortuneID?: any): void {
        this.Fortune = { recommends: [] };
        this.modal.show();
        if (FortuneID) {
            this.operation = "edit";
            this._FaceTagsServiceProxy.getFaceTagById(FortuneID).subscribe(result => {
                this.Fortune = Object.assign({}, result);
            });
        } else {
            this.operation = "add";
        }
        this.active = true;
    }


    onShown(): void {

    }


    save(): void {
        this.saving = true;
        if (this.operation == "add") {
            this.CreateFaceTagInput = new CreateFaceTagInput(this.Fortune);
            this._FaceTagsServiceProxy.createFaceTag(this.CreateFaceTagInput)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        } else {
            this.UpdateFaceTagInput = new UpdateFaceTagInput(this.Fortune);
            this._FaceTagsServiceProxy.updateFaceTag(this.UpdateFaceTagInput)
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
        this.CreateFaceTagInput = null;
        this.UpdateFaceTagInput = null;
        this.saving = false;
        this.modal.hide();
    }

    createRecommend() {
        this.Fortune.recommends.push(new CreateRecommendInput());
    }

    deleteRecord(i) {
        this.Fortune.recommends.splice(i, 1);
    }

    imageOnUpload(result): void {
        this.Fortune.iconUrl = result.fileUri;
    }
}
