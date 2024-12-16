import { HttpClient } from '@angular/common/http'
import { BehaviorSubject, Observable } from 'rxjs'
import { apis } from 'src/environments/environment'
import { Injectable } from '@angular/core'

@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}/order`
    private data = new BehaviorSubject<Array<any>>([{ fetching: true }])
    data$ = this.data.asObservable()

    constructor(public http: HttpClient) { }

    list(params): Observable<any> {
        const url = `${this.baseUrl}/store-order-list`

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

}
