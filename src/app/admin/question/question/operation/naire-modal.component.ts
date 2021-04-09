import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';
import { UpdateQuestionScoreAndOrderInput, PublishedQuestionDto, PublishQuestionsToPapersInput, PaperServiceProxy, CreatePaperInput, UpdatePaperInput, QuestionServiceProxy } from '@shared/service-proxies/service-proxies5';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { TagServiceProxy, TagType as Type } from '@shared/service-proxies/service-proxies5';
import { AddQuestionModalComponent } from '@app/admin/question/question/operation/add-question-modal.component';

@Component({
    selector: 'naireModal',
    templateUrl: './naire-modal.component.html',
    // styleUrls: ['./naire-modal.component.css']
})
export class NaireModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput', { static: true }) nameInput: ElementRef;
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('SampleDatePicker', { static: true }) sampleDatePicker: ElementRef;
    @ViewChild('TypeCombobox', { static: true }) typeComboboxElement: ElementRef;

    @ViewChild('addQuestionModal', { static: false }) AddQuestionModalComponent: AddQuestionModalComponent;


    @ViewChild('dataTable', { static: false }) dataTable: Table;
    @ViewChild('paginator', { static: false }) paginator: Paginator;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    operation: string = "add";
    Paper: any;
    initPaper: any;

    UpdatePaperInput: UpdatePaperInput;
    CreatePaperInput: CreatePaperInput;

    filterText = "";

    questionPublishList = [];

    nowTab = 0;
    canSave: boolean = false;

    tagSelectList: any[];
    tagSuggestion: any[];
    tags: any[] = [];


    constructor(
        injector: Injector,
        private _PaperServiceProxy: PaperServiceProxy,
        private _QuestionServiceProxy: QuestionServiceProxy,
        private _TagServiceProxy: TagServiceProxy
    ) {
        super(injector);

    }


    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(record?: any): void {
        this.Paper = { compositionType: 0 };
        this.modal.show();

        if (record) {
            this.operation = "edit";
            this.initPaper = record;
            this.Paper = Object.assign({}, record);
            this.tags = (this.Paper.tags || []).map((item) => {
                return {
                    'id': item.id,
                    'value': item.name
                }
            });
        } else {
            this.operation = "add";
            this.tags = [];
        }
        this.active = true;

    }

    assignTags() {
        var tagString = [];
        this.tags.forEach((items) => {
            tagString.push(items.id);
        })
        this.Paper.tags = tagString;
    }
    //筛选标签
    filter(event) {
        //获取标签下拉
        this._TagServiceProxy.getTagsByType(event.query, undefined, 100, 0, Type.Question).subscribe((result) => {
            this.tagSuggestion = result.items;
        })
    }

    editQuestion(record) {
        record.editMode = true;

        console.log(record)
    }

    AddQuestion() {
        this.AddQuestionModalComponent.show(this.Paper.id);
    }
    AddRandomQuestionsToPaper() {
        this.message.confirm(this.l('AddRandomQuestionsToPaper'), this.l('AreYouSure'), (r) => {
            if (r) {
                this.questionPublishList = [];
                this.primengTableHelper.showLoadingIndicator();
                this._PaperServiceProxy.addRandomQuestionsToPaper(this.Paper.id)
                    .pipe(finalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
                    .subscribe(() => {
                        this.notify.info(this.l('success'));
                        this.getQuestions();
                    })
            }
        })

    }
    deleteQuestion(record) {
        var targetPaperList = [this.Paper.id];
        var obj = new PublishedQuestionDto()
        obj.id = record.id;
        var entityIds = [obj];
        var publishType = "delete";
        var input = {
            questions: entityIds,
            paperIds: targetPaperList,
            action: publishType
        }
        this.message.confirm(this.l('deletethisquestion'), this.l('AreYouSure'), (r) => {
            if (r) {
                this._QuestionServiceProxy.publishQuestionsToPapers(new PublishQuestionsToPapersInput(input)).subscribe(r => {
                    this.notify.info(this.l('success'));
                    this.getQuestions()
                })
            }
        })
    }

    deleteBatch() {
        console.log(this.questionPublishList)
        var targetPaperList = [this.Paper.id];
        var entityIds = this.questionPublishList.map(item => {
            var obj = new PublishedQuestionDto()
            obj.id = item.id;
            return obj
        })
        var publishType = "delete";
        var input = {
            questions: entityIds,
            paperIds: targetPaperList,
            action: publishType
        }
        this.message.confirm(this.l('deletethisquestion'), this.l('AreYouSure'), (r) => {
            if (r) {
                this._QuestionServiceProxy.publishQuestionsToPapers(new PublishQuestionsToPapersInput(input)).subscribe(r => {
                    this.notify.info(this.l('success'));
                    this.getQuestions()
                })
            }
        })
    }

    changeEditMode(record?, bool?) {
        if (record) {
            record.editMode = bool;
        }
        this.canSave = this.primengTableHelper.records.some(item => {
            return item.editMode
        })
    }

    getQuestions(event?) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();
        this.questionPublishList = [];

        this._PaperServiceProxy.getQuestionsByPaperId(
            this.Paper.id,
            undefined,
            this.filterText,
            this.primengTableHelper.getSorting(this.dataTable),
            this.primengTableHelper.getMaxResultCount(this.paginator, event),
            this.primengTableHelper.getSkipCount(this.paginator, event)
        ).subscribe(result => {
            this.primengTableHelper.totalRecordsCount = result.totalCount;
            result.items = result.items.map((item: any) => {
                item.newOrderNo = item.orderNo;
                item.newScore = item.score;
                return item
            })
            console.log(result.items)
            this.primengTableHelper.records = result.items;
            this.changeEditMode();//重新生成canSave状态

            this.primengTableHelper.hideLoadingIndicator();
        })
    }


    onShown(): void {

    }

    changeTab(tab) {
        if (this.nowTab == 0 && tab == 1) {
            this.getQuestions();
        }
        this.nowTab = tab;
    }


    save(): void {
        if (this.nowTab == 0) {

            if (this.Paper.compositionType == 0) {
                this.Paper.randomCount = 0;
            } else if (this.Paper.compositionType == 1) {
                this.Paper.randomCount = this.Paper.questionsCount;
            } else if (this.Paper.compositionType == 2 && this.Paper.randomCount >= this.Paper.questionsCount) {
                // return this.notify.warn(this.l('randomCount must less than questionsCount'))
                return this.message.warn(this.l('randomCount must less than questionsCount'))
            }


            this.saving = true;
            if (this.Paper.tags) {
                this.Paper.tagIds = this.Paper.tags.map(item => {
                    return item.id ? item.id : item
                });
            } else {
                this.Paper.tagIds = [];
            }




            if (this.operation == "add") {
                this.CreatePaperInput = new CreatePaperInput(this.Paper);
                this._PaperServiceProxy.createPaper(this.CreatePaperInput)
                    .pipe(finalize(() => { this.saving = false; }))
                    .subscribe(() => {
                        this.notify.info(this.l('SavedSuccessfully'));
                        this.close();
                        // this.modalSave.emit(null);
                    });
            } else {
                this.UpdatePaperInput = new UpdatePaperInput(this.Paper);
                this._PaperServiceProxy.updatePaper(this.UpdatePaperInput)
                    .pipe(finalize(() => { this.saving = false; }))
                    .subscribe(() => {
                        this.notify.info(this.l('SavedSuccessfully'));
                        this.close();
                        // this.modalSave.emit(null);
                    });
            }
        } else {
            var questionsInput = [];
            for (var i = 0; i < this.primengTableHelper.records.length; i++) {
                if (this.primengTableHelper.records[i].editMode) {
                    questionsInput.push(new PublishedQuestionDto({
                        id: this.primengTableHelper.records[i].id,
                        score: this.primengTableHelper.records[i].newScore,
                        orderNo: this.primengTableHelper.records[i].newOrderNo
                    }))
                }
            }
            var input = new UpdateQuestionScoreAndOrderInput({
                paperId: this.Paper.id,
                questions: questionsInput
            })
            this._PaperServiceProxy.updateQuestionScoreAndOrder(input).subscribe(r => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                // this.modalSave.emit(null);
            })
        }

    }

    close(): void {

        this.active = false;
        this.CreatePaperInput = null;
        this.UpdatePaperInput = null;

        //如果不清空,下次打开时会引起transIndex的报错
        this.primengTableHelper.records = [];

        this.questionPublishList = [];
        this.nowTab = 0;
        this.canSave = false;
        this.saving = false;
        this.modal.hide();
        this.modalSave.emit(null);

    }


    imageOnUpload(result): void {
        this.Paper.imageUrl = result.fileUri;
    }
    //转换序列
    transIndex(i, event?: LazyLoadEvent) {
        return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
    }
}
