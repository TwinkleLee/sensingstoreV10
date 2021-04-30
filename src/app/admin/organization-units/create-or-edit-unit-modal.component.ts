// import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Injector, Output, ViewChild } from '@angular/core';
// import { AppComponentBase } from '@shared/common/app-component-base';
// import { CreateOrganizationUnitInput, OrganizationUnitDto, OrganizationUnitServiceProxy, UpdateOrganizationUnitInput } from '@shared/service-proxies/service-proxies';
// import { ModalDirective } from 'ngx-bootstrap/modal';
// import { finalize } from 'rxjs/operators';

// export interface IOrganizationUnitOnEdit {
//     id?: number;
//     parentId?: number;
//     displayName?: string;
// }

// @Component({
//     selector: 'createOrEditOrganizationUnitModal',
//     templateUrl: './create-or-edit-unit-modal.component.html'
// })
// export class CreateOrEditUnitModalComponent extends AppComponentBase {

//     @ViewChild('createOrEditModal', {static: true}) modal: ModalDirective;
//     @ViewChild('organizationUnitDisplayName', {static: true}) organizationUnitDisplayNameInput: ElementRef;

//     @Output() unitCreated: EventEmitter<OrganizationUnitDto> = new EventEmitter<OrganizationUnitDto>();
//     @Output() unitUpdated: EventEmitter<OrganizationUnitDto> = new EventEmitter<OrganizationUnitDto>();

//     active = false;
//     saving = false;

//     organizationUnit: IOrganizationUnitOnEdit = {};

//     constructor(
//         injector: Injector,
//         private _organizationUnitService: OrganizationUnitServiceProxy,
//         private _changeDetector: ChangeDetectorRef
//     ) {
//         super(injector);
//     }

//     onShown(): void {
//         document.getElementById('OrganizationUnitDisplayName').focus();
//     }

//     show(organizationUnit: IOrganizationUnitOnEdit): void {
//         this.organizationUnit = organizationUnit;
//         this.active = true;
//         this.modal.show();
//         this._changeDetector.detectChanges();
//     }

//     save(): void {
//         if (!this.organizationUnit.id) {
//             this.createUnit();
//         } else {
//             this.updateUnit();
//         }
//     }

//     createUnit() {
//         const createInput = new CreateOrganizationUnitInput();
//         createInput.parentId = this.organizationUnit.parentId;
//         createInput.displayName = this.organizationUnit.displayName;

//         this.saving = true;
//         this._organizationUnitService
//             .createOrganizationUnit(createInput)
//             .pipe(finalize(() => this.saving = false))
//             .subscribe((result: OrganizationUnitDto) => {
//                 this.notify.info(this.l('SavedSuccessfully'));
//                 this.close();
//                 this.unitCreated.emit(result);
//             });
//     }

//     updateUnit() {
//         const updateInput = new UpdateOrganizationUnitInput();
//         updateInput.id = this.organizationUnit.id;
//         updateInput.displayName = this.organizationUnit.displayName;

//         this.saving = true;
//         this._organizationUnitService
//             .updateOrganizationUnit(updateInput)
//             .pipe(finalize(() => this.saving = false))
//             .subscribe((result: OrganizationUnitDto) => {
//                 this.notify.info(this.l('SavedSuccessfully'));
//                 this.close();
//                 this.unitUpdated.emit(result);
//             });
//     }

//     close(): void {
//         this.modal.hide();
//         this.active = false;
//     }
// }


import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Injector, Output, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CreateOrganizationUnitInput, OrganizationUnitDto, OrganizationUnitServiceProxy, UpdateGroupInput, OrganizationUnitTypeServiceProxy, PositionDto} from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

import * as moment from 'moment';
import { MyMapComponent } from '@app/shared/common/map/my-map.component';

export interface IOrganizationUnitOnEdit {
    id?: number;
    parentId?: number;
    displayName?: string;
    type?: string;//troncell
}

