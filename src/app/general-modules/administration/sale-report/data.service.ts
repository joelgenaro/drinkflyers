import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { apis } from 'src/environments/environment'

@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}/report`
    private data = new BehaviorSubject<Array<any>>([{ fetching: true }])
    data$ = this.data.asObservable()

    constructor(public http: HttpClient) { }

    list(params): Observable<any> {
        const url = `${this.baseUrl}/sale`

        return this.http.post<any>(url, params)
    }

    downloadInvoice(params): Observable<any> {
        console.log(params)

        const options: any = {
            responseType: 'arraybuffer'
        }

        const url = `${this.baseUrl}/create-pdf`

        return this.http.post<any>(url, params, options)
    }

    items(params): Observable<any> {
        const url = `${this.baseUrl}/items`

        return this.http.get<any>(url, { params })
    }

    sendReminder(params): Observable<any> {
        const url = `${this.baseUrl}/send-reminder`

        return this.http.post<any>(url, params)
    }

    uploadDoc(params): Observable<any> {
        const url = `${this.baseUrl}/add-prove-document`

        return this.http.post<any>(url, params)
    }

    documentsList(params): Observable<any> {
        const url = `${this.baseUrl}/prove-document-list`

        return this.http.post<any>(url, params)
    }

    deleteDocument(params): Observable<any> {
        const url = `${this.baseUrl}/delete-prove-document`

        return this.http.post<any>(url, params)
    }

    downloadDocument(id) {
        const options: any = {
            responseType: 'arraybuffer'
        }
        const url = `${apis.baseUrl}/public/download-prove-document/${id}`

        return this.http.get(url, options)
    }

    markAsPaid(params): Observable<any> {
        const url = `${this.baseUrl}/mark-as-paid`

        return this.http.post<any>(url, params)
    }

    getAccountsList(): Observable<any> {
        const url = `${apis.baseUrl}/account/list`

        return this.http.get<any>(url)
    }

    getClientList(): Observable<any> {
        const url = `${apis.baseUrl}/client/list`

        return this.http.get<any>(url)
    }

    getStoreList(): Observable<any> {
        const url = `${apis.baseUrl}/client-store/list`

        return this.http.get<any>(url)
    }
}

