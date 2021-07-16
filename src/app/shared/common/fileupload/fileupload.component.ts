import { Component, OnInit, Injector, Input, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DomSanitizer } from '@angular/platform-browser';
import { FileServiceProxy, _definitions_FileArea as FileArea, ResourceFileServiceProxy, FileType as ResourceFileDtoType0, _definitions_FileArea as FileArea2, OssServerServiceProxy, CreateResourceFileInput, FileType as CreateResourceFileInputType } from '@shared/service-proxies/service-proxies';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { AppConsts } from '@shared/AppConsts';
// import { TokenService } from 'abp-ng2-module/dist/src/auth/token.service';
import { TokenService } from 'abp-ng2-module';

import { FileuploadResPoolComponent } from '@app/shared/common/fileupload/respool/resource-pool.component';

/*        Common,
          Users,
          Apps,
          Products,
          Matchs,
          Likes,
          Ads,
          Coupon,
          Peripheral,
          DeviceCategory,
          ProductCategory,
          DeviceType,
          Staff
*/
export enum fileAccept {
  any = "*",
  img = "image/*",
  zip = ".zip",
}

enum ResourceFileDtoType {
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


@Component({
  selector: 'app-fileupload',
  templateUrl: './fileupload.component.html',
  styleUrls: ['./fileupload.component.css']
})
export class FileuploadComponent extends AppComponentBase implements OnInit {
  //
  @ViewChild('dataTable', { static: false }) dataTable: Table;
  @ViewChild('paginator', { static: false }) paginator: Paginator;
  @ViewChild('advance', { static: true }) advance: ElementRef;
  @ViewChild('fileupload', { static: true }) fileupload: ElementRef;
  @ViewChild('resourcePool', { static: true }) resourcePool: FileuploadResPoolComponent;

  //输入参数
  @Input() fileUrl: any;
  @Input() multiple?: boolean = false;
  @Input() mode?: fileAccept = fileAccept.any;
  @Input() require?: boolean = false;
  @Input() _resourcetype?: any = "Image";
  //广播事件
  @Output() onUpLoadEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() onBeforeSendEvent?: EventEmitter<any> = new EventEmitter<any>();
  @Output() onErrorEvent?: EventEmitter<any> = new EventEmitter<any>();
  @Output() onProgressEvent?: EventEmitter<any> = new EventEmitter<any>();


  EmptyHolder: string = AppConsts.appBaseUrl + "/assets/common/images/holderimg2.png";
  EmptyHolderV: string = AppConsts.appBaseUrl + "/assets/common/images/holdervideo.png";
  EmptyHolderA: string = AppConsts.appBaseUrl + "/assets/common/images/holderaudio.png";
  EmptyHolderP: string = AppConsts.appBaseUrl + "/assets/common/images/holderPDF.png";
  EmptyHolderW: string = AppConsts.appBaseUrl + "/assets/common/images/holderWeb.png";
  EmptyHolderPPT: string = AppConsts.appBaseUrl + "/assets/common/images/holderPPT.png";
  EmptyHolderT: string = AppConsts.appBaseUrl + "/assets/common/images/holderText.png";
  EmptyHolderZ: string = AppConsts.appBaseUrl + "/assets/common/images/holderZip.png";
  EmptyHolderO: string = AppConsts.appBaseUrl + "/assets/common/images/holderOther.png";






