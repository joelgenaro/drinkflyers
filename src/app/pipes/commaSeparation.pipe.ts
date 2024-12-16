import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
    name: 'commaSeparation'
})
export class CommaSeparationPipe implements PipeTransform {

    transform(value: any): any {
        // Convert value into Array of strings
        value = (Array.from(value.toString())).reverse()
        // Insertion of Comma after 3 digits
        let i = 0
        value.forEach((d, index) => {
            if (index % 3 == 0 && index !== 0) {
                value.splice(index + i, 0, ',')
                i++
            }
        })
        value = value.reverse()
        // As value is Array we have to convert it into string/Number .concat all entries of array into newNumber 
        let newNumber: string = ''
        value.forEach(element => {
            newNumber = newNumber + element
        })
        return newNumber
    }

}
