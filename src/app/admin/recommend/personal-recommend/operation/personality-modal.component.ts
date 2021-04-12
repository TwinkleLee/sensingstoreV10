import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';
import { UpdateMetaPhysicsInput, CreateMetaPhysicsInput, MetaPhysicsServiceProxy } from '@shared/service-proxies/service-proxies4';
import * as moment from 'moment';

@Component({
    selector: 'PersonalityModal',
    templateUrl: './personality-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class PersonalityModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput',{static:true}) nameInput: ElementRef;
    @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    operation: string = "add";
    Personality: any={};
    UpdateMetaPhysicsInput: UpdateMetaPhysicsInput;
    CreateMetaPhysicsInput: CreateMetaPhysicsInput;
    //下拉
    types:any[]=[];

    constructor(
        injector: Injector,
        private _PersonalityService: MetaPhysicsServiceProxy
    ) {
        super(injector);

        this.Personality.type="";
        
    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    
    


    show(Personality?: any): void {
        this._PersonalityService.getMetaPhysicsTypes(void 0,void 0,100,0).subscribe((r) => {
            this.types = r.items;
            this.active = true;
            if (Personality) {
                this.operation = "edit";
                this.Personality = Personality;
            } else {
                this.operation = "add";
                this.Personality = new CreateMetaPhysicsInput();
                this.Personality.themeColor = '#0000ff';
                this.Personality.startTime = moment();
                this.Personality.endTime = moment();
            }
            this.modal.show();

        })

    }

    onShown(): void {
        if (this.nameInput) {
            $(this.nameInput.nativeElement).focus()
        }
    }

    save(): void {
        this.saving = true;
        if(this.Personality.startTime&&this.Personality.endTime){
            this.Personality.startTime = this.Personality.startTime.add(-(new Date().getTimezoneOffset()/60),'h');
            this.Personality.endTime = this.Personality.endTime.add(-(new Date().getTimezoneOffset()/60),'h');
        }

        if (this.operation == "add") {
            this.CreateMetaPhysicsInput = new CreateMetaPhysicsInput(this.Personality);
            this._PersonalityService.createMetaPhysics(this.CreateMetaPhysicsInput)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(() => {
                    this.modalSave.emit(null);
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                });
        } else {
            this.UpdateMetaPhysicsInput = new UpdateMetaPhysicsInput(this.Personality);
            this._PersonalityService.updateMetaphysics(this.UpdateMetaPhysicsInput)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(() => {
                    this.modalSave.emit(null);
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                });
        }
    }

    close(): void {
        this.active = false;
        this.CreateMetaPhysicsInput = null;
        this.UpdateMetaPhysicsInput = null;
        this.saving = false;
        this.modal.hide();
    }
    // upload completed event
    imageOnUpload(result): void {
        this.Personality.picUrl = result.fileUri;
    }
    logoOnUpload(result): void {
        this.Personality.logoUrl = result.fileUri;
    }
}
