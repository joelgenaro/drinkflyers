import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { apis } from 'src/environments/environment'

@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}`
    private data = new BehaviorSubject<Array<any>>([{ fetching: true }])
    data$ = this.data.asObservable()

    constructor(public http: HttpClient) { }

    uploadFile(params): Observable<any> {
        const url = `${this.baseUrl}/base-product/bulk-upload`

        return this.http.post<any>(url, params)
    }

    tagList(): Observable<any> {
        const url = `${apis.baseUrl}/public/tag/list`

        return this.http.get<any>(url, {})
    }
    lastChildCatList(): Observable<any> {
        const url = `${apis.baseUrl}/public/category/last-child-categories`

        return this.http.get<any>(url, {})
    }

    update(params): Observable<any> {
        const url = `${this.baseUrl}/base-product/bulk-upload-update`

        return this.http.post<any>(url, params)
    }

    delete(params): Observable<any> {
        const url = `${this.baseUrl}/base-product/delete-bulkupload-row`

        return this.http.post<any>(url, params)
    }

    baseProductList(): Observable<any> {
        const url = `${this.baseUrl}/base-product/list`

        return this.http.get<any>(url)
    }

    uploadBulkProducts(params): Observable<any> {
        const url = `${this.baseUrl}/base-product/insert-data`
        return this.http.post<any>(url, params)
    }
}
