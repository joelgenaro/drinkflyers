import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { apis } from 'src/environments/environment'

@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}/supplier-product`
    private data = new BehaviorSubject<Array<any>>([{ fetching: true }])
    data$ = this.data.asObservable()

    constructor(
        public http: HttpClient
    ) { }

    list(params): Observable<any> {
        const url = `${this.baseUrl}/supplier-product-list`

        return this.http.get<any>(url, { params })
    }

    productList(params): Observable<any> {
        const url = `${this.baseUrl}/non-selected-products`

        return this.http.get<any>(url, { params })
    }

    add(params): Observable<any> {
        const url = `${this.baseUrl}/add`

        return this.http.post<any>(url, params)
    }

    update(params): Observable<any> {
        const url = `${this.baseUrl}/update`

        return this.http.post<any>(url, params)
    }

    delete(params): Observable<any> {
        const url = `${this.baseUrl}/delete`

        return this.http.post<any>(url, params)
    }

    supplierDetail(params): Observable<any> {
        const url = `${apis.baseUrl}/supplier/detail`

        return this.http.post<any>(url, params)
    }

    changeStatusActive(params: any): Observable<any> {
        const url = `${apis.baseUrl}/product-variant/activate`

        return this.http.post<any>(url, params)
    }

    changeStatusInactive(params: any): Observable<any> {
        const url = `${apis.baseUrl}/product-variant/deactivate`

        return this.http.post<any>(url, params)
    }

    variantList(params): Observable<any> {
        const url = `${apis.baseUrl}/product-variant/list`

        return this.http.get<any>(url, { params })
    }
    addVariant(params): Observable<any> {
        const url = `${apis.baseUrl}/product-variant/add`

        return this.http.post<any>(url, params)
    }
    updateVariant(params): Observable<any> {
        const url = `${apis.baseUrl}/product-variant/update`

        return this.http.post<any>(url, params)
    }
}
