import { HttpClient } from '@angular/common/http'
import { BehaviorSubject, Observable } from 'rxjs'
import { apis } from 'src/environments/environment'
import { Injectable } from '@angular/core'

@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}/public`
    private data = new BehaviorSubject<Array<any>>([{ fetching: true }])
    $data = this.data.asObservable

    constructor(public http: HttpClient) { }

    userRegistration(params): Observable<any> {
        const url = `${this.baseUrl}/user-registration`

        return this.http.post<any>(url, params)
    }

    companyRegistration(params): Observable<any> {
        const url = `${this.baseUrl}/company-registration`

        return this.http.post<any>(url, params)
    }

    designationList(): Observable<any> {
        const url = `${apis.baseUrl}/designation/list`

        return this.http.get<any>(url)
    }

}
