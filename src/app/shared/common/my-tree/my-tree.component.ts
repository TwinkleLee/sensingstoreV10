import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import * as _ from 'lodash';

/**
 * 组件名称：多功能树组件
 * 功能设计：1.可勾选    分为多选和单选  singleSelect字段区分
 *          2.每个分类名称前面显示icon
 *          3.自定义右键菜单 初步功能如下  
 *                      1) 添加
 *                      2) 删除
 *                      3) 详情
 *                      4) 添加子节点 
 *          4.点击菜单一项  触发事件 并将右键的节点信息广播  
 * 
 * 
 * 功能追加：将勾选模式分为以下几种  
 *                           1.正常勾选,勾选父节点直接选中所有子节点 操作子节点不影响父节点   常用于类似列表选中操作
 *                           2.无差别勾选  所有节点选中时都只操作自身  不影响其他节点
 *                           3.window功能勾选模式  
 *                                          选中样式：1)未选中-显示为□   2)选中-显示为√    3)部分选中  显示为 ■
 *                                          说明:选中单个子节点勾选中父节点(选中样式为黑色方块或者其他),选中所有字节点将父节点选中样式变为正常样式
 */
@Component({
    selector: 'app-my-tree',
    templateUrl: './my-tree.component.html',
    styleUrls: ['./my-tree.component.css']
})
export class MyTreeComponent implements OnInit {
    //配置参数
    /**
     * items 用于生成树的数据
     * root 生成最外层树的数据
     * config  参数配置:
     *         1.singleSelect 是否单选
     *         2.selectable 是否可选 若为false 则不存在checkbox的样式
     *         3.name 每一项名称的字段 默认'text'
     *         4.children 子节点数组对应的字段  默认children
     *         5.showIcon 是否显示icon      
     *         6.icon  icon地址的字段  默认 'iconUrl'
     *         7.selecionMode:number  选中模式 默认1(具体介绍见line-16)
     *         8.preciseMatch filter和outerId或config.name精准匹配时,直接选中匹配项,并展开
     *         9.canOnlyChooseType 仅有该类型可以被勾选和输出
     */

    @Input() items: any[] = [];
    @Input() root: any[] = [];
    @Input() filterRoot: any[] = [];
    @Input() config: any = {};
    @Output() onMenu: EventEmitter<any> = new EventEmitter<any>();
    @Output() onRender: EventEmitter<any> = new EventEmitter<any>();
    @Output() onCheck: EventEmitter<any> = new EventEmitter<any>();
    @Input() isRoot = true;
    @Input() needAddShowChildren = true; //给每个item.showChildren变成true 注意,这里是反的,true是收缩,false才是展开
    @Input() needShowNoChildren = true;
    @Input() isonlydevice = false;


