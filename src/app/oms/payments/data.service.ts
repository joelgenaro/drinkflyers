import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject, Observable } from 'rxjs'
import { apis } from 'src/environments/environment'

@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}/order`

    constructor(private http: HttpClient) { }

    list(params): Observable<any> {
        const url = `${this.baseUrl}/my-orders`

        return this.http.get<any>(url, { params })
    }

    orderItem(params): Observable<any> {
        const url = `${this.baseUrl}/items`

        return this.http.get<any>(url, { params })
    }

    changeStatus(params): Observable<any> {
        const url = `${this.baseUrl}/change-status`

        return this.http.post<any>(url, params)
    }

    getReasons(): Observable<any> {
        const url = `${apis.baseUrl}/public/reason/list`

        return this.http.get<any>(url)
    }
}
