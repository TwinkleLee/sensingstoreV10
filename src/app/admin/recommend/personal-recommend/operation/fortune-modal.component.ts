import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';
import { MetaPhysicsServiceProxy, DateMetaPhysicsServiceProxy, UpdateDateMetaPhysicsInput, CreateDateMetaPhysicsInput, CreateLuckInput, CreateRecommendInput } from '@shared/service-proxies/service-proxies4';
import * as moment from 'moment';

@Component({
    selector: 'FortuneModal',
    templateUrl: './fortune-modal.component.html',
    styleUrls: ['./fortune-modal.component.css']
})
export class FortuneModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput',{static:true}) nameInput: ElementRef;
    @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    operation: string = "add";
    Fortune: any;
    dateTime: any;
    metaNameSelectList = [];
    getPersonalityInformationFlag = false;
    UpdateDateMetaPhysicsInput: UpdateDateMetaPhysicsInput;
    CreateDateMetaPhysicsInput: CreateDateMetaPhysicsInput;
    luckArray = ['summary', 'love', 'fortune', 'career', 'health', 'bestMatch', 'number', 'color', 'direction', 'keyword'];
    tabArray = ['Today', 'Tomorrow', 'Week', 'Month', 'Year'];

    constructor(
        injector: Injector,
        private _metaService: MetaPhysicsServiceProxy,
        private _fortuneService: DateMetaPhysicsServiceProxy
    ) {
        super(injector);

    }


    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        // $('tabset ul.nav').addClass('m-tabs-line');
        // $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(FortuneID?: any): void {
        this.Fortune = { lucks: [], recommneds: [] };
        this.getPersonalityInformation();

        this.modal.show();
        if (FortuneID) {
            this.operation = "edit";
            this._fortuneService.getDateMetaPhysics(FortuneID).subscribe(result => {

                this.Fortune = Object.assign({}, result);
                this.Fortune.lucks = [];
                for (var i = 0; i < this.tabArray.length; i++) {
                    this.Fortune.lucks[i] = new CreateLuckInput(<any>{ type: this.tabArray[i] });
                }
                for (var m = 0; m < result.lucks.length; m++) {
                    for (var n = 0; n < this.Fortune.lucks.length; n++) {
                        if (result.lucks[m].type == this.Fortune.lucks[n].type) {
                            this.Fortune.lucks[n] = result.lucks[m];
                        }
                    }
                }

            });
        } else {
            this.operation = "add";
            this.Fortune.date = moment();

            for (var i = 0; i < this.tabArray.length; i++) {
                this.Fortune.lucks[i] = new CreateLuckInput(<any>{ type: this.tabArray[i] });
            }

        }
        this.active = true;
    }

    //获取个性信息列表
    getPersonalityInformation() {
        this._metaService.getMetaPhysicsList(
            void 0,
            void 0,
            void 0,
            1000,
            0
        ).subscribe(result => {
            this.metaNameSelectList = result.items;
            this.getPersonalityInformationFlag = true;
        });
    }

    onShown(): void {
        if (this.nameInput) {
            $(this.nameInput.nativeElement).focus()
        }
    }


    save(): void {
        this.saving = true;
        this.Fortune.date = this.Fortune.date.add(-(new Date().getTimezoneOffset()/60),'h');

        if (this.operation == "add") {
            this.CreateDateMetaPhysicsInput = new CreateDateMetaPhysicsInput(this.Fortune);
            this._fortuneService.createDateMetaPhysics(this.CreateDateMetaPhysicsInput)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        } else {
            this.UpdateDateMetaPhysicsInput = new UpdateDateMetaPhysicsInput(this.Fortune);
            this._fortuneService.updateDateMetaphysics(this.UpdateDateMetaPhysicsInput)
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
        this.CreateDateMetaPhysicsInput = null;
        this.UpdateDateMetaPhysicsInput = null;
        this.getPersonalityInformationFlag = false;
        this.saving = false;
        this.modal.hide();
    }

    createRecommend() {
        this.Fortune.recommneds.push(new CreateRecommendInput());
    }

    deleteRecord(i) {
        this.Fortune.recommneds.splice(i, 1);
    }
}
