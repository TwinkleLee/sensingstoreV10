import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked, Input } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { BuildingServiceProxy} from '@shared/service-proxies/service-proxies-floor';
import { RoomServiceProxy, CreateRoomInput, UpdateRoomInput, FloorServiceProxy } from '@shared/service-proxies/service-proxies-floor';

import { AddOrUpdateOutPutInStorageBillInput, GetOutPutInStorageRecordInput, OutPutInStorageServiceProxy, OutPutInStorageSku } from '@shared/service-proxies/service-proxies-product';
import { ProductServiceProxy, RedeemType,UpdateProductInput, TagServiceProxy, ApplyServiceProxy, CreateApplyFormInput, ApplyFormType as CreateApplyFormInputApplyType, ApplyWanted as CreateApplyFormInputWanted, ProductCategoryServiceProxy, TagType as Type,ProductPointRule,RedeemRule,AwardRule } from '@shared/service-proxies/service-proxies-product';
        
import { SkuGridModalComponent } from '@app/admin/organization-units/organization-detail/sku-grid-modal.component';

import * as _ from 'lodash'
import { result } from 'lodash-es';

@Component({
  selector: 'skuModal',
  templateUrl: './product-sku-detail-modal.component.html',
})
export class ProductSkuDetailModalComponent extends AppComponentBase implements AfterViewChecked {

  constructor(
    injector: Injector,
    private _productsService: ProductServiceProxy
  ) {
    super(injector);
    
  }
  ProductSelectionList:any=[];
  pProduct:any=[];
  length:any=0;
  @ViewChild('createOrEditModal', { static: false }) modal: ModalDirective;
  @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
  ngAfterViewChecked(): void {

  }
  
        
  onShown() {

  }
  onOperateProduct(event?){

  }
  getProductByDeviceId(event?){

  }
  ngOnInit(): void {
  }
  show(record:any):void{
    this._productsService.getProductSkus(
      record.id,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
    ).subscribe(result=>{
      this.pProduct.records = result.items;
      this.length=this.pProduct.records.length;
      console.log("result:",result);
    })
    this.modal.show()
    console.log("record:",record);
  }
  close(): void {
    this.modal.hide();
  }

}
