import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { apis } from 'src/environments/environment'

@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}/base-product`
    private data = new BehaviorSubject<Array<any>>([{ fetching: true }])
    data$ = this.data.asObservable()

    constructor(
        public http: HttpClient
    ) { }

    list(params): Observable<any> {
        const url = `${this.baseUrl}/active-list`

        return this.http.get<any>(url, { params })
    }

    categoriesList(params): Observable<any> {
        const url = `${apis.baseUrl}/public/category/list`

        return this.http.get<any>(url, { params })
    }
    baseProductDefaultImage(bpId: number) {
        const url = `${apis.baseUrl}/public/base-product/default-image/${bpId}`
        return url
    }
}
