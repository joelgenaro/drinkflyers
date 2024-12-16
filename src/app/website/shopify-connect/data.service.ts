import { Observable } from 'rxjs'
import { apis } from './../../../environments/environment'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'

@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}/channel-manager/shopify`

    constructor(public http: HttpClient) {
    }

    createStore(params): Observable<any> {
        const url = `${this.baseUrl}/create-store`

        return this.http.post<any>(url, params)
    }
}
