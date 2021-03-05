import { Component, ViewChild, Injector, AfterViewChecked } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { OrderServiceProxy } from '@shared/service-proxies/service-proxies2';
import * as moment from 'moment';
import { DateRangePickerComponent } from '@app/shared/common/timing/date-range-picker.component';
import { AppConsts } from '@shared/AppConsts';


@Component({
    selector: 'memberInfoModal',
    templateUrl: './memberInfo-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class MemberInfoModalComponent extends AppComponentBase implements AfterViewChecked {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    @ViewChild('daterange', { static: true }) daterange: DateRangePickerComponent;

    active = false;
    StartTime;
    EndTime;
    memberId;
    title;

    constructor(
        injector: Injector,
        private _OrderServiceProxy: OrderServiceProxy,
    ) {
        super(injector);

    }

    ngAfterViewChecked(): void {
        //Temporary fix for: https://github.com/valor-software/ngx-bootstrap/issues/1508
        $('tabset ul.nav').addClass('m-tabs-line');
        $('tabset ul.nav li a.nav-link').addClass('m-tabs__link');
    }

    show(record, start, end): void {
        this.active = true;
        console.log(record)
        this.memberId = record.memberId;
        this.title = record.snsNickName;
        this.modal.show();
        this.dataTable.sortField = "number"
        this.dataTable.sortOrder = -1;

        this.StartTime = start ? start : undefined;
        this.EndTime = end ? end : undefined;
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
        var input: any = ({
            memberId: this.memberId,
            orderDateTimeStart: this.StartTime ? this.StartTime.add(-(new Date().getTimezoneOffset() / 60), 'h') : undefined,
            orderDateTimeEnd: this.EndTime ? this.EndTime.add(-(new Date().getTimezoneOffset() / 60), 'h') : undefined,
            sorting: this.primengTableHelper.getSorting(this.dataTable) || "number ASC",
            maxResultCount: this.primengTableHelper.getMaxResultCount(this.paginator, event),
            skipCount: this.primengTableHelper.getSkipCount(this.paginator, event)
        })
        this.primengTableHelper.showLoadingIndicator();

        this._OrderServiceProxy.orderSkuByMemberId(input)
            .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
            .subscribe(result => {
                console.log(result)
                this.primengTableHelper.totalRecordsCount = result.totalCount;
                this.primengTableHelper.records = result.items;
                // this.primengTableHelper.hideLoadingIndicator();
            })

        this.StartTime.add((new Date().getTimezoneOffset() / 60), 'h')
        this.EndTime.add((new Date().getTimezoneOffset() / 60), 'h')
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

    //显示图片加载失败的占位图
    showEmpty(e) {
        var target = $(e.target);
        target.attr("src", AppConsts.appBaseUrl + "/assets/common/images/holderimg.png")
    }

}
