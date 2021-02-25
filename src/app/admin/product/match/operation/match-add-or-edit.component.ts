import { Component, ViewChild, Injector, OnInit } from '@angular/core';
import { MatchInfoServiceProxy, CreateMatchInfoInput, UpdateMatchInfoInput, MainSku } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CreateOrEditMatchModalComponent } from '@app/admin/product/match/operation/create-or-edit-match-modal.component';
import { Router } from '@angular/router';
import { ConnectorService } from '@app/shared/services/connector.service';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'MatchAddOrEdit',
    templateUrl: './Match-add-or-edit.component.html',
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
export class MatchAddOrEditComponent extends AppComponentBase implements OnInit {

    match: any = {};
    skuList: any[] = [];
    saving;
    operation: string = 'add';
    @ViewChild('createOrEditMatchModal',{static:true}) createOrEditMatchModal: CreateOrEditMatchModalComponent;

    constructor(
        injector: Injector,
        private router: Router,
        private _matchService: MatchInfoServiceProxy,
        private connector: ConnectorService
    ) {
        super(injector);
        var urls = location.pathname.split("\/"), id;
        id = urls[urls.length - 1];
        if (/\d+/.test(id)) {
            this.operation = "edit";
            this.match.id = id;
        } else {
            return;
        }
        this._matchService.getSingle(id).subscribe((result) => {
            this.match = result;
            this.skuList = result.matchItems || [];
            this.match.skus = this.skuList.map((item) => {
                return new MainSku({
                    'isMain': item.isMain,
                    'skuId': item.skuId
                });
            })
        })
    }

    ngOnInit() {

    }
    addMatchSku() {
        this.createOrEditMatchModal.show(this.match.id);
    }
    editSkus(e) {
        if (e.action == 'delete') {
            this.message.confirm(this.l('deletethissku'),this.l('AreYouSure'), (r) => {
                if (r) {
                    var skuIds = this.match.skus.map((r) => {
                        return r.skuId;
                    }) || [];
                    var index = skuIds.indexOf(e.image.skuId || e.image.id);
                    this.match.skus.splice(index, 1);
                    this.skuList.splice(index, 1);
                }
            })
        }
    }
    //图片上传事件
    onUpload(result) {
        this.match.showImage = result.fileUri;
    }
    //保存skus
    saveSkus(result) {
        var skus = this.match.skus || [],
            selection = result.selection,
            skuid;
        var skuIds = skus.map((r) => {
            return r.skuId;
        })
        selection = selection.filter((r) => {
            skuid = Number(r.id);
            if (skuIds.indexOf(skuid) > -1) {
                return false;
            }
            skus.push(new MainSku({
                'isMain': r.isMain,
                'skuId': r.id
            }))
            return true;
        });
        this.skuList = this.skuList.concat(selection);
        this.match.skus = skus;
    }

    //返回
    goBack() {
        this.router.navigate(['app', 'admin','product', 'match']);
    }
    //提交
    save() {
        if (this.match.skus.length < 1) {
            return this.notify.info(this.l('atLeastOneSku'));
        }
        let index = this.skuList.findIndex((r) => {
            return r.isMain == true;
        });
        this.match.skus.forEach((sku, i) => {
            sku.isMain = i == index;
        });
        this.saving = true;
        if (this.operation == 'add') {
            this._matchService.create(new CreateMatchInfoInput(this.match)).pipe(finalize(() => {
                this.saving = false;
            })).subscribe(() => {
                this.notify.success(this.l('success'));
                this.goBack();
            })
        } else {
            this._matchService.update(new UpdateMatchInfoInput(this.match)).pipe(finalize(() => {
                this.saving = false;
            })).subscribe(() => {
                this.notify.success(this.l('success'));
                this.goBack();
            })
        }

    }
}
