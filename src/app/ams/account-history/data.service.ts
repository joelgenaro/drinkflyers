import { HttpClient } from '@angular/common/http'
import { apis } from 'src/environments/environment'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'

@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}/account`
    private data = new BehaviorSubject<Array<any>>([{ fetching: true }])
    data$ = this.data.asObservable()

    constructor(public http: HttpClient) { }

    list(params): Observable<any> {
        const url = `${this.baseUrl}/history`

        return this.http.post<any>(url, params)
    }

    downloadProveFiles(params): Observable<any> {

        const options: any = {
            responseType: 'arraybuffer'
        }

        const url = `${apis.baseUrl}/download/account-prove-file-zip`

        return this.http.post<any>(url, params, options)
    }

    exportCsv(params): Observable<any> {
        const options: any = {
            responseType: 'blob',
            params
        }
        const url = `${this.baseUrl}/export-account-history`

        return this.http.get<any>(url, options)
    }

    exportPdf(params): Observable<any> {
        const options: any = {
            responseType: 'blob',
            params
        }
        const url = `${this.baseUrl}/export-account-history-pdf`

        return this.http.get<any>(url, options)
    }

    accountDetail(params): Observable<any> {
        const url = `${this.baseUrl}/detail`
        return this.http.post<any>(url, params)
    }
}
