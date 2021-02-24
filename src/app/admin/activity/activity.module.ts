import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { CountoModule } from 'angular2-counto';
import { ModalModule } from '@node_modules/ngx-bootstrap/modal';
import { TabsModule } from '@node_modules/ngx-bootstrap/tabs';
import { TooltipModule } from '@node_modules/ngx-bootstrap/tooltip';
import { BsDropdownModule } from '@node_modules/ngx-bootstrap/dropdown';
import { PopoverModule } from '@node_modules/ngx-bootstrap/popover';
import { ActivityRoutingModule } from './activity-routing.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { BsDatepickerModule, BsDatepickerConfig, BsDaterangepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { NgxBootstrapDatePickerConfigService } from 'assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service';

NgxBootstrapDatePickerConfigService.registerNgxBootstrapDatePickerLocales();

import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TreeModule } from 'primeng/tree';

import { AutoCompleteModule } from 'primeng/autocomplete';
import { from } from 'rxjs';

import { ActivityComponent } from '@app/admin/activity/activity/activity.component'
// import { ActivityDataComponent } from '@app/activity/activity/data/activity-data.component'
// import { ActivityBasicComponent } from '@app/activity/activity/basic/activity-basic.component'
// import { ActivityAdvancedComponent } from '@app/activity/activity/advanced/activity-advanced.component'
// import { ActivityPrizeComponent } from '@app/activity/activity/prize/activity-prize.component'
import { PageTemplateComponent } from '@app/admin/activity/activity-template/page-template.component'
// import { GameComponent } from '@app/activity/activity/game/game.component'
import { CreateActivityModalComponent } from '@app/admin/activity/activity/create-activity-modal.component';
// import { ChangeWhiteListModalComponent } from '@app/activity/activity/data/operation/change-white-list.component';
// import { ExpressDetailModalComponent } from '@app/activity/activity/data/operation/express-detail.component';
// import { CreateOrEditPrizeModalComponent } from '@app/activity/activity/prize/operation/create-or-edit-prize.component';
// import { CreateOrEditWhiteListModalComponent } from '@app/activity/activity/prize/operation/create-or-edit-white-list.component';
import { PageTemplateModalComponent } from '@app/admin/activity/activity-template/operation/create-or-edit-pageTemplate.component';
// //活动
import { PlayerDataComponent } from '@app/admin/activity/player-data/player-data.component'
import { PlayerDataDetailComponent } from '@app/admin/activity/player-data/detail/player-data-detail.component'

// import { CreateOrEditGameModalComponent } from '@app/activity/activity/game/operation/create-or-edit-game.component';


import {AdminSharedModule} from '@app/admin/shared/admin-shared.module';
import {AppSharedModule} from '@app/shared/app-shared.module';

@NgModule({
    imports: [
        AdminSharedModule,
        AppSharedModule,


        CommonModule,
        FormsModule,
        ModalModule,
        TabsModule,
        TooltipModule,
        AppCommonModule,
        UtilsModule,
        ActivityRoutingModule,
        CountoModule,
        NgxChartsModule,
        BsDatepickerModule.forRoot(),
        BsDropdownModule.forRoot(),
        PopoverModule.forRoot(),
        PaginatorModule,
        TableModule,
        TreeModule,
        AutoCompleteModule,
    ],
    declarations: [
        ActivityComponent,
        // ActivityDataComponent,
        // ActivityBasicComponent,
        // ActivityAdvancedComponent,
        // ActivityPrizeComponent,
        PageTemplateComponent,
        // GameComponent,
        CreateActivityModalComponent,
        // ChangeWhiteListModalComponent,
        // ExpressDetailModalComponent,
        // CreateOrEditPrizeModalComponent,
        // CreateOrEditWhiteListModalComponent,
        PageTemplateModalComponent,
        PlayerDataComponent,
        // //活动
        // CreateOrEditGameModalComponent,
        PlayerDataDetailComponent
    ],
    exports:[
        // CreateOrEditGameModalComponent
    ],
    providers: [
        { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
        { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
        { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale }
    ]
})
export class ActivityModule { }
