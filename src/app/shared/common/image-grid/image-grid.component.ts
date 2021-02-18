import { Component, OnInit, Input, Output, EventEmitter, Injector, ViewChild, ElementRef, AfterViewChecked, OnDestroy } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { unwatchFile } from 'fs';


@Component({
  selector: 'app-image-grid',
  templateUrl: './image-grid.component.html',
  styleUrls: ['./image-grid.component.css']
})
export class ImageGridComponent extends AppComponentBase implements AfterViewChecked, OnDestroy, OnInit {
  /*
    传入参数/传出事件
    imageList 传入的包含图片信息的数组
    onOperate 组件广播的操作事件
    selection 传入的数组(包含了选中的每一项)
  */
  @Input() imageList: any[] = [];
  @Input() justForShow: boolean = false;//禁止选择操作
  @Output("onOperate") operation: EventEmitter<any> = new EventEmitter();
  @Input("selection") selection: any[] = [];
  @Input() style: any;
  /**
   * 操作模式
   * <=0 无操作
   * 1 删除
   * 2 删除与详情
   * 3 详情
   */
  @Input() mode: number = 2;
  @Input() judgeOnline: any = true;
  @ViewChild('imageGrid',{static:true}) imageGrid: ElementRef;
  @Input() gridOwner: string = "product";
  @Input() isSingleSelect: boolean = false;
  @Input() operationAfterChoose: boolean = false;
  colnum: number = 5;
  widthP: string = '';
  checkMaxLoadCountFun = this.checkMaxLoadCount();

  EmptyHolder: string = AppConsts.appBaseUrl + "/assets/common/images/holderimg2.png";
  EmptyHolderV: string = AppConsts.appBaseUrl + "/assets/common/images/holdervideo.png";
  EmptyHolderA: string = AppConsts.appBaseUrl + "/assets/common/images/holderaudio.png";
  EmptyHolderP: string = AppConsts.appBaseUrl + "/assets/common/images/holderPDF.png";
  EmptyHolderW: string = AppConsts.appBaseUrl + "/assets/common/images/holderWeb.png";
  EmptyHolderPPT: string = AppConsts.appBaseUrl + "/assets/common/images/holderPPT.png";
  EmptyHolderT: string = AppConsts.appBaseUrl + "/assets/common/images/holderText.png";
  EmptyHolderZ: string = AppConsts.appBaseUrl + "/assets/common/images/holderZip.png";
  EmptyHolderO: string = AppConsts.appBaseUrl + "/assets/common/images/holderOther.png";




  //开始加载多少个图片
  maxLoadCount: number = 14;
  stopLoadKey: string = "notloadingnow";

