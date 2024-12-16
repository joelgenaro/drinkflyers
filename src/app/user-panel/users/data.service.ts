import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { apis } from '../../../environments/environment'

@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}/admin`
    private data = new BehaviorSubject<Array<any>>([{ fetching: true }])
    data$ = this.data.asObservable()

    constructor(public http: HttpClient) {
    }

    getList(params): Observable<any> {
        const url = `${this.baseUrl}/user-list`

        return this.http.get<any>(url,{params})
    }

    delete(params): Observable<any> {
        const url = `${this.baseUrl}/delete-user`

        return this.http.post<any>(url, params)
    }

    add(params): Observable<any> {
        const url = `${this.baseUrl}/add-user`

        return this.http.post<any>(url, params)
    }

    update(params): Observable<any> {
        const url = `${this.baseUrl}/update-user`

        return this.http.post<any>(url, params)
    }

    activeUser(params): Observable<any> {
        const url = `${this.baseUrl}/active-user`
  
        return this.http.post<any>(url, params)
      }
  
    inactiveUser(params): Observable<any> {
    const url = `${this.baseUrl}/inactive-user`

    return this.http.post<any>(url, params)
    }

}
