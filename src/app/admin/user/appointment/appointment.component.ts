import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';


import { AppointmentStatus, AuditUserAppointmentInput, UserAppointmentServiceProxy } from '@shared/service-proxies/service-proxies-pager';

import { Router, ActivatedRoute } from '@angular/router';
import { CreateOrEditAppointmentModalComponent } from './appointment-modal.component';

@Component({
  templateUrl: './appointment.component.html',
  animations: [appModuleAnimation()]
})
export class AppointmentComponent extends AppComponentBase {

  @ViewChild('appointmentModal', { static: true }) appointmentModal: CreateOrEditAppointmentModalComponent;

  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  AppointmentStatus = AppointmentStatus;

  filterText = "";
  handled: any = "";
  applicationId: any = "";
  applicationList = [];
  constructor(injector: Injector,
    private router: Router,
    private route: ActivatedRoute,
    private _UserAppointmentServiceProxy: UserAppointmentServiceProxy,
  ) {
    super(injector);

  }

  handle(record) {
    // this.appointmentModal.show(Object.assign({}, record));
    if (!record) return

    this.message.confirm(this.l('AuditUserAppointment'), this.l('AreYouSure'), (r) => {
      if (r) {
        this._UserAppointmentServiceProxy.auditAppointment(this.appSession.tenantId, new AuditUserAppointmentInput({
          targetStatus: 1,
          userAppointmentId: record.id
        }))
          .subscribe((res) => {
            this.notify.info(this.l('success'));
            this.getList();
          })
      }

    })

  }

  //获取列表
  getList(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }

    this.primengTableHelper.showLoadingIndicator();
    this._UserAppointmentServiceProxy.getAppointmentsForHall(
      void 0,
      void 0,
      this.appSession.tenantId,
      this.filterText,
      this.primengTableHelper.getSorting(this.dataTable),
      this.primengTableHelper.getMaxResultCount(this.paginator, event),
      this.primengTableHelper.getSkipCount(this.paginator, event)
    )
      .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
      .subscribe(result => {
        this.primengTableHelper.totalRecordsCount = result.totalCount;
        this.primengTableHelper.records = result.items;
      })
  }


  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }

}
