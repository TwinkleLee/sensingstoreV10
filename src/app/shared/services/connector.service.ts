import { Injectable } from '@angular/core';

@Injectable()
export class ConnectorService {

  private cache:object={};
  private storageKey:string = 'Connector';
  constructor() { }

  //存储数据
  setCache(k,v){
    this.cache[k] = v;
    this.update();
  }
  //获取数据
  getCache(k){
      this.update();
      return this.cache[k];
  }
  //清空数据
  clearCache(){
      this.cache = {};
      localStorage.setItem(this.storageKey,'{}');
  }
  //更新到localStorage
  private update(){
    if(Object.keys(this.cache).length==0){
      this.cache = JSON.parse(localStorage.getItem(this.storageKey))||{};
    }else{
      let Connector = JSON.stringify(this.cache||{});
      localStorage.setItem(this.storageKey,Connector);
    }
  }
}
