import { Component, OnInit, Injector, ViewChild, ElementRef } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { MemberServiceProxy, CommonServiceProxy, ReportServiceProxy, SensingShopManageServiceProxy, DispatchPointToMemberInput, EnumInOrOutType, EnumPointFromType } from '@shared/service-proxies/service-proxies2';
import { MemberShipModalComponent } from '@app/admin//memberShip/member-ship/member-ship-detail-modal.component';
import { finalize } from 'rxjs/operators';
import * as _ from 'lodash';
import { MyTreeComponent } from '@app/shared/common/my-tree/my-tree.component';
import * as moment from 'moment';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { StoreServiceProxy as NewStoreServiceProxy} from '@shared/service-proxies/service-proxies-devicecenter';

@Component({
  selector: 'app-member-ship',
  templateUrl: './member-ship.component.html',
  animations: [appModuleAnimation()]
})
export class MemberShipComponent extends AppComponentBase {

  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;
  @ViewChild('memberShipModal', { static: true }) memberShipModal: MemberShipModalComponent;
  @ViewChild('StoreCombobox', { static: false }) storeComboboxElement: ElementRef;
  @ViewChild('storeTree', { static: false }) storeTree: MyTreeComponent;
  @ViewChild('highTree', { static: false }) highTree;


  @ViewChild('PointInputModal', { static: true }) PointInputModal: ModalDirective;


  filterText: string;
  memberShipType: any = '';
  startTime: any = moment().utc().subtract(29, 'days').startOf('day');
  endTime: any = moment().utc().endOf('day');
  belongStore: any = "";
  storeFilter: string = '';
  memberSelection: any[] = [];
  //下拉
  stores: any[] = [];
  memberTypes: any[] = [];

  exportLoading = false;

  // showStore = false;
  storeText = '';

  chosenItem = [];
  DispatchingPointToMember = false;
  selectedMember: any = {};
  DispatchPoint = {
    dispatchAmount: 0,
    inOrOutType: EnumInOrOutType["In"]
  };
  DispatchPointToMemberInputInOrOutType = EnumInOrOutType;

  constructor(injector: Injector,
    private _memberService: MemberServiceProxy,
    private _commonService: CommonServiceProxy,
    private _NewStoreServiceProxy: NewStoreServiceProxy,
    private _SensingShopManageServiceProxy: SensingShopManageServiceProxy) {
    super(injector);
    _commonService.memberType().subscribe((result) => {
      this.memberTypes = result;
      this.memberShipModal.memberTypes = result;
    })
  }

  DispatchPointToMember() {
    this._SensingShopManageServiceProxy.dispatchPointToMember({
      memberIds: [this.selectedMember.id],
      openIds: void 0,
      dispatchAmount: this.DispatchPoint.dispatchAmount,
      pointFromType: EnumPointFromType["Dispatch"],
      inOrOutType: this.DispatchPoint.inOrOutType,
      thingId: void 0,
      from: void 0,
      description: void 0
    } as DispatchPointToMemberInput).subscribe(r => {
      this.notify.success(this.l('success'));
      this.PointInputModal.hide();
      this.getMembers();
    })
  }

  ngOnInit() {

  }
  ngOnDestroy() {

  }

  clickContainer() {
    if (this.highTree && this.highTree.showStore) {
      this.highTree.clickInput()
    }
  }

  onTreeUpdate(originalArr) {
    console.log(originalArr)
    this.chosenItem = originalArr.filter(item => {
      return item.type == 'store'
    }).map(item => {
      return item.id
    })
  }


  // updateStoreSelected() {
  //   if (this.showStore) {
  //     var arr = this.storeTree.getchosen().map(item => {
  //       return item.text
  //     })
  //     this.storeText = '';
  //     for (var i = 0; i < arr.length; i++) {
  //       this.storeText = this.storeText + arr[i] + ' '
  //     }
  //   }
  // }

  // dropDownBind2 = function (e) {
  //   var target = e.target;
  //   if (!$(target).hasClass("belongToTree")) {
  //     this.showStore = false;
  //     this.updateStoreSelected();
  //   }
  // }.bind(this);
  //筛选树
  storeFilterTree(e?: Event) {
    e && e.preventDefault();
    this.storeTree.filterTree(this.storeFilter);
  }

