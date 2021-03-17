import { Component, OnInit, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import {MatchInfoServiceProxy} from '@shared/service-proxies/service-proxies-product';
import { AppConsts } from '@shared/AppConsts';
import { ConnectorService } from '@app/shared/services/connector.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})
export class MatchComponent extends AppComponentBase {

 
  // @ViewChild('editUserPermissionsModal') editPerPermissionsModal: EditPerPermissionsModalComponent;
  @ViewChild('dataTable',{static:true}) dataTable: Table;
  @ViewChild('paginator',{static:true}) paginator: Paginator;

  filterText:string;
  skuid:number;
  matchSelection:any[]=[];
  constructor(injector: Injector,
              private _matchService:MatchInfoServiceProxy,
              private router:Router,
              private route:ActivatedRoute,
              private Connector:ConnectorService) {
      super(injector);
   }

  //获取外设列表
  getMatchInfos(event?: LazyLoadEvent){
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.primengTableHelper.showLoadingIndicator();
      this._matchService.gets(
          this.skuid,
          this.filterText,
          this.primengTableHelper.getSorting(this.dataTable)||'name',
          this.primengTableHelper.getMaxResultCount(this.paginator, event),
          this.primengTableHelper.getSkipCount(this.paginator, event)
      )
      .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
      .subscribe(result => {
          this.primengTableHelper.totalRecordsCount = result.totalCount;
          this.primengTableHelper.records = result.items;
          // this.primengTableHelper.hideLoadingIndicator();
    });
  }
   //切换显示模式
   toggle(f) {
    if (f) {
      $("#tableShow").show();
      $("#gridShow").hide();
    } else {
      $("#tableShow").hide();
      $("#gridShow").show();
    }
  }
  //操作matchinfo
  operateMatchInfo(f,record?){
    if(f=='add'){
        this.Connector.setCache('matchinfo',null);
        this.router.navigate(['operation'],{relativeTo:this.route});
    }else if(f=='info'){
        this.Connector.setCache('matchinfo',Object.assign({},record));
        this.router.navigate(['operation',record.id],{relativeTo:this.route});
    }else if(f=='delete'){
      this.message.confirm(this.l("DeleteThisMatchQuestion"),this.l('AreYouSure'), (r) => {
        if (r) {
          this._matchService.delete(record.id).subscribe(result=>{
            this.matchSelection = [];
            this.notify.info(this.l('success'));
            this.getMatchInfos();
          })
        }
      })
    }     
  }
  //图片操作
  onOperate(e){
      this.operateMatchInfo(e.action,e.image);
  }
  //转换序列
  transIndex(i,event?: LazyLoadEvent){
    return i+1+this.primengTableHelper.getSkipCount(this.paginator,event);
  }
  //转换图片路径
  transfileUrl(fileUrl){
     var url;
     if(!fileUrl){
        url = './assets/common/images/holderimg.png';
     }else if(fileUrl.indexOf('http:')>-1||fileUrl.indexOf('https:')>-1||fileUrl.indexOf('data:')>-1){
        url = fileUrl;
      }else{
        url = AppConsts.remoteServiceBaseUrl+'\\'+fileUrl;
      } 
      return url;
  }

  //前往导入页面
  goImport(){
    this.router.navigate(['app','admin','import','import','match']);
  }

}


