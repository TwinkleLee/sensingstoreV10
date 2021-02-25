import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CreateOrderInput, OrderServiceProxy, OrderItemDto } from '@shared/service-proxies/service-proxies2';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { ProductServiceProxy } from '@shared/service-proxies/service-proxies';
import { SensingShopManageServiceProxy, DeliverOrderInput,GetRefundDetailDtoRefundWay } from '@shared/service-proxies/service-proxies2';
import * as moment from 'moment'


@Component({
    selector: 'orderDetailModal',
    templateUrl: './order-detail-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }
        .aaa td{
            background: #fff;
        }`
    ]

})
export class OrderDetailModalComponent extends AppComponentBase {

    @ViewChild('nameInput' ,{static:false}) nameInput: ElementRef;
    @ViewChild('createOrEditModal' ,{static:false}) modal: ModalDirective;


    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    order: any;
    operationType;
    editable = false;
    saving: boolean = false;
    orderStatusList;
    recordTitleList = [];

    companyList: any = [];
    deliver: any = {
        expressCompanyId: ''
    };
    refund: any = {
        imageUrls: []
    }
    activeIndex: any = 0;

    constructor(
        injector: Injector,
        private _OrderService: OrderServiceProxy,
        private _productsService: ProductServiceProxy,
        private _SensingShopManageServiceProxy: SensingShopManageServiceProxy
    ) {
        super(injector);
    }

    show(order?: any, editable?: boolean, orderStatusList?: any, activeIndex?: any): void {
        this.orderStatusList = orderStatusList;
        this.activeIndex = activeIndex ? activeIndex : 0;

        this.active = true;
        console.log(order);
        if (order) {
            this.editable = editable;
            this.operationType = "edit";
            this.order = Object.assign({}, order);
            if (this.order.from == 'weishop') {
                this._SensingShopManageServiceProxy.getExpressCompanies(
                    undefined,
                    undefined,
                    999,
                    0
                ).subscribe(r => {
                    this.companyList = r.items;
                })
            }
        } else {
            this.editable = editable;
            this.order = new CreateOrderInput();
            this.order.orderItems = [new OrderItemDto()];
            setTimeout(() => {
                this.order.orderDateTime = moment();
            }, 1000)
            this.operationType = "add";
        }
        this.modal.show();
    }

    save(e: Event) {
        !this.editable && e.preventDefault();
        this.saving = true;
        if (this.operationType == "add") {
            for (var i of this.order.orderItems) {
                if (i.title.title) {
                    i.title = i.title.title;
                } else {
                    i.picUrl = null;
                }
            }
            this._OrderService.createOrder(this.order).pipe(finalize(() => {
                this.saving = false;
            })).subscribe(() => {
                this.modalSave.emit();
                this.close();
            })
        } else {

            this._OrderService.updateOrder(this.order).pipe(finalize(() => {
                this.saving = false;
            })).subscribe(() => {
                this.modalSave.emit();
                this.close();
            })
        }
    }



    getOrderDeliverInfo() {
        if (this.order.status != '待发货') {
            this._SensingShopManageServiceProxy.getOrderDeliverInfo(this.order.id).subscribe(r => {
                this.deliver = r;
            })
        }
    }
    getRefundDetail() {
        if (this.order.status == '退款中' || this.order.status == '退款') {
            this._SensingShopManageServiceProxy.getRefundDetail(this.order.id).subscribe(r => {
                this.refund = r;
            })
        }
    }

    saveDeliver() {
        this.saving = true;
        this._SensingShopManageServiceProxy.deliverWeishopOrder({
            "orderId": this.order.id,
            "expressCompanyId": this.deliver.expressCompanyId,
            "expressNumber": this.deliver.expressNumber
        } as DeliverOrderInput).pipe(finalize(() => {
            this.saving = false;
        })).subscribe(r => {
            this.modalSave.emit();
            this.close();
        })
    }

    agreeReturn() {
        this._SensingShopManageServiceProxy.acceptRefundOrder(
            this.order.id
        ).pipe(finalize(() => {
            this.saving = false;
        })).subscribe(r => {
            this.modalSave.emit();
            this.close();
        })
    }
    disagreeReturn() {
        this._SensingShopManageServiceProxy.refuseRefundApply(
            this.order.id
        ).pipe(finalize(() => {
            this.saving = false;
        })).subscribe(r => {
            this.modalSave.emit();
            this.close();
        })
    }




    //转换序列
    transIndex(i) {
        return i + 1;
    }

    close(): void {
        this.active = false;
        this.deliver = {
            expressCompanyId: ''
        };
        this.refund = {
            imageUrls: []
        }
        this.modal.hide();
    }

    createOrderItem() {
        this.order.orderItems.push(new OrderItemDto());
    }

    deleteOrderItem(i) {
        this.order.orderItems.splice(i, 1);
    }

    //筛选商品
    filterGoods(event) {
        this._productsService.getProducts(
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            false,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            event,
            undefined,
            10,
            0
        ).subscribe(result => {
            console.log(result, 222);
            this.recordTitleList = result.items;
        });
    }

    assignPeri(e, record) {
        record.skuId = e.itemId;
        // console.log(e,111)
        record.picUrl = e.picUrl;
    }


}
