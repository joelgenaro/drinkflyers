import { apis } from 'src/environments/environment'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { Router } from '@angular/router'


@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}/product`
    private data = new BehaviorSubject<Array<any>>([{ fetching: true }])
    data$ = this.data.asObservable()

    constructor(public http: HttpClient) { }

    recentelyProductData(): Observable<any> {
        const url = `${this.baseUrl}/top-selling`

        return this.http.get<any>(url)
    }

    addProductDetail(params): Observable<any> {
        const url = `${apis.baseUrl}/product/add`

        return this.http.post<any>(url, params)
    }
}