  //控件图片地址
  get _fileUrl() {//解决bug
    // this.judgeType(this.fileUrl);
    return this.fixFileUrl(this.fileUrl);
  }
  //类型
  ResourceFileDtoTypes = Object.keys(ResourceFileDtoType);
  fileType: any = {
    'zip': ResourceFileDtoType.Zip,
    'png': ResourceFileDtoType.Image,
    'jpg': ResourceFileDtoType.Image,
    'jpeg': ResourceFileDtoType.Image,
    'ppt': ResourceFileDtoType.PPT,
    'pdf': ResourceFileDtoType.PDF,
    'html': ResourceFileDtoType.Web,
    'mp3': ResourceFileDtoType.Audio,
    'aiff': ResourceFileDtoType.Audio,
    'flac': ResourceFileDtoType.Audio,
    'ape': ResourceFileDtoType.Audio,
    'wav': ResourceFileDtoType.Audio,
    'mp4': ResourceFileDtoType.Video,
    'avi': ResourceFileDtoType.Video,
    'mov': ResourceFileDtoType.Video,
    'mpeg': ResourceFileDtoType.Video,
    'mpg': ResourceFileDtoType.Video,
    'wmv': ResourceFileDtoType.Video,
    'asf': ResourceFileDtoType.Video,
    'rm': ResourceFileDtoType.Video,
    'rmvb': ResourceFileDtoType.Video,
    'ra': ResourceFileDtoType.Video,
    'mkv': ResourceFileDtoType.Video,
    'vob': ResourceFileDtoType.Video,
    'txt': ResourceFileDtoType.Text,
    'json': ResourceFileDtoType.Json
  };
  areaMap = {
    'common': "Common",
    'users': "Users",
    'apps': "Apps",
    'products': "Products",
    'matchs': "Matchs",
    'likes': "Likes",
    'ads': "Ads",
    'coupon': "Coupon",
    'peripheral': "Peripheral",
    'devicecategory': "DeviceCategory",
    'productcategory': "ProductCategory",
    'devicetype': "DeviceType",
    'staff': "Staff"
  };
  //上传参数
  filearea: string = "Common";
  fileinput: any;
  // _resourcetype: string = "Image";
  _toResource: boolean = true;
  uploadedFiles: any[] = [];
  isLocal: boolean = true;
  WebUrl: string;
  Prefix: string;
  CreateThumbnail: boolean = true;

