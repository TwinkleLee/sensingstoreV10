import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { PropertyDto, ProductServiceProxy, UpdatePropertyInput } from '@shared/service-proxies/service-proxies-product';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { Router } from '@angular/router';
import { ConnectorService } from '@app/shared/services/connector.service';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';

import { PropertyValueAlertModalComponent } from '@app/admin/product/product-info/operation/selection-modal.component';
import { Table } from 'primeng/table';

@Component({
    selector: 'PropertyEdit',
    templateUrl: './property-edit.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;}`, `form{
            width:100%;}`]
})
export class PropertyEditComponent extends AppComponentBase {

    property: any = {};
    // @ViewChild('createOrEditPropertyModal') createOrEditPropertyModal: CreateOrEditPropertyModalComponent;
    //广告分页
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    @ViewChild('PropertyValueAlertModal', { static: true }) PropertyValueAlertModal: PropertyValueAlertModalComponent;
    SelectionList: any[] = [];
    filterText;
    //标识符
    saving: boolean = false;

    constructor(
        injector: Injector,
        private router: Router,
        private connector: ConnectorService,
        private _ProductServiceProxy: ProductServiceProxy,
    ) {
        super(injector);
        var property = this.connector.getCache('property');
        if (property && property.id) {
            this.property = property;
            this.primengTableHelper.totalRecordsCount = property.propertyValues.length;
            this.primengTableHelper.records = property.propertyValues;
        } else {
            var urls = location.pathname.split('\/');
            this.property.id = urls[urls.length - 1];
            this._ProductServiceProxy.getSignleProperty(this.property.id).subscribe((result) => {
                this.property = result;
            })
        }
    }
    //获取商品属性值
    getPropertyValue(event?: LazyLoadEvent) {
        this.primengTableHelper.showLoadingIndicator();
        this._ProductServiceProxy.getPropertyValues(
            this.property.id,
            this.filterText,
            this.primengTableHelper.getSorting(this.dataTable),
            this.primengTableHelper.getMaxResultCount(this.paginator, event),
            this.primengTableHelper.getSkipCount(this.paginator, event))
            .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
            .subscribe((result) => {
                this.primengTableHelper.totalRecordsCount = result.totalCount;
                this.primengTableHelper.records = result.items;
                // this.primengTableHelper.hideLoadingIndicator();
            })
    }
    //删除商品属性值
    deletePropertyValue(record) {
        this._ProductServiceProxy.deleteProperty(record.id).subscribe((result) => {
            this.notify.info('success');
            this.getPropertyValue();
        })
    }
    //编辑商品属性值
    editPropertyValue(record) {
        this.PropertyValueAlertModal.show(record);
    }
    //创建商品属性值
    addPropertyValue() {
        this.PropertyValueAlertModal.show(false, this.property.id);
    }
    //转换序列
    transIndex(i, event?: LazyLoadEvent) {
        return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
    }
    // upload completed event
    onUpload(result): void {
        this.property.iconUrl = result.fileUri;
    }

    onBeforeSend(event): void {

    }
    //返回
    goBack() {
        this.router.navigate(['app', 'admin','product', 'prodInfo']);
    }
    //提交
    save() {
        this._ProductServiceProxy.updateProperty(new UpdatePropertyInput(this.property)).subscribe(() => {
            this.notify.success("sucess");
            var self = this;
            setTimeout(function () {
                self.goBack();
            }, 1000)
        })
    }
}
