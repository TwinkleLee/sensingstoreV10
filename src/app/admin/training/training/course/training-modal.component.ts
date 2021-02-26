import { Component, ViewChild, Injector, Output, Input, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import * as moment from 'moment';

import { TagServiceProxy, TagType as Type, LoginServiceProxy } from '@shared/service-proxies/service-proxies';
import { AutoGenerateTrainingInput, TrainingServiceProxy } from '@shared/service-proxies/service-proxies5';

@Component({
    selector: 'trainingModal',
    templateUrl: './training-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class SetTrainingModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput', { static: true }) nameInput: ElementRef;
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    tagSuggestion: any[];
    tags: any = '';

    lecturerSuggestion: any[] = [];
    lecturers: any = '';

    training: any = {};

    constructor(
        injector: Injector,
        private _TagServiceProxy: TagServiceProxy,
        private _TrainingServiceProxy: TrainingServiceProxy,
        private _LoginServiceProxy: LoginServiceProxy
    ) {
        super(injector);
    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        // $('tabset ul.nav').addClass('m-tabs-line');
        // $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(objItem?: any): void {
        this.tags = []
        this.lecturers = []
        this.training.startTime = moment().utc().endOf('day');
        this.active = true;
        this.modal.show();
    }

    onShown(): void {
        
    }

    save(): void {
        this.saving = true;

        this.training.startTime = this.training.startTime ? this.training.startTime.add(-(new Date().getTimezoneOffset() / 60), 'h') : undefined;

        console.log(this.training)
        this._TrainingServiceProxy.autoGenerateTrainingByTag(new AutoGenerateTrainingInput(this.training))
        .pipe(finalize(() => { this.saving = false; }))
        .subscribe(result => {
            console.log(result)
            this.notify.info(this.l('SavedSuccessfully'));
            this.close();
            this.modalSave.emit(null);
        })
    }

    //筛选tags
    //筛选标签
    filter(event) {
        //获取标签下拉
        this._TagServiceProxy.getTagsByType(event.query, undefined, 100, 0, Type.Other).subscribe((result) => {
            this.tagSuggestion = result.items;
        })
    }
    assignTags() {
        var tagTemp = []
        console.log(this.tags)
        this.training.courseTagId = this.tags.id
    }

    // 筛选讲师
    lecturerFilter (event) {
        this._LoginServiceProxy.getPlatformUsers(abp.session.tenantId).subscribe((result) => {
            this.lecturerSuggestion = (result || []).map((item) => {
                return {
                    'id': item.userId,
                    'value': item.userName
                }
            });;
            console.log(this.lecturerSuggestion)
        })
    }

    assignLecturer () {
        var temp: any = {}
        console.log(this.lecturers)
        this.training.userId = this.lecturers.id
    }

    close(): void {
        this.active = false;
        this.saving = false;
        this.modal.hide();
    }

}
