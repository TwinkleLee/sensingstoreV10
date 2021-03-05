import { Component, Injector, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DashboardCustomizationConst } from '@app/shared/common/customizable-dashboard/DashboardCustomizationConsts';

@Component({
    templateUrl: './dashboard2.component.html',
    styleUrls: ['./dashboard2.component.less'],
    encapsulation: ViewEncapsulation.None
})

export class DashboardComponent2 extends AppComponentBase {
    dashboardName = DashboardCustomizationConst.dashboardNames.defaultTenantDashboard;

    constructor(
        injector: Injector) {
        super(injector);
    }
}
