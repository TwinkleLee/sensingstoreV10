import { Component, ViewChild, Injector, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { DateRangePickerComponent } from '@app/shared/common/timing/date-range-picker.component';
import { OutPutInStorageServiceProxy } from '@shared/service-proxies/service-proxies-product';

import { SkuRfidServiceProxy, PDFDto, TextForPDF, SensingDeviceServiceProxy } from '@shared/service-proxies/service-proxies'


import { CreateOrEditSkuRfidModalComponent } from '@app/admin/product/outputin/create-or-edit-skurfid-modal.component';


@Component({
    selector: 'rfidListModal',
    templateUrl: './rfid-list-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class RfidListModalComponent extends AppComponentBase implements AfterViewChecked {
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    @ViewChild('daterange', { static: true }) daterange: DateRangePickerComponent;
    @ViewChild('createOrEditSkuRfidModal', { static: true }) createOrEditSkuRfidModal: CreateOrEditSkuRfidModalComponent;

    active = false;
    skuId;
    rfidList: any =[];
    filter = '';
    constructor(
        injector: Injector,
        private _OutPutInStorageServiceProxy: OutPutInStorageServiceProxy,
        private _SensingDeviceServiceProxy: SensingDeviceServiceProxy,
        private _skuRfidServiceProxy: SkuRfidServiceProxy,

    ) {
        super(injector);
    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(skuId?): void {
        this.active = true;
        this.skuId = skuId;
        this.modal.show();
        this.getList();
    }

    recoverRfidCode(record, event?: LazyLoadEvent) {
        this.primengTableHelper.showLoadingIndicator();
        this._OutPutInStorageServiceProxy.recoverRfidCode(
            record.rfidCode
        ).subscribe(result => {
            this.getList(event);
        })
    }
    generateAll() {
        if (this.rfidList.length == 0) {
            return
        }
        console.log(this.skuId)
        var promptMsg = prompt("请输入格式配置", JSON.stringify({
            "IsTop": 1,
            "Content": JSON.stringify(
                [{
                    "content": "请微信扫码支付",
                    "bold": false,
                    "fontSize": 10
                }, {
                    "content": "Scan to Pay",
                    "bold": true,
                    "fontSize": 12
                }]
            ),
            "Column": 4
        }));
        if (promptMsg) {
            try {
                console.log("promptMsg",promptMsg);
                var obj = JSON.parse(promptMsg);
                obj.Content = JSON.parse(obj.Content);
                console.log("obj",obj);

                var input = new PDFDto({
                    "tenantId": this.appSession.tenantId,
                    "skuId": this.skuId,
                    "isTop": obj.IsTop,
                    "textForPDF": obj.Content.map(item => new TextForPDF(item)),
                    "column": obj.Column,
                    // "ids": this.rfidList.map(i => {
                    //     return i.id
                    // })
                });
                console.log("input",input);
                this.primengTableHelper.showLoadingIndicator();
                this._SensingDeviceServiceProxy.getWeishopProductBySkuID(input)
                    .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
                    .subscribe(result => {
                        console.log(result)
                        var link = document.getElementById('aaa');
                        $(link).attr("href", result);
                        link.click();
                    });
            } catch (error) {

            }
        }


    }
    generateURL(record) {
        this.primengTableHelper.showLoadingIndicator();
        this._SensingDeviceServiceProxy.getWeishopProductRfidQrcode(
            this.appSession.tenantId,
            record.rfidCode
        )
            .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
            .subscribe(result => {
                console.log("result", result);
                // this.primengTableHelper.hideLoadingIndicator();
                var t: any = document.getElementById("generateURLSpecial1212");
                t.value = result.qrcodeUrl;
                record.qrcodeUrl = result.qrcodeUrl;
                record.imgUrl = result.qrcodeImageUrl;
                t.select(); // 选择对象
                if (document.execCommand) {
                    if (document.execCommand("Copy")) { // 执行浏览器复制命令
                        console.log("document.execCommand", true)
                        this.notify.info("URLInClipboard");
                    } else {
                        console.log("document.execCommand", false)
                        this.notify.info("ManualCopyTip");
                    }
                }
            })
    }


    getList(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }
        this.primengTableHelper.showLoadingIndicator();
        this._OutPutInStorageServiceProxy.getSkuRfids(
            undefined,
            this.skuId,
            undefined,
            undefined,
            undefined,
            this.filter,
            this.primengTableHelper.getSorting(this.dataTable),
            this.primengTableHelper.getMaxResultCount(this.paginator, event),
            this.primengTableHelper.getSkipCount(this.paginator, event)
        )
            .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
            .subscribe(result => {
                this.primengTableHelper.totalRecordsCount = result.totalCount;
                this.primengTableHelper.records = result.items;
                // this.primengTableHelper.hideLoadingIndicator();
            })

    }
    create() {
        this.createOrEditSkuRfidModal.show();
        this.createOrEditSkuRfidModal.skuRfid.skuId = this.skuId;
    }
    edit(record) {
        this.createOrEditSkuRfidModal.show(record);
        this.createOrEditSkuRfidModal.skuRfid.skuId = this.skuId;
    }
    delete(record) {
        this.message.confirm(this.l('deletethisselected'), this.l('AreYouSure'), (r) => {
            if (r) {
                this._skuRfidServiceProxy.delete(record.id).subscribe(result => {
                    this.notify.info(this.l('success'));
                    this.getList();
                })
            }
        })
    }
    onShown() {

    }
    close(): void {
        this.skuId = '';
        this.rfidList = [];
        this.active = false;
        this.modal.hide();
    }

    //转换序列
    transIndex(i, event?: LazyLoadEvent) {
        return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
    }

}
