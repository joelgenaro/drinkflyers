import { HttpClient } from '@angular/common/http'
import { BehaviorSubject, Observable } from 'rxjs'
import { apis } from 'src/environments/environment'
import { Injectable } from '@angular/core'

@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}/fulfillment-center`
    private data = new BehaviorSubject<Array<any>>([{ fetching: true }])
    data$ = this.data.asObservable()

    constructor(private http: HttpClient) { }

    list(params): Observable<any> {
        const url = `${apis.baseUrl}/fulfillment-center`

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
}
