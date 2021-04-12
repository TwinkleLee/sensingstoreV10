import { Component, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
// import { LazyLoadEvent } from 'primeng/components/common/lazyloadevent';
// import { Paginator } from 'primeng/components/paginator/paginator';
// import { Table } from 'primeng/components/table/table';

import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';

import { IBasicOrganizationUnitInfo } from './basic-organization-unit-info';
import { IUserWithOrganizationUnit } from './user-with-organization-unit';
import { IUsersWithOrganizationUnit } from './users-with-organization-unit';
import { finalize } from 'rxjs/operators';


import { Router } from '@angular/router';
import { StoreServiceProxy as NewStoreServiceProxy,GetStorseListInput} from '@shared/service-proxies/service-proxies-devicecenter';


@Component({
    selector: 'organization-unit-stores',
    templateUrl: './organization-unit-stores.component.html'
})
export class OrganizationUnitStoresComponent extends AppComponentBase implements OnInit {

    @Output() memberRemoved = new EventEmitter<IUserWithOrganizationUnit>();
    @Output() membersAdded = new EventEmitter<IUsersWithOrganizationUnit>();

    @ViewChild('dataTable', {static: true}) dataTable: Table;
    @ViewChild('paginator', {static: true}) paginator: Paginator;

    private _organizationUnit: IBasicOrganizationUnitInfo = null;

    constructor(
        injector: Injector,
        private _NewStoreServiceProxy: NewStoreServiceProxy,
        private _router: Router


    ) {
        super(injector);
    }

    get organizationUnit(): IBasicOrganizationUnitInfo {
        return this._organizationUnit;
    }

    set organizationUnit(ou: IBasicOrganizationUnitInfo) {
        if (this._organizationUnit === ou) {
            return;
        }

        this._organizationUnit = ou;
        if (ou) {
            this.getStores();
        }
    }

    ngOnInit(): void {

    }

    getStores(event?: LazyLoadEvent) {
        if (!this._organizationUnit) {
            return;
        }

        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();
        this._NewStoreServiceProxy.getStoresList(new GetStorseListInput({
            storeStatus:null,
            organizationUnitId: [this._organizationUnit.id],
            areas: void 0,
            filter: void 0,
            sorting: this.primengTableHelper.getSorting(this.dataTable),
            maxResultCount: this.primengTableHelper.getMaxResultCount(this.paginator, event),
            skipCount: this.primengTableHelper.getSkipCount(this.paginator, event)
        }))
        .pipe(finalize(() => this.primengTableHelper.hideLoadingIndicator())).subscribe(result => {
            this.primengTableHelper.totalRecordsCount = result.totalCount;
            this.primengTableHelper.records = result.items;
            this.primengTableHelper.hideLoadingIndicator();
        });

    }

    goDetail(record) {
        this._router.navigate(['app', 'admin', 'organization-units', 'OUDetail', record.storeId], { queryParams: { name: record.displayName, isStore: true } });
    }
}