  constructor(injector: Injector) {
    super(injector);
    $(window).on("scroll", this.checkMaxLoadCountFun)
  }
  checkMaxLoadCount() {
    return function (e) {
      var scrollHeight = $(window).scrollTop();
      this.maxLoadCount = Math.max(this.maxLoadCount, 14 + Math.round(scrollHeight / 380) * this.colnum);
    }.bind(this);
  }
  ngOnInit() {
    // console.log(this.imageList, 'imageListimageListimageListimageList')
    // console.log($('.m-menu__link-text').css('color'), 'color')
    // if ($("#imageGridStyle").length == 0) {
      // var color = $('.m-menu__link-text').css('color');
      // var style = '<style id="imageGridStyle">.imgWrap.chosed {border-color:' + color + ';box-shadow: 0px 0px 20px ' + color + ';}</style>';
      // $(style).appendTo("body");
    // }
  }
  ngAfterViewChecked() {
    this.style && $(this.imageGrid.nativeElement).css(this.style);
    if ($(this.imageGrid.nativeElement).is(":visible")) {
      // <number>this.imageGrid.nativeElement.offsetWidth
      var rowWidth = $(this.imageGrid.nativeElement).width(), colnum, realWidth, realMarginLeft;
      if (this.imageGrid.nativeElement.style.width.indexOf('calc') > -1) {
        var oldmargin = this.imageGrid.nativeElement.style.width.split(' + ')[1].replace("px)", '');
        rowWidth = $(this.imageGrid.nativeElement).width() - <number>oldmargin + 30;
      }
      colnum = Math.floor(rowWidth / 312);
      this.colnum = colnum;
      this.widthP = (100 / colnum) + '%';
      realWidth = "calc(100% + " + (rowWidth - 312 * colnum) / (colnum - 1) + "px";
      realMarginLeft = "-" + ((rowWidth - 312 * colnum) / (colnum - 1)) / 2 + "px";
      $(this.imageGrid.nativeElement).css('width', realWidth);
      $(this.imageGrid.nativeElement).css('marginLeft', realMarginLeft);
      this.checkMaxLoadCount()(null);
    }
  }
  ngOnDestroy() {
    $(window).off("scroll", this.checkMaxLoadCountFun);
  }
  //判断是不是默认
  isDefault(image) {
    var f = image.isDefault === true;
    return f;
  }
  isApp(image) {
    var f = image.software !== undefined || image.alias !== undefined;
    return f
  }
  //判断是不是资源
  isResource(image) {
    var f = image.resourceId !== undefined || image.resourceTags !== undefined;
    return f;
  }
  //获取资源类型
  getResType(image) {
    var c = image.typeString || image.resourceType || image.type;
    return (c !== undefined ? (c === null ? 'None' : c) : '') + " resTypeIcon";
  }
  //前往查看图片的info
  getInfo(image) {
    this.operation.emit({
      action: "info",
      image: image
    });
  }
  //删除图片
  deleteImg(image) {
    this.operation.emit({
      action: "delete",
      image: image
    });
  }
  //选择图片/取消选中图片
  chose(image, event) {
    if (this.justForShow) { return; }

    if ($(event.target).closest('.btnHolder').length != 0) { return; }

    var index = this.selection.indexOf(image);
    if (index > -1) {
      this.selection.splice(index, 1);
    } else {
      if (this.isSingleSelect) { this.selection.splice(0, 1); }
      this.selection.push(image);
    }

    if (this.operationAfterChoose) {

      this.operation.emit({
        action: "choose",
        image: image
      });
    }
  }
  //判断是否被选中
  isSelected(image) {
    if (this.selection && this.selection.indexOf) {
      return this.selection.indexOf(image) > -1;
    } else {
      return false
    }
  }
  //转换图片路径
  transfileUrl(record, i?) {
    if (i > this.maxLoadCount) {
      return this.stopLoadKey;
    }
    var url, fileUrl;
    if (record.picUrl !== undefined) {
      fileUrl = record.picUrl;
    } else if (record.fileUrl !== undefined) {
      fileUrl = record.fileUrl;
    } if (record.resourceItem !== undefined) {
      fileUrl = record.resourceItem.fileUrl;
    } else if (record.skuPicUrl !== undefined) {
      fileUrl = record.skuPicUrl;
    } else if (record.pictures !== undefined) {
      fileUrl = record.pictures;
    } else if (record.largeImageUrl !== undefined) {
      fileUrl = record.largeImageUrl;
    } else if (record.software !== undefined) {
      fileUrl = record.software.url || record.software.logoUrl;
    } else if (record.showImage !== undefined) {
      fileUrl = record.showImage;
    } else if (record.image !== undefined) {
      fileUrl = record.image;
    } else if (record.awardPicUrl !== undefined) {
      fileUrl = record.awardPicUrl;
    } else if (record.awardIcon !== undefined) {
      fileUrl = record.awardIcon;
    } else if (record.thumb_url !== undefined) {
      fileUrl = record.thumb_url;
    } else if (record.imageUrl !== undefined) {
      fileUrl = record.imageUrl;
    }

    if (!fileUrl) {
      url = this.EmptyHolder;
    } else if (fileUrl.indexOf('http:') > -1 || fileUrl.indexOf('https:') > -1 || fileUrl.indexOf('data:') > -1) {
      url = fileUrl;
    } else {
      var base = AppConsts.remoteServiceBaseUrl.replace(/\//g, '\\');
      url = base + '\\' + fileUrl;
    }
    return url;
  }

  compatXunLei(url) {
    if (url.indexOf(".jpg") > -1 || url.indexOf(".png") > -1 || url.indexOf(".jpeg") > -1 || url.indexOf(".svg") > -1 ||
      url.indexOf(".JPG") > -1 || url.indexOf(".PNG") > -1 || url.indexOf(".JPEG") > -1 || url.indexOf(".SVG") > -1) {
      return url
    } else {
      return ""
    }
  }
  
  //显示图片加载失败的占位图
  showEmpty(e, type) {
    // console.log(type)
    var target = $(e.target);
    if (target.attr("src") == this.stopLoadKey) {
      //dont load image
    } else {
      var url = this.EmptyHolderO;
      if (type == "PDF") {
        url = this.EmptyHolderP;
      } else if (type == "Video") {
        url = this.EmptyHolderV;
      } else if (type == "Audio") {
        url = this.EmptyHolderA;
      } else if (type == "Web") {
        url = this.EmptyHolderW;
      } else if (type == "PPT") {
        url = this.EmptyHolderPPT;
      } else if (type == "Text") {
        url = this.EmptyHolderT;
      } else if (type == "Zip") {
        url = this.EmptyHolderZ;
      } else if (type == "Image") {
        url = this.EmptyHolder;
      }
      target.attr("src", url)
    }
  }
  //
  toggleView(image, e) {
    image.shape = e.target.naturalWidth > e.target.naturalHeight;
    image.loaded = true;
  }


  //获取占位图片
  getHolder() {
    var empty = "./assets/common/images/placeholder/" + this.gridOwner + "Holder.png";
    return empty;
  }
  trans(m) {
    var p = "￥";
    if (m) {
      p = p + m;
    } else {
      p = p + "0.0";
    }
    return p;
  }

  getTagsOrCates(record) {
    var type: any = '', ary = [], icon = "";
    if (record.adsTags !== undefined || record.productTags !== undefined || record.tags !== undefined) {
      type = "tag";
      ary = record.adsTags || record.productTags || record.tags;
      icon = "icon-biaoqian2";
    } else if (record.productCategories !== undefined) {
      type = "cate";
      ary = record.productCategories;
      icon = "icon-fenlei";
    }
    ary = ary.map((item) => {
      return item.name || item.value;
    });
    return {
      'type': type,
      'string': ary.join(" | ") || ' ' + this.EmptyTdText,
      'icon': icon
    }
  }
  //
  setSkuMain(image) {
    this.imageList.forEach((item) => {
      item.isMain = item.id === image.id;
    });
  }
  clearSkuMain(image) {
    image.isMain = false;
  }
}
