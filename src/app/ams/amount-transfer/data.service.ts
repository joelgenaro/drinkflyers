import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { apis } from 'src/environments/environment'

@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}/account`
    private data = new BehaviorSubject<Array<any>>([{ fetching: true }])
    data$ = this.data.asObservable()

    constructor(public http: HttpClient) { }

    list(params): Observable<any> {
        const url = `${this.baseUrl}/transfer-list`

        return this.http.get<any>(url, { params })
    }

    add(params): Observable<any> {
        const url = `${this.baseUrl}/transfer-amount`

        return this.http.post<any>(url, params)
    }

    accountList(): Observable<any> {
        const url = `${this.baseUrl}/list`

        return this.http.get<any>(url)
    }

}
