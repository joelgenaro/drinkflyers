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

    signup(params): Observable<any> {
        const url = `${this.baseUrl}/client-registrations`

        return this.http.post<any>(url, params)
    }

}
