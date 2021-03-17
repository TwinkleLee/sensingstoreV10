import { Component, ViewChild, Injector, OnInit } from '@angular/core';
import { LikeInfoServiceProxy, CreateLikeInfoInput, UpdateLikeInfoInput } from '@shared/service-proxies/service-proxies-product';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CreateOrEditLikeModalComponent } from '@app/admin/product/likes/operation/create-or-edit-like-modal.component';
import { Router } from '@angular/router';
import { ConnectorService } from '@app/shared/services/connector.service';

@Component({
    selector: 'LikeAddOrEdit',
    templateUrl: './like-add-or-edit.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`, `a.addSkuA{
            cursor: pointer;
            font-size: 46px;
        }`, `a.addSkuA:active{
            width:110%;
            height:110%;
        }`
    ]
})
export class LikeAddOrEditComponent extends AppComponentBase implements OnInit {

    ToResource = true;
    like: any = {};
    skuList: any[] = [];
    operation: string = 'add';
    saving = false;
    @ViewChild('createOrEditLikeModal',{static:true}) createOrEditLikeModal: CreateOrEditLikeModalComponent;

    constructor(
        injector: Injector,
        private router: Router,
        private _likeService: LikeInfoServiceProxy,
        private connector: ConnectorService
    ) {
        super(injector);
        var urls = location.pathname.split("\/"), id;
        id = urls[urls.length - 1];
        if (/\d+/.test(id)) {
            this.operation = "edit";
            this.like.id = id;
        } else {
            return;
        }
        this._likeService.getSingle(id).subscribe((result) => {
            this.like = result;
            this.skuList = result.likeItems || [];
            this.like.skuIds = this.skuList.map((item) => {
                return Number(item.skuId);
            })
        })
    }

    ngOnInit() {

    }
    addLikeSku() {
        this.createOrEditLikeModal.show(this.like.id);
    }
    //图片上传事件
    onUpload(result) {
        this.like.image = result.fileUri;
    }
    onBeforeSend(event?) {

    }
    editSkus(e) {
        if (e.action == 'delete') {
            this.message.confirm(this.l('deletethissku'),this.l('AreYouSure'), (r) => {
                if (r) {
                    var index = this.like.skuIds.indexOf(e.image.skuId||e.image.id);
                    this.like.skuIds.splice(index, 1);
                    this.skuList.splice(index, 1);
                }
            })
        }
    }
    //保存skus
    saveSkus(result) {
        var skuIds = this.like.skuIds||[],
            selection = result.selection,
            skuid;

        selection = selection.filter((r) => {
            skuid = Number(r.id);
            if (skuIds.indexOf(skuid) > -1) {
                return false;
            }
            skuIds.push(skuid);
            return true;
        })
        this.skuList = this.skuList.concat(selection);
        this.like.skuIds = skuIds;
    }

    //返回
    goBack() {
        this.router.navigate(['app', 'admin','product', 'like']);
    }
    //提交
    save() {
        if ( !this.like.skuIds || this.like.skuIds.length < 1) {
            return this.notify.info(this.l('atLeastOneSku'));
        }
        if (this.operation == 'add') {
            this._likeService.create(new CreateLikeInfoInput(this.like)).subscribe(() => {
                this.goBack();
            })
        } else {
            this._likeService.update(new UpdateLikeInfoInput(this.like)).subscribe(() => {
                this.goBack();
            })
        }

    }
}
