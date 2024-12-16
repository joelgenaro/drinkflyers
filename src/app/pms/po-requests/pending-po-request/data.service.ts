import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { apis } from 'src/environments/environment'


@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}/po-request`
    private data = new BehaviorSubject<Array<any>>([{ fetching: true }])
    data$ = this.data.asObservable()

    constructor(
        public http: HttpClient
    ) { }

    list(params): Observable<any> {
        const url = `${this.baseUrl}/pending-list`

        return this.http.get<any>(url, { params })
    }

    add(params): Observable<any> {
        const url = `${this.baseUrl}/add`

        return this.http.post<any>(url, params)
    }

    PoRequestItems(params): Observable<any> {
        const url = `${this.baseUrl}/pending-items`

        return this.http.get<any>(url, {params})
    }

    poRequestApprove(params): Observable<any> {
        const url = `${this.baseUrl}/approve`

        return this.http.post<any>(url, params)
    }

    poRequestReject(params): Observable<any> {
        const url = `${this.baseUrl}/reject`

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

    variantList(params): Observable<any> {
        const url = `${apis.baseUrl}/product-variant/list`

        return this.http.get<any>(url, { params })
    }

}
