import { Component, OnInit, Input, Injector, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { PositionDto } from '@shared/service-proxies/service-proxies';
import { AppConsts } from '@shared/AppConsts';

@Component({
  selector: 'app-my-map',
  templateUrl: './my-map.component.html',
  styleUrls: ['./my-map.component.css']
})
export class MyMapComponent extends AppComponentBase implements OnInit, AfterViewInit {
  @ViewChild("mapContainer", { static: true }) mapContainer: ElementRef;
  @Output() afterInit: EventEmitter<any> = new EventEmitter<any>();
  @Output() mapClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() markClick: EventEmitter<any> = new EventEmitter<any>();
  @Input() address: PositionDto[] = [];
  @Input() labels: any[] = [];
  @Input() id: string = "mapContainer";
  visible: boolean = false;
  rendered: boolean = false;
  private iconUrl: string = AppConsts.appBaseUrl + "\/assets\/common\/images\/animation\/mapIcon.jpg";
  private _BMap: any;
  public map: any;
  private Geo: any;
  markers: any = [];
  constructor(Injector: Injector) {
    super(Injector);
  }
  ngOnInit() {
  }
  ngAfterViewInit() {
    this._BMap = this._BMap ? this._BMap : window['BMap'];
    // 百度地图API功能
    // 创建Map实例
    //添加地图类型控件,window['BMAP_ANIMATION_BOUNCE']
    this.map = new this._BMap.Map(this.id);
    this.map.addControl(new this._BMap.MapTypeControl({
      mapTypes: [
        window['BMAP_NORMAL_MAP']
      ]
    }));
    // 创建地址解析器实例     
    this.Geo = new this._BMap.Geocoder();
    var self = this;
    this.map.addEventListener("click", function (e) {
      var pt = e.point;
      self.Geo.getLocation(pt, function (rs) {
        var addComp = rs.addressComponents;
        self.mapClick.emit({
          'point': pt,
          'addComp': addComp
        });
      });
    });
    this.map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
    this.map.centerAndZoom('银川', 5);
  }
  //渲染
  render(width?, height?) {
    console.log("address", this.address, "labels", this.labels);
    if (!(this.address instanceof Array)) { return; }
    //移除之前的所有标点
    this.map.clearOverlays();
    this.markers = [];
    width && $("#" + this.id).css('width', width);
    height && $("#" + this.id).css('height', height);
    var points = [], availablePositionCount = this.address.length, zoomLevel;
    zoomLevel = availablePositionCount == 1 ? 15 : 5;
    //遍历地址数组
    this.address.forEach((v, i) => {
      if (Object.keys(v).length == 0) {
        return availablePositionCount--;
      }
      // var address = (v.province || '') + (v.city || '') + (v.county || '') + (v.location || '');
      // // 将地址解析结果显示在地图上，并调整地图视野    
      // this.Geo.getPoint(address, function (point) {
      //   if (point) {
      //     points.push(point);
      //     this.addMarker(point, this.labels[i]);
      //   }
      //   if (availablePositionCount == i + 1) {
      //     this.map.centerAndZoom(this.getCenterPoint(points), zoomLevel);
      //     this.afterInit.emit(points);
      //     new window['BMapLib'].MarkerClusterer(this.map, { markers: this.markers });
      //   }
      // }.bind(this),
      //   v.city);
      if (v.longitude && v.latitude) {
        var point = new this._BMap.Point(v.longitude, v.latitude);
        points.push(point);
        this.addMarker(point, this.labels[i]);
      }

      if (availablePositionCount == i + 1) {
        console.log(points, 'points');
        this.afterInit.emit(points);
        new window['BMapLib'].MarkerClusterer(this.map, { markers: this.markers });
        setTimeout(() => {
          this.map.centerAndZoom(this.getCenterPoint(points), zoomLevel);
        })
      }
    });
    if (this.address.length == 0 || this.markers.length == 0) {
      this.map.centerAndZoom('北京', 10);

      this.afterInit.emit();
    }
    this.visible = true;
    this.rendered = true;
  }
  private getCenterPoint(points: any[]) {
    var lngNum = 0, latNum = 0, avLng = 0, avLat = 0;
    points.forEach((point) => {
      lngNum += point.lng;
      latNum += point.lat;
    });
    avLng = lngNum / points.length;
    avLat = latNum / points.length;
    return new this._BMap.Point(avLng, avLat);
  }
  //添加覆盖物
  private addMarker(point, l?) {
    var option = {
      // 'icon':new this._BMap.Icon(this.iconUrl, new this._BMap.Size(18,18)),
    }, InfoWindow, marker, span: Element;
    marker = new this._BMap.Marker(point, option);
    if (l) {
      span = document.createElement("span");
      span.className = "text-info";
      span.innerHTML = l ? l.outerId : '';
      InfoWindow = new this._BMap.InfoWindow(span, { offset: new this._BMap.Size(20, -10) });
      InfoWindow.setTitle(l ? l.name : '');
      InfoWindow.enableCloseOnClick();
      InfoWindow.enableAutoPan();
    }
    marker.addEventListener("click", (e) => {
      l && this.markClick.emit({
        'point': point,
        'data': l
      });
      this.map.centerAndZoom(point, 15);

      if (InfoWindow) {
        if (InfoWindow.isOpen()) {
          marker.closeInfoWindow();
        } else {
          marker.openInfoWindow(InfoWindow);
        }
      }
    })
    marker.addEventListener("dblclick", (e) => {
      l && this.markClick.emit({
        'point': point,
        'data': l
      });
      this.map.centerAndZoom(point, 18);
    })
    // this.map.addOverlay(marker);
    this.markers.push(marker);

  }
  //隐藏
  hide() {
    $(this.mapContainer.nativeElement).hide();
    this.visible = false;
  }
  //显示
  show() {
    $(this.mapContainer.nativeElement).show();
    this.visible = true;
  }
}
