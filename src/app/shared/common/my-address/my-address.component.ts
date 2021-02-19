import { Component, OnInit, Input, ViewChild, Injector, ChangeDetectorRef } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { PositionDto } from '@shared/service-proxies/service-proxies';

@Component({
  selector: 'app-my-address',
  templateUrl: './my-address.component.html',
  styleUrls: ['./my-address.component.css']
})
// state!: string | undefined;
// area!: string | undefined;
// province!: string | undefined;
// city!: string | undefined;
// county!: string | undefined;
// location!: string | undefined;
// zipCode!: string | undefined;
// longitude!: number | undefined;
// latitude!: number | undefined;
// code!: string | undefined;
export class MyAddressComponent extends AppComponentBase implements OnInit {
  @Input() position: PositionDto = new PositionDto();
  @ViewChild('pick',{static:true}) pick;
  //地区码信息  如果localstorage不存在  则请求本地json
  areaList: any[] = [];
  cityList: any[] = [];
  countyList: any[] = [];
  //地区显示
  area: string = '';
  //是否请求到地区信息
  ready = false;
  //显示模式
  mode: number = 1;

  constructor(Injector: Injector,
              private changeDef:ChangeDetectorRef) {
    super(Injector);
  }
  ngDoCheck() {
      this.initAddress();
  }
  ngOnInit() {
    var areaList = JSON.parse(localStorage.getItem('areaList'));
    if (areaList && areaList.length && areaList.length > 0) {
      this.areaList = areaList;
      this.ready = true;
    } else {
      $.get("assets/common/address.json", (data) => {
        this.areaList = data;
        this.ready = true;
        localStorage.setItem('areaList', JSON.stringify(data));
      });
    }
    $(document).off("click", this.hideAddress.bind(this));
    $(document).on("click", this.hideAddress.bind(this));
  }
  initAddress() {
    if (this.areaList.length == 0 || !this.position) {
      this.position = new PositionDto();
      return; 
    }else{
      this.fixArea(this.position.province,this.position.city,this.position.county);  
    }
  }
  //显示选择
  showPick() {
    $(this.pick.nativeElement).show();
    if (this.position.county) {
      this.toggleTab(3);
    } else if (this.position.city) {
      this.toggleTab(2);
    } else if (this.position.province) {
      this.toggleTab(1);
    } else {
      this.toggleTab(1);
    }
  }
  //失去焦点时隐藏选择内容
  hide() {
    $(this.pick.nativeElement).hide();
  }
  //判断是否需要隐藏
  hideAddress(e) {
    var target = $(e.target);
    if (target.closest('.ngx-address-overlay').length == 0 && target.closest('.ngx-address-title').length == 0) {
      this.hide();
    }
  }

  //切换tab
  toggleTab(index) {
    if(index>1){
        this.areaList.forEach((item)=>{
              if(item.name==this.position.province){
                  this.cityList = item.city;
              }
        })
    }
    if(index>2){
      this.cityList.forEach((item)=>{
        if(item.name==this.position.city){
            this.countyList = item.area;
        }
      })
    }
    this.mode = index;
  }
  //自我补足地址
  fixArea(a, b?, c?) {
    var bString = b ? ' \/ ' + b : '',
      cString = c ? ' \/ ' + c : '';
    this.area = (a?a:"") + bString + cString;
  }
  //转换
  transIndex(i) {
    var str = String(i);
    if (str.length == 1) {
      str = 0 + str;
    }
    return str;
  }
  //选中省
  choseProvince(p) {
    this.cityList = p.city;
    this.position.code = p.code;
    this.position.province = p.name;
    this.position.city = null;
    this.position.county = null;
    this.fixArea(this.position.province);
    this.toggleTab(2);
  }
  //选中市
  choseCity(c) {
    this.countyList = c.area;
    this.position.code = c.code;
    this.position.city = c.name;
    this.position.county = null;
    this.fixArea(this.position.province, this.position.city);
    this.toggleTab(3);
  }
  //选中区
  choseCounty(c) {
    this.position.county = c.name;
    this.position.code = c.code;
    this.fixArea(this.position.province, this.position.city, this.position.county);
    this.hide();
  }


}
