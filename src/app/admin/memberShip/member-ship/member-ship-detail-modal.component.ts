import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { CommonServiceProxy, MemberServiceProxy, ShippingAddressDto, CreateMemberInput, UpdateMemberInput, OrderServiceProxy, SensingShopServiceProxy, GetMemberPointLogInput } from '@shared/service-proxies/service-proxies2';
import { finalize } from 'rxjs/operators';
import * as moment from 'moment';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';


@Component({
    selector: 'memberShipModal',
    templateUrl: './member-ship-detail-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class MemberShipModalComponent extends AppComponentBase {
    @ViewChild('nameInput', { static: true }) nameInput: ElementRef;
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @ViewChild('dataTable', { static: false }) dataTable0: Table;
    @ViewChild('paginator', { static: false }) paginator0: Paginator;
    OrderPrimeng: PrimengTableHelper = new PrimengTableHelper();


    @ViewChild('SkuDataTable', { static: false }) SkuDataTable: Table;
    @ViewChild('SkuPaginator', { static: false }) SkuPaginator: Paginator;
    SkuPrimeng: PrimengTableHelper = new PrimengTableHelper();

    @ViewChild('PointDataTable', { static: false }) PointDataTable: Table;
    @ViewChild('PointPaginator', { static: false }) PointPaginator: Paginator;
    PointPrimeng: PrimengTableHelper = new PrimengTableHelper();

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    saving: boolean = false;
    active = false;
    member: any = new CreateMemberInput();
    editable = false;
    memberTypes: any[] = [];
    operationType: string = "add";
    //dto
    createMember: CreateMemberInput;
    updateMember: UpdateMemberInput;

    toDebug;
    amount;
    orderStatusList: any[] = [];
    orderStatus;
    startTime: any = moment().utc().subtract(30, 'days').startOf('day').add((new Date().getTimezoneOffset() / 60), 'h');
    endTime: any = moment().utc().endOf('day').add((new Date().getTimezoneOffset() / 60), 'h');
    StartTime: any = moment().utc().subtract(30, 'days').startOf('day').add((new Date().getTimezoneOffset() / 60), 'h');
    EndTime: any = moment().utc().endOf('day').add((new Date().getTimezoneOffset() / 60), 'h');
    filterText;

    showSave = true;
    constructor(
        injector: Injector,
        private _OrderServiceProxy: OrderServiceProxy,
        private _commonService: CommonServiceProxy,
        private _memberService: MemberServiceProxy,
        private _SensingShopServiceProxy: SensingShopServiceProxy
    ) {
        super(injector);
        // _commonService.memberType().subscribe((result) => {
        //     this.memberTypes = result;
        // })
        _commonService.orderStatus().subscribe((result) => {
            this.orderStatusList = result;
        })
    }

    show(member?: any, editable?: boolean): void {
        this.active = true;
        this.editable = editable;
        this.toDebug = false;
        if (member) {
            this.operationType = "edit";
            this.member = member;
            this.member.id = Number(this.member.id);
            this.modal.show();
        } else {
            this.operationType = "add";
            this.member = new CreateMemberInput();
            this.modal.show();
        }
    }
    getSkuInfo(event?: LazyLoadEvent) {
        if (this.SkuPrimeng.shouldResetPaging(event)) {
            this.SkuPaginator.changePage(0);
            return;
        }
        if (!this.primengTableHelper.getSorting(this.SkuDataTable)) {
            this.SkuDataTable.sortField = "orderDateTime"
            this.SkuDataTable.sortOrder = -1;
        }
        this.SkuPrimeng.showLoadingIndicator();

        var input: any = ({
            memberId: this.member.id,
            orderDateTimeStart: this.StartTime ? this.StartTime.add(-(new Date().getTimezoneOffset() / 60), 'h') : undefined,
            orderDateTimeEnd: this.EndTime ? this.EndTime.add(-(new Date().getTimezoneOffset() / 60), 'h') : undefined,
            sorting: this.SkuPrimeng.getSorting(this.SkuDataTable) || "orderDateTime DESC",
            maxResultCount: this.SkuPrimeng.getMaxResultCount(this.SkuPaginator, event),
            skipCount: this.SkuPrimeng.getSkipCount(this.SkuPaginator, event)
        })
        this._OrderServiceProxy.orderSkuByMemberId(input)
            .pipe(this.myFinalize(() => { this.SkuPrimeng.hideLoadingIndicator(); }))
            .subscribe(result => {
                console.log(result)
                this.toDebug = true;
                this.SkuPrimeng.totalRecordsCount = result.totalCount;
                this.SkuPrimeng.records = result.items;
                // this.SkuPrimeng.hideLoadingIndicator();
            })
    }


    getSalesInfo(event?: LazyLoadEvent) {
        if (this.OrderPrimeng.shouldResetPaging(event)) {
            this.paginator0.changePage(0);
            return;
        }
        if (!this.OrderPrimeng.getSorting(this.dataTable0)) {
            this.dataTable0.sortField = "orderDateTime"
            this.dataTable0.sortOrder = -1;
            console.log(this.dataTable0, 222333)
        }
        this.OrderPrimeng.showLoadingIndicator();
        this.startTime = this.startTime ? moment(this.startTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h') : undefined;
        this.endTime = this.endTime ? moment(this.endTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h') : undefined;

        this._OrderServiceProxy.getOrdersByMemberId(
            this.member.id,
            undefined,
            undefined,
            undefined,
            this.startTime,
            this.endTime,
            undefined,
            undefined,
            undefined,
            this.orderStatus,
            undefined,
            undefined,
            this.OrderPrimeng.getSorting(this.dataTable0) || 'orderDateTime DESC',
            this.OrderPrimeng.getMaxResultCount(this.paginator0, event),
            this.OrderPrimeng.getSkipCount(this.paginator0, event)
        )
        .pipe(this.myFinalize(() => { this.OrderPrimeng.hideLoadingIndicator(); }))
        .subscribe(result => {
            console.log(result)
            this.toDebug = true;
            this.amount = result.amount;
            this.OrderPrimeng.totalRecordsCount = result.orders.totalCount;
            this.OrderPrimeng.records = result.orders.items;
            // this.OrderPrimeng.hideLoadingIndicator();
        })
    }

    getMemberPointLog(event?: LazyLoadEvent) {
        if (this.PointPrimeng.shouldResetPaging(event)) {
            this.PointPaginator.changePage(0);
            return;
        }

        this.PointPrimeng.showLoadingIndicator();
        this.startTime = this.startTime ? moment(this.startTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h') : undefined;
        this.endTime = this.endTime ? moment(this.endTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h') : undefined;

        this._SensingShopServiceProxy.getMemberPointLog(
            this.appSession.tenantId,
            this.member.id,
            new GetMemberPointLogInput({
                inOrOutType: undefined,
                pointFromType: undefined,
                startTime: this.startTime,
                endTime: this.endTime,
                filter: undefined,
                sorting: this.PointPrimeng.getSorting(this.PointDataTable),
                maxResultCount: this.PointPrimeng.getMaxResultCount(this.PointPaginator, event),
                skipCount: this.PointPrimeng.getSkipCount(this.PointPaginator, event)
            })
        )
        .pipe(this.myFinalize(() => { this.PointPrimeng.hideLoadingIndicator(); }))
        .subscribe(result => {
            console.log('PointPrimeng', result)
            this.PointPrimeng.totalRecordsCount = result.totalCount;
            this.PointPrimeng.records = result.items;
            // this.PointPrimeng.hideLoadingIndicator();
        })
    }


    addAddress() {
        var address = new ShippingAddressDto();
        this.member.shippingAddresses.push(address);
    }
    deleteAddress(i) {
        this.member.shippingAddresses.splice(i, 1);
    }
    close(): void {
        this.active = false;
        this.toDebug = false;
        this.modal.hide();
        this.member = new CreateMemberInput();
    }

    save(e: Event) {
        !this.editable && e.preventDefault();
        this.saving = true;
        if (this.operationType == "add") {
            this.createMember = new CreateMemberInput(this.member);
            this._memberService.createMember(this.createMember).pipe(finalize(() => {
                this.saving = false;
            })).subscribe(() => {
                this.modalSave.emit();
                this.close();
            })
        } else {
            this.updateMember = new UpdateMemberInput(this.member);
            this._memberService.updateMember(this.updateMember).pipe(finalize(() => {
                this.saving = false;
            })).subscribe(() => {
                this.modalSave.emit();
                this.close();
            })
        }
    }
    //转换序列
    transIndex(i, event?: LazyLoadEvent) {
        return i + 1 + this.OrderPrimeng.getSkipCount(this.paginator0, event);
    }
    transIndex2(i, event?: LazyLoadEvent) {
        return i + 1 + this.SkuPrimeng.getSkipCount(this.SkuPaginator, event);
    }
    transIndex3(i, event?: LazyLoadEvent) {
        return i + 1 + this.PointPrimeng.getSkipCount(this.PointPaginator, event);
    }
}
