import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

import { OrganizationUnitServiceProxy, CreateOrganizationUnitInput, IUpdateGroupInput, OrganizationUnitDto, ICreateOrganizationUnitInput, UpdateGroupInput, OrganizationUnitTypeServiceProxy, CreateOrganizationUnitTypeInput, UpdateOrganizationUnitTypeInput } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

import { LazyLoadEvent } from 'primeng/api';

// import { Paginator } from 'primeng/components/paginator/paginator';
import { Table } from 'primeng/table';


@Component({
    selector: 'createOrEditOrganizationUnitTypeModal',
    templateUrl: './create-or-edit-unitType-modal.component.html'
})
export class CreateOrEditUnitTypeModalComponent extends AppComponentBase {

    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    // @ViewChild('paginator', { static: true }) paginator: Paginator;

    @Output() ouTypeSaved: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    filterText;
    ouType = '';
    constructor(
        injector: Injector,
        private _organizationUnitTypeService: OrganizationUnitTypeServiceProxy
    ) {
        super(injector);
    }

    onShown(): void {
        this.getOUTypes(null);
    }

    refreshTable() {

    }

    getOUTypes(event?: LazyLoadEvent) {
        setTimeout(() => {
            this.primengTableHelper.showLoadingIndicator();
            this._organizationUnitTypeService.getOrganizationUnitTypes(
                this.filterText,
                void 0,
                // this.primengTableHelper.getMaxResultCount(this.paginator, event),
                // this.primengTableHelper.getSkipCount(this.paginator, event)
                999, 0
            )
                .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
                .subscribe(result => {
                    this.primengTableHelper.totalRecordsCount = result.totalCount;
                    this.primengTableHelper.records = result.items;
                    // this.primengTableHelper.hideLoadingIndicator();
                });
        }, 500)
    }
    show(): void {
        this.active = true;
        this.modal.show();
    }


    createUnitType() {
        if (!this.ouType || this.ouType.trim() == '') {
            return this.notify.warn(this.l('ouTypeIsRequired'));
        }
        var input = new CreateOrganizationUnitTypeInput();
        input.name = this.ouType;
        input.orderNumber = void 0;
        this._organizationUnitTypeService.createOrganizationUnitType(input).subscribe((result) => {
            this.notify.info(this.l('success'));
            this.ouType = "";
            this.getOUTypes();
        })
    }
    saveOUType(record) {
        record.editable = false;
        var input = new UpdateOrganizationUnitTypeInput(record);
        this._organizationUnitTypeService.updateOrganizationUnitType(input).subscribe((res) => {
            this.notify.info(this.l('success'));
            this.getOUTypes();
            this.ouTypeSaved.emit();
        })
    }
    editOUType(record) {
        record.editable = true;
    }
    deleteOUType(record) {
        this._organizationUnitTypeService.deleteOrganizationUnitType(record.id).subscribe((res) => {
            this.notify.info(this.l('success'));
            this.getOUTypes();
        })
    }

    close(): void {
        this.modal.hide();
        this.active = false;
        this.ouTypeSaved.emit();
    }
}