    @ViewChild("list",{static:false}) list: ElementRef;
    private rootFunBinded = false;
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
        "canOnlyChooseType": false,
        "specialClass":{}
    };
    menuTemplate = '<ul id="treeMenu" class="vakata-context jstree-contextmenu jstree-default-contextmenu" style="display: none;position:fixed;">' +
        '<li><a href="#" name="edit" rel="0"><i></i><span class="vakata-contextmenu-sep">&nbsp;</span>修改</a></li>' +
        '<li><a href="#" name="detail" rel="1"><i></i><span class="vakata-contextmenu-sep">&nbsp;</span>详情</a></li>' +
        '<li><a href="#" name="add" rel="2"><i></i><span class="vakata-contextmenu-sep">&nbsp;</span>添加子分类</a></li>' +
        '<li><a href="#" name="delete" rel="3"><i></i><span class="vakata-contextmenu-sep">&nbsp;</span>删除</a></li></ul>';
    defaultImg = "./assets/common/images/holderimg.png";
    treeFilterText: string = '';
    rendered: boolean = false;
    chosenNodeIds: number[] = [];


    @Input() lastTimeChosenList: any = [];
    constructor() {

    }

    ngDoCheck() {
        if (this.isRoot) {
            this.filterRoot = this.items;
        }
        if (this.isRoot && !this.rendered) {
            this.refresh();
        }
    }
    addShowChildren(arr?) {
        if (!arr) arr = this.items;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].children && arr[i].children.length > 0) {
                arr[i].showChildren = true;
                this.addShowChildren(arr[i].children)
            }
        }

    }
    closeShowChildren(arr?) {
        if (!arr) arr = this.items;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].children && arr[i].children.length > 0) {
                arr[i].showChildren = false;
                this.closeShowChildren(arr[i].children)
            }
        }

    }

    notShowNoChildren(arr) {
        var returnArr = [];
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].type == 'organization' && arr[i].children.length == 0) {
                continue
            } else if (arr[i].type == 'organization' && arr[i].children.length > 0) {
                arr[i].children = this.notShowNoChildren(arr[i].children)
                if (arr[i].children.length > 0) {
                    returnArr.push(arr[i])
                }
            } else if (arr[i].type == 'tenant') {
                arr[i].children = this.notShowNoChildren(arr[i].children)
                if (arr[i].children.length > 0) {
                    returnArr.push(arr[i])
                }
            } else {
                returnArr.push(arr[i])
            }
        }
        return returnArr
    }

    checkSelection(chosen, ary) {
        ary.forEach((item1) => {
            if (item1.id == 52422) console.log(52422)
            item1.isSelected = false;
            chosen.forEach((item2) => {
                if ((item1.id == item2.id || item1.id == item2) && (item1.type == item2.type || !item2.type)) {
                    // console.log(item1, item2);
                    item1.isSelected = true
                }
                // if (item1.children instanceof Array) {
                //     this.checkSelection(chosen, item1.children);
                // }
            })
            if (item1.children instanceof Array) {
                this.checkSelection(chosen, item1.children);
            }

        })
    }


    ngOnInit() {
        this.config = Object.assign(this.defaultConfig, this.config);
        console.log("this.config",this.config)
        if (this.isRoot) {
            if (!this.needShowNoChildren) {
                this.items = this.notShowNoChildren(this.items);
            }

            if (this.needAddShowChildren) {
                this.addShowChildren(this.items)
            }

            console.log('lastTimeChosenList', this.lastTimeChosenList)
            console.log('当前的items', this.items);
            this.checkSelection(this.lastTimeChosenList, this.items)
            // console.log(this.items);

            this.root = this.items;
            this.initTreeData();
            $(document).on({
                'click': (e) => {
                    var target = e.target;
                    if ($(target).closest('ul#treeMenu').length == 0) {
                        $("ul#treeMenu").hide();
                    }
                },
                "scroll": () => {
                    $("ul#treeMenu").hide();
                }
            });
            $("label").off('click');
            $("label").on('click', (event) => {
                var target = event.target.nodeName;
                if ((target != "SPAN") && (target != "INPUT")) {
                    event.preventDefault();
                }
            });
        }
    }
    refresh() {
        if (this.isRoot) {
            this.root = this.items;
            if (this.root.length == 0) {
                this.rendered = false;
            } else {
                this.rendered = true;
                this.onRender.emit(this.root);
            }
        }
    }
    //初始化选中
    initSelection(chosen, ary?) {
        var _ary = ary ? ary : this.root;
        _ary.forEach((item) => {
            if (chosen.indexOf(item.id) > -1) { item.isSelected = true; }
            if (item.children instanceof Array) {
                this.initSelection(chosen, item.children);
            }
        })
    }
    //初始化树节点的信息
    initTreeData(ary?: any[], str?) {
        var _ary = ary || this.root,
            _treeKey = str || '';
        _ary.forEach((value, index) => {
            value.treeKey = _treeKey + '' + index;
            if (value.isSelected) { this.chosenNodeIds.push(value.id) };
            if (value.children instanceof Array) {
                this.initTreeData(value.children, value.treeKey);
            }
        });
    }
    //操作所有
    private operateAll(f, skipId?, ary?) {
        var _ary = ary ? ary : this.filterRoot;
        _ary.forEach((item) => {
            if (item.id != skipId) { item.isSelected = f; }
            // console.log(item.text, item.isSelected);
            if (item.children instanceof Array) {
                this.operateAll(f, skipId, item.children);
            }
        })
    }
    //选中自己以及子孙
    public chose(item) {
        if (this.config.selecionMode == 2) { return; }//无差别模式不操作子孙
        if (this.config.singleSelect && item.isSelected) { return this.operateAll(false, item.id); }
        if (!(item.children instanceof Array)) { return; }//没有子孙不需要继续
        item.children.forEach(element => {
            element.isSelected = item.isSelected;
            if (element.children instanceof Array) {
                element.children.forEach((child) => {
                    child.isSelected = item.isSelected;
                    this.chose(child);
                })
                element.allSelected = true;
            }
        });
        item.allSelected = true;
        this.onCheck.emit();
    }

    public childCheckEvent() {
        this.onCheck.emit();
    }
    //切换子节点显隐
    public toggleChildren(item, event?: Event) {
        event.preventDefault();
        item.showChildren = !item.showChildren;
    }
    public childMenuEvent(e) {
        this.onMenu.emit(e);
    }


    //显示右键菜单
    public showMenu(e, item) {
        e.preventDefault();
        if (!this.config.menu) {
            return;
        }
        var $menu;
        if ($("ul#treeMenu").length == 0) {
            $menu = $(this.menuTemplate);
            $("body").append($menu);
        } else {
            $menu = $("ul#treeMenu").first();
        }
        $menu.css('top', e.y);
        $menu.css('left', e.x);
        $menu.off('click');
        $menu.on('click', (event) => {
            event.preventDefault();
            if (e.target.nodeName != "A") { return; }
            var action = event.target.name;
            this.onMenu.emit({
                'action': action,
                'data': item
            });
            $menu.hide();
        });
        $menu.show();
    }

    /*
     * 对外
     */
    //获取当前已选中的items
    getchosen(chosen?) {
        var items = [], selection = [];
        //判断是否传入需要判断的节点数组 若无则默认全部
        if (!chosen) {
            items = Object.assign(items, this.items);
        } else {
            items = chosen;
        }
        items.forEach((v, i) => {
            if (v.isSelected) {
                if (this.config.canOnlyChooseType) {
                    if (this.config.canOnlyChooseType == v.type) selection.push(v);
                } else {
                    selection.push(v);
                }
            }
            if (v.children instanceof Array) {
                selection = selection.concat(this.getchosen(v.children));
            }
        })
        return selection;
    }


    getEndPoints() {
        var selectedItems = this.getchosen().map(item => {
            return item
        })
        var newList = [];
        for (var j = 0; j < selectedItems.length; j++) {
            var arr = getChildIds([selectedItems[j]])
            var repeatCount = 0;
            for (var k = 0; k < selectedItems.length; k++) {
                for (var l = 0; l < arr.length; l++) {
                    if (selectedItems[k].id == arr[l]) {
                        repeatCount++
                    }
                }
            }
            if (repeatCount == 1) {
                newList.push(selectedItems[j])
            }
        }
        function getChildIds(arr) {
            var childrenList = [];
            for (var i = 0; i < arr.length; i++) {
                childrenList.push(arr[i].id)
                console.log('pushId', arr[i].id)
                if (arr[i].children && arr[i].children.length > 0) {
                    childrenList = childrenList.concat(getChildIds(arr[i].children))
                }
            }
            return childrenList
        }
        return newList
    }


    //获取ids
    getchosenIds() {
        var ids = [];
        this.getchosen().forEach((v, i) => {
            ids.push(v.id);
        })
        return ids;
    }

    //转换图片路径
    transIconUrl(iconUrl) {
        var url;
        if (!iconUrl) {
            url = this.defaultImg;
        } else if (iconUrl.indexOf('http:') > -1 || iconUrl.indexOf('https:') > -1 || iconUrl.indexOf('data:') > -1) {
            url = iconUrl;
        } else {
            url = AppConsts.remoteServiceBaseUrl + '\\' + iconUrl;
        }
        return url;
    }
    //图片加载失败时  显示占位图
    showEmpty(e) {
        $(e.target).attr("src", this.defaultImg);
    }
    //筛选节点
    private filterNode(children, filter, filter2?) {
        var hasChild = false, childMatchs = [];
        return children.filter((item) => {
            hasChild = (item.children instanceof Array) && item.children.length > 0;
            if (hasChild) { item.children = this.filterNode(item.children, filter, filter2); }
            // return String(item.id).indexOf(filter) > -1 || item[this.config.name].indexOf(filter) > -1 || hasChild && item.children.length > 0;
            var return1 = true, return2 = true;
            if (filter) {
                return1 = String(item.outerId).indexOf(filter) > -1 || String(item.id).indexOf(filter) > -1 || item[this.config.name].indexOf(filter) > -1 || hasChild && item.children.length > 0;
                if (this.config.preciseMatch && (item.outerId == filter || item[this.config.name] == filter)) {
                    item.isSelected = true;
                    setTimeout(() => {
                        this.closeShowChildren(this.items)
                    }, 100)
                }
            }
            if (filter2) {
                return2 = item.deviceTypeId == filter2 || hasChild;
            }
            return return1 && return2
        })
    }
    //筛选树
    filterTree(filter, filter2?) {
        if (!this.isRoot) { return; }
        // if (filter === "" || filter === null) { return this.items = _.cloneDeep(this.root); }
        this.items = this.filterNode(_.cloneDeep(this.root), filter, filter2);
    }
    //组件自带的过滤
    filter() {
        this.filterTree(this.treeFilterText);
    }
    //获取图标 文字 和选中框的水平偏移
    getLeft(node) {
        var showIcon = this.config.showIcon,
            selectable = this.config.selectable, left = "0px";
        if (node == 'i') {
            left = showIcon ? (selectable ? '-22px' : '-22px') : (selectable ? '-22px' : '-5px');
        } else if (node == 'img') {
            left = showIcon ? (selectable ? '18px' : '0px') : (selectable ? '18px' : '0px');
        } else if (node == 'a') {
            left = showIcon && selectable ? '38px' : '20px';
        } else if (node == 'span') {
            left = showIcon && selectable ? '18px' : '0px';
        }
        return left;
    }
}
