import { AfterViewChecked, Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AppComponentBase } from '@shared/common/app-component-base';
import Editor from '../../../../../node_modules/wangeditor/dist/wangEditor.js';

import { FileServiceProxy, _definitions_FileArea as FileArea, ResourceFileServiceProxy, FileType as ResourceFileDtoType0, _definitions_FileArea as FileArea2, OssServerServiceProxy, CreateResourceFileInput, FileType as CreateResourceFileInputType } from '@shared/service-proxies/service-proxies';
import { TokenService } from 'abp-ng2-module';
import { AppConsts } from '@shared/AppConsts.ts';
import { from } from 'rxjs';

@Component({
    selector: 'w-editor',
    changeDetection: ChangeDetectionStrategy.Default,
    templateUrl: './w-editor.component.html',
    styleUrls: ['./w-editor.css']
})

export class WEditorComponent extends AppComponentBase implements AfterViewChecked, OnDestroy, OnInit {

    editor: any;
    _resourcetype: string = 'Image';
    fileName: string = "";

    // 上传参数
    filearea: string = "Common";
    fileinput: any;
    _toResource: boolean = true;
    uploadedFiles: any[] = [];
    isLocal: boolean = true;
    WebUrl: string;
    Prefix: string;
    CreateThumbnail: boolean = true;

    @Input() html: string = '';
    @Output("onComplete") complete: EventEmitter<any> = new EventEmitter();

    constructor(
        private _router: Router,
        private _tokenService: TokenService,
        private _resourceService: ResourceFileServiceProxy,
        private _OssServerServiceProxy: OssServerServiceProxy,
        injector: Injector
    ) {
        super(injector);
    }

    ngOnInit() {

        this.editor = new Editor("#editorMenu", "#editor");
        this.editor.config.customUploadImg = this.onUploads.bind(this);
        this.setEditorConfig();

        this.editor.config.onchange = (html) => {
            this.complete.emit(html)
        }
        this.editor.create();

    }

    // 监测@Input传过来的值，如果有变化就会执行这里面的方法
    /*注意 ngOnChanges的生命周期执行的顺序在ngOnInit之前*/
    ngOnChanges(changes: SimpleChanges): void {

        console.log(changes);
        if (changes['html'] != undefined) {
            this.editor.txt.html(changes['html'].currentValue);
            this.html = changes['html'].currentValue;
        }
    }

    async onUploads(resultFiles, insertImgFn) {
        // resultFiles 是 input 中选中的文件列表
        // insertImgFn 是获取图片 url 后，插入到编辑器的方法
        // 上传图片，返回结果，将图片插入到编辑器中
        this.uploadbigFile(resultFiles, insertImgFn);
    }

    uploadbigFile(resultFiles, successCallBack) {
        let file = resultFiles[0];
        let storeAs = "Uploads/Tenants/" + this.appSession.tenantId + "/Common/" + new Date().getTime() + file.name;
        this._OssServerServiceProxy.getToken().subscribe(r => {
            if (r.useStsServer) {
                let client = new OSS({
                    accessKeyId: r.accessKeyId,
                    accessKeySecret: r.accessKeySecret,
                    stsToken: r.security,
                    endpoint: r.endpoint,
                    bucket: r.bucketName
                });
                client.multipartUpload(storeAs, file, {
                    progress: async (p, checkpoint) => {
                    }
                }).then(result => {
                    console.log(result);
                    var fileUrl = "http://sensingstore.oss-cn-shanghai.aliyuncs.com/" + result.name;
                    this._resourceService.createResource(new CreateResourceFileInput({
                        name: "" + new Date().getTime(),
                        tenantId: this.appSession.tenantId,
                        organizationUnitId: null,
                        fileUrl: fileUrl,
                        content: null,
                        type: CreateResourceFileInputType[CreateResourceFileInputType[this._resourcetype]],
                        size: 0,
                        orderNumber: 0,
                        width: null,
                        height: null,
                        thumbnailUrl: null,
                        category: "Common",
                        tags: [],
                        md5: null
                    })).subscribe(rr => {
                        console.log(rr)
                        successCallBack && successCallBack(rr.fileUrl);
                    })
                }).catch(function (err) {
                    console.log(err);
                });
            } else {
                this.onUpload(file, successCallBack);
            }

        })
    }

    //上传到服务器
    onUpload(file, successCallBack,event?: any) {
        // V3 for ecovacs
        if (AppConsts.customTheme == 'kewosi') {
            this.uploadForEcovacs(file, FileArea[this.filearea], this.isLocal, this.WebUrl, this.Prefix, this._toResource, this.CreateThumbnail, successCallBack);
        } else {
            this.uploadFile(file, FileArea[this.filearea], this.isLocal, this.WebUrl, this.Prefix, this._toResource, this.CreateThumbnail, successCallBack);
        }
    }

