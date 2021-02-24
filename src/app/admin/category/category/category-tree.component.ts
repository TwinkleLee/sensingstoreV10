import { Component, OnInit, Injector, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { observable, Observable } from 'rxjs';
import { observeOn } from 'rxjs/operators';
import { AppComponentBase } from '@shared/common/app-component-base';

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
    selector: 'app-new-tree',
    templateUrl: './category-tree.component.html',
    styleUrls: ['./category-tree.component.css']
})
export class CategoryTreeComponent extends AppComponentBase implements OnInit {
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
     */

    @Input() items: any[] = [];
    @Input() root: any[] = [];
    @Input() config: any = {};
    @Output() onMenu: EventEmitter<any> = new EventEmitter<any>();
    @Output() emitDrag: EventEmitter<any> = new EventEmitter<any>();
    @Input() isRoot = true;
    @ViewChild("list",{static:true}) list: ElementRef;
    public rootFunBinded = false;
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
        'draggable': true
    };
    menuTemplate = '<ul id="treeMenu" class="vakata-context jstree-contextmenu jstree-default-contextmenu" style="display: none;position:fixed;">' +
        '<li><a href="#" name="edit" rel="0"><i></i><span class="vakata-contextmenu-sep">&nbsp;</span>修改</a></li>' +
        // '<li><a href="#" name="detail" rel="1"><i></i><span class="vakata-contextmenu-sep">&nbsp;</span>详情</a></li>' +
        '<li><a href="#" name="add" rel="2"><i></i><span class="vakata-contextmenu-sep">&nbsp;</span>添加子分类</a></li>' +
        '<li><a href="#" name="delete" rel="3"><i></i><span class="vakata-contextmenu-sep">&nbsp;</span>删除</a></li></ul>';
    defaultImg = "./assets/common/images/holderimg.png";
    isParent;
    timer;
    direction;
    constructor(injector: Injector) {
        super(injector);
    }
    ngDoCheck() {
        if (this.isRoot) {
            this.root = this.items;
        }
    }
    ngOnInit() {
        this.config = Object.assign(this.defaultConfig, this.config);
        if (this.isRoot) {
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

    //拖动排序
    public dragStart(e, item) {
        e.dataTransfer.setData("item", JSON.stringify(item));
        e.stopPropagation();
        $('.beautyDiv').css('visibility', 'visible');
        if (!this.timer) {
            this.timer = setInterval(() => {
                if (this.direction == 'top') {
                    $('.beautyScroll').stop().animate({ 'scrollTop': $('.beautyScroll').scrollTop() - 50 }, 15);
                } else if (this.direction == 'bottom') {
                    $('.beautyScroll').stop().animate({ 'scrollTop': $('.beautyScroll').scrollTop() + 50 }, 15);
                }
            }, 20)
        }
    }

    public drop(e, item) {
        e.stopPropagation();
        var initItem = JSON.parse(e.dataTransfer.getData("item"));
        this.isParent = false;
        if (item) {
            this.checkParent(item.id, initItem);
            if (this.isParent) {
                return
            }
        } else {
            item = {
                id: null,
                text: this.l('Root')
            }
        }


        this.message.confirm(this.l('OrganizationUnitMoveConfirmMessage', initItem.text, item.text),this.l('AreYouSure'), (r) => {
            if (r) {
                this.emitDrag.emit({
                    itemId: initItem.id,
                    parentId: item.id,
                });
            }
        })
    }

    public drag(e) {
        e.stopPropagation();
        console.log(e.screenY / $(window).height())
        if (e.screenY < $(window).height() / 4) {
            this.direction = 'top';
        } else if (e.screenY > $(window).height() * 0.6) {
            this.direction = 'bottom';
        } else {
            this.direction = ''
        }
    }

    public dragEnd(e) {
        e.stopPropagation();
        $('.beautyDiv').css('visibility', 'hidden');
        clearInterval(this.timer);
        this.timer = false;
    }

    public childDropEvent(e) {
        this.emitDrag.emit(e);
    }

    checkParent(id, parent) {
        if (id == parent.id) {
            this.isParent = true;
        } else if (parent.children.length > 0) {
            for (var child of parent.children) {
                this.checkParent(id, child);
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
            if (value.children instanceof Array) {
                this.initTreeData(value.children, value.treeKey);
            }
        });
    }
    //操作所有
    public operateAll(f, skipId?, ary?) {
        var _ary = ary ? ary : this.root;
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
    }
    //切换子节点显隐
    public toggleChildren(item) {
        item.showChildren = !item.showChildren;
    }
    public childMenuEvent(e) {
        this.onMenu.emit(e);
    }

    public nothing(e) {
        e.preventDefault();
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


    public click(e, item) {
        console.log(item.id)
        this.onMenu.emit({
            'action': 'click',
            'data': item.id
        });
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
                selection.push(v);
            }
            if (v.children instanceof Array) {
                selection = selection.concat(this.getchosen(v.children));
            }
        })
        return selection;
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
}
