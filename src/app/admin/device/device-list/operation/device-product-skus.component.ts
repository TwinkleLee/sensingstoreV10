import { Component, ViewChild, Injector, } from '@angular/core';
import { PriceTagServiceProxy, UpdateDefaultPriceTagInput } from '@shared/service-proxies/service-proxies-product';

import { AuditStatus as AuditStatus8, DeviceServiceProxy, ProductServiceProxy, PublishEntitiesInput, IdTypeDto } from '@shared/service-proxies/service-proxies-product';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Router } from '@angular/router';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { finalize } from 'rxjs/operators';
import { SkusSelectionModalComponent } from '@app/admin/device/device-list/tabAlert/skus-selection-modal.component';
import { ConnectorService } from '@app/shared/services/connector.service';
import { TableCheckbox } from 'primeng/table';


@Component({
    selector: 'DeviceProductSku',
    templateUrl: './device-product-skus.component.html'
})
export class DeviceProductSkuComponent extends AppComponentBase {

    @ViewChild('paginator', { static: true }) paginator: Paginator;
    @ViewChild('TableCheckbox', { static: true }) TableCheckbox: TableCheckbox;

    @ViewChild('SkusSelectionModal', { static: true }) SkusSelectionModal: SkusSelectionModalComponent;

    deviceName: string = "";
    productName: string = "";
    deviceId: number;
    productId: number;
    filterText: string = "";
    deviceProductSkuSelection: any[] = [];
    informDevice = false;
    constructor(
        injector: Injector,
        private router: Router,
        private _deviceService: DeviceServiceProxy,
        private _prodService: ProductServiceProxy,
        private _connector: ConnectorService,
        private _PriceTagServiceProxy: PriceTagServiceProxy
    ) {
        super(injector);
        var urls = window.location.href.split("\/");
        this.deviceId = Number(urls[urls.length - 3]);
        this.productId = Number(urls[urls.length - 1]);
        var deviceAndProduct = _connector.getCache("deviceAndProduct") || {};
        this.productName = deviceAndProduct.productName;
        this.deviceName = deviceAndProduct.deviceName;
    }
    toggleSkuGrid(f) {
        if (f) {
            $("#TableShow").show();
            $("#GridShow").hide();
        } else {
            $("#TableShow").hide();
            $("#GridShow").show();
        }
        this.TableCheckbox.tableService.onSelectionChange()
    }
    transIndex(i, event?: LazyLoadEvent) {
        return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
    }
    getDeviceProductSkus(event?: LazyLoadEvent) {
        this.primengTableHelper.showLoadingIndicator();
        this._deviceService.getSkusByDeviceId(this.deviceId, this.productId, AuditStatus8.Online, this.filterText, void 0,
            this.primengTableHelper.getMaxResultCount(this.paginator, event),
            this.primengTableHelper.getSkipCount(this.paginator, event)).pipe(finalize(() => {
                this.primengTableHelper.hideLoadingIndicator();
            }))
            .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
            .subscribe((result) => {
                this.primengTableHelper.totalRecordsCount = result.totalCount;
                this.primengTableHelper.records = result.items;
                // this.primengTableHelper.hideLoadingIndicator();
            })
    }
    //发布上线sku到设备
    publishSkusToDevice(e) {
        var ids = e.selection.map((item) => {
            return item.id;
        }) || [];
        if (ids.length == 0) {
            return this.notify.info(this.l('atLeastChoseOneItem'));
        }

        var id = Math.floor(Math.random() * 10000000);
        this.message.confirm(`
        <div class="form-group">
            <label class="checkbox">
                <input id="device_product_skus_${id}" type="checkbox" name="device_product_skus_${id}" ${this.informDevice ? 'checked' : ''}/>${this.l('informDevice')}
                <span></span>
            </label>
        </div>
     `, this.l('deleteThisAdOfDevice'), (r) => {
            if (!r) return
            if ($(`#device_product_skus_${id}`).is(':checked')) {
                this.informDevice = true;
            } else {
                this.informDevice = false;
            }
            var input = new PublishEntitiesInput({
                'entityIds': ids,
                'ouOrDeviceOrStoreList': [new IdTypeDto({
                    'id': this.deviceId,
                    'type': "device"
                })],
                'action': 'add',
                'includeSku': false,
                'isCreateDefaultSchedule': false,
                'informDevice': this.informDevice,
                'type': 'publish'
            });
            this._prodService.publishSkuToOrganizationOrDevicesOrStore(input).subscribe((r) => {
                this.notify.success(this.l('success'));
                this.deviceProductSkuSelection = [];
                this.getDeviceProductSkus();
            })
        })



    }
    //批量撤回商品sku
    withdrawSkusFromDevice() {
        if (this.deviceProductSkuSelection.length == 0) {
            return this.notify.info(this.l('atLeastChoseOneItem'));
        }
        var id = Math.floor(Math.random() * 10000000);
        this.message.confirm(`
        <div class="form-group">
            <label class="checkbox">
                <input id="device_product_skus_${id}" type="checkbox" name="device_product_skus_${id}" ${this.informDevice ? 'checked' : ''}/>${this.l('informDevice')}
                <span></span>
            </label>
        </div>
     `, this.l('deletethisskus'), (r) => {
            if (!r) return
            if ($(`#device_product_skus_${id}`).is(':checked')) {
                this.informDevice = true;
            } else {
                this.informDevice = false;
            }
            var ids = this.deviceProductSkuSelection.map((item) => {
                return item.id;
            })
            var input = new PublishEntitiesInput({
                'entityIds': ids,
                'ouOrDeviceOrStoreList': [new IdTypeDto({
                    'id': this.deviceId,
                    'type': "device"
                })],
                'action': 'delete',
                'includeSku': false,
                'isCreateDefaultSchedule': false,
                'informDevice': this.informDevice,
                'type': 'publish'
            });
            this._prodService.publishSkuToOrganizationOrDevicesOrStore(input).subscribe((r) => {
                this.notify.success(this.l('success'));
                this.deviceProductSkuSelection = [];
                this.getDeviceProductSkus();
            })
        });
    }
    //撤回单个
    withdrawSku(record) {
        var id = Math.floor(Math.random() * 10000000);
        this.message.confirm(`
        <div class="form-group">
            <label class="checkbox">
                <input id="device_product_skus_${id}" type="checkbox" name="device_product_skus_${id}" ${this.informDevice ? 'checked' : ''}/>${this.l('informDevice')}
                <span></span>
            </label>
        </div>
     `, this.l('deleteThisSkuQuestion'), (r) => {
            if (!r) return
            if ($(`#device_product_skus_${id}`).is(':checked')) {
                this.informDevice = true;
            } else {
                this.informDevice = false;
            }
            var input = new PublishEntitiesInput({
                'entityIds': [record.id],
                'ouOrDeviceOrStoreList': [new IdTypeDto({
                    'id': this.deviceId,
                    'type': "device"
                })],
                'action': 'delete',
                'includeSku': false,
                'isCreateDefaultSchedule': false,
                'informDevice': this.informDevice,
                'type': 'publish'
            });
            this._prodService.publishSkuToOrganizationOrDevicesOrStore(input).subscribe((r) => {
                this.notify.success(this.l('success'));
                this.deviceProductSkuSelection = [];
                this.getDeviceProductSkus();
            })
        })
    }
    //操作imageGrid
    onOperateProductSkus(e) {
        if (e.action == "delete") {
            this.withdrawSku(e.image);
        }
    }
    //
    //弹出未发布的sku选择框
    getUnpublishedSkus() {
        this.SkusSelectionModal.show(this.deviceId, this.productId);
    }
    //返回设备编辑
    backToDeviceEdit() {
        var deviceEdit = window.location.pathname.replace(/\/product\/\d+/, "").split(/\//);
        deviceEdit.shift();
        this.router.navigate(deviceEdit, { queryParams: { initTab: 'product' } });
    }
    //设为默认sku(电子价签)
    setDefault(record) {
        this.message.confirm(this.l('SaveAsSystemDefault'), this.l('AreYouSure'), (r) => {
            if (r) {
                var input = new UpdateDefaultPriceTagInput({
                    "targetSkuId": record.id,
                    "deviceId": this.deviceId
                });

                this._PriceTagServiceProxy.updateDefaultPriceTag(input).subscribe((r) => {
                    this.notify.success(this.l('success'));
                    this.deviceProductSkuSelection = [];
                    this.getDeviceProductSkus();
                })
            }
        })
    }
}
