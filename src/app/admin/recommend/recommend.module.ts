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
import { RecommendRoutingModule } from './recommend-routing.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { BsDatepickerModule, BsDatepickerConfig, BsDaterangepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { NgxBootstrapDatePickerConfigService } from 'assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service';

NgxBootstrapDatePickerConfigService.registerNgxBootstrapDatePickerLocales();

import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TreeModule } from 'primeng/tree';

import { AutoCompleteModule } from 'primeng/autocomplete';
import { from } from 'rxjs';


//推荐
import { PersonalRecommendComponent } from '@app/admin/recommend/personal-recommend/personal-recommend.component';
import { FortuneModalComponent } from '@app/admin/recommend/personal-recommend/operation/fortune-modal.component';
import { PersonalityModalComponent } from '@app/admin/recommend/personal-recommend/operation/personality-modal.component';
import { PersonalCategoryComponent } from '@app/admin/recommend/personal-category/personal-category.component';
import { CreateOrEditCatModalComponent } from '@app/admin/recommend/personal-category/create-or-edit-personalCategory-modal.component';
import { FaceRecommendComponent } from '@app/admin/recommend/face-recommend/face-recommend.component';
import { FaceModalComponent } from '@app/admin/recommend/face-recommend/operation/face-modal.component';

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
        RecommendRoutingModule,
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
        PersonalRecommendComponent,
        FortuneModalComponent,
        PersonalityModalComponent,
        PersonalCategoryComponent,
        CreateOrEditCatModalComponent,
        FaceRecommendComponent,
        FaceModalComponent,
    ],
    providers: [
        { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
        { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
        { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale }
    ]
})
export class RecommendModule { }
