import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'momentFormat' })
export class MomentFormatPipe implements PipeTransform {
    transform(value: moment.MomentInput, format: string) {
        if (!value) {
            return '';
        }

        return moment(value).format(format);
    }
}
//V3
@Pipe({ name: 'deviceStatus' })
export class DeviceStatusPipe implements PipeTransform {
    transform(value) {
        console.log(value)
        switch(value){
            case 0: return '未处理';
            case 1: return '处理中';
            case 2: return '已完成';
        } 
    }
}