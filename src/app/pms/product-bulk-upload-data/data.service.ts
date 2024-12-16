

import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { ApiService } from 'src/app/services/api.service'
import { apis } from 'src/environments/environment'

@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}/base-product`
    private data = new BehaviorSubject<Array<any>>([{ fetching: true }])
    public driverDoc = new BehaviorSubject<number>(0)
    $data = this.data.asObservable()

    constructor(private http: HttpClient, private api: ApiService) { }

    list(params): Observable<any> {
        const url = `${this.baseUrl}/bulk-upload-data`

        return this.http.get<any>(url, { params })
    }

    childCategories(): Observable<any> {
        const url = `${apis.baseUrl}/public/category/last-child-categories`

        return this.http.get<any>(url, {})
    }

    tagList(): Observable<any> {
        const url = `${apis.baseUrl}/public/tag/list`

        return this.http.get<any>(url, {})
    }

    update(params): Observable<any> {
        const url = `${this.baseUrl}/bulk-upload-update`

        return this.http.post<any>(url, params)
    }

    delete(params): Observable<any> {
        const url = `${this.baseUrl}/delete`

        return this.http.post<any>(url, params)
    }
    baseProductList(): Observable<any> {
        const url = `${apis.baseUrl}/base-product/list`

        return this.http.get<any>(url)
    }
    uploadBulkProducts(params): Observable<any> {
        const url = `${apis.baseUrl}/base-product/insert-data`
        return this.http.post<any>(url, params)
    }

}
