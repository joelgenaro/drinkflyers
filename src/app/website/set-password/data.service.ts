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

    checkVCode(params): Observable<any> {
        const url = `${this.baseUrl}/user-code-verification`

        return this.http.post<any>(url, params)
    }

    sendCAgain(params): Observable<any> {
      const url = `${this.baseUrl}/resend-code-verification`

      return this.http.post<any>(url, params)
  }

    submit(params): Observable<any> {
        const url = `${this.baseUrl}/set-user-password`
        return this.http.post<any>(url,params)
    }
}
