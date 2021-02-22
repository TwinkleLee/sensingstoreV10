import { Component, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';

import { BrandServiceProxy, OnlineOrOffLineBrandInput, ApplyWanted as OnlineOrOffLineBrandInputWanted } from '@shared/service-proxies/service-proxies';
import { Router, ActivatedRoute } from '@angular/router';
import { TagServiceProxy, TagType as Type } from '@shared/service-proxies/service-proxies';


@Component({
  selector: 'app-brand-center',
  templateUrl: './brand-center.component.html',
  styleUrls: ['./brand-center.component.css'],
  animations: [appModuleAnimation()]
})
export class BrandCenterComponent extends AppComponentBase {

  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  filterText: string;
  startTime;
  endTime;
  orderStatus;

  tagList: any = [];
  tagId: any = '';
  brandPublishList = [];

  constructor(injector: Injector,
    private _brandService: BrandServiceProxy,
    private router: Router,
    private route: ActivatedRoute,
    private _TagServiceProxy: TagServiceProxy) {
    super(injector);
    this._TagServiceProxy.getTagsByType(
      undefined,
      undefined,
      99,
      0,
      Type['Brand']
    ).subscribe(result => {
      this.tagList = result.items
    });
  }

  //获取广告列表
  getBrands(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.primengTableHelper.showLoadingIndicator();
    this._brandService.gets(
      this.tagId,
      undefined,
      this.filterText,
      this.primengTableHelper.getSorting(this.dataTable),
      this.primengTableHelper.getMaxResultCount(this.paginator, event),
      this.primengTableHelper.getSkipCount(this.paginator, event)
    )
      .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
      .subscribe(result => {
        this.primengTableHelper.totalRecordsCount = result.totalCount;
        this.primengTableHelper.records = result.items;
        // this.primengTableHelper.hideLoadingIndicator();
        this.brandPublishList = [];
      });
  }
  createBrand() {
    this.router.navigate(['operation'], { relativeTo: this.route });
  }
  editBrand(record) {
    this.router.navigate(['operation', record.id], { relativeTo: this.route });
  }
  deleteBrand(record) {
    this.message.confirm(`
    <div class="form-group">
        <label class="kt-checkbox">
            <input id="brand_center_isDeleteProductBelongBrand" class="form-control" type="checkbox" name="isDeleteProductBelongBrand" checked/>${this.l('isDeleteProductBelongBrand')}
            <span></span>
        </label>
    </div>
 `, this.l('confirmDelete'), (r) => {
      if (!r) return
      if ($("#brand_center_isDeleteProductBelongBrand").is(':checked')) {
        var isIncludeProduct = true;
      } else {
        var isIncludeProduct = false;
      }
      this.primengTableHelper.showLoadingIndicator();
      var brandIds = [record.id]
      this._brandService.deleteBrands(
        isIncludeProduct,
        false,
        brandIds
      )
        .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
        .subscribe(r => {
          this.notify.info(this.l('success'));
          this.getBrands();
        })
    }, { isHtml: true })
  }


  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }





  online() {

    if (this.brandPublishList.length == 0) {
      this.message.warn(this.l('atLeastChoseOneItem'))
      return
    }

    this.message.confirm(`
    <div class="form-group">
        <label class="kt-checkbox">
            <input id="brand_center_isOnlineProductBelongBrand" class="form-control" type="checkbox" name="isOnlineProductBelongBrand" checked/>${this.l('isOnlineProductBelongBrand')}
            <span></span>
        </label>
    </div>
     `, this.l('confirmBrandOnline'), (r) => {
      if (!r) return

      if ($("#brand_center_isOnlineProductBelongBrand").is(':checked')) {
        var isIncludeProduct = true;
      } else {
        var isIncludeProduct = false;
      }
      this.primengTableHelper.showLoadingIndicator();

      var brandIds = this.brandPublishList.map(item => {
        return item.id
      })
      this._brandService.onlineOrOfflineBrand(new OnlineOrOffLineBrandInput({
        "isIncludeProduct": isIncludeProduct,
        "wanted": OnlineOrOffLineBrandInputWanted["Online"],
        "isAllBrands": false,
        "brandIds": brandIds
      }))
        .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
        .subscribe(r => {
          console.log(r)
          this.notify.info(this.l('success'));
          this.getBrands();
        })
    }, { isHtml: true })
  }

  offline() {
    if (this.brandPublishList.length == 0) {
      this.message.warn(this.l('atLeastChoseOneItem'))
      return
    }
    this.message.confirm(`
    <div class="form-group">
        <label class="kt-checkbox">
            <input id="brand_center_isOfflineProductBelongBrand" class="form-control" type="checkbox" name="isOfflineProductBelongBrand" checked/>${this.l('isOfflineProductBelongBrand')}
            <span></span>
        </label>
    </div>
    `, this.l('confirmBrandOffline'), (r) => {
      if (!r) return
      if ($("#brand_center_isOfflineProductBelongBrand").is(':checked')) {
        var isIncludeProduct = true;
      } else {
        var isIncludeProduct = false;
      }
      this.primengTableHelper.showLoadingIndicator();

      var brandIds = this.brandPublishList.map(item => {
        return item.id
      })
      this._brandService.onlineOrOfflineBrand(new OnlineOrOffLineBrandInput({
        "isIncludeProduct": isIncludeProduct,
        "wanted": OnlineOrOffLineBrandInputWanted["Offline"],
        "isAllBrands": false,
        "brandIds": brandIds
      }))
        .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
        .subscribe(r => {
          this.notify.info(this.l('success'));
          this.getBrands();
        })
    }, { isHtml: true })


  }


  onlineAll() {
    this.message.confirm(this.l('isOnlineProductBelongBrand'), this.l('AreYouSure'), (r) => {
      if (r) {
        var isIncludeProduct = true;
      } else {
        var isIncludeProduct = false;
      }

      this.message.confirm(this.l('confirmBrandOnline'), this.l('AreYouSure'), (r) => {
        if (r) {
          this.primengTableHelper.showLoadingIndicator();

          this._brandService.onlineOrOfflineBrand(new OnlineOrOffLineBrandInput({
            "isIncludeProduct": isIncludeProduct,
            "wanted": OnlineOrOffLineBrandInputWanted["Online"],
            "isAllBrands": true,
            "brandIds": []
          }))
            .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
            .subscribe(r => {
              // this.primengTableHelper.hideLoadingIndicator();

              console.log(r)
              this.notify.info(this.l('success'));
              this.getBrands();
            })
        }
      })
    })
  }

  offlineAll() {

    this.message.confirm(this.l('isOfflineProductBelongBrand'), this.l('AreYouSure'), (r) => {
      if (r) {
        var isIncludeProduct = true;
      } else {
        var isIncludeProduct = false;
      }

      this.message.confirm(this.l('confirmBrandOffline'), this.l('AreYouSure'), (r) => {
        if (r) {
          this.primengTableHelper.showLoadingIndicator();

          this._brandService.onlineOrOfflineBrand(new OnlineOrOffLineBrandInput({
            "isIncludeProduct": isIncludeProduct,
            "wanted": OnlineOrOffLineBrandInputWanted["Offline"],
            "isAllBrands": true,
            "brandIds": []
          }))
            .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
            .subscribe(r => {
              // this.primengTableHelper.hideLoadingIndicator();

              console.log(r)
              this.notify.info(this.l('success'));
              this.getBrands();
            })
        }
      })
    })

  }


  deleteBatch() {
    console.log(this.brandPublishList)
    if (this.brandPublishList.length == 0) {
      this.message.warn(this.l('atLeastChoseOneItem'))
      return
    }

    //此处应检测是否存在已上线的品牌
    if (this.brandPublishList.some(item => {
      return item.auditStatus == 1
    })) {
      this.message.warn(this.l('cantDeleteOnlineBrand'))
      return
    }


    this.message.confirm(this.l('isDeleteProductBelongBrand'), this.l('AreYouSure'), (r) => {
      if (r) {
        var isIncludeProduct = true;
      } else {
        var isIncludeProduct = false;
      }
      this.message.confirm(this.l('confirmBrandDelete'), this.l('AreYouSure'), (r) => {
        if (r) {
          this.primengTableHelper.showLoadingIndicator();
          var brandIds = this.brandPublishList.map(item => {
            return item.id
          })
          this._brandService.deleteBrands(
            isIncludeProduct,
            false,
            brandIds
          )
            .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
            .subscribe(r => {
              // this.primengTableHelper.hideLoadingIndicator();
              this.notify.info(this.l('success'));
              this.getBrands();
            })

        }
      })


    })
  }






}
