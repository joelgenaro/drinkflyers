import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { apis } from 'src/environments/environment'

@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}/shipping-method`
    private baseUrlRate = `${apis.baseUrl}/shipping-method-rate`

    constructor(
        private http: HttpClient
    ) { }

    getCountryList(): Observable<any> {
        const url = `${apis.baseUrl}/public/country-list`

        return this.http.get<any>(url)
    }
    getZoneList(): Observable<any> {
        const url = `${apis.baseUrl}/zone/list`

        return this.http.get<any>(url)
    }
    getZoneCountryList(): Observable<any> {
        const url = `${this.baseUrl}/selected-countries`

        return this.http.get<any>(url)
    }

    list(): Observable<any> {
        const url = `${this.baseUrl}`

        return this.http.get<any>(url)
    }

    detail(params): Observable<any> {
        const url = `${this.baseUrl}/detail`

        return this.http.post<any>(url, params)
    }

    add(params): Observable<any> {
        const url = `${this.baseUrl}/add`

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

    rateNames(): Observable<any> {
        const url = `${this.baseUrlRate}/names`

        return this.http.get<any>(url)
    }
    rateList(): Observable<any> {
        const url = `${this.baseUrlRate}`

        return this.http.get<any>(url)
    }
    rateAdd(params): Observable<any> {
        const url = `${this.baseUrlRate}/add`

        return this.http.post<any>(url, params)
    }
    rateUpdate(params): Observable<any> {
        const url = `${this.baseUrlRate}/update`

        return this.http.post<any>(url, params)
    }
    rateDelete(params): Observable<any> {
        const url = `${this.baseUrlRate}/delete`

        return this.http.post<any>(url, params)
    }
}
