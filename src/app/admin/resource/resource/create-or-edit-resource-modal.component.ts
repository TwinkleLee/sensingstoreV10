import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { CreateResourceFileInput,UpdateResourceFileInput,ResourceFileServiceProxy, FileServiceProxy, TokenAuthServiceProxy, TagServiceProxy} from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { TokenService } from 'abp-ng2-module';
import { finalize } from 'rxjs/operators';


export enum ResourceFileDtoType {
    None = "None", 
    Text = "Text", 
    Image = "Image", 
    Video = "Video", 
    PPT = "PPT", 
    PDF = "PDF", 
    Web = "Web", 
    Audio = "Audio", 
    Zip = "Zip", 
    View3DS = "View3DS", 
    Other = "Other", 
    Json = "Json", 
}
export enum FileArea2 {
    Common = "Common", 
    Users = "Users", 
    Apps = "Apps", 
    Products = "Products", 
    Matchs = "Matchs", 
    Likes = "Likes", 
    Ads = "Ads", 
    Coupon = "Coupon", 
    Peripheral = "Peripheral", 
    DeviceCategory = "DeviceCategory", 
    ProductCategory = "ProductCategory", 
    DeviceType = "DeviceType", 
    Staffs = "Staffs", 
    Devices = "Devices", 
}
export enum Type {
    Resource = "Resource", 
    Device = "Device", 
    Product = "Product", 
    Ads = "Ads", 
    Other = "Other", 
    Brand = "Brand", 
    Question = "Question", 
    Counter = "Counter", 
    WechatPublicMessage = "WechatPublicMessage", 
}
@Component({
    selector: 'createOrEditResourceModal',
    templateUrl: './create-or-edit-resource-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditResourceModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput',{static:true}) nameInput: ElementRef;
    @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;


    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    operation: string = "add";
    filename:string ='';
    progress:number=0;
    file:any={};
    resource: any = {};
    tags:any[]=[];
    tagSuggestion:any[]=[];
    ResourceFileDtoType = ResourceFileDtoType;
    ResourceFileDtoTypes = Object.keys(ResourceFileDtoType);
    createresource: CreateResourceFileInput;
    updateresource: UpdateResourceFileInput;

    fileType:any={
        'zip':this.ResourceFileDtoType.Zip,
        'png':this.ResourceFileDtoType.Image,
        'jpg':this.ResourceFileDtoType.Image,
        'ppt':this.ResourceFileDtoType.PPT,
        'pdf':this.ResourceFileDtoType.PDF,
        'html':this.ResourceFileDtoType.Web,
        'mp3':this.ResourceFileDtoType.Audio,
        'aiff':this.ResourceFileDtoType.Audio,
        'flac':this.ResourceFileDtoType.Audio,
        'ape':this.ResourceFileDtoType.Audio,
        'wav':this.ResourceFileDtoType.Audio,
        'mp4':this.ResourceFileDtoType.Video,
        'avi':this.ResourceFileDtoType.Video,
        'mov':this.ResourceFileDtoType.Video,
        'mpeg':this.ResourceFileDtoType.Video,
        'mpg':this.ResourceFileDtoType.Video,
        'wmv':this.ResourceFileDtoType.Video,
        'asf':this.ResourceFileDtoType.Video,
        'rm':this.ResourceFileDtoType.Video,
        'rmvb':this.ResourceFileDtoType.Video,
        'ra':this.ResourceFileDtoType.Video,
        'mkv':this.ResourceFileDtoType.Video,
        'vob':this.ResourceFileDtoType.Video,
    };
    FileArea2= FileArea2;
    FileArea2s = Object.keys(FileArea2);
    constructor(
        injector: Injector,
        private _resourceService: ResourceFileServiceProxy, 
        private _fileService:FileServiceProxy,
        private _tokenService:TokenService,
        private _TagServiceProxy:TagServiceProxy,
        private _refService:ChangeDetectorRef
    ) {
        super(injector);
        
    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(resource?: any): void {
        this.active = true;
        if (resource) {
            this.operation = "edit";
            resource.tenantId = resource.tenantId==0?void 0:resource.tenantId;
            this.resource = resource;
            this.file={
                'name':this.resource.fileUrl
            };
            this.resource.type = ResourceFileDtoType[this.resource.typeString];
            this.tags = this.resource.resourceTags.map((item)=>{
                return {
                    'id':item.id,
                    'value':item.name
                }
            })||[];
        } else {
            this.operation = "add";
            this.resource = {};
            this.file = {};
            this.tags = [];
            this.resource.tenantId = this.appSession.tenantId||void 0;
            // this.resource.organizationUnitId = this.appSession.ouId||void 0;
            
            this.resource.type = ResourceFileDtoType.None;
            this.resource.category = FileArea2.Common;
        }
        this._refService.detectChanges();
        this.modal.show();
    }

    onShown(): void {
        if (this.nameInput) {
            $(this.nameInput.nativeElement).focus()
        }
    }
     //筛选tags
     //筛选标签
     filter(event) {
        //获取标签下拉
        this._TagServiceProxy.getTagsByType(event.query,void 0,100,0,0).subscribe((result)=>{
                this.tagSuggestion = result.items;
        })
    }
    assignTags(){
        var tagString = [];
            this.tags.forEach((items)=>{
                    tagString.push(items.id);
            })
            this.resource.tags = tagString;
    }
    

    save(): void {
        this.saving = true;
        this.resource.tags = this.tags.map((tag)=>{
            return Number(tag.id);
        })
        if(!this.resource.fileUrl){
            this.resource.fileUrl =this.file.name
        }
        if (this.operation == "add") {
            this.createresource = new CreateResourceFileInput(this.resource);
            this._resourceService.createResource(this.createresource)
            .pipe(finalize(() => {this.saving = false; }))
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        } else {
            this.updateresource = new UpdateResourceFileInput(this.resource)
            this._resourceService.updateResource(this.updateresource)
            .pipe(finalize(() => { this.saving = false; }))
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        }
    }

    close(): void {
        this.active = false;
        this.operation = "add";
        this.modal.hide();
    }
    //判断文件类型
    judgeType(name){
            var attrs = name.split('.');
            var  attr = attrs[attrs.length-1];
            return this.fileType[attr] || this.ResourceFileDtoType.Other
    }
    //选中文件
    uploadFile(e){
        var file = e.target.files[0],size;
            size = file.size;
            this.resource.type = size;
            this.resource.type = this.judgeType(file.name);
            this.file = file;
            if(!this.resource.category){
                    return this.notify.info(this.l('ResourceCategoryNeeded'))
            }
            var form = document.forms.namedItem('IncidentForm');
            var formData = new FormData(form);
                formData.append('ToResource ','true');
                formData.append('CreateThumbnail ','true');
                formData.append('IsLocal ','true');
                
            var tenantId = this.appSession.tenantId;
            var token = this._tokenService.getToken();
            var url = AppConsts.remoteServiceBaseUrl + "/api/File/UploadSingleBigFile?fileArea="+this.resource.category;
            var self = this;
            $.ajax({
                'type':'POST',
                'url':url,
                'contentType':false,
                'beforeSend': function(request) {
                  request.setRequestHeader("Authorization", "Bearer " + token);
                  request.setRequestHeader("Abp.TenantId",tenantId+'');
                },
                'xhr':function(){
                  var xhr = $.ajaxSettings.xhr();
                  xhr.upload.onprogress = function(event){
                      var loaded = event.loaded;
                      var total = event.total;
                      self.progress = Math.floor(100 * loaded / total);
                  };
                  return xhr;
                },
                'processData':false,
                'data':formData,
                'dataType':"json",
                'success':function(result,status,xhr){
                    if(result.success){
                       self.resource.fileUrl = result.result.fileUri;
                        self.resource.thumbnailUrl = result.result.thumbnailUri;
                        self.notify.info(self.l('success'));
                        setTimeout(function(){
                            self.progress = 0;
                        },500)
                    }
                 },
                 'error':function(xhr,status,error){
                    self.notify.warn(error);
                 }
              })
    }
    //清空资源
    resetResource(){
        this.file = {};
        this.resource.type = this.ResourceFileDtoType.None;
        this.resource.fileUrl = '';
        this.resource.thumbnailUrl = '';
    }



    resourceOnUpload(result): void {
        this.resource.fileUrl = result.fileUri;
    }
}