  //输入的web资源路径
  inputUrl: string;
  filterText: string = '';
  //提示信息
  alert: string;
  _maxSize: number = 100 * 1024 * 1024;
  poped: boolean = false;
  progress: number = 0;
  fileName: string = "";
  xhr: XMLHttpRequest;
  appliedResourceId: number;
  constructor(injector: Injector,
    public dz: DomSanitizer,
    private _fileService: FileServiceProxy,
    private _tokenService: TokenService,
    private _resourceService: ResourceFileServiceProxy,
    private _OssServerServiceProxy: OssServerServiceProxy) {
    super(injector);
  }
  ngOnInit() {
    this.getFileArea();
    /*拖拽的目标对象------ document 监听drop 并防止浏览器打开客户端的图片*/
    document.ondragover = function (e) {
      e.preventDefault();  //只有在ondragover中阻止默认行为才能触发 ondrop 而不是 ondragleave
    };
    document.ondrop = function (e) {
      e.preventDefault();  //阻止 document.ondrop的默认行为  *** 在新窗口中打开拖进的图片
    };
    // console.log(this.fileType, 111, ResourceFileDtoType)
    // debugger
  }
  //获取当前fileArea
  getFileArea() {
    var formName = ($(this.fileupload.nativeElement).closest("form").attr("name") || '').replace('Form', '').toLowerCase();
    if (formName in this.areaMap) {
      this.filearea = this.areaMap[formName];
    }
  }
  //切换高级参数
  toggleAdvance() {
    this.poped = !this.poped;
    this.poped && $(this.advance.nativeElement).removeAttr("hidden");
    !this.poped && $(this.advance.nativeElement).attr("hidden", "hidden");
  }
  //点击选取文件
  fileChange(e) {
    //新方法
    let file = e.target.files[0];
    this.judgeType(file.name);
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
            this.progress = p * 100;
            console.log('p', p);
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
            this.onUpLoadEvent.emit({
              'resourceId': rr.id,
              'fileUri': fileUrl,
              'thumbnailUri': rr.thumbnailUrl
            });
            this.setImgUrl(fileUrl);
            this.message.warn('资源上传成功');
          })
        }).catch(function (err) {
          console.log(err);
        });
      } else {
        this.uploadedFiles = [];
        this.uploadedFiles.push(file);
        this.onUpload();
      }

    })
    //老方法
    // this.uploadedFiles = [];
    // var file = e.target.files[0];
    // this.judgeType(file.name);
    // this.uploadedFiles.push(file);
    // this.onUpload();
  }
  //拖拽file
  allowGrag(e) {
    e.preventDefault();
  }
  fileGrop(e) {
    let file = e.dataTransfer.files[0];
    this.judgeType(file.name);
    if (file.size > this._maxSize) {
      return this.showMsg(this.l("fileTooLarge"));
    }
    let self = this;
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      // self.setImgUrl(self.dz.bypassSecurityTrustUrl(reader.result));
    }
    this.uploadedFiles = [];
    this.uploadedFiles.push(file);
    this.onUpload(null);
  }
  //公用方法设置预览图url
  setImgUrl(url) {
    var dropArea = document.getElementsByClassName('dropArea')[0];
    if (!url || url == "") {
      this.showMsg(this.l('EmptyUrl'));
    }
    this.judgeType(url);
    this.fileUrl = url;
  }

  // V3 科沃斯上传图片方法
  uploadForEcovacs(filearea, isLocal, WebUrl, Prefix, toResource, CreateThumbnail, onprogress, errorCallBack, successCallBack) {
      var form = $(this.fileupload.nativeElement).find("form")[0];
      var formData = new FormData(<HTMLFormElement>form);
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
        'xhr': function () {
          var xhr = $.ajaxSettings.xhr();
          self.xhr = xhr;
          xhr.upload.onprogress = function (event) {
            onprogress && onprogress(event);
          };
          xhr.onabort = function () {
            self.progress = 0;
            self.xhr = null
          }
          return xhr;
        },
        'processData': false,
        'data': formData,
        'dataType': "json",
        'success': function (result, status, xhr) {
          if (result.success) {
            successCallBack && successCallBack(result.result);
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
              self.onUpLoadEvent.emit({
                'resourceId': rr.id,
                'fileUri': fileUrl,
                'thumbnailUri': rr.thumbnailUrl
              });
              self.setImgUrl(fileUrl);
              self.notify.info(self.l('success'));
              setTimeout(function () {
                self.progress = 0;
              }, 500)
            })
          }
        },
        'error': function (xhr, status, error) {
          errorCallBack && errorCallBack(error);
          self.notify.warn(JSON.stringify(error));
        }
      })
  }

  //
  showEmpty(e?, isLoad?) {
    if (isLoad) {
      this.fileUrl = this.LoadingHolder;
    } else {
      this.fileUrl = this.EmptyHolder;
    }
  }
  //web资源库
  setWebFileUrl(e?) {
    e && e.preventDefault();
    if (!this.WebUrl) { return; }
    this.judgeType(this.WebUrl);
    this.uploadedFiles = [];
    this.fileinput = null;
    this.onUpload();
  }

  //清除文件
  clearFile() {
    this.xhr && this.xhr.abort();
    this.uploadedFiles = [];
    this.WebUrl = "";
    this.fileName = "";
    this.fileUrl = this.EmptyHolder;
    this.fileinput = null;
    this.appliedResourceId = undefined;
    this.onUpLoadEvent.emit({
      'resourceId': null,
      'fileUri': null,
      'thumbnailUri': null
    });
  }
  //显示提示/报错
  showMsg(msg) {
    this.alert = msg;
    setTimeout(() => {
      this.alert = "";
    }, 1000)
  }
  //选中文件
  uploadFile(filearea, isLocal, WebUrl, Prefix, toResource, CreateThumbnail, onprogress, errorCallBack, successCallBack) {
    var form = $(this.fileupload.nativeElement).find("form")[0];
    var formData = new FormData(<HTMLFormElement>form);
    console.log(formData);
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
        self.xhr = xhr;
        xhr.upload.onprogress = function (event) {
          onprogress && onprogress(event);
        };
        xhr.onabort = function () {
          self.progress = 0;
          self.xhr = null
        }
        return xhr;
      },
      'processData': false,
      'data': formData,
      'dataType': "json",
      'success': function (result, status, xhr) {
        if (result.success) {
          successCallBack && successCallBack(result.result);
          self.notify.info(self.l('success'));
          setTimeout(function () {
            self.progress = 0;
          }, 500)
        }
      },
      'error': function (xhr, status, error) {
        errorCallBack && errorCallBack(error);
        self.notify.warn(JSON.stringify(error));
      }
    })
  }
  //上传到服务器
  onUpload(event?: any) {
    this.showEmpty(null, true);
    // V3 for ecovacs
    if (AppConsts.customTheme == 'kewosi') {
      this.uploadForEcovacs(FileArea[this.filearea], this.isLocal, this.WebUrl, this.Prefix, this._toResource, this.CreateThumbnail, (event) => {
        var loaded = event.loaded;
        var total = event.total;
        this.progress = Math.floor(100 * loaded / total);
      }, (error) => {
        this.showEmpty();
        this.onErrorEvent.emit({
          'event': error
        })
        this.clearFile();
        this.notify.warn("uploadError");
      }, (r) => {
        this.onUpLoadEvent.emit(r);
        this.setImgUrl(r.fileUri);
      });
    } else {
      this.uploadFile(FileArea[this.filearea], this.isLocal, this.WebUrl, this.Prefix, this._toResource, this.CreateThumbnail, (event) => {
        var loaded = event.loaded;
        var total = event.total;
        this.progress = Math.floor(100 * loaded / total);
      }, (error) => {
        this.showEmpty();
        this.onErrorEvent.emit({
          'event': error
        })
        this.clearFile();
        this.notify.warn("uploadError");
      }, (r) => {
        this.onUpLoadEvent.emit(r);
        this.setImgUrl(r.fileUri);
      });
    }
    
  }
  onProgress(event?: any) {
    this.onProgressEvent.emit({
      'event': event
    })
  }
  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }
  //获取资源列表
  getResources(event?: LazyLoadEvent) {
    // if (this.primengTableHelper.shouldResetPaging(event)) {
    //   this.paginator.changePage(0);
    //   return;
    // }
    console.log("this.primengTableHelper", this.primengTableHelper)
    console.log("this.paginator", this.paginator)
    console.log("this.dataTable", this.dataTable)
    if (!this.appSession.tenantId) return
    this.primengTableHelper.showLoadingIndicator();
    this._resourceService.getResources(
      undefined,
      undefined,
      FileArea2[this.filearea],
      this.filterText,
      this.primengTableHelper.getSorting(this.dataTable),
      5,
      this.primengTableHelper.getSkipCount(this.paginator, event)
    )
      .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
      .subscribe(result => {
        this.primengTableHelper.totalRecordsCount = result.totalCount;
        this.primengTableHelper.records = result.items;
        // this.primengTableHelper.hideLoadingIndicator();
      });
  }
  applyResource(e) {
    this.paginator.first = e.index;
    setTimeout(() => {
      this.paginator.updatePaginatorState();
    }, 0);
    setTimeout(() => {
      this.getResources();
    }, 10);
    this.useResPool(e.selection);
  }
  //
  useResPool(record) {
    this.appliedResourceId = record.id;
    this.fileUrl = record.fileUrl;
    this.judgeType(this.fileUrl);
    this.onUpLoadEvent.emit({
      'resourceId': record.id,
      'fileUri': record.fileUrl,
      'thumbnailUri': record.thumbnailUrl
    });
  }
  //判断文件类型
  judgeType(name) {
    if (name == this.EmptyHolder || name == this.LoadingHolder) { return; }
    if (!name) { return this._resourcetype = ResourceFileDtoType.Image; }
    //getname
    var names = name.split(/\/|\\/);
    this.fileName = names[names.length - 1].split("?")[0];
    var attrs = name.split('.');
    var attr = attrs[attrs.length - 1].split("?");
    var att = attr[0];
    this._resourcetype = this.fileType[att] || ResourceFileDtoType.Other;
  }
  //
  ajust(e) {
    var shape = e.target.naturalWidth > e.target.naturalHeight;
    if (shape) {
      $(e.target).removeAttr('height');
      $(e.target).attr('width', "100%");
    } else {
      $(e.target).removeAttr('width');
      $(e.target).attr('height', "100%");
    }
  }
  //
  showPool() {
    this.resourcePool.show();
  }
  //
  getFilearea() {
    return FileArea[this.filearea];
  }
}
