import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked, AfterViewInit } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { SoftwareServiceProxy, UpdateDeviceSoftwareInput } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { TokenService } from '@abp/auth/token.service';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'appSettingModal',
    templateUrl: './app-setting-modal.component.html',
    styles: []
})
export class AppSettingModalComponent extends AppComponentBase {
    @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    saving: boolean = false;
    progress:number=0;
    settings:UpdateDeviceSoftwareInput = new UpdateDeviceSoftwareInput();
    dispatchedId: any;
    name: any;
    constructor(injecor: Injector, private _appService:SoftwareServiceProxy,
                private _tokenService:TokenService) {
        super(injecor);
    }

    save() {
        if (!this.checkJson(this.settings.extensionData)) {
            return
        }
        this.saving = true;
        this._appService.updateDeviceSoftware(this.settings).pipe(finalize(() => {
            this.saving = false;
        })).subscribe((result)=>{
            this.notify.info(this.l('success'));
            this.modalSave.emit();
            this.modal.hide();
                
        })
    }
    //选中文件
    uploadFile(e) {
        var form = document.forms.namedItem('materialPacketUrlForm');
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
                    self.settings.materialPacketUrl = result.result.fileUri;
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
        this.settings.materialPacketUrl = '';
    }
    close(): void {
        this.modal.hide();
    }
    //弹出显示方法
    show(software, deviceId) {
        this.dispatchedId = software.dispatchedId;
        this.name = software.name;
        this.settings = new UpdateDeviceSoftwareInput(software);
        this.settings.deviceId = deviceId;
        this.modal.show()
    }
    //监听显示事件
    onShown() {
        
    }
 

}
