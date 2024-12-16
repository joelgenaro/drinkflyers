import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSizeConverter'
})
export class FileSizeConverterPipe implements PipeTransform {

  transform(value: any): any {
    if (isNaN(value)) return null // will only work value is a number
    if (value === null) return null
    if (value < 1024) {
        return value + ' Kb'
    } else if (value >= 1024 && value < 1048576) {
        return Math.trunc((value/1024)) + ' Mb'
    } else if (value >= 1048576 && value < 1073741824) {
        return Math.trunc((value/1048576)) + ' Gb'
    } else if (value >= 1073741824 && value < 1099511627776) {
        return Math.trunc((value/1073741824)) + ' Tb'
    }
  }

}
