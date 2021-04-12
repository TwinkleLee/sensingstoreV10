import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { WechatManageServiceProxy } from '@shared/service-proxies/service-proxies5';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'publicAccountManageModal',
    templateUrl: './public-account-manage-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class PublicAccountManageModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    operation: string = "add";
    objItem: any = {
        "menuContent": {
            button: []
        }
    };
    selectedButton: any;
    nickName: any = '';
    constructor(
        injector: Injector,
        private _WechatManageServiceProxy: WechatManageServiceProxy,
        private _activeRouter: ActivatedRoute
    ) {
        super(injector);
    }

    ngAfterViewChecked(): void {

    }

    AddMenu() {
        this.objItem.menuContent.button.push({});
    }

    AddChildMenu() {
        if (!this.selectedButton.sub_button) {
            this.selectedButton.sub_button = [];
        }
        this.selectedButton.sub_button.push({});
    }

    DeleteMenu() {
        this.objItem.menuContent.button.forEach((button, index1) => {
            if (this.selectedButton == button) {
                console.log('index1', index1)
                this.objItem.menuContent.button.splice(index1, 1);
            }
            if (button.sub_button) {
                button.sub_button.forEach((sub_button, index2) => {
                    if (this.selectedButton == sub_button) {
                        console.log('index2', index2)
                        this.objItem.menuContent.button[index1].sub_button.splice(index2, 1);
                    }
                })
            }
        })
        this.selectedButton = void 0;
    }

    selectButton(button, isRoot) {
        button.isRoot = isRoot;
        this.selectedButton = button;
    }
    goLeft(index1) {
        var obj = this.objItem.menuContent.button.splice(index1, 1)[0];
        this.objItem.menuContent.button.splice(index1 - 1, 0, obj);
    }
    goRight(index1) {//
        var obj = this.objItem.menuContent.button.splice(index1, 1)[0];
        this.objItem.menuContent.button.splice(index1 + 1, 0, obj);
    }
    goUp(index1, index2) {
        var obj = this.objItem.menuContent.button[index1].sub_button.splice(index2, 1)[0];
        this.objItem.menuContent.button[index1].sub_button.splice(index2 + 1, 0, obj);
    }
    goDown(index1, index2) {//
        var obj = this.objItem.menuContent.button[index1].sub_button.splice(index2, 1)[0];
        this.objItem.menuContent.button[index1].sub_button.splice(index2 - 1, 0, obj);
    }
    show(objItem?: any): void {
        this.active = true;
        if (objItem) {
            this.operation = "edit";
            this.objItem = Object.assign({}, objItem);//Object.assign失效?
            if (!this.objItem.menuContent) this.objItem.menuContent = {};
            if (!this.objItem.menuContent.button) this.objItem.menuContent.button = [];
            this._activeRouter.queryParams.subscribe(params => {
                this.objItem.weixinAppID = params.weixinAppID;
            })
        } else {
            this.operation = "add";
            this._activeRouter.queryParams.subscribe(params => {
                this.objItem.weixinAppID = params.weixinAppID;
            })
        }
        this.modal.show();
    }

    onShown(): void {

    }

    save(): void {
        this.saving = true;
        console.log(this.objItem);
        this.objItem.menuContent.button.forEach(button => {
            if (!button.type) delete button.type
            if (button.sub_button && button.sub_button.length == 0) delete button.sub_button
            if (button.isRoot) delete button.isRoot
            if (button.sub_button && button.sub_button.length > 0){
                button.sub_button.forEach(sub_button=>{
                    delete sub_button.isRoot
                })
            }
        })

        this._WechatManageServiceProxy.addOrUpdateWechatMenu(this.objItem)
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe(result => {
                console.log(result)
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
            })
    }

    close(): void {
        this.active = false;
        this.objItem = {
            "menuContent": { button: [] }
        };
        this.saving = false;
        this.modal.hide();
    }

}
