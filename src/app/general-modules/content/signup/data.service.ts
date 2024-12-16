import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { apis } from 'src/environments/environment'

@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}/page-content/registration`
    private data = new BehaviorSubject<Array<any>>([{ fetching: true }])
    data$ = this.data.asObservable()

    constructor(public http: HttpClient) { }

    getContent(): Observable<any> {
        const url = `${this.baseUrl}/detail`

        return this.http.get<any>(url)
    }

    updateContent(params): Observable<any> {
        const url = `${this.baseUrl}/add-update`

        return this.http.post<any>(url, params)
    }
}
