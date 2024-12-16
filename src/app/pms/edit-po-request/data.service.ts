import { HttpClient } from '@angular/common/http'
import { BehaviorSubject, Observable } from 'rxjs'
import { apis } from 'src/environments/environment'
import { Injectable } from '@angular/core'

@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}`
    private data = new BehaviorSubject<Array<any>>([{ fetching: true }])
    $data = this.data.asObservable()

    constructor(private http: HttpClient) { }

    productDetail(params): Observable<any> {
        const url = `${this.baseUrl}/product/detail`

        return this.http.post<any>(url, params)
    }
    poRequestDetail(params): Observable<any> {
        const url = `${this.baseUrl}/po-request/detail`

        return this.http.post<any>(url, params)
    }

    newVariant(params): Observable<any> {
        const url = `${this.baseUrl}/po-request/new-variant`

        return this.http.post<any>(url, params)
    }

    deleteItem(params): Observable<any> {
        const url = `${this.baseUrl}/po-request/delete-po-item`

        return this.http.post<any>(url, params)
    }

    variantList(params): Observable<any> {
        const url = `${this.baseUrl}/base-product-variant/list`

        return this.http.get<any>(url, { params })
    }

    unitList(): Observable<any> {

        const url = `${this.baseUrl}/public/unit/list`

        return this.http.get<any>(url, {})
    }

    productList(params): Observable<any> {

        const url = `${this.baseUrl}/supplier-product/supplier-product-list`

        return this.http.get<any>(url, { params })
    }

    savePoRequest(params): Observable<any> {
        const url = `${this.baseUrl}/po-request/update`

        return this.http.post<any>(url, params)
    }

}
