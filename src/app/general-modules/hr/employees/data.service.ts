import { ApiService } from './../../../services/api.service'
import { apis } from './../../../../environments/environment'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { Router } from '@angular/router'


@Injectable()
export class DataService {
    step = 'personal-info'
    private baseUrl = `${apis.baseUrl}/employees`
    private data = new BehaviorSubject<Array<any>>([{ fetching: true }])
    data$ = this.data.asObservable()

    constructor(public http: HttpClient, private router: Router, public api: ApiService) {
    }

    navigateWindow(obj: any) {
        this.step = obj.step
        this.router.navigate(['/user/employees/' + obj.step], { queryParams: { id: obj.id }, replaceUrl: true })
    }
    designationList(): Observable<any> {
        const url = `${apis.baseUrl}/designation/list`

        return this.http.get<any>(url)
    }

    get(params): Observable<any> {
        const url = `${apis.baseUrl}/employee/list`

        return this.http.get<any>(url, { params })
    }
    add(params): Observable<any> {
        const url = `${apis.baseUrl}/employee/add`

        return this.http.post<any>(url, params)
    }
    update(params): Observable<any> {
        const url = `${apis.baseUrl}/employee/update`

        return this.http.post<any>(url, params)
    }
    delete(params): Observable<any> {
        const url = `${apis.baseUrl}/employee/delete`

        return this.http.post<any>(url, params)
    }
    getEmployee(params): Observable<any> {
        const url = `${apis.baseUrl}/employee/detail`

        return this.http.post<any>(url, params)
    }

    getPermissionsList(): Observable<any> {
        const url = `${apis.baseUrl}/authorization/permission-list`

        return this.http.get<any>(url)
    }
    getRolesList(): Observable<any> {
        const url = `${apis.baseUrl}/authorization/role-list`

        return this.http.get<any>(url)
    }
    assignPermissions(params): Observable<any> {
        const url = `${apis.baseUrl}/authorization/assign-permissions `

        return this.http.post<any>(url, params)
    }
    assignRoles(params): Observable<any> {
        const url = `${apis.baseUrl}/authorization/add-user-roles `

        return this.http.post<any>(url, params)
    }
}
