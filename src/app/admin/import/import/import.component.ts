import { Component, OnInit, Injector } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { Router, ActivatedRoute } from '@angular/router';
import { TokenService } from 'abp-ng2-module';
import { DateMetaPhysicsServiceProxy } from '@shared/service-proxies/service-proxies4';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
// import { BatchTaskLogServiceProxy } from '@shared/service-proxies/service-proxies-product';
import { ViewChild } from '@angular/core';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { FaceTagsServiceProxy } from '@shared/service-proxies/service-proxies4';
import { ImportCargoRoadsServiceProxy } from '@shared/service-proxies/service-proxies-smartdevice';
import { ImportQuestionsServiceProxy } from '@shared/service-proxies/service-proxies5';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.css']
})

export class ImportComponent extends AppComponentBase implements OnInit {
  @ViewChild('paginatorhistory', { static: true }) paginatorhistory: Paginator;
  @ViewChild('paginator', { static: true }) paginator: Paginator;
  historyPrimeng: PrimengTableHelper = new PrimengTableHelper();
  model: any = {};
  progress: Number = 0;
  fileName;
  isFile;
  package;
  deviceId;
  importUrls: any = {
    //通过jq直接调接口
    'match': AppConsts.remoteProductServiceUrl + '/ImportMatches/ImportMatchByZip',
    'like': AppConsts.remoteProductServiceUrl + '/ImportLikes/ImportLikeByZip',
    'device': AppConsts.remoteDeviceCenterUrl + '/ImportDevices/ImportDevicesByExcel',
    'ads': AppConsts.remoteAdserviceUrl + '/ImportAds/ImportAdsByZip',
    'product': AppConsts.remoteProductServiceUrl + '/ImportProducts/ImportProductByZip',
    'organization-units': AppConsts.remoteServiceBaseUrl + '/ImportStores/ImportStoresByExcel',
    'rfid': AppConsts.remoteProductServiceUrl + '/ImportSkuRfids/ImportSkuRfidByExcel',
    'storagecheck': AppConsts.remoteProductServiceUrl + '/ImportStorageCheck/ImportStoageCheckByExcel',
    'training': AppConsts.remoteActivityServiceUrl + '/ImportTrainings/ImportTrainingsByExcel',
    'room': AppConsts.remoteDeviceCenterUrl + '/ImportFloorGuideRoomAndStore/ImportBrandAndStoreFromExcel',
    'sulwhasoo': AppConsts.remoteDeviceCenterUrl + '/ImportDeviceSchedule/ImportDeviceStoreScheduleByExcel',
    'store': AppConsts.remoteDeviceCenterUrl + '/ImportFloorGuideRoomAndStore/ImportStoreFromExcel',
  }
  accept = {
    'match': 'zip',
    'like': 'zip',
    'device': 'excel',
    'ads': 'zip',
    'product': 'zip',
    'organization-units': 'excel',
    'recommend': 'excel',
    // 'whiteuser':'excel',
    'faceRecommend': 'excel',
    'cargo': 'excel',
    'question': 'excel',
    'rfid': 'excel',
    'storagecheck': 'excel',
    'training': 'excel',
    'room': 'excel',
    'sulwhasoo': 'excel',
    'store': 'excel',
  }
  tempUrls: any = {
    'match': AppConsts.appBaseUrl + '/assets/common/batch_match.zip',
    'like': AppConsts.appBaseUrl + '/assets/common/batch_like.zip',
    'device': AppConsts.appBaseUrl + '/assets/common/batch_device.xlsx',
    'ads': AppConsts.appBaseUrl + '/assets/common/batch_ads.zip',
    'product': AppConsts.appBaseUrl + '/assets/common/batch_product.zip',
    'organization-units': AppConsts.appBaseUrl + '/assets/common/batch_ou.xlsx',
    'recommend': AppConsts.appBaseUrl + '/assets/common/recommend.xlsx',
    // 'whiteuser':AppConsts.appBaseUrl + '/assets/common/whiteUser.csv',
    'faceRecommend': AppConsts.appBaseUrl + '/assets/common/faceRecommend.xlsx',
    'cargo': AppConsts.appBaseUrl + '/assets/common/cargo.xlsx',
    'question': AppConsts.appBaseUrl + '/assets/common/question.xlsx',
    'rfid': AppConsts.appBaseUrl + '/assets/common/rfid.xlsx',
    'storagecheck': AppConsts.appBaseUrl + '/assets/common/storagecheck.xlsx',
    'training': AppConsts.appBaseUrl + '/assets/common/training.xlsx',
    'room': AppConsts.appBaseUrl + '/assets/common/room.xlsx',
    'sulwhasoo': AppConsts.appBaseUrl + '/assets/common/sulwhasoo.xlsx',
    'store': AppConsts.appBaseUrl + '/assets/common/store.xlsx',
  }

