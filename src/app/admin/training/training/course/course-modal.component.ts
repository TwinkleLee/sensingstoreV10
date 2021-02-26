import { Component, ViewChild, Injector, Output, Input, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective, ModalModule } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { CourseServiceProxy, CreateCourseInput, UpdateCourseInput } from '@shared/service-proxies/service-proxies5';
import { TagServiceProxy, TagType as Type } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'courseModal',
    templateUrl: './course-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditCourseModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput', { static: true }) nameInput: ElementRef;
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    operation: string = "add";
    objItem: any = {};

    tagSelectList: any[];
    tagSuggestion: any[];
    resourceSelection: any[] = [];
    tags: any[] = [];

    constructor(
        injector: Injector,
        private _TagServiceProxy: TagServiceProxy,
        private _CourseServiceProxy: CourseServiceProxy
    ) {
        super(injector);
    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        // $('tabset ul.nav').addClass('m-tabs-line');
        // $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(objItem?: any): void {
        this.active = true;
        if (objItem) {
            this.operation = "edit";
            this.objItem = objItem;
            console.log(objItem)
            this.tags = (objItem.courseTags || []).map((item) => {
                return {
                    'id': item.id,
                    'value': item.name
                }
            });
        } else {
            this.tags = [];
            this.operation = "add";
            this.objItem = {};
        }
        this.modal.show();
    }

    onShown(): void {
        
    }

    save(): void {
        this.saving = true;
        console.log(this.objItem);
        if (!this.objItem.id) {
            this._CourseServiceProxy.createCourse(new CreateCourseInput(this.objItem))
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(result => {
                    console.log(result)
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                })
        } else {
            this._CourseServiceProxy.updateCourse(new UpdateCourseInput(this.objItem))
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(result => {
                    console.log(result)
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                })
        }
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
        var tagString = [];
        this.tags.forEach((items) => {
            tagString.push(items.id);
        })
        this.objItem.tagIds = tagString;
    }

    close(): void {
        this.active = false;
        this.objItem = {};
        this.saving = false;
        this.modal.hide();
    }

}
