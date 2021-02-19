import { Component, OnInit, Input } from '@angular/core';
import { MachineService } from '@app/shared/services/machine.service';
import { ChartReportDto } from '@shared/service-proxies/service-proxies3';
import * as moment from 'moment';

export enum ChartType {
    'Line' = 'Line',
    'Column' = 'Column',
    'Line0' = 'Line0'
}


@Component({
    selector: 'app-charts',
    templateUrl: './charts.component.html',
    styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements OnInit {
    dataSets: any = [];
    titles: string[] = [];
    @Input() chartId: string = 'chartDiv';
    chart: any;
    @Input() chartType: ChartType = ChartType.Line;
    private AmCharts;
    Colors: string[] = ['#f44336', '#9c27b0', '#3f51b5', '#2196f3', '#00bcd4', '#009688', '#8bc34a', '#ffeb3b', '#ff9800', '#795548', '#9e9e9e', '#607d8b'];
    constructor(
        private _machineService: MachineService) { }

    ngOnInit() {
        this.AmCharts = window['AmCharts'];
    }
    draw(dataSets?: ChartReportDto[] | any, date?: moment.Moment, valueField?: string, cateField?: string) {
        this._draw(dataSets, date, valueField, cateField);
    }
    private _draw(dataSets?: ChartReportDto[] | any, date?: moment.Moment, valueField?: string, cateField?: string) {

        if (this.chartType == ChartType.Line) {
            this.chart = this.AmCharts.makeChart(this.chartId, this.generateLineOption(dataSets, date));
            this.chart.zoomToIndexes(this.chart.dataProvider.length - 1);
        } else if (this.chartType == ChartType.Column) {
            this.chart = this.AmCharts.makeChart(this.chartId, this.generateColumnOption(dataSets, valueField, cateField));
        } else if (this.chartType == ChartType.Line0) {
            this.chart = this.AmCharts.makeChart(this.chartId, this.generateLine0Option(dataSets, date));
            this.chart.zoomToIndexes(this.chart.dataProvider.length);
        }
        //鼠标滑轮
        this.chart.addListener("rendered", zoomChart);
        zoomChart(this.chart);
        function zoomChart(chart) {
            chart.zoomToIndexes(chart.dataProvider.length - 40, chart.dataProvider.length - 1);
        }
    }
    //生成折线图参数
    private generateLineOption(data, date?) {
        var chartData = this._machineService.reCompositeChartData(data, date);
        this.dataSets = chartData.data || this.dataSets;
        this.titles = chartData.title || this.titles;
        //
        var graphs = this.titles.map((title, index) => {
            return {
                "type": "smoothedLine",//去掉此项后变为折线条
                "id": "g" + index,
                "balloon": {
                    "drop": false,
                    "adjustBorderColor": false,
                    "color": this.Colors[index]
                },
                "bullet": "round",
                "bulletBorderAlpha": 1,
                "bulletColor": this.Colors[index],
                "bulletSize": 5,
                "hideBulletsCount": 50,
                "lineThickness": 2,
                "title": title,
                "useLineColorForBulletBorder": true,
                "valueField": "value" + (index == 0 ? "" : index),
                "balloonText": "<span style='font-size:18px;'>[[value" + (index == 0 ? "" : index) + "]]</span>"
            }
        });
        return {
            "type": "serial",
            "theme": "light",
            "legend": {
                "equalWidths": false,
                "useGraphSettings": true,
                "valueAlign": "left",
                "valueWidth": 120
            },
            "marginRight": 40,
            "marginLeft": 40,
            "autoMarginOffset": 20,
            "mouseWheelZoomEnabled": true,
            "valueAxes": [{
                "id": "v1",
                "axisAlpha": 0,
                "position": "left",
                "ignoreAxisWidth": true
            }],
            "balloon": {
                "borderThickness": 1,
                "shadowAlpha": 0
            },
            "graphs": graphs,
            "chartScrollbar": {
                "graph": "g1",
                "oppositeAxis": false,
                "offset": 30,
                "scrollbarHeight": 80,
                "backgroundAlpha": 0,
                "selectedBackgroundAlpha": 0.1,
                "selectedBackgroundColor": "#888888",
                "graphFillAlpha": 0,
                "graphLineAlpha": 0.5,
                "selectedGraphFillAlpha": 0,
                "selectedGraphLineAlpha": 1,
                "autoGridCount": true,
                "color": "#AAAAAA"
            },
            "chartCursor": {
                "categoryBalloonDateFormat": "JJ:NN, DD MMMM",
                "cursorPosition": "mouse"
            },
            //   "chartCursor": {
            //       "pan": true,
            //       "valueLineEnabled": true,
            //       "valueLineBalloonEnabled": true,
            //       "cursorAlpha": 1,
            //       "cursorColor": "#258cbb",
            //       "limitToGraph": "g1",
            //       "valueLineAlpha": 0.2,
            //       "valueZoomable": true
            //   },
            "valueScrollbar": {
                "oppositeAxis": false,
                "offset": 50,
                "scrollbarHeight": 10
            },
            "categoryField": "date",
            "categoryAxis": {
                "parseDates": true,
                "minPeriod": "mm"
            },
            "export": {
                "enabled": true,
                "dateFormat": "YYYY-MM-DD HH:NN:SS"
            },
            "dataProvider": chartData.data
        };
    }


    //生成折线图参数
    private generateLine0Option(data, date?) {
        var chartData = this._machineService.reCompositeChartData(data, date);
        this.dataSets = chartData.data || this.dataSets;
        this.titles = chartData.title || this.titles;
        //
        var graphs = this.titles.map((title, index) => {
            return {
                // "type": "smoothedLine",//去掉此项后变为折线条
                "id": "g" + index,
                "balloon": {
                    "drop": false,
                    "adjustBorderColor": false,
                    "color": this.Colors[index]
                },
                "bullet": "round",
                "bulletBorderAlpha": 1,
                "bulletColor": this.Colors[index],
                "bulletSize": 5,
                "hideBulletsCount": 50,
                "lineThickness": 2,
                "title": title,
                "useLineColorForBulletBorder": true,
                "valueField": "value" + (index == 0 ? "" : index),
                "balloonText": "<span style='font-size:18px;'>[[value" + (index == 0 ? "" : index) + "]]</span>"
            }
        });
        return {
            "type": "serial",
            "theme": "light",
            "legend": {
                "equalWidths": false,
                "useGraphSettings": true,
                "valueAlign": "left",
                "valueWidth": 120
            },
            "marginRight": 40,
            "marginLeft": 40,
            "autoMarginOffset": 20,
            "mouseWheelZoomEnabled": true,
            "valueAxes": [{
                "id": "v1",
                "axisAlpha": 0,
                "position": "left",
                "ignoreAxisWidth": true
            }],
            "balloon": {
                "borderThickness": 1,
                "shadowAlpha": 0
            },
            "graphs": graphs,
            "chartScrollbar": {
                "graph": "g1",
                "oppositeAxis": false,
                "offset": 30,
                "scrollbarHeight": 80,
                "backgroundAlpha": 0,
                "selectedBackgroundAlpha": 0.1,
                "selectedBackgroundColor": "#888888",
                "graphFillAlpha": 0,
                "graphLineAlpha": 0.5,
                "selectedGraphFillAlpha": 0,
                "selectedGraphLineAlpha": 1,
                "autoGridCount": true,
                "color": "#AAAAAA"
            },
            "chartCursor": {
                "categoryBalloonDateFormat": "JJ:NN, DD MMMM",
                "cursorPosition": "mouse"
            },
            //   "chartCursor": {
            //       "pan": true,
            //       "valueLineEnabled": true,
            //       "valueLineBalloonEnabled": true,
            //       "cursorAlpha": 1,
            //       "cursorColor": "#258cbb",
            //       "limitToGraph": "g1",
            //       "valueLineAlpha": 0.2,
            //       "valueZoomable": true
            //   },
            "valueScrollbar": {
                "oppositeAxis": false,
                "offset": 50,
                "scrollbarHeight": 10
            },
            "categoryField": "date",
            "categoryAxis": {
                "parseDates": true,
                "minPeriod": "mm"
            },
            "export": {
                "enabled": true,
                "dateFormat": "YYYY-MM-DD HH:NN:SS"
            },
            "dataProvider": chartData.data
        };
    }

    //生成柱状图参数
    private generateColumnOption(data, valueField?, cateField?) {
        console.log(data, 111, valueField, 222, cateField)
        var title = data[0].title,
            dataProvider = data[0].chartItems;
        this.dataSets = data;
        return {
            "type": "serial",
            "theme": "light",
            "marginRight": 70,
            "dataProvider": dataProvider,
            "valueAxes": [{
                "axisAlpha": 0,
                "position": "left",
                "title": title
            }],
            "startDuration": 1,
            "graphs": [{
                "balloonText": "<b>[[category]]: [[value]]</b>",
                "fillColorsField": "color",
                "fillAlphas": 0.9,
                "lineAlpha": 0.2,
                "type": "column",
                "valueField": valueField || 'value'
            }],
            "chartCursor": {
                "categoryBalloonEnabled": false,
                "cursorAlpha": 0,
                "zoomable": false
            },
            "categoryField": cateField || 'date',
            "categoryAxis": {
                "gridPosition": "start",
                "labelRotation": 45
            },
            "export": {
                "enabled": true
            }
        };
    }

}
