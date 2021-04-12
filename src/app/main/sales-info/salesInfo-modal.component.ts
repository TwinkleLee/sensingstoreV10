import { Component, ViewChild, Injector, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { ReportServiceProxy, SkuDaySaleInput } from '@shared/service-proxies/service-proxies2';
import * as moment from 'moment';
import { DateRangePickerComponent } from '@app/shared/common/timing/date-range-picker.component';


@Component({
    selector: 'salesInfoModal',
    templateUrl: './salesInfo-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class SalesInfoModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    @ViewChild('daterange', { static: true }) daterange: DateRangePickerComponent;


    active = false;
    StartTime;
    EndTime;
    skuId;
    title;

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

    show(record, start, end): void {

        console.log(start, end, 'console.log')

        this.active = true;
        this.skuId = record.skuId;
        this.title = record.title;
        this.modal.show();
        this.dataTable.sortField = "date"
        this.dataTable.sortOrder = -1;
        this.StartTime = start ? start : void 0;
        this.EndTime = end ? end : void 0;
        setTimeout(() => {
            this.daterange.refresh()
        })
        this.getList()
    }


    getList(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        var input = new SkuDaySaleInput({
            filter: void 0,
            skuId: this.skuId,
            startTime: this.StartTime ? this.StartTime.add(-(new Date().getTimezoneOffset() / 60), 'h') : this.StartTime,
            endTime: this.EndTime ? this.EndTime.add(-(new Date().getTimezoneOffset() / 60), 'h') : this.EndTime,
            sorting: this.primengTableHelper.getSorting(this.dataTable) || "date DESC",
            maxResultCount: this.primengTableHelper.getMaxResultCount(this.paginator, event),
            skipCount: this.primengTableHelper.getSkipCount(this.paginator, event)
        })
        this.primengTableHelper.showLoadingIndicator();

        console.log(this.dataTable, 123)

        this.__reportService.skuDaySale(input)
            .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
            .subscribe(result => {
                console.log(result)
                this.primengTableHelper.totalRecordsCount = result.totalCount;
                this.primengTableHelper.records = result.items;
                // this.primengTableHelper.hideLoadingIndicator();
            })
        if (this.StartTime) {
            this.StartTime.add((new Date().getTimezoneOffset() / 60), 'h')
        }
        if (this.EndTime) {
            this.EndTime.add((new Date().getTimezoneOffset() / 60), 'h')
        }
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
