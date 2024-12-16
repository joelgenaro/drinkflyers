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
        const url = `${apis.baseUrl}/public/base-product/list`

        return this.http.get<any>(url)
    }

    uploadBulk(params): Observable<any> {
        const url = `${this.baseUrl}/bulk-uploader/add`
        return this.http.post<any>(url, params)
    }

    baseProductDetail(params): Observable<any> {
        const url = `${apis.baseUrl}/public/base-product/detail`
        return this.http.post<any>(url, params)
    }

    downloadZip(): Observable<any> {

        const options: any = {
            responseType: 'arraybuffer'
        }

        const url = `${apis.baseUrl}/public/download-sample-zip`

        return this.http.get<any>(url, options)
    }
}
