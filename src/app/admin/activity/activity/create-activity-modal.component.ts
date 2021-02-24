import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { ActivityServiceProxy, CreateBasicActivityInput, CommonServiceProxy, ActivityFromTemplateInput } from '@shared/service-proxies/service-proxies5';


@Component({
    selector: 'createActivityModal',
    templateUrl: './create-activity-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateActivityModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput',{static:true}) nameInput: ElementRef;
    @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;


    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    activityTemplate: any = "";
    templateList = [];
    name;
    ifFormalUse: boolean = true;

    organizationUnitId = "";
    operation: string = "add";
    activity: CreateBasicActivityInput = new CreateBasicActivityInput();
    ToResource = true;

    memberedOrganizationUnits: string[];

    constructor(
        injector: Injector,
        private _acitvityService: ActivityServiceProxy,
        private _commonService: CommonServiceProxy
    ) {
        super(injector);
    }

    ngAfterViewChecked(): void {
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(activity?: any): void {
        this._commonService.activityTemplateSelect().subscribe((r) => {
            console.log(r)
            this.templateList = r;
        })
        this.name = '';
        this.active = true;
        this.modal.show();
    }

    onShown(): void {

    }

    save(): void {
        this.saving = true;
        if (this.activityTemplate) {//从模板创建
            var activityTemplate = new ActivityFromTemplateInput({
                id: this.activityTemplate,
                name: this.name,
                isPublic: this.ifFormalUse,
                isTemplate: false,
            })
            console.log(this.activityTemplate)
            this._acitvityService.createActivityFromTemplate(activityTemplate)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(result => {
                    console.log(result)
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                })
        } else {//新建
            this.activity.name = this.name;
            this.activity.isPublic = this.ifFormalUse;
            this._acitvityService.createActivity(this.activity)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(result => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                })
        }

    }

    close(): void {
        this.activity = new CreateBasicActivityInput();
        this.active = false;
        this.saving = false;
        this.modal.hide();
    }

}
