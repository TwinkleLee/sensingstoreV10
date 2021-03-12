import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { SoftwareServiceProxy, CreateSoftwareInput } from '@shared/service-proxies/service-proxies-ads';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { TokenService } from 'abp-ng2-module';
import { finalize } from 'rxjs/operators';

export enum CreateSoftwareInputEnvType {
    H5Screen = "H5Screen",
    UWP = "UWP",
    WPF_Win32 = "WPF_Win32",
    Android = "Android",
    IOS = "IOS",
}
export enum CreateSoftwareInputType {
    None = "None",
    GAME = "GAME",
    Behavior = "Behavior",
    Shopping = "Shopping",
    Customerize = "Customerize"
}

@Component({
    selector: 'createAppModal',
    templateUrl: './create-app-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateAppModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput', { static: true }) nameInput: ElementRef;
    @ViewChild('createAppModal', { static: true }) modal: ModalDirective;


    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    progress: number = 0;
    active = false;
    saving = false;
    software: any;
    createAppInput: CreateSoftwareInput;
    tagSuggestion;
    CreateSoftwareInputEnvType = CreateSoftwareInputEnvType;
    CreateSoftwareInputEnvTypes = Object.keys(CreateSoftwareInputEnvType);
    CreateSoftwareInputType = CreateSoftwareInputType;
    CreateSoftwareInputTypes = Object.keys(CreateSoftwareInputType);
    constructor(
        injector: Injector,
        private _appService: SoftwareServiceProxy,
        private _tokenService: TokenService
    ) {
        super(injector);
    }
    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
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
    show(): void {
        this.active = true;
        this.software = {};
        this.modal.show();
    }

    onShown(): void {
        if (this.nameInput) {
            $(this.nameInput.nativeElement).focus()
        }
    }
    save(): void {
        if (!this.checkJson(this.software.setting)) {
            return
        }
        this.createAppInput = new CreateSoftwareInput(this.software);
        this._appService.createSoftware(this.createAppInput)
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
            });
    }
    close(): void {
        this.active = false;
        this.software = {};
        this.modal.hide();
    }
    // upload completed event
    onUploadPic(result): void {
        this.software.largeImageUrl = result.fileUri;
    }
    onUploadIcon(result): void {
        this.software.logoUrl = result.fileUri;
    }
    onBeforeSend(e?) {

    }
}
