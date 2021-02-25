import { Component, Injector, ViewChild } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { OrganizationTreeComponent } from './organization-tree.component';
import { OrganizationUnitMembersComponent } from './organization-unit-members.component';
import { OrganizationUnitRolesComponent } from './organization-unit-roles.component';
import { OrganizationUnitStoresComponent } from './organization-unit-stores.component';
import { IBasicOrganizationUnitInfo } from './basic-organization-unit-info';
import { Router } from '@angular/router';

@Component({
    templateUrl: './organization-units.component.html',
    animations: [appModuleAnimation()]
})
export class OrganizationUnitsComponent extends AppComponentBase {

    @ViewChild('ouMembers', {static: true}) ouMembers: OrganizationUnitMembersComponent;
    @ViewChild('ouRoles', {static: true}) ouRoles: OrganizationUnitRolesComponent;
    @ViewChild('ouStores', {static: true}) ouStores: OrganizationUnitStoresComponent;
    @ViewChild('ouTree', {static: true}) ouTree: OrganizationTreeComponent;
    organizationUnit: IBasicOrganizationUnitInfo = null;

    constructor(
        injector: Injector,
        private router:Router
    ) {
        super(injector);
    }

    ouSelected(event: any): void {
        this.organizationUnit = event;
        this.ouMembers.organizationUnit = event;
        this.ouRoles.organizationUnit = event;
        this.ouStores.organizationUnit = event;
    }
    goImport(){
        this.router.navigate(['app', 'admin','import','import','organization-units']);
    }
}
