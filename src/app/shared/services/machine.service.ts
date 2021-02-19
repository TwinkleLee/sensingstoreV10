import { Injectable } from '@angular/core';
import { FeatureCheckerService } from 'abp-ng2-module';
// import { FeatureCheckerService } from '@abp/features/feature-checker.service';
import { ChartReportDto, ChartItem } from '@shared/service-proxies/service-proxies3';
import * as moment from 'moment';

//进行较为复杂运算的服务
@Injectable()
export class MachineService {
  private featureCheckerService: FeatureCheckerService = new FeatureCheckerService;
  //路由名称与featureName的映射
  private nameToFeatureName: object = {
    'Device': 'App.DeviceFeature',
    'OnlineStore': 'App.OnlineStoreFeature',
    'Advertisement': 'App.AdsFeature',
    'AdvertisementList': 'App.AdsFeature',
    'Software': 'App.SoftwareFeature',
    'App': 'App.SoftwareFeature',
    'Product': 'App.ProductFeature',
    'Likes': 'App.ProductFeature.Like',
    'Match': 'App.ProductFeature.Match',
    'Coupon': 'App.CouponFeature',
    // 'OrderManagement':'App.OnlineStoreFeature.Order',
    // 'MembershipManagement':'App.OnlineStoreFeature.Member',
    'Recommend': 'App.RecommendFeature',

    'OrderManagement': 'App.OnlineStoreFeature',
    'MembershipManagement': 'App.OnlineStoreFeature'

  }
  constructor() {

  }

  //通过菜单名称获取对应feature权限
  getFeatureByName(name) {
    var featureName = this.nameToFeatureName[name];
    return featureName ? this.featureCheckerService.getValue(featureName) == "true" : true;
  }
  /**
   * 拼接chart的数据
   */
  reCompositeChartData(data: ChartReportDto[], date?: moment.Moment) {
    var data_ary: any = [], title_ary: any = [], dict: any = {
      'count': 0
    };
    if (!data || data.length == 0) {
      return {
        'data': null,
        'title': null
      };
    }
    if (date && date.isValid) {
      date.minutes(0);
      date.seconds(0);
      date.utcOffset(8)
    }
    var chartItems0 = data[0].chartItems.map((item) => {
      var new_item = new ChartItem(item);
      if (date) {
        date.hours(Number(new_item.date));
        new_item.date = date.toString();
      }
      return new_item;
    });
    //使用第一组数据为基础
    data_ary = Object.assign(chartItems0);
    //生成基础 date的字典
    data_ary.forEach((obj, i) => {
      dict[obj.date] = i;
      dict.count = i;
    });
    data.forEach((item, index) => {
      title_ary.push(item.title);
      if (index == 0) { return; }
      var i_value = 'value' + index;
      item.chartItems.forEach((r) => {
        var item_date = date ? item_date = moment(date).hour(Number(r.date)).toString() : r.date;
        if (item_date in dict) {
          data_ary[dict[item_date]][i_value] = r.value;
        } else {
          var o = { 'date': item_date }
          o[i_value] = r.value;
          dict[item_date] = data_ary.push(o);
          dict.count = dict.count + 1;
        }
      })
    })
    return {
      'data': data_ary,
      'title': title_ary
    }
  }

}
