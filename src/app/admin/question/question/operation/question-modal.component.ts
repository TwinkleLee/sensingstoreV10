import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';
import { QuestionServiceProxy, CreateQuestionInput, UpdateQuestionInput, QuestionItemDto } from '@shared/service-proxies/service-proxies5';
import { TagServiceProxy, TagType as Type } from '@shared/service-proxies/service-proxies5';

@Component({
    selector: 'questionModal',
    templateUrl: './question-modal.component.html',
    // styleUrls: ['./question-modal.component.css']
})
export class QuestionModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput', { static: true }) nameInput: ElementRef;
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('SampleDatePicker', { static: true }) sampleDatePicker: ElementRef;
    @ViewChild('TypeCombobox', { static: true }) typeComboboxElement: ElementRef;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    operation: string = "add";
    Question: any;
    metaNameSelectList = [];

    UpdateQuestionInput: UpdateQuestionInput;
    CreateQuestionInput: CreateQuestionInput;



    tagSelectList: any[];
    tagSuggestion: any[];
    tags: any[] = [];

    constructor(
        injector: Injector,
        private _QuestionServiceProxy: QuestionServiceProxy,
        private _TagServiceProxy: TagServiceProxy

    ) {
        super(injector);
    }


    ngAfterViewChecked(): void {
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }



    //筛选标签
    filter(event) {
        //获取标签下拉
        this._TagServiceProxy.getTagsByType(event.query, undefined, 100, 0, Type.Question).subscribe((result) => {
            this.tagSuggestion = result.items;
        })
    }
    assignTags() {
        var tagString = [];
        this.tags.forEach((items) => {
            tagString.push(items.id);
        })
        this.Question.tags = tagString;
    }


    show(record?: any): void {
        this.Question = { tags: [], type: 0, questionScoreType: 0, enabled: true, questionItems: [] };
        this.modal.show();
        function sortOrderNo(a, b) {
            return a.orderNo - b.orderNo
        }
        if (record) {
            this.operation = "edit";
            console.log(record)
            this.Question = Object.assign({}, record);

            this.tags = (this.Question.tags || []).map((item) => {
                return {
                    'id': item.id,
                    'value': item.name
                }
            });

            if (this.Question.questionItems.length > 0) {
                this.Question.questionItems.sort(sortOrderNo);
            }

        } else {
            this.operation = "add";
            this.tags = [];
        }
        this.active = true;
    }

    doSingleSelect(record) {
        for (var i = 0; i < this.Question.questionItems.length; i++) {
            this.Question.questionItems[i].isAnswer = false;
        }
        record.isAnswer = true;
    }

    onShown(): void {

    }


    save(): void {
        console.log(this.Question)
        if (this.Question.type == 2) {
            this.Question.questionItems = [];
        } else {
            this.Question.answer = "";
            if (!this.Question.questionItems.some(item => item.isAnswer)) {
                return this.message.warn(this.l("AtLeastOneIsAnswer"));
            }
        }
        this.saving = true;

        this.Question.tagIds = this.Question.tags.map(item => {
            return item.id ? item.id : item
        });

        if (this.operation == "add") {
            this.CreateQuestionInput = new CreateQuestionInput(this.Question);
            this._QuestionServiceProxy.createQuestion(this.CreateQuestionInput)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        } else {
            this.UpdateQuestionInput = new UpdateQuestionInput(this.Question);
            this._QuestionServiceProxy.updateQuestion(this.UpdateQuestionInput)
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
        this.CreateQuestionInput = null;
        this.UpdateQuestionInput = null;
        this.saving = false;
        this.modal.hide();
    }

    createRecommend() {
        this.Question.questionItems.push(new QuestionItemDto());
    }

    deleteRecord(i) {
        this.Question.questionItems.splice(i, 1);
    }

    imageOnUpload(result): void {
        this.Question.imageUrl = result.fileUri;
    }
    // logoOnUpload(result): void {
    //     this.Question.logoUrl = result.fileUri;
    // }
}
