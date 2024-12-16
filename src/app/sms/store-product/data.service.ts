import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { apis } from 'src/environments/environment'

@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}/client-store`
    private data = new BehaviorSubject<Array<any>>([{ fetching: true }])
    data$ = this.data.asObservable()

    constructor(
        public http: HttpClient
    ) { }

    list(params): Observable<any> {
        const url = `${this.baseUrl}/product-list`

        return this.http.get<any>(url, { params })
    }

    productList(params): Observable<any> {
        const url = `${this.baseUrl}/virtual-product-list`

        return this.http.get<any>(url, { params })
    }

    add(params): Observable<any> {
        const url = `${this.baseUrl}/publish-product`

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

    storeDetail(params): Observable<any> {
        const url = `${this.baseUrl}/detail`

        return this.http.post<any>(url, params)
    }

    changeStatusPublish(params: any): Observable<any> {
        const url = `${this.baseUrl}/change-status`

        return this.http.post<any>(url, params)
    }

    changeStatusUnpublish(params: any): Observable<any> {
        const url = `${this.baseUrl}/change-status`

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