@Component({
    selector: 'createOrEditOrganizationUnitModal',
    templateUrl: './create-or-edit-unit-modal.component.html'
})
export class CreateOrEditUnitModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', {static: true}) modal: ModalDirective;
    @ViewChild('organizationUnitDisplayName', {static: true}) organizationUnitDisplayNameInput: ElementRef;

    //troncell
    @ViewChild('map',{static:false}) map: MyMapComponent;

    @Output() unitCreated: EventEmitter<OrganizationUnitDto> = new EventEmitter<OrganizationUnitDto>();
    @Output() unitUpdated: EventEmitter<OrganizationUnitDto> = new EventEmitter<OrganizationUnitDto>();

    active = false;
    saving = false;

    //troncell
    checkBoxShow = false;
    outypeList: any[] = [];
    openingTime: string = "07:00";
    closedTime: string = "23:00";
    organizationUnit: any = {
        'position': {}
    };
    _oldPosition: string = "";
    TypeIdStore;
    onShowBool = false;
    showBusy = true;
    interval;

    isStore = false;

    constructor(
        injector: Injector,
        private _organizationUnitService: OrganizationUnitServiceProxy,
        //V3
        private _organizationUnitTypeService: OrganizationUnitTypeServiceProxy,

        private _changeDetector: ChangeDetectorRef
    ) {
        super(injector);
    }

    ngOnDestroy() {
        if (this.interval) {
            clearInterval(this.interval)
        }
    }

    onShown(): void {
        // document.getElementById('OrganizationUnitDisplayName').focus();
        //V3
        if (this.interval) {
            clearInterval(this.interval)
        }
        this.interval = setInterval(() => {
            if (this.onShowBool) {
                this.onShowBool = false;
                //获取组织类型列表
                this._organizationUnitTypeService.getOrganizationUnitTypeSelect().subscribe((result) => {
                    this.outypeList = result.items;
                    this._changeDetector.detectChanges();
                    this.outypeList.map(item => {
                        if (item.name == 'Store') {//type为Store时有额外input
                            this.TypeIdStore = item.value;
                        }
                    })
                    this.showBusy = false;
                })
                // $(this.organizationUnitDisplayNameInput.nativeElement).focus();
            }
            console.log(1001)

        }, 500)
    }

    show(organizationUnit: IOrganizationUnitOnEdit): void {
        // this.organizationUnit = organizationUnit;
        // this.active = true;
        // this.modal.show();
        // this._changeDetector.detectChanges();
        this.showBusy = true;

        if (organizationUnit.id) {
            this._organizationUnitService.getOrganizationUnitById(organizationUnit.id).subscribe((r) => {
                this.organizationUnit = r;
                this.organizationUnit.position = this.organizationUnit.position ? this.organizationUnit.position : {};
                if (this.organizationUnit.closedTime) {
                    var closedTime = moment(this.organizationUnit.closedTime).format("HH:mm");
                    this.closedTime = closedTime;
                }
                if (this.organizationUnit.openingTime) {
                    var openingTime = moment(this.organizationUnit.openingTime).format("HH:mm");
                    this.openingTime = openingTime;
                }
                this.onShowBool = true;
            })
        } else {
            this.organizationUnit = {
                'position': {},
                'organizationUnitTypeId': '',
                'parentId': organizationUnit.parentId
            };
            this.onShowBool = true;
        }
        this.active = true;
        this.modal.show();
        this._changeDetector.detectChanges();
    }

    save(): void {
        if (!this.organizationUnit.id) {
            this.createUnit();
        } else {
            this.updateUnit();
        }
    }

    createUnit() {
        // const createInput = new CreateOrganizationUnitInput();
        // createInput.parentId = this.organizationUnit.parentId;
        // createInput.displayName = this.organizationUnit.displayName;

        //V3
        this.organizationUnit.openingTime = new Date(`2017-12-31T${this.openingTime}:00.000`);
        this.organizationUnit.closedTime = new Date(`2017-12-31T${this.closedTime}:00.000`);
        this.organizationUnit.position = new PositionDto(this.organizationUnit.position);
        const createInput = new CreateOrganizationUnitInput(this.organizationUnit);
        console.log("createInput",createInput)
        this.saving = true;
        this._organizationUnitService
            .createOrganizationUnit(createInput)
            .pipe(finalize(() => this.saving = false))
            .subscribe((result: OrganizationUnitDto) => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.unitCreated.emit(result);
            });
    }

    updateUnit() {
        // const updateInput = new UpdateOrganizationUnitInput();
        // updateInput.id = this.organizationUnit.id;
        // updateInput.displayName = this.organizationUnit.displayName;

        //V3
        this.organizationUnit.openingTime = new Date(`2017-12-31T${this.openingTime}:00.000`);
        this.organizationUnit.closedTime = new Date(`2017-12-31T${this.closedTime}:00.000`);
        this.organizationUnit.position = new PositionDto(this.organizationUnit.position);
        const updateInput = new UpdateGroupInput(this.organizationUnit);

        this.saving = true;
        this._organizationUnitService
            .updateOrganizationUnit(updateInput)
            .pipe(finalize(() => this.saving = false))
            .subscribe((result: OrganizationUnitDto) => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.unitUpdated.emit(result);
            });
    }

    close(): void {
        this.modal.hide();
        this.active = false;
        if (this.interval) {
            clearInterval(this.interval)
        }
    }
    showMap(e?: Event) {
        e && e.preventDefault();
        //仍是旧地址
        if (JSON.stringify(this.organizationUnit.position || {}) == this._oldPosition) {
            if (this.map.visible) {
                this.map.hide();
            } else {
                this.map.show();
            }
        } else {
            this.map.render(false, '500px');
            this._oldPosition = JSON.stringify(this.organizationUnit.position || {});
            this.map.show();
        }
    }
    getPointer(e) {

    }
    mapClick(e) {

    }
}
