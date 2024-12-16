import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject, Observable } from 'rxjs'
import { apis } from 'src/environments/environment'

@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}/client-store`

    constructor(private http: HttpClient) { }

    storeList(): Observable<any> {
        const url = `${this.baseUrl}/list`

        return this.http.get<any>(url)
    }

    shippingMethodRate(): Observable<any> {
        const url = `${apis.baseUrl}/shipping-method-rate`

        return this.http.get<any>(url)
    }

    clientShippingDetail(): Observable<any> {
        const url = `${this.baseUrl}/shipping-method/detail`

        return this.http.get<any>(url)
    }

    clientShippingAddUpdate(params): Observable<any> {
        const url = `${this.baseUrl}/shipping-method/add-update`

        return this.http.post<any>(url, params)
    }
}
