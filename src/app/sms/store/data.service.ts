import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { apis } from 'src/environments/environment'

@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}/client-store`
    private data = new BehaviorSubject<Array<any>>([{ fetching: true }])
    data$ = this.data.asObservable()

    constructor(public http: HttpClient) { }

    list(params): Observable<any> {
        const url = `${this.baseUrl}/list`

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

    changeStatusActive(params: any): Observable<any> {
        const url = `${this.baseUrl}/activate`

        return this.http.post<any>(url, params)
    }

    changeStatusInactive(params: any): Observable<any> {
        const url = `${this.baseUrl}/deactivate`

        return this.http.post<any>(url, params)
    }

    getClientList(): Observable<any> {
        const url = `${apis.baseUrl}/client/list`

        return this.http.get<any>(url)
    }

    getEbayConnectionData(): Observable<any> {
        const url = `${apis.baseUrl}/channel-manager/ebay/connect`

        return this.http.post<any>(url, {})
    }

    getEtsyConnectionData(): Observable<any> {
        const url = `${apis.baseUrl}/channel-manager/etsy/connect`

        return this.http.post<any>(url, {})
    }

    getAmazonConnectionData(): Observable<any> {
        const url = `${apis.baseUrl}/channel-manager/amazon/connect`

        return this.http.get<any>(url, {})
    }
}
