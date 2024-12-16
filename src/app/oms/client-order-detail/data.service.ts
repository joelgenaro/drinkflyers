import { Observable } from 'rxjs'
import { apis } from 'src/environments/environment'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'

@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}/order`

    constructor(private http: HttpClient) { }

    orderDetail(params): Observable<any> {
        const url = `${this.baseUrl}/detail`

        return this.http.get<any>(url, { params })
    }

    updateEmail(params): Observable<any> {
        const url = `${this.baseUrl}/update-email`

        return this.http.post<any>(url, params)
    }
    updateShippingAddress(params): Observable<any> {
        const url = `${this.baseUrl}/update-shipping-address`

        return this.http.post<any>(url, params)
    }

    countryList(): Observable<any> {
        const url = `${apis.baseUrl}/public/country-list`

        return this.http.get<any>(url)
    }

    tagList(params): Observable<any> {
        const url = `${this.baseUrl}/tag-list`

        return this.http.get<any>(url, { params })
    }
    saveTag(params): Observable<any> {
        const url = `${this.baseUrl}/add-tag`

        return this.http.post<any>(url, params)
    }
    updateTag(params): Observable<any> {
        const url = `${this.baseUrl}/update-tags`

        return this.http.post<any>(url, params)
    }
    deleteTag(params): Observable<any> {
        const url = `${this.baseUrl}/delete-tag`

        return this.http.post<any>(url, params)
    }
}
