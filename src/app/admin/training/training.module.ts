import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { CountoModule } from 'angular2-counto';
mport { ModalModule } from '@node_modules/ngx-bootstrap/modal';
import { TabsModule } from '@node_modules/ngx-bootstrap/tabs';
import { TooltipModule } from '@node_modules/ngx-bootstrap/tooltip';
import { BsDropdownModule } from '@node_modules/ngx-bootstrap/dropdown';
import { PopoverModule } from '@node_modules/ngx-bootstrap/popover';
import { TrainingRoutingModule } from './training-routing.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { BsDatepickerModule, BsDatepickerConfig, BsDaterangepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { NgxBootstrapDatePickerConfigService } from 'assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service';

NgxBootstrapDatePickerConfigService.registerNgxBootstrapDatePickerLocales();

import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TreeModule } from 'primeng/tree';

import { TrainingListComponent} from '@app/admin/training/training/training-list.component';
import { MyTrainingComponent} from '@app/admin/training/training/my-training.component';
import { CreateOrEditTrainingModalComponent} from '@app/admin/training/training/create-or-edit-training-modal.component';
import { CourseComponent} from '@app/admin/training/training/course/course.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { from } from 'rxjs';
import {CreateOrEditCourseModalComponent} from './training/course/course-modal.component'
import { SetTrainingModalComponent } from './training/course/training-modal.component'

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
        TrainingRoutingModule,
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
        TrainingListComponent,
        MyTrainingComponent,
        CreateOrEditTrainingModalComponent,
        CourseComponent,
        CreateOrEditCourseModalComponent,
        SetTrainingModalComponent
    ],
    providers: [
        { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
        { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
        { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale }
    ]
})
export class TrainingModule { }
