import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AwardServiceProxy, ActivityServiceProxy } from '@shared/service-proxies/service-proxies5';

@Component({
    selector: 'playerDataDetailModal',
    templateUrl: './player-data-detail.component.html',
    styles: [`.user-edit-dialog-profile-image {
           margin-bottom: 20px;
      }`
    ]
})


export class PlayerDataDetailComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput' ,{static:true}) nameInput: ElementRef;
    @ViewChild('playerDataDetailModal' ,{static:true}) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    Detail: any = {};
    awardList = [];
    // awardId = "";

    constructor(
        injector: Injector,
        private _AwardServiceProxy: AwardServiceProxy,
        private _ActivityServiceProxy: ActivityServiceProxy
    ) {
        super(injector);
    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }


    show(detail?: any): void {
        console.log(detail)
        this._AwardServiceProxy.getAwards(
            detail.activityId,
            void 0,
            void 0,
            void 0,
            999,
            0
        ).subscribe(r => {
            console.log(r)
            this.awardList = r.items.filter(item => {
                return item.actualQty > 0
            })
            console.log(this.awardList)
        })
        this.active = true;
        this.Detail = detail;
        this.modal.show();
    }

    DoLotteryAction2Award() {
        this.saving = true;
        this._ActivityServiceProxy.doLotteryAction2Award(
            this.Detail.awardId,
            this.Detail.id
        ).subscribe(r => {
            this.modalSave.emit(null);
            this.notify.info(this.l('SavedSuccessfully'));
            console.log(r)
            this.close()
        })
    }

    onShown(): void {

    }

    close(): void {
        this.active = false;
        this.Detail = {};
        this.saving = false;
        this.modal.hide();
    }

}