  goExport() {
    this.exportLoading = true;
    // if (this.showStore) {
    //   this.chosenItem = this.storeTree.getchosen().map(item => {
    //     return item.id
    //   })
    // }
    this._memberService.getMemberListToExcel(
      this.filterText,
      this.startTime ? moment(this.startTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h') : void 0,
      this.endTime ? moment(this.endTime.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's') : void 0,
      this.memberShipType || void 0,
      this.chosenItem,
      void 0,
      this.primengTableHelper.getSorting(this.dataTable),
      void 0,
      this.primengTableHelper.getMaxResultCount(this.paginator, void 0),
      this.primengTableHelper.getSkipCount(this.paginator, void 0)
    ).subscribe(r => {
      setTimeout(() => {
        this.exportLoading = false;
      }, 2000)
      var href = `https://o.api.troncell.com/api/File/DownloadTempFile?FileName=` + r.fileName + `&FileType=` + r.fileType + `&FileToken=` + r.fileToken;
      var link = document.getElementById('aaa');
      $(link).attr("href", href);
      link.click();
    })
  }


  //所属店铺
  getStores() {
    //树
    // this._ouService.getCurrentTenantOrganizationUnitsTree().subscribe((result) => {
    //   this.stores = [result];
    // })
    this._NewStoreServiceProxy.getCurrentTenantOrganizationUnitsAndStoresTree([],true).subscribe((result) => {
      this.stores = [result];
    })
  }


  //获取会员列表
  getMembers(event?: LazyLoadEvent) {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.memberSelection = [];


    // if (this.showStore) {
    //   this.chosenItem = this.storeTree.getchosen().map(item => {
    //     return item.id
    //   })
    // }


    // var selectedStores = this.showStore ? this.storeTree.getchosen().map(item => {
    //   return item.id
    // }) : void 0;

    this.primengTableHelper.showLoadingIndicator();
    this._memberService.getMembers(
      this.filterText,
      this.startTime ? moment(this.startTime.format("YYYY/MM/DD")).add(-(new Date().getTimezoneOffset() / 60), 'h') : void 0,
      this.endTime ? moment(this.endTime.format("YYYY/MM/DD")).add(24 - (new Date().getTimezoneOffset() / 60), 'h').add(-1, 's') : void 0,
      this.memberShipType || void 0,
      // this.belongStore ? [this.belongStore] : void 0,
      // selectedStores,
      this.chosenItem,
      void 0,
      this.primengTableHelper.getSorting(this.dataTable),
      void 0,
      this.primengTableHelper.getMaxResultCount(this.paginator, event),
      this.primengTableHelper.getSkipCount(this.paginator, event)
    ).pipe(finalize(() => {
      this.primengTableHelper.hideLoadingIndicator();
    })).subscribe(result => {
      this.primengTableHelper.totalRecordsCount = result.totalCount;
      this.primengTableHelper.records = result.items;
      // setTimeout(() => {
      //   this.juggeChosen(this.memberSelection);
      // },0)
    });
  }
  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }
  //会员详情
  goDetail(record) {
    this.memberShipModal.show(_.cloneDeep(record), false);
  }

  //编辑
  editMember(record) {
    this.memberShipModal.show(_.cloneDeep(record), true);
  }
  //
  deleteMember(record) {
    this.message.confirm(this.l('deleteThisMemberShip'), this.l('AreYouSure'), (r) => {
      if (r) {
        this._memberService.deleteMember(record.id).subscribe(() => {
          this.notify.success(this.l('success'));
          this.memberSelection = [];
          this.getMembers();
        })
      }
    })
  }
  //
  deleteMembers() {
    var ids = this.memberSelection.map((member) => {
      return member.id;
    });
    if (ids.length == 0) {
      return this.notify.info(this.l('atLeastChoseOneItem'));
    }
    this.message.confirm(this.l('deleteThisMemberShips'), this.l('AreYouSure'), (r) => {
      if (r) {
        this._memberService.deleteMembers(ids).subscribe(() => {
          this.notify.success(this.l('success'));
          this.memberSelection = [];
          this.getMembers();
        })
      }
    })
  }
}
