import { AfterViewInit, Component, ElementRef, EventEmitter, Injector, Input, Output, ViewChild, ChangeDetectorRef, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';

@Component({
    selector: 'date-range-picker',
    template:
        `<input #DateRangePicker type="text" class="form-control" [ngClass]="{'dashboardCss m--font-brand': cssStyle=='dashboard'}" [disabled]="isDisabled" [ngStyle]="{color:(_startDate||_endDate)?'':'transparent'}" />
        <span *ngIf="showButton&&hasLabel" class="input-group-btn" style="position:absolute;right:0;top:2.1rem;">
            <button (click)="buttonClick()" class="btn btn-primary" type="button">
                <i class="icon-sousuo-sousuo"></i>
            </button>
        </span>
        <span *ngIf="showButton&&!hasLabel" class="input-group-btn" style="position:absolute;right:0;top:0rem;">
            <button (click)="buttonClick()" class="btn btn-primary" type="button" style="transform:scale(1.05)">
                <i class="icon-sousuo-sousuo"></i>
            </button>
        </span>
        <span *ngIf="(_startDate||_endDate)&&admitDelete" class="input-group-btn clearSpan" id="ClearSpanBtn" style="position:absolute;right:0;top:2rem;">
            <button (click)="clear()" class="btn btn-primary" style="background:transparent;border:none;" type="button">
                <i class="icon-icon-test" style="color:#333;"></i>
            </button>
        </span>`,
    styles: [`.dashboardCss {
            font-weight:bold;
       }`
    ]
})
export class DateRangePickerComponent extends AppComponentBase implements AfterViewInit, OnInit {

    @ViewChild('DateRangePicker', { static: true }) dateRangePickerElement: ElementRef;
    _startDate: moment.Moment = undefined;
    _endDate: moment.Moment = undefined;

    @Input() isDisabled = false;
    @Input() allowFutureDate = false;
    @Input() isSingleDatePicker = false;
    @Input() showButton = false;
    @Input() dateRangePickerOptions: any = undefined;

    @Output() startDateChange = new EventEmitter();
    @Output() endDateChange = new EventEmitter();
    @Output() buttonEmit = new EventEmitter();
    @Input() rangeMode = 'history';
    @Input() needInitDate: boolean = false;
    @Input() admitDelete: boolean = true;
    @Input() hasLabel: boolean = true;
    @Input() cssStyle: String = '';
    
    @Input() minDate: any = undefined;
    @Input() maxDate: any = undefined;

    
    private picker;

    @Input()
    get startDate() {
        return this._startDate;
    }

    set startDate(val) {
        this._startDate = val;
        this.startDateChange.emit(val);
    }

    @Input()
    get endDate() {
        return this._endDate;
    }

    set endDate(val) {
        this._endDate = val;
        this.endDateChange.emit(val);
    }

    constructor(
        injector: Injector,
        private _element: ElementRef,
        private _changeDef: ChangeDetectorRef
    ) {
        super(injector);
    }
    ngOnInit() {
        if (!this.needInitDate) {
            setTimeout(() => {
                $(this.dateRangePickerElement.nativeElement).val('');
            }, 0)
        } else {
        }
    }
    ngAfterViewInit(): void {
        this.refresh();
    }
    refresh() {
        const $element: any = $(this.dateRangePickerElement.nativeElement);

        const _selectedDateRange = {
            startDate: this._startDate,
            endDate: this._endDate
        };

        if (!this.dateRangePickerOptions) {
            this.dateRangePickerOptions = {
                singleDatePicker: this.isSingleDatePicker
            };
        } else {
            this.isSingleDatePicker = this.dateRangePickerOptions.singleDatePicker;
        }

        $element.daterangepicker(
            $.extend(true, this.createDateRangePickerOptions(), this.dateRangePickerOptions, _selectedDateRange, {
                minDate: this.minDate,
                maxDate: this.maxDate
            }), (start, end, label) => {
                if (this.dateRangePickerOptions.singleDatePicker) {
                    this.startDate = this.endDate = end;
                } else {
                    this.startDate = start._isValid ? start : undefined;
                    this.endDate = end._isValid ? end : undefined;
                }
                !end._isValid && !start._isValid && setTimeout(() => {
                    $(this.dateRangePickerElement.nativeElement).val('');
                }, 0);
            });
        this.picker = $element.data('daterangepicker');
    }
    transLocalToUtc(m: moment.Moment) {
        if (!m) { return m; }
        var s = m.toString().replace(/GMT\+\d{4}/, "GMT+0000");
        return moment.utc(s);
    }
    createDateRangePickerOptions(): any {
        const self = this;
        const options: any = {
            locale: {
                format: (this.dateRangePickerOptions && this.dateRangePickerOptions.timePicker) ? 'L LT' : 'L',
                applyLabel: self.l('Apply'),
                cancelLabel: self.l('Cancel'),
                customRangeLabel: self.l('CustomRange')
            },
            ranges: {},
            autoApply: true
        }


        if (!this.isSingleDatePicker) {
            if (!this.allowFutureDate) {
                options.max = moment();
                options.maxDate = moment();
            }
            if (this.rangeMode == 'history') {
                options.ranges[self.l('Today')] = [moment().startOf('day'), moment().endOf('day')];
                options.ranges[self.l('Yesterday')] = [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')];
                options.ranges[self.l('Last7Days')] = [moment().subtract(6, 'days').startOf('day'), moment().endOf('day')];
                options.ranges[self.l('Last30Days')] = [moment().subtract(29, 'days').startOf('day'), moment().endOf('day')];
            } else if (this.rangeMode == 'all') {
                options.ranges[self.l('Today')] = [moment().startOf('day'), moment().endOf('day')];
                options.ranges[self.l('Yesterday')] = [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')];
                options.ranges[self.l('Last7Days')] = [moment().subtract(6, 'days').startOf('day'), moment().endOf('day')];
                options.ranges[self.l('Last30Days')] = [moment().subtract(29, 'days').startOf('day'), moment().endOf('day')];
                options.ranges[self.l('NextWeek')] = [moment().endOf('day'), moment().add(7, 'days').startOf('day')];
                options.ranges[self.l('Next30Days')] = [moment().endOf('day'), moment().add(30, 'days').startOf('day')];
                options.ranges[self.l('Next90Days')] = [moment().endOf('day'), moment().add(90, 'days').startOf('day')];
            } else if (this.rangeMode == 'star') {
                options.ranges[self.l('Today')] = [moment().startOf('day'), moment().endOf('day')];
                options.ranges[self.l('Tomorrow')] = [moment().add(1, 'days').startOf('day'), moment().add(1, 'days').endOf('day')];
                options.ranges[self.l('NextWeek')] = [moment().endOf('day'), moment().add(7, 'days').startOf('day')];
                options.ranges[self.l('Next30Days')] = [moment().endOf('day'), moment().add(30, 'days').startOf('day')];
                // options.ranges[self.l('ThisMonth')] = [moment().startOf('month'), moment().endOf('month')];
                // options.ranges[self.l('LastMonth')] = [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')];    
            } else {
                options.ranges[self.l('Today')] = [moment().startOf('day'), moment().endOf('day')];
                options.ranges[self.l('NextWeek')] = [moment().endOf('day'), moment().add(7, 'days').startOf('day')];
                options.ranges[self.l('Next30Days')] = [moment().endOf('day'), moment().add(30, 'days').startOf('day')];
                options.ranges[self.l('Next90Days')] = [moment().endOf('day'), moment().add(90, 'days').startOf('day')];
                options.ranges[self.l('Next365Days')] = [moment().endOf('day'), moment().add(365, 'days').startOf('day')];
            }
            // options.ranges[self.l('Clear')] = [null, null];
            // options.ranges[self.l('Clear')] = [undefined, undefined];
        } else {
            options.ranges[self.l('Today')] = [moment().startOf('day'), moment().endOf('day')];
            options.ranges[self.l('Yesterday')] = [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')];
            options.ranges[self.l('Tomorrow')] = [moment().add(1, 'days').startOf('day'), moment().add(1, 'days').endOf('day')];
            // options.ranges[self.l('Clear')] = [undefined, undefined];
        }
        // if (!this.isSingleDatePicker) {
        //     if (!this.allowFutureDate) {
        //         options.max = moment().utc();
        //         options.maxDate = moment().utc();
        //     }
        //     if (this.rangeMode == 'history') {
        //         options.ranges[self.l('Today')] = [moment().utc(), moment().utc()];
        //         options.ranges[self.l('Yesterday')] = [moment().utc().subtract(1, 'days').startOf('day'), moment().utc().subtract(1, 'days').endOf('day')];
        //         options.ranges[self.l('Last7Days')] = [moment().utc().subtract(6, 'days').startOf('day'), moment().utc().endOf('day')];
        //         options.ranges[self.l('Last30Days')] = [moment().utc().subtract(29, 'days').startOf('day'), moment().utc().endOf('day')];
        //     } else if (this.rangeMode == 'all') {
        //         options.ranges[self.l('Today')] = [moment().utc(), moment()];
        //         options.ranges[self.l('Yesterday')] = [moment().utc().subtract(1, 'days').startOf('day'), moment().utc().subtract(1, 'days').endOf('day')];
        //         options.ranges[self.l('Last7Days')] = [moment().utc().subtract(6, 'days').startOf('day'), moment().utc().endOf('day')];
        //         options.ranges[self.l('Last30Days')] = [moment().utc().subtract(29, 'days').startOf('day'), moment().utc().endOf('day')];
        //         options.ranges[self.l('NextWeek')] = [moment().utc().endOf('day'), moment().utc().add(7, 'days').startOf('day')];
        //         options.ranges[self.l('Next30Days')] = [moment().utc().endOf('day'), moment().utc().add(30, 'days').startOf('day')];
        //         options.ranges[self.l('Next90Days')] = [moment().utc().endOf('day'), moment().utc().add(90, 'days').startOf('day')];
        //     } else if(this.rangeMode == 'star') {
        //         options.ranges[self.l('Today')] = [moment().utc(), moment().utc()];
        //         options.ranges[self.l('Tomorrow')] = [moment().utc().add(1, 'days').startOf('day'), moment().utc().add(1, 'days').endOf('day')];
        //         options.ranges[self.l('NextWeek')] = [moment().utc().endOf('day'), moment().utc().add(7, 'days').startOf('day')];
        //         options.ranges[self.l('Next30Days')] = [moment().utc().endOf('day'), moment().utc().add(30, 'days').startOf('day')];
        //         // options.ranges[self.l('ThisMonth')] = [moment().startOf('month'), moment().endOf('month')];
        //         // options.ranges[self.l('LastMonth')] = [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')];    
        //     } else {
        //         options.ranges[self.l('Today')] = [moment().utc(), moment().utc()];
        //         options.ranges[self.l('NextWeek')] = [moment().utc().endOf('day'), moment().utc().add(7, 'days').startOf('day')];
        //         options.ranges[self.l('Next30Days')] = [moment().utc().endOf('day'), moment().utc().add(30, 'days').startOf('day')];
        //         options.ranges[self.l('Next90Days')] = [moment().utc().endOf('day'), moment().utc().add(90, 'days').startOf('day')];
        //         options.ranges[self.l('Next365Days')] = [moment().utc().endOf('day'), moment().utc().add(365, 'days').startOf('day')];
        //     }
        //     options.ranges[self.l('Clear')] = [null, null];
        //     // options.ranges[self.l('Clear')] = [undefined, undefined];
        // }
        return options;
    }

    buttonClick() {
        this.buttonEmit.emit();
    }
    clear() {
        // this._endDate = null;
        // this._startDate = null;
        this.endDate = null;
        this.startDate = null;
        $(this.dateRangePickerElement.nativeElement).val('');
    }
}
