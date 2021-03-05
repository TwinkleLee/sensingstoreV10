import { Component, ViewChild, Injector, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { finalize } from 'rxjs/operators';
import { ReportServiceProxy, OrderInformationInput } from '@shared/service-proxies/service-proxies2';
import * as moment from 'moment';


@Component({
    selector: 'orderInfoModal',
    templateUrl: './order-information-modal.component.html',
    animations: [appModuleAnimation()]

})
export class OrderInfoModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;



    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;


    active = false;
    saving = false;
    list;
    gettingTaobaoAuthUrl = false;
    StartTime: any = moment().utc().subtract(29, 'days').startOf('day');
    EndTime: any = moment().utc().endOf('day');
    chosenItem = [];
    constructor(
        injector: Injector,
        private __reportService: ReportServiceProxy,
    ) {
        super(injector);

    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(chosenItem): void {
        console.log(chosenItem)
        this.chosenItem = chosenItem;
        this.active = true;
        this.modal.show();
        this.getList();
    }


    getList(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }
        var input = new OrderInformationInput({
            filter: undefined,
            ouOrStoreList: this.chosenItem,
            startTime: this.StartTime ? moment(this.StartTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h') : undefined,
            endTime: this.EndTime ? moment(this.EndTime.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's') : undefined,
            sorting: this.primengTableHelper.getSorting(this.dataTable),
            maxResultCount: this.primengTableHelper.getMaxResultCount(this.paginator, event),
            skipCount: this.primengTableHelper.getSkipCount(this.paginator, event)
        })
        this.primengTableHelper.showLoadingIndicator();

        this.__reportService.orderInformation(input)
            .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
            .subscribe(result => {
                console.log(result)
                this.primengTableHelper.totalRecordsCount = result.totalCount;
                this.primengTableHelper.records = result.items;
                // this.primengTableHelper.hideLoadingIndicator();
            })

    }

    onShown() {

    }
    close(): void {
        this.active = false;
        this.modal.hide();
    }

    //转换序列
    transIndex(i, event?: LazyLoadEvent) {
        return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
    }

}
