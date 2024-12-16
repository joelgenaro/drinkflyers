import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { BehaviorSubject, Observable } from 'rxjs'
import { apis } from 'src/environments/environment'

@Injectable()
export class DataService {
    step = 'detail'
    private baseUrl = `${apis.baseUrl}/zone`
    private data = new BehaviorSubject<Array<any>>([{ fetching: true }])
    data$ = this.data.asObservable()

    constructor(
        public http: HttpClient,
        private router: Router
    ) { }

    navigateWindow(obj: any) {
        this.step = obj.step
        this.router.navigate(['/user/zone/' + obj.step], { queryParams: { id: obj.id }, replaceUrl: true })
    }

    list(params): Observable<any> {
        const url = `${this.baseUrl}/list`

        return this.http.get<any>(url, { params })
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

    zoneDetail(params): Observable<any> {
        const url = `${this.baseUrl}/detail`

        return this.http.post<any>(url, params)
    }

    changeStatusActive(params: any): Observable<any> {
        const url = `${this.baseUrl}/activate`

        return this.http.post<any>(url, params)
    }

    changeStatusInactive(params: any): Observable<any> {
        const url = `${this.baseUrl}/deactivate`

        return this.http.post<any>(url, params)
    }


    getStateList(): Observable<any> {
        const url = `${apis.baseUrl}/state/list`

        return this.http.get<any>(url)
    }
    getEmployee(params): Observable<any> {
        const url = `${apis.baseUrl}/client/detail`

        return this.http.post<any>(url, params)
    }
    assignPermissions(params): Observable<any> {
        const url = `${apis.baseUrl}/authorization/assign-permissions `

        return this.http.post<any>(url, params)
    }

    getCountryList(): Observable<any> {
        const url = `${apis.baseUrl}/public/country-list`

        return this.http.get<any>(url)
    }

    getSelectedCountryList(): Observable<any> {
        const url = `${apis.baseUrl}/public/selected-country-list`

        return this.http.get<any>(url)
    }

    zoneRegionlist(params): Observable<any> {
        const url = `${apis.baseUrl}/zone-region/list`

        return this.http.get<any>(url, { params })
    }

    zoneRegionAddUpdate(params): Observable<any> {
        const url = `${apis.baseUrl}/zone-region/add-update`

        return this.http.post<any>(url, params)
    }
}
