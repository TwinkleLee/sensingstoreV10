import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';
import { UpdateQuestionScoreAndOrderInput, PublishedQuestionDto, PublishQuestionsToPapersInput, PaperServiceProxy, CreatePaperInput, UpdatePaperInput, QuestionServiceProxy } from '@shared/service-proxies/service-proxies5';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { TagServiceProxy, TagType as Type } from '@shared/service-proxies/service-proxies2';

@Component({
    selector: 'addQuestionModal',
    templateUrl: './add-question-modal.component.html'
})
export class AddQuestionModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('createOrEditModal', { static: false }) modal: ModalDirective;
    @ViewChild('SampleDatePicker', { static: true }) sampleDatePicker: ElementRef;
    @ViewChild('TypeCombobox', { static: true }) typeComboboxElement: ElementRef;

    @ViewChild('dataTable', { static: false }) dataTable: Table;
    @ViewChild('paginator', { static: false }) paginator: Paginator;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;


    filterText = "";
    type: any = "";


    questionPublishList = [];


    tags = [];
    tagFilter = "";

    paperId;

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

    show(paperId): void {
        this.paperId = paperId;
        console.log(this.paperId)
        this.modal.show();
        this.active = true;
    }

    getTags() {
        this._TagServiceProxy.getTagsByType('', undefined, 1000, 0, Type.Question).subscribe((r) => {
            this.tags = r.items;
        })
    }

    getQuestions(event?) {
        setTimeout(() => {

            if (this.primengTableHelper.shouldResetPaging(event)) {
                this.paginator.changePage(0);
                return;
            }

            this.primengTableHelper.showLoadingIndicator();


            this._PaperServiceProxy.getNoUsedQuestionsByPaperId(
                this.paperId,
                this.tagFilter ? [Number(this.tagFilter)] : [],
                this.filterText,
                this.primengTableHelper.getSorting(this.dataTable),
                this.primengTableHelper.getMaxResultCount(this.paginator, event),
                this.primengTableHelper.getSkipCount(this.paginator, event)
            )
                .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
                .subscribe(result => {
                    this.primengTableHelper.totalRecordsCount = result.totalCount;
                    result.items = result.items.map((item: any) => {
                        item.newOrderNo = item.orderNo;
                        item.newScore = item.score;
                        return item
                    })
                    console.log(result.items)
                    this.primengTableHelper.records = result.items;
                })
        })

    }


    onShown(): void {
        this.getTags();
        this.getQuestions();
    }


    save(): void {
        var targetPaperList = [this.paperId];

        var entityIds = this.questionPublishList.map(item => {
            var obj = new PublishedQuestionDto();
            obj.id = item.id;
            return obj
        });
        var publishType = "add";
        var input = {
            questions: entityIds,
            paperIds: targetPaperList,
            action: publishType
        }
        this.message.confirm(this.l('isPublishChosen'), this.l('AreYouSure'), (r) => {
            if (r) {
                this.questionPublishList = [];
                this._QuestionServiceProxy.publishQuestionsToPapers(new PublishQuestionsToPapersInput(input)).subscribe(r => {
                    this.notify.info(this.l('success'));
                    this.close();
                    this.modalSave.emit(null);
                })
            }
        })

    }

    close(): void {
        this.active = false;

        //如果不清空,下次打开时会引起transIndex的报错
        this.primengTableHelper.records = [];
        this.questionPublishList = [];

        this.saving = false;
        this.modal.hide();
    }

    //转换序列
    transIndex(i, event?: LazyLoadEvent) {
        return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
    }
}
