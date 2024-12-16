import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject, Observable } from 'rxjs'
import { apis } from 'src/environments/environment'

@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}/invoice`

    constructor(private http: HttpClient) { }

    list(params): Observable<any> {
        const url = `${this.baseUrl}/order-list`

        return this.http.get<any>(url, { params })
    }

    createInvoice(params): Observable<any> {
        const url = `${this.baseUrl}/create`

        return this.http.post<any>(url, params)
    }

    orderItem(params): Observable<any> {
        const url = `${apis.baseUrl}/order/items`

        return this.http.get<any>(url, { params })
    }
}
