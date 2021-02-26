import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { ShopServiceProxy, CreateShopFreightInput, UpdateShopFreightInput } from '@shared/service-proxies/service-proxies';
// import districts from './districts';
import districts from '@app/admin/weshop/we-shop/operation/districts';

@Component({
    selector: 'setFreightModal',
    templateUrl: './set-freight-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ],
    styleUrls: ['./set-freight-modal.component.css'],

})
export class SetFreightModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput' ,{static:true}) nameInput: ElementRef;
    @ViewChild('createOrEditModal' ,{static:true}) modal: ModalDirective;


    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    operation: string = "add";
    freight: any = {
        areas: []
    };

    freightStatus = true;
    showSelect = false;
    originDistricts: any = [];
    districts: any = [];

    areaIndex;

    constructor(
        injector: Injector,
        private _ShopServiceProxy: ShopServiceProxy
    ) {
        super(injector);
        this.getDistricts();
    }

    ngAfterViewChecked(): void {

    }

    addArea() {
        this.areaIndex = -1;
        this.districts = JSON.parse(JSON.stringify(this.originDistricts));
        this.checkAble();
        console.log(this.districts);
        this.showSelect = true;

    }
    editArea(area, i) {
        this.areaIndex = i;
        this.districts = JSON.parse(JSON.stringify(this.originDistricts));
        var selectedAreaList = area.city.split(',');
        console.log(selectedAreaList);
        this.districts.forEach(province => {
            province.children.forEach(city => {
                if (selectedAreaList.indexOf(city.name) >= 0) {
                    city.selected = true;
                }
            })
            this.checkProvince(province)
        })

        this.checkAble(i);
        this.showSelect = true;

    }

    checkAble(except?) {
        this.freight.areas.forEach((area,index) => {
            if(index==except) return

            var disabledAreaList = area.city.split(',');
            this.districts.forEach(province => {
                province.children.forEach(city => {
                    if (disabledAreaList.indexOf(city.name) >= 0) {
                        city.able = false;
                    }
                })
                this.checkProvince(province)
            })
        })
    }

    deleteArea(i) {
        this.freight.areas.splice(i, 1);
    }

    saveArea() {
        var cityList = [];
        this.districts.forEach(province => {
            province.children.forEach(city => {
                if (city.selected) {
                    cityList.push(city.name);
                }
            })
        })

        if (cityList.length == 0) {
            this.message.warn(this.l('atLeastChoseOneItem'));
            return
        }

        if (this.areaIndex < 0) {//新增
            this.freight.areas.push({
                "city": cityList.join(","),
                "firstNumber": 0,
                "secondNumber": 0,
                "firstWeight": 0,
                "secondWeight": 0,
                "firstPrice": 0,
                "secondPrice": 0
            })
            console.log(this.freight)
        } else {//编辑
            this.freight.areas[this.areaIndex]["city"] = cityList.join(",")
        }
        this.showSelect = false;
    }

    selectAll(province) {
        province.children.forEach(item => {
            if (province.selected) {//原本是全选
                item.selected = false;
            } else {
                item.selected = true;
            }
        })
        this.checkProvince(province);
    }


    selectCity(city, province) {
        if (!city.able) return
        city.selected = !city.selected;
        this.checkProvince(province);
    }

    checkProvince(province) {//检测每个省的勾选状态
        province.contain = province.children.filter(item => {
            return item.selected
        }).length
        if (province.contain == province.children.length) {
            province.selected = true;
        } else {
            province.selected = false;
        }
        if (province.children.some(item => {
            return !item.able
        })) {
            province.able = false;
        } else {
            province.able = true;
        }
    }

    getDistricts() {
        var mydistricts = {};
        for (var item in districts) {
            if (districts[100000][item]) {
                mydistricts[item] = districts[item]
            }
        }
        var districtsList = [];
        for (var item in districts[100000]) {
            var obj: any = { name: districts[100000][item], id: item, selected: false, able: true }
            for (var item2 in mydistricts) {
                if (item2 == item) {
                    var children = [];
                    for (var item3 in mydistricts[item2]) {
                        children.push({ name: mydistricts[item2][item3], selected: false, able: true })
                    }
                    obj.children = children;
                }
            }
            districtsList.push(obj);
        }
        this.originDistricts = districtsList;
        console.log(this.originDistricts);
    }

    show(freight?: any): void {
        this.active = true;
        if (freight) {
            this.operation = "edit";
            this.freight = freight;
            if (this.freight.status == 1) {
                this.freightStatus = true;
            } else {
                this.freightStatus = false;
            }
        } else {
            this.operation = "add";
            this.freight = {
                areas: [],
                shopShopFreightType: 0,
                status: 1
            };
        }
        this.modal.show();
    }

    onShown(): void {

    }

    save(): void {
        this.saving = true;

        if (this.freightStatus) {
            this.freight.status = 1;
        } else {
            this.freight.status = 0;
        }
        if (this.operation == "add") {
            console.log(this.freight);
            this._ShopServiceProxy.createShopFreight(this.freight as CreateShopFreightInput)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(result => {
                    console.log(result)
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                })
        } else {
            console.log(this.freight);
            this._ShopServiceProxy.updateShopFreight(this.freight as UpdateShopFreightInput)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(result => {
                    console.log(result)
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                })
        }
    }

    close(): void {
        this.active = false;
        this.freight = {};
        this.saving = false;
        this.modal.hide();
    }

}
