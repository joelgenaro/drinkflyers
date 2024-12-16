import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { apis } from '../../../environments/environment'

@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}/public`
    private data = new BehaviorSubject<Array<any>>([{ fetching: true }])
    data$ = this.data.asObservable()

    constructor(public http: HttpClient) {
    }

    getHome(): Observable<any> {
        const url = `${this.baseUrl}/home-page-items`

        return this.http.get<any>(url)
    }

    getCompanyImages(): Observable<any> {
        const url = `${this.baseUrl}/company-images-list`

        return this.http.get<any>(url)
    }
}
