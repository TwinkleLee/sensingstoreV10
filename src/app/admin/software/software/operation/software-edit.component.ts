import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { EnviormentEnum as CreateSoftwareInputEnvType, SoftwareType as CreateSoftwareInputType, SoftwareServiceProxy, UpdateSoftwareInput } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { ConnectorService } from '@app/shared/services/connector.service';
import { Router } from '@angular/router';
import { LazyLoadEvent } from 'primeng/primeng';
import { Paginator } from 'primeng/components/paginator/paginator';
import { SoftwareAuthComponent } from '@app/software/software/auth/software-auth.component';
import { Table } from 'primeng/components/table/table';
import { TokenService } from '@abp/auth/token.service';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'SoftwareEdit',
    templateUrl: './software-edit.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class SoftwareEditComponent extends AppComponentBase {

    @ViewChild('dataTable', { static: false }) dataTable: Table;
    @ViewChild('paginator', { static: false }) paginator: Paginator;
    @ViewChild('SoftwareAuth', { static: true }) SoftwareAuth: SoftwareAuthComponent;

    saving = false;
    ToResource: boolean = true;
    uploadUrl: string;
    uploadedFiles: any[] = [];
    operation: string = "add";
    software: any = {};
    progress: number = 0;
    filterText = '';
    addOrEditInput: UpdateSoftwareInput = new UpdateSoftwareInput();
    CreateSoftwareInputEnvType = CreateSoftwareInputEnvType;
    CreateSoftwareInputType = CreateSoftwareInputType;
    CreateSoftwareInputEnvTypes = Object.keys(CreateSoftwareInputEnvType);
    CreateSoftwareInputTypes = Object.keys(CreateSoftwareInputType);
    constructor(
        injector: Injector,
        private _appService: SoftwareServiceProxy,
        private router: Router,
        private connector: ConnectorService,
        private _tokenService: TokenService
    ) {
        super(injector);
        var urls = location.pathname.split("\/"), id;
        id = urls[urls.length - 1];
        this.software.id = id;
        _appService.getSingleSoftware(id).subscribe((result) => {
            this.software = result;
            this.software.resolution = (this.software.targetResolution_Width || 0) + "*" + (this.software.targetResolution_Height || 0);
        });
        // var a = this.isJson(`{"name":"666"}`)
        // var b = this.isJson('{name:}')
        // console.log(a, b)
    }
    //转换序列
    transIndex(i, event?: LazyLoadEvent) {
        return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
    }

    //获取软件授权列表
    getAuthList(event?: LazyLoadEvent) {
        this._appService.getSoftWareAuthList(
            this.software.id,
            undefined,
            this.filterText,
            this.primengTableHelper.getSorting(this.dataTable),
            this.primengTableHelper.getMaxResultCount(this.paginator, event),
            this.primengTableHelper.getSkipCount(this.paginator, event)
        )
            .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
            .subscribe((result) => {
                this.primengTableHelper.totalRecordsCount = result.totalCount;
                this.primengTableHelper.records = result.items;
                // this.primengTableHelper.hideLoadingIndicator();
            })
    }
    //添加软件授权
    addAuth() {
        this.SoftwareAuth.show({
            'softwareId': this.software.id
        });
    }
    //编辑授权
    editAuthRecord(record) {
        this.SoftwareAuth.show(record);
    }
    //删除授权
    deleteAuthRecord(record) {
        this.message.confirm(this.l('deletethisauthrecord'), this.l('AreYouSure'), (r) => {
            if (r) {
                this._appService.removeAuthorizeToTenant(record.softwareId, record.tenantId).subscribe((result) => {
                    this.notify.info(this.l('success'));
                    this.getAuthList()
                })
            }
        })
    }
    //返回
    back() {
        this.router.navigate(['app', 'software', 'software']);
    }
    //保存
    save(): void {

        if (!this.checkJson(this.software.setting)) {
            return
        }


        this.saving = true;
        var resolutions = (this.software.resolution || '').split('*');
        this.software.targetResolution_Width = resolutions[0] || 0;
        this.software.targetResolution_Height = resolutions[1] || 0;
        this.addOrEditInput = new UpdateSoftwareInput(this.software);

        this._appService.updateSoftware(this.addOrEditInput)
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.back();
            });
    }
    //选中文件
    uploadFile(e) {
        var form = document.forms.namedItem('packageUrlForm');
        var formData = new FormData(form);
        formData.append('ToResource ', 'true');
        formData.append('CreateThumbnail ', 'true');
        formData.append('IsLocal ', 'true');
        var tenantId = this.appSession.tenantId;
        var token = this._tokenService.getToken();
        var url = AppConsts.remoteServiceBaseUrl + "/api/File/UploadSingleBigFile?fileArea=Apps";
        var self = this;
        $.ajax({
            'type': 'POST',
            'url': url,
            'contentType': false,
            'beforeSend': function (request) {
                request.setRequestHeader("Authorization", "Bearer " + token);
                request.setRequestHeader("Abp.TenantId", tenantId + '');
            },
            'xhr': function () {
                var xhr = $.ajaxSettings.xhr();
                xhr.upload.onprogress = function (event) {
                    var loaded = event.loaded;
                    var total = event.total;
                    self.progress = Math.floor(100 * loaded / total);
                };
                return xhr;
            },
            'processData': false,
            'data': formData,
            'dataType': "json",
            'success': function (result, status, xhr) {
                if (result.success) {
                    self.software.packageUrl = result.result.fileUri;
                    self.notify.info(self.l('success'));
                    setTimeout(function () {
                        self.progress = 0;
                    }, 500)
                }
            },
            'error': function (xhr, status, error) {
                self.notify.warn(error);
            }
        })
    }
    //清空资源
    resetResource() {
        this.software.packageUrl = '';
    }
    // upload completed event
    onUploadPic(result): void {
        this.software.largeImageUrl = result.fileUri;
    }
    onUploadIcon(result): void {
        this.software.logoUrl = result.fileUri;
    }
    onBeforeSend(event): void {

    }
}
