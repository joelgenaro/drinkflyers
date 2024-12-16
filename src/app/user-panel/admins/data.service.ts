import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { apis } from '../../../environments/environment'

@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}/admin`
    private data = new BehaviorSubject<Array<any>>([{ fetching: true }])
    public permissionsList = []
    data$ = this.data.asObservable()

    constructor(public http: HttpClient) {
    }

    save(params: any): Observable<any> {
        const url = `${this.baseUrl}/save-admin`

        return this.http.post<any>(url, params)
    }

    update(params: any): Observable<any> {
        const url = `${this.baseUrl}/update-admin`

        return this.http.post<any>(url, params)
    }

    delete(param): Observable<any> {

        const url = `${this.baseUrl}/delete-admin`


        return this.http.post<any>(url, param)
    }

    list(): Observable<any> {
        const url = `${this.baseUrl}/admin-list`

        return this.http.get<any>(url)
    }
}
