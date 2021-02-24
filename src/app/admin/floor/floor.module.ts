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
import { FloorRoutingModule } from './floor-routing.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { BsDatepickerModule, BsDatepickerConfig, BsDaterangepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { NgxBootstrapDatePickerConfigService } from 'assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service';

NgxBootstrapDatePickerConfigService.registerNgxBootstrapDatePickerLocales();

import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TreeModule } from 'primeng/tree';


import { FloorComponent } from './floor/floor.component'
import { CreateOrEditFloorModalComponent } from './floor/floor-modal.component'

import { BuildingComponent } from './building/building.component'
import { CreateOrEditBuildingModalComponent } from './building/building-modal.component'

import { RoomComponent } from './room/room.component'
import { CreateOrEditRoomModalComponent } from './room/room-modal.component'

import { CreateOrEditResourceModalComponent } from './floor/resource-modal.component'
import { CreateOrEditRoomResourceModalComponent } from './room/resource-modal.component'

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
        FloorRoutingModule,
        CountoModule,
        NgxChartsModule,
        BsDatepickerModule.forRoot(),
        BsDropdownModule.forRoot(),
        PopoverModule.forRoot(),
        PaginatorModule,
        TableModule,
        TreeModule,
    ],
    declarations: [
        FloorComponent,
        CreateOrEditFloorModalComponent,
        BuildingComponent,
        CreateOrEditBuildingModalComponent,
        RoomComponent,
        CreateOrEditRoomModalComponent,
        CreateOrEditResourceModalComponent,
        CreateOrEditRoomResourceModalComponent
    ],
    providers: [
        { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
        { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
        { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale }
    ]
})
export class FloorModule { }
