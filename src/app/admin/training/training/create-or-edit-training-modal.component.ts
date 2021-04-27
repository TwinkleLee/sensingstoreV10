import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective, ModalModule } from '@node_modules/ngx-bootstrap/modal';
import { TrainingServiceProxy, CreateTrainingInput, UpdateTrainingInput,TrainingCategoryEnum as TrainingCategory,TrainingWayEnum as TrainingWay,PaperServiceProxy,CourseServiceProxy } from '@shared/service-proxies/service-proxies5'
import { LoginServiceProxy,OrganizationUnitServiceProxy} from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';
import * as moment from 'moment';
import * as _ from 'lodash';


@Component({
    selector: 'createOrEditTrainingModal',
    templateUrl: './create-or-edit-training-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditTrainingModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput',{static:true}) nameInput: ElementRef;
    @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;


    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    ToResource: boolean = true;
    uploadUrl: string;
    uploadedFiles: any[] = [];
    operation: string = "add";
    training: any;
    paperList:any[]=[];
    platformUsers:any[] =[];
    organizationUnits:any[] =[];
    courses:any[] =[];

    tags: any[] = [];
    tagSuggestion;
    createTraining: CreateTrainingInput;
    updateTraining: UpdateTrainingInput;

    startTime:string="17:30:00";
    endTime:string="18:30:00";
    
    startDate:string= moment().format('YYYY-MM-DD');


    //枚举
    trainingCategoryEnum=TrainingCategory;
    trainingWayEnum = TrainingWay;


    memberedOrganizationUnits: string[];

    constructor(
        injector: Injector,
        private _trainingService: TrainingServiceProxy,
        private _paperService:PaperServiceProxy,
        private _loginServiceProxy:LoginServiceProxy,
        private _organizationUnitServiceProxy:OrganizationUnitServiceProxy,
        private _courseServiceProxy:CourseServiceProxy
    ) {
        super(injector);
        _paperService.getPapers(void 0,void 0,void 0,void 0,999,0).subscribe((r) => {
            this.paperList = r.items;          
            console.log("papers="+this.paperList);
        })
        _loginServiceProxy.getPlatformUsers(abp.session.tenantId).subscribe((r) => {
            this.platformUsers = r;          
            console.log("platformUsers="+this.platformUsers);
        })
        _organizationUnitServiceProxy.getOrganizationUnits().subscribe((r) => {
            this.organizationUnits = r.items;          
            console.log("organizationUnits=",this.organizationUnits);
        })
        _courseServiceProxy.getCourses(void 0,void 0,void 0,void 0,void 0,void 0,999,0).subscribe((r) => {
            this.courses = r.items;          
            console.log("courses=",this.courses);
        })
    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    
 

    show(training?: any): void {
        this.active = true;
        if (training) {
            this.operation = "edit";
            this.training =_.cloneDeep(training);
            this.startDate = moment(this.training.startTime).format('YYYY-MM-DD');
            this.startTime = moment(this.training.startTime).format('HH:mm:ss');
            this.endTime = moment(this.training.endTime).format('HH:mm:ss');
        } else {
            this.operation = "add";
            this.training = {
                 'startTime': moment().utc().subtract(1, 'days').startOf('day'),
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
            this.createTraining = this.training as CreateTrainingInput;
            this.createTraining.groupIds = this.tags.map((item) => {
                return Number(item.id);
            })
            console.log("startDate",this.startDate);
            console.log("startTime",this.startTime);
            console.log("endTime",this.endTime);
            console.log("date",moment(this.startDate).format('YYYY-MM-DD'));
            this.createTraining.startTime = moment(moment(this.startDate).format('YYYY-MM-DD')+"T"+this.startTime+"Z");
            this.createTraining.endTime = moment(moment(this.startDate).format('YYYY-MM-DD')+"T"+this.endTime+"Z");

            this._trainingService.createTraining(this.createTraining)
            .pipe(finalize(() => {this.saving = false; }))
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        } else {

            this.updateTraining = this.training as UpdateTrainingInput;
            this.updateTraining.groupIds = this.tags.map((item) => {
                return Number(item.id);
            })
            this.updateTraining.startTime = moment(moment(this.startDate).format('YYYY-MM-DD')+"T"+this.startTime+"Z");
            this.updateTraining.endTime = moment(moment(this.startDate).format('YYYY-MM-DD')+"T"+this.endTime+"Z");

            this._trainingService.updateTraining(this.updateTraining)
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
        this.training = {
            'start_time': new Date(),
            'end_time': new Date()
        };
        this.modal.hide();
    }


    // upload completed event
    onUpload(result): void {
        this.training.pictures = result.fileUri;
    }

    onBeforeSend(event): void {

    }

    filter(event) {
        //获取标签下拉
        this._organizationUnitServiceProxy.getOrganizationUnits().subscribe((r) =>{
            this.organizationUnits = r.items;  
            this.tagSuggestion = r.items;
            console.log(this.tagSuggestion)
        })
    }

    assignTags() {
        var tagString = [];
        this.tags.forEach((items) => {
            tagString.push(items.id);
        })
        this.training.tags = tagString;
    }
}
