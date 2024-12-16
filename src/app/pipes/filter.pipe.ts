import { Pipe, PipeTransform, Injectable } from '@angular/core'

@Pipe({
    name: 'filter',
    pure: false
})
@Injectable()
export class FilterPipe implements PipeTransform {
    transform(items: any[], searchString: string): any[] {
        if (!items) {
            return []
        }
        if (!searchString) {
            return items
        }

        searchString = searchString.toLowerCase()

        return items.filter((item: object) => {
            return this.findMatch(item, searchString)
        })
    }

    findMatch(item: Object, searchString: string) {
        return Object.keys(item).some(key => {
            const value = item[key] ? item[key] : ''
            if (typeof value === "object") {
                if(this.findMatch(value, searchString)) {
                    return true
                }
            } else {
                if (value.toString().toLowerCase().includes(searchString)) {
                    return true
                }
            }
        })
    }
}
