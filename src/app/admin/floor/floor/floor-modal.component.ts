import { Component, ViewChild, Injector, Output, Input, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { Paginator } from 'primeng/paginator';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import { FloorServiceProxy, CreateFloorInput, UpdateFloorInput } from '@shared/service-proxies/service-proxies-floor';
import { LazyLoadEvent } from 'primeng/api';
import { CreateOrEditResourceModalComponent } from './resource-modal.component';
import * as _ from 'lodash';

@Component({
    selector: 'floorModal',
    templateUrl: './floor-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditFloorModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('resourceModal', { static: false }) resourceModal: CreateOrEditResourceModalComponent;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    @Input("buildingList") buildingList: any = "";
    @Input("buildingId") buildingId: any = [];
    @ViewChild('paginatorRes', { static: false }) paginatorRes: Paginator;

    resPrimeng: PrimengTableHelper = new PrimengTableHelper();

    active = false;
    saving = false;

    operation: string = "add";
    objItem: any = {};
    resourceSelection: any = [];

    constructor(
        injector: Injector,
        private _FloorServiceProxy: FloorServiceProxy
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
        } else {
            this.operation = "add";
            this.objItem = {
                buildingId: this.buildingId
            };
        }
        this.modal.show();
    }

    onShown(): void {
    }

    save(): void {
        this.saving = true;
        console.log(this.objItem);
        if (!this.objItem.id) {
            this._FloorServiceProxy.createFloor(new CreateFloorInput(this.objItem))
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(result => {
                    console.log(result)
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                })
        } else {
            this._FloorServiceProxy.updateFloor(new UpdateFloorInput(this.objItem))
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(result => {
                    console.log(result)
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                })
        }
    }

    getResByFloorId(event?: LazyLoadEvent): void {
        if (this.resPrimeng.shouldResetPaging(event)) {
            this.paginatorRes.changePage(0);
            return;
        }
        this.resPrimeng.showLoadingIndicator();
        this._FloorServiceProxy.getFloorAngleResources(
            this.objItem.id,
            undefined,
            undefined,
            this.resPrimeng.getMaxResultCount(this.paginatorRes, event),
            this.resPrimeng.getSkipCount(this.paginatorRes, event)
        )
            .pipe(this.myFinalize(() => { this.resPrimeng.hideLoadingIndicator(); }))
            .subscribe(result => {
                this.resPrimeng.totalRecordsCount = result.totalCount;
                this.resPrimeng.records = result.items;
                // this.resPrimeng.hideLoadingIndicator();
            });
    }

    onOperateResource(e?) {
        console.log(e);
        if (e.action == "info") {
            this.resourceModal.show(this.objItem.id, _.cloneDeep(e.image));
        } else {
            this.message.confirm(this.l('deletethisresource'), this.l('AreYouSure'), (r) => {
                if (r) {
                    this._FloorServiceProxy.deleteFloorAngleResouces([e.image.id]).subscribe((result) => {
                        this.notify.info(this.l('success'));
                        this.getResByFloorId();
                        this.resourceSelection = [];
                    })

                }
            })
        }
    }

    createResource(e?) {
        this.resourceModal.show(this.objItem.id);
    }

    deleteResources(e?) {
        if (this.resourceSelection.length == 0) {
            return this.notify.warn('atLeastChoseOneItem');
        }
        this.message.confirm(this.l('deletethisresources'), this.l('AreYouSure'), (r) => {
            if (r) {
                var ids = [];
                ids = this.resourceSelection.map((item) => {
                    return item.id;
                })
                this._FloorServiceProxy.deleteFloorAngleResouces(ids).subscribe((result) => {
                    this.notify.info(this.l('success'));
                    this.getResByFloorId();
                    this.resourceSelection = []
                })
            }
        })
    }

    close(): void {
        this.active = false;
        this.objItem = {};
        this.saving = false;
        this.modal.hide();
    }

}
