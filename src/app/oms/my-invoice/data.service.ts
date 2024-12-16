import { HttpClient } from '@angular/common/http'
import { apis } from 'src/environments/environment'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'

@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}/invoice`
    private data = new BehaviorSubject<Array<any>>([{ fetching: true }])
    data$ = this.data.asObservable()

    constructor(public http: HttpClient) { }

    list(params): Observable<any> {
        const url = `${this.baseUrl}/my-invoices-list`

        return this.http.get<any>(url, { params })
    }

    downloadInvoice(params): Observable<any> {
        const options: any = {
            responseType: 'arraybuffer'
        }
        const url = `${this.baseUrl}/create-pdf`

        return this.http.post<any>(url, params, options)
    }

    items(params): Observable<any> {
        const url = `${this.baseUrl}/view-items`

        return this.http.get<any>(url, { params })
    }
}
