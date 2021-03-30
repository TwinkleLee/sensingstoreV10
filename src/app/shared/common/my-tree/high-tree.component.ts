import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, Injector } from '@angular/core';
import * as _ from 'lodash';
import { MyTreeComponent } from '@app/shared/common/my-tree/my-tree.component';
import { OrganizationUnitServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

import { DeviceServiceProxy as NewDeviceServiceProxy} from '@shared/service-proxies/service-proxies-devicecenter';
import { StoreServiceProxy as NewStoreServiceProxy} from '@shared/service-proxies/service-proxies-devicecenter';

@Component({
    selector: 'app-high-tree',
    templateUrl: './high-tree.component.html',
    styleUrls: ['./high-tree.component.css']
})
export class HighTreeComponent extends AppComponentBase implements OnInit {

    @Input() treeList: any[];
    @Input() treeType: any = '';
    @Input() selfConfig: any = {
        'labelName': false,
        'searchDepth': null,
        'includeOfflineStore':false
    };
    @Input() containerHeight = '6rem';

    @Input() config: any = {
        // 'singleSelect': false,
        // 'selectable': true,
        // 'name': 'text',
        // 'children': 'children',
        // 'showIcon': false,
        // 'icon': "iconUrl",
        // 'menu': false,
        // 'selecionMode': 1,
        // 'sortable': false,
        // 'draggable': false,
        // 'showId': false,
        // 'needFilter': false,
        // 'showOuterId': true,
        // "preciseMatch": true
    };
    defaultConfig: any = {
        'singleSelect': false,
        'selectable': true,
        'name': 'text',
        'children': 'children',
        'showIcon': false,
        'icon': "iconUrl",
        'menu': false,
        'selecionMode': 1,
        'sortable': false,
        'draggable': false,
        'showId': false,
        'needFilter': false,
        'showOuterId': true,
        "preciseMatch": true,
        "canOnlyChooseType": false
    };
    @Input() initShowArray: any[];//初始化时被选中的item数组,或item的id数组
    @Output() onTreeUpdate: EventEmitter<any> = new EventEmitter<any>();

    storeText = '';
    showStore = false;
    storeFilter = '';
    needAddShowChildren = true;
    @ViewChild('storeTree',{static:false}) storeTree: MyTreeComponent;


    lastTimeChosenList: any = [];
    constructor(
        injector: Injector,
        private _ouService: OrganizationUnitServiceProxy,
        private _NewStoreServiceProxy: NewStoreServiceProxy,
        private _NewDeviceServiceProxy: NewDeviceServiceProxy) {
        super(injector)
    }
    ngDoCheck() {

    }
    ngOnInit() {
        console.log('initShowArray', this.initShowArray);
        this.config = Object.assign(this.defaultConfig, this.config);
        this.getTreeList();
        if (this.initShowArray && this.initShowArray.length) {
            // console.log(this.initShowArray, 'initShowArray')
            this.lastTimeChosenList = _.cloneDeep(this.initShowArray);
            this.initSelectionText(this.treeList);
        }

    }
    ngOnDestroy() {
        // console.log('destroy')
    }


    initSelectionText(arr) {
        // console.log('initSelectionText', arr, this.initShowArray)
        arr.forEach((item1) => {
            this.initShowArray.forEach((item2) => {
                if ((item1.id == item2.id || item1.id == item2) && ((item1.type == item2.type) || !item2.type)) {
                    this.storeText = this.storeText + item1[this.config.name] + ' '
                }
                if (item1.children instanceof Array) {
                    this.initSelectionText(item1.children);
                }
            })

        })
    }


    updateSelectedList() {
        var arr = this.storeTree.getchosen().map(item => {
            return item[this.config.name]
        })
        this.storeText = '';
        for (var i = 0; i < arr.length; i++) {
            this.storeText = this.storeText + arr[i] + ' '
        }
        this.showStore = false;
        this.lastTimeChosenList = this.storeTree.getchosen();
        this.onTreeUpdate.emit(this.storeTree.getchosen().map(item => {
            return item
        }));
    }

    //筛选树
    storeFilterTree(e?: Event) {
        e && e.preventDefault();
        try {
            this.storeTree.filterTree(this.storeFilter);
        } catch (err) {
            console.log(err)
        }
    }

    getTreeList() {//树
        if (this.treeList) {
            // this.storeTree.addShowChildren()
            return
        }
        if (this.selfConfig.searchDepth == 'organization') {
            this._ouService.getCurrentTenantOrganizationUnitsTree().subscribe((result) => {
                this.treeList = [result];
                // this.storeTree.addShowChildren()
            })
        } else if (this.selfConfig.searchDepth == 'store') {
            this._NewStoreServiceProxy.getCurrentTenantOrganizationUnitsAndStoresTree([],this.selfConfig.includeOfflineStore).subscribe((result) => {
                this.treeList = [result];
                // this.storeTree.addShowChildren()
            })
        } else {//device
            this._NewDeviceServiceProxy.getOuStoreDeviceTree([]).subscribe((result) => {
                this.treeList = [result];
                // this.storeTree.addShowChildren()
            })
        }
    }

    clickInput() {
        //2020 2 25
        // if (this.treeList.length == 0) {
        //     this.storeText = this.l("NoData");
        //     return
        // }
        if (this.showStore) {
            this.updateSelectedList();
        } else {
            this.showStore = true;
            setTimeout(() => {
                this.storeFilterTree();
            })
            setTimeout(() => {
                this.needAddShowChildren = false;
            }, 1000)
        }

    }

}
