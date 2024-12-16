import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
    name: 'suffix'
})
export class SuffixPipe implements PipeTransform {

    transform(value: number, args?: any): any {
        if (isNaN(value)) return null // will only work value is a number
        if (value === null) return null
        if (value < 1000) {
            return value
        } else if (value >= 1000 && value <= 999999) {
            return (value / Math.pow(10, 3)) + 'K'
        } else if (value >= 1000000 && value <= 999999999) {
            return (value / Math.pow(10, 6)) + 'M'
        } else if (value >= 1000000000 && value <= 999999999999) {
            return (value / Math.pow(10, 9)) + 'B'
        }
    }
}