    // V3 科沃斯上传图片方法
    uploadForEcovacs(file, filearea, isLocal, WebUrl, Prefix, toResource, CreateThumbnail, successCallBack) {
        var formData = new FormData();
        formData.append('file', file);
        var token = this._tokenService.getToken();
        var url = AppConsts.remoteServiceBaseUrl + '/api/File/SaveUploadFile';
        // 接口更改
        var self = this;
        $.ajax({
            'type': 'POST',
            'url': url,
            'contentType': false,
            'beforeSend': function (request) {
                request.setRequestHeader("Authorization", "Bearer " + token);
            },
            'processData': false,
            'data': formData,
            'dataType': "json",
            'success': function (result, status, xhr) {
                if (result.success) {
                    // successCallBack && successCallBack(result.result);
                    // https 替换成 http
                    var fileUrl = result.result.fileUri.replace(/https/, 'http')
                    self._resourceService.createResource(new CreateResourceFileInput({
                        name: "" + new Date().getTime(),
                        tenantId: self.appSession.tenantId,
                        organizationUnitId: null,
                        fileUrl: fileUrl,
                        content: null,
                        type: CreateResourceFileInputType[CreateResourceFileInputType[self._resourcetype]],
                        size: 0,
                        orderNumber: 0,
                        width: null,
                        height: null,
                        thumbnailUrl: null,
                        category: "Common",
                        tags: [],
                        md5: null
                    })).subscribe(rr => {
                        console.log(rr)
                        successCallBack && successCallBack(rr.fileUrl);
                    })
                }
            }
        })
    }
    //选中文件
    uploadFile(file, filearea, isLocal, WebUrl, Prefix, toResource, CreateThumbnail, successCallBack) {
        var formData = new FormData();
        formData.append('file', file);
        formData.append('Prefix', String(Prefix));
        formData.append('ToResource', String(toResource));
        formData.append('WebUrl', String(WebUrl));
        formData.append('CreateThumbnail', String(CreateThumbnail));
        formData.append('IsLocal', String(isLocal));
        formData.append('FileType', String(this._resourcetype));
        //拼接http头部信息    
        var tenantId = this.appSession.tenantId;
        var token = this._tokenService.getToken();
        var url = AppConsts.remoteServiceBaseUrl + "/api/File/UploadSingleBigFile?fileArea=" + filearea;

        console.log(AppConsts.remoteServiceBaseUrl, AppConsts);

        var self = this;
        $.ajax({
            'type': 'POST',
            'url': url,
            'contentType': false,
            'beforeSend': function (request) {
                request.setRequestHeader("Authorization", "Bearer " + token);
                request.setRequestHeader("Abp.TenantId", tenantId + '');
            },
            'processData': false,
            'data': formData,
            'dataType': "json",
            'success': function (result, status, xhr) {
                if (result.success) {
                    var fileUrl = result.result.fileUri.replace(/https/, 'http')
                    self._resourceService.createResource(new CreateResourceFileInput({
                        name: "" + new Date().getTime(),
                        tenantId: self.appSession.tenantId,
                        organizationUnitId: null,
                        fileUrl: fileUrl,
                        content: null,
                        type: CreateResourceFileInputType[CreateResourceFileInputType[self._resourcetype]],
                        size: 0,
                        orderNumber: 0,
                        width: null,
                        height: null,
                        thumbnailUrl: null,
                        category: "Common",
                        tags: [],
                        md5: null
                    })).subscribe(rr => {
                        console.log(rr)
                        successCallBack && successCallBack(rr.fileUrl);
                    })
                }
            },
        })
    }

    // 设置富文本编辑器
    setEditorConfig() {
        // 菜单展示项配置
        this.editor.config.menus = this.getMenuConfig();
        // 自定义配置颜色（字体颜色、背景色）
        this.editor.config.colors = this.getColorConfig();
    }

    // 设置可选颜色
    getColorConfig(): string[] {
        // 配置颜色（文字颜色、背景色）
        return [
            '#000000',
            '#eeece0',
            '#1c487f',
            '#4d80bf'
        ]
    }

    // 获取显示菜单项
    getMenuConfig(): string[] {
        return [
            'head',
            'bold',
            'fontSize',
            'fontName',
            'italic',
            'underline',
            'strikeThrough',
            'indent',
            'lineHeight',
            'foreColor',
            'backColor',
            'link',
            'list',
            'todo',
            'justify',
            'quote',
            'emoticon',
            'image',
            'video',
            'table',
            'code',
            'splitLine',
            'undo',
            'redo',
        ];
    }

    ngAfterViewChecked() { }

    ngOnDestroy() { }

}
