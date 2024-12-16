import { HttpClient } from '@angular/common/http'
import { apis } from 'src/environments/environment'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'

@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}/supplier`
    private data = new BehaviorSubject<Array<any>>([{ fetching: true }])
    data$ = this.data.asObservable()

    constructor(public http: HttpClient) { }

    list(params): Observable<any> {
        const url = `${this.baseUrl}/account-history`

        return this.http.post<any>(url, params)
    }

    downloadProveFiles(id): Observable<any> {

        const options: any = {
            responseType: 'blob'

        }

        const url = `${apis.baseUrl}/public/supplier-download-file/${id}`

        return this.http.get<any>(url, options)
    }

    supplierDetail(params): Observable<any> {
        const url = `${apis.baseUrl}/supplier/detail`

        return this.http.post<any>(url, params)
    }

    exportCsv(params): Observable<any> {
        const options: any = {
            responseType: 'blob',
            params
        }

        const url = `${apis.baseUrl}/supplier/export-wallet-history`

        return this.http.get<any>(url,options)
    }
    exportPdf(params): Observable<any> {
        const options: any = {
            responseType: 'blob',
            params
        }
        const url = `${this.baseUrl}/export-supplier-history-pdf`

        return this.http.get<any>(url,options)
    }
}
