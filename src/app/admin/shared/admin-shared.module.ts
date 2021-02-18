import {NgModule} from '@angular/core';
import {RoleComboComponent} from '@app/admin/shared/role-combo.component';
import {AppSharedModule} from '@app/shared/app-shared.module';
import {PermissionTreeComponent} from '@app/admin/shared/permission-tree.component';
import {PermissionTreeModalComponent} from '@app/admin/shared/permission-tree-modal.component';
import {PermissionComboComponent} from '@app/admin/shared/permission-combo.component';
import {OrganizationUnitsTreeComponent} from '@app/admin/shared/organization-unit-tree.component';
import {FeatureTreeComponent} from '@app/admin/shared/feature-tree.component';
import {EditionComboComponent} from '@app/admin/shared/edition-combo.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TreeModule} from '@node_modules/primeng/tree';
import {TooltipModule} from 'ngx-bootstrap/tooltip';
import {PerfectScrollbarModule} from '@node_modules/ngx-perfect-scrollbar';
import {CommonModule} from '@angular/common';
import {UtilsModule} from '@shared/utils/utils.module';
import {AppCommonModule} from '@app/shared/common/app-common.module';
import {TableModule} from '@node_modules/primeng/table';
import {DragDropModule} from '@node_modules/primeng/dragdrop';
import {ContextMenuModule} from '@node_modules/primeng/contextmenu';
import {PaginatorModule} from '@node_modules/primeng/paginator';
import {AutoCompleteModule} from '@node_modules/primeng/autocomplete';
import {EditorModule} from '@node_modules/primeng/editor';
import {InputMaskModule} from '@node_modules/primeng/inputmask';
import {CountoModule} from '@node_modules/angular2-counto';
import {TextMaskModule} from '@node_modules/angular2-text-mask';
import {ImageCropperModule} from '@node_modules/ngx-image-cropper';
import {DropdownModule} from '@node_modules/primeng/dropdown';
import {AppBsModalModule} from '@shared/common/appBsModal/app-bs-modal.module';
import {FileUploadModule} from 'ng2-file-upload';
import {FileUploadModule as PrimeNgFileUploadModule} from 'primeng/fileupload';

@NgModule({
    declarations: [
        RoleComboComponent,
        PermissionTreeComponent,
        PermissionTreeModalComponent,
        PermissionComboComponent,
        OrganizationUnitsTreeComponent,
        FeatureTreeComponent,
        EditionComboComponent
    ],
    imports: [
        AppSharedModule,
        ReactiveFormsModule,
        TreeModule,
        TooltipModule,
        FormsModule,
        CommonModule,
        UtilsModule,
        AppCommonModule,
        TableModule,
        TreeModule,
        DragDropModule,
        ContextMenuModule,
        PaginatorModule,
        AutoCompleteModule,
        EditorModule,
        InputMaskModule,
        CountoModule,
        TextMaskModule,
        ImageCropperModule,
        PerfectScrollbarModule,
        DropdownModule,
        AppBsModalModule,
        FileUploadModule,
        PrimeNgFileUploadModule,
    ],
    exports: [
        RoleComboComponent,
        PermissionTreeComponent,
        PermissionTreeModalComponent,
        PermissionComboComponent,
        OrganizationUnitsTreeComponent,
        FeatureTreeComponent,
        EditionComboComponent,
        UtilsModule,
        AppCommonModule,
        TableModule,
        TreeModule,
        DragDropModule,
        ContextMenuModule,
        PaginatorModule,
        AutoCompleteModule,
        EditorModule,
        InputMaskModule,
        CountoModule,
        TextMaskModule,
        ImageCropperModule,
        PerfectScrollbarModule,
        DropdownModule,
        AppBsModalModule,
        AppSharedModule,
        ReactiveFormsModule,
        TreeModule,
        TooltipModule,
        FormsModule,
        CommonModule,
        FileUploadModule,
        PrimeNgFileUploadModule,
    ]
})
export class AdminSharedModule {
}
