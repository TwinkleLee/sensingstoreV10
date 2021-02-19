import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, OnInit } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { OrganizationUnitServiceProxy, TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppSessionService } from '@shared/common/session/app-session.service';
import { LazyLoadEvent } from 'primeng/api';
@Component({
    selector: 'switchOUModal',
    templateUrl: './switch-ou-modal.component.html'
})
export class SwitchOUModalComponent extends AppComponentBase{

    @ViewChild('switchOUModal' ,{static:true}) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    constructor(
        injector: Injector,
        private _ouService: OrganizationUnitServiceProxy,
        private _tokenService:TokenAuthServiceProxy,
        private _sessionAppService: AppSessionService
    ) {
        super(injector);
    }

    show(): void {
        // if(this.isGranted('ExternalAccessTokenInfo')){}
        this.getOUs();
        this.active = true;
        this.modal.show();
    }
    onShown(): void {
  
    }
    //GetCurrentUserOrganizationUnits
    //SetOrganizationUnitI
    //获取ou
    getOUs(event?:LazyLoadEvent){
        this.primengTableHelper.showLoadingIndicator();
        this._ouService.getCurrentUserOrganizationUnits().subscribe((result)=>{
            this.primengTableHelper.records = result.items;
            this.primengTableHelper.hideLoadingIndicator();
        })
    }
    //切换管理的ou
    switchToOU(record){
            this._tokenService.setOrganizationUnitId(record.value).subscribe((result)=>{
                    abp.utils.setCookieValue(
                        'Abp.OrganizationUnitId',
                        String(result.organizationUnitId),
                        new Date(new Date().getTime() + 1 * 86400000), //1 day
                        abp.appPath
                    );
                    this.appSession.setCurrentOu(record.name,result.organizationUnitId);
                    this.notify.info(this.l('switchSuccess'));
                    this.modal.hide();
            })
    }

    save(): void {
        this.saving = true;

    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
