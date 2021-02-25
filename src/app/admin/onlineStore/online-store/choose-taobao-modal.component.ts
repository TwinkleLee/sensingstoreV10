import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';
import { TaobaoServiceProxy } from '@shared/service-proxies/service-proxies-sync';

@Component({
    selector: 'chooseTaobaoModal',
    templateUrl: './choose-taobao-modal.component.html'
})
export class ChooseTaobaoModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('nameInput',{static:false}) nameInput: ElementRef;
    @ViewChild('createOrEditModal',{static:false}) modal: ModalDirective;


    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    list;
    gettingTaobaoAuthUrl = false;


    constructor(
        injector: Injector,
        private _taobaoService: TaobaoServiceProxy,
    ) {
        super(injector);

    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(list): void {
        this.active = true;
        this.list = list;
        console.log(this.list)
        this.modal.show();
    }
    //请求并跳转淘宝授权地址
    goTaobao(item) {
        if (this.gettingTaobaoAuthUrl) {
            return;
        }
        console.log(item)
        this.gettingTaobaoAuthUrl = true;

        this._taobaoService.authorzieUrl(item.id).pipe(finalize(() => {
            this.gettingTaobaoAuthUrl = false;
        })).subscribe((result) => {
            window.location.href = result;
        })


    }

    onShown() {

    }
    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
