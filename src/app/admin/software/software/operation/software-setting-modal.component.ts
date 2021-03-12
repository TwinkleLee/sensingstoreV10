import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked, AfterViewInit } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { SoftwareServiceProxy, UpdateAuthorizeSoftwareInput } from '@shared/service-proxies/service-proxies-ads';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { TokenService } from 'abp-ng2-module';
import { finalize } from 'rxjs/operators';
import { Table } from 'primeng/table';
import { PaperServiceProxy, PublishPapersToSoftwares } from '@shared/service-proxies/service-proxies5';
import { TagServiceProxy, TagType as Type } from '@shared/service-proxies/service-proxies';
import * as _ from 'lodash';


@Component({
    selector: 'softwareSettingModal',
    templateUrl: './software-setting-modal.component.html',
    styles: []
})
export class SoftwareSettingModalComponent extends AppComponentBase {
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild('dataTable', { static: false }) dataTable: Table;
    @ViewChild('paginator', { static: false }) paginator: Paginator;

    saving: boolean = false;
    name: any;
    progress: number = 0;
    software :any= new UpdateAuthorizeSoftwareInput();




    tags = [];
    tagFilter = "";
    filterText = "";
    paperPublishList = [];
    basicMsg: any = {};

    constructor(injecor: Injector,
        private _appService: SoftwareServiceProxy,
        private _tokenService: TokenService,
        private _PaperServiceProxy: PaperServiceProxy,
        private _TagServiceProxy: TagServiceProxy) {
        super(injecor);
        this.getTags();
    }

    deleteNaire(record) {
        this.message.confirm(this.l('deletethispaper'), this.l('AreYouSure'), (r) => {
            if (r) {
                var dispathcedSoftwareIds = [this.software.id];
                var paperIds = [record.id]
                this.paperPublishList = [];
                var input = new PublishPapersToSoftwares({
                    dispathcedSoftwareIds,
                    paperIds,
                    action: "delete"
                })

                this._PaperServiceProxy.publishPapersToSoftwares(input).subscribe(r => {
                    this.notify.info(this.l('success'));
                    this.getPaper();
                })
            }
        })
    }

    deleteNaireBatch() {
        this.message.confirm(this.l('deletethispaper'), this.l('AreYouSure'), (r) => {
            if (r) {
                var dispathcedSoftwareIds = [this.software.id];
                var paperIds = this.paperPublishList.map(item => {
                    return item.id
                });
                this.paperPublishList = [];
                var input = new PublishPapersToSoftwares({
                    dispathcedSoftwareIds,
                    paperIds,
                    action: "delete"
                })
                this._PaperServiceProxy.publishPapersToSoftwares(input).subscribe(r => {
                    this.notify.info(this.l('success'));
                    this.getPaper();
                })
            }
        })
    }

    save() {
        if (!this.checkJson(this.software.extensionData)) {
            return
        }
        this.saving = true;
        var software = new UpdateAuthorizeSoftwareInput(this.software);
        this._appService.updateAuthorizedSoftware(this.software).pipe(finalize(() => {
            this.saving = false;
        })).subscribe((result) => {
            this.notify.info(this.l('success'));
            this.modalSave.emit();
            this.modal.hide();

        })
    }
    //转换序列
    transIndex(i, event?: LazyLoadEvent) {
        return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
    }


    getTags() {
        this._TagServiceProxy.getTagsByType('', undefined, 1000, 0, Type.Question).subscribe((r) => {
            this.tags = r.items;
        })
    }

    getPaper(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }
        this.primengTableHelper.showLoadingIndicator();
        this._PaperServiceProxy.getDispatchedPapers(
            this.software.id,
            undefined,
            this.tagFilter ? [Number(this.tagFilter)] : [],
            this.filterText,
            this.primengTableHelper.getSorting(this.dataTable),
            this.primengTableHelper.getMaxResultCount(this.paginator, event),
            this.primengTableHelper.getSkipCount(this.paginator, event)
        )
            .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
            .subscribe(result => {
                console.log(result);
                this.primengTableHelper.totalRecordsCount = result.totalCount;
                this.primengTableHelper.records = result.items;
                // this.primengTableHelper.hideLoadingIndicator();
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
                    self.software.materialPacketUrl = result.result.fileUri;
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
        this.software.materialPacketUrl = '';
    }
    close(): void {
        this.primengTableHelper.records = [];
        this.paperPublishList = [];
        this.modal.hide();
    }
    //弹出显示方法
    show(authedsoftware) {
        this.name = authedsoftware.software.name;
        // this.software = new UpdateAuthorizeSoftwareInput(authedsoftware);
        this.software = _.clone(authedsoftware);
        this.basicMsg = authedsoftware.software;
        this.modal.show();
    }
    //监听显示事件
    onShown() {

    }


}