  target: any = 'match';
  constructor(injector: Injector,
    // private _batchTaskLog: BatchTaskLogServiceProxy,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private _tokenService: TokenService,
    private _dateMetaService: DateMetaPhysicsServiceProxy,
    private _ImportCargoRoadsServiceProxy: ImportCargoRoadsServiceProxy,
    private _FaceTagsServiceProxy: FaceTagsServiceProxy,
    private _ImportQuestionsServiceProxy: ImportQuestionsServiceProxy,
  ) {
    super(injector);
    //监听路由变化
    var urls = window.location.pathname.split('\/');
    this.target = urls[urls.length - 1]
    console.log(this.target)
    this.activatedRoute.queryParams.subscribe(queryParams => {
      if (queryParams.id) this.deviceId = queryParams.id;
    })
  }
  ngOnInit() {
  }

  //查询同步历史
  getSyncHistory(event?: LazyLoadEvent) {
  //   if (this.historyPrimeng.shouldResetPaging(event)) {
  //     this.paginatorhistory.changePage(0);
  //     return;
  //   }
  //   this.historyPrimeng.showLoadingIndicator();
  //   this._batchTaskLog.getBatchTaskLogs(
  //     'ImportProducts',
  //     void 0,
  //     void 0,
  //     void 0,// this.historyPrimeng.getSorting(this.dataTablehistory) || 'taobao_user_nick',
  //     this.historyPrimeng.getMaxResultCount(this.paginatorhistory, event),
  //     this.historyPrimeng.getSkipCount(this.paginatorhistory, event)
  //   )
  //     .pipe(this.myFinalize(() => { this.historyPrimeng.hideLoadingIndicator(); }))
  //     .subscribe(result => {
  //       this.historyPrimeng.totalRecordsCount = result.totalCount;
  //       this.historyPrimeng.records = result.items;
  //       // this.historyPrimeng.hideLoadingIndicator();
  //     });
  }

  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginatorhistory, event);
  }

  getAccept() {
    return this.accept[this.target];
  }
  fileChangeEvent(event: any) {
    let fileReader = new FileReader();
    let file = <File>event.target.files[0];
    if (file) {
      this.fileName = file.name;
      this.model.file = file
      this.isFile = true;
    }
  }
  //返回
  goBack() {
    if (this.target == 'whiteuser') {
      this.router.navigate(['app', 'admin', 'activity', 'activity', 'prize']);
    } 
    else if (this.target == 'cargo') {
      this.router.navigate(['app', 'admin', 'device', 'deviceList', 'operation', this.deviceId]);
    } 
    else if (this.target == 'rfid') {
      // this.router.navigate(['app', 'admin', 'product', 'outputin']);
      window.history.back();
    } 
    else if (this.target == 'storagecheck') {
      this.router.navigate(['app', 'admin', 'product', 'outputin']);
    }
    else if (this.target == 'advertisement') {
      this.router.navigate(['app', 'admin', 'advertisement', 'advertisement']);
    }
    else if (this.target == 'device') {
      this.router.navigate(['app', 'admin', 'device', 'deviceList']);
    }
    else if (this.target == 'room') {
      this.router.navigate(['app', 'admin', 'floor', 'room']);
    }
    else if (this.target == 'like') {
      this.router.navigate(['app', 'admin', 'product', 'like']);
    }
    else if (this.target == 'question') {
      this.router.navigate(['app', 'admin', 'question', 'question']);
    }
    else if (this.target == 'faceRecommend') {
      this.router.navigate(['app', 'admin', 'recommend', 'faceRecommend']);
    }
    else if (this.target == 'recommend') {
      this.router.navigate(['app', 'admin', 'recommend', 'recommend']);
    }
    else if (this.target == 'training') {
      this.router.navigate(['app', 'admin', 'training', 'training']);
    } 
    else if (this.target == 'sulwhasoo' || this.target == 'store') {
      this.router.navigate(['app', 'admin', 'entityStore', 'entityStore']);
    } 
    else if (this.target == 'ads') {
      this.router.navigate(['app', 'admin', 'advertisement', 'adsList']);
    } 
    else if (this.target == 'organization-units') {
      this.router.navigate(['app', 'admin', 'organization-units']);
    } 
    else if (this.target == 'match') {
      this.router.navigate(['app', 'admin', 'product', 'match']);
    }
    else {
      this.router.navigate(['app', 'admin', this.target, this.target]);
    }
  }
  //两种上传文件方式
  upload() {
    if (this.target == "recommend") {
      console.log(this.target)
      this._dateMetaService.postImportFile({
        data: this.model.file,
        fileName: this.fileName
      }).subscribe(result => {
        this.notify.info(result);
      })
    }
    else if (this.target == "faceRecommend") {
      this._FaceTagsServiceProxy.importFaceTagsExcelFile({
        data: this.model.file,
        fileName: this.fileName
      }).subscribe(result => {
        this.notify.info(result);
      })
    }
    else if (this.target == "cargo") {

      this._ImportCargoRoadsServiceProxy.postCargoRoadsImportFile(
        this.deviceId,
        {
          data: this.model.file,
          fileName: this.fileName
        }
      ).subscribe(result => {
        this.notify.info(result);
      })
    }

    else if (this.target == "question") {
      this._ImportQuestionsServiceProxy.importQuestionByExcel({
        data: this.model.file,
        fileName: this.fileName
      }).subscribe(result => {
        this.notify.info(result.importResult);
      })
    }
    // else if (this.target == "room") {
    //   this._ImportFloorGuideRoomAndStoreServiceProxy.importBrandAndStoreFromExcel(this.model.file).subscribe(result => {
    //     // this.notify.info(result.importResult);
    //     console.log("res", result)
    //   })
    // }

    // else if (this.target == "rfid") {
    // this._ImportSkuRfidsServiceProxy.importSkuRfidByExcel({
    //   data: this.model.file,
    //   fileName: this.fileName
    // } as FileParameter).subscribe(result => {
    //   this.notify.info('success');
    // })

    // this._ImportSkuRfidsServiceProxy.importSkuRfidByExcel(
    //   this.model.file).subscribe(result => {
    //     this.notify.info('success');
    //   })
    // }
    // else if (this.target == "storagecheck") {
    // this._ImportStorageCheckServiceProxy.importStoageCheckByExcel({
    //   data: this.model.file,
    //   fileName: this.fileName
    // } as FileParameter).subscribe(result => {
    //   this.notify.info('success');
    // })

    // const content_ = new FormData();
    // content_.append("InputFile", this.model.file, this.fileName);
    // this._ImportStorageCheckServiceProxy.importStoageCheckByExcel(
    //   content_
    // ).subscribe(result => {
    //   this.notify.info('success');
    // })

    // let reader = new FileReader();
    // let rs = reader.readAsArrayBuffer(this.model.file);
    // let blob = null;
    // reader.onload = (e: any) => {
    //   if (typeof e.target.result === 'object') {
    //     blob = new Blob([e.target.result])
    //   } else {
    //     blob = e.target.result
    //   }
    //   this._ImportStorageCheckServiceProxy.importStoageCheckByExcel(
    //     blob
    //   ).subscribe(result => {
    //     this.notify.info('success');
    //   })
    // }


    // }
    else {
      var form = document.forms.namedItem('importForm');
      var formData = new FormData(form);
      var url = this.importUrls[this.target];
      var tenantId = this.appSession.tenantId;
      var token = this._tokenService.getToken();
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
          if (result.success && self.target == "room") {
            console.log("result", result.result)
            self.message.warn(JSON.stringify(result.result));
          } else if (result.result.importState && result.success) {
            self.notify.info(result.result.importResult);
            self.getSyncHistory();
          }
        },
        'error': function (xhr, status, error) {
          self.notify.warn(error);
        }
      })
    }

  }

  download(src) {
    console.log(src)
    var a = document.createElement("a");
    a.download = this.target;
    a.href = src;
    a.click();
  }
}
