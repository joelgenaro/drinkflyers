import { ApiService } from './../../services/api.service'
import { apis } from './../../../environments/environment'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { Router } from '@angular/router'


@Injectable()

export class DataService {
    step = 'store-detail'
    private baseUrl = `${apis.baseUrl}/sepod-store`
    private data = new BehaviorSubject<Array<any>>([{ fetching: true }])
    data$ = this.data.asObservable()

    constructor(public http: HttpClient, private router: Router, public api: ApiService) {
    }

    navigateWindow(obj: any) {
        this.step = obj.step
        this.router.navigate(['/user/sepod-stores/' + obj.step], { queryParams: { id: obj.id }, replaceUrl: true })
    }

    get(params): Observable<any> {
        const url = `${this.baseUrl}/list`

        return this.http.get<any>(url, { params })
    }

    // getAllUserStorePermissions(params): Observable<any> {
    //     const url = `${this.baseUrl}/all-store-user-permissions`

    //     return this.http.get<any>(url, { params })
    // }

    add(params): Observable<any> {
        const url = `${this.baseUrl}/add`

        return this.http.post<any>(url, params)
    }

    permissionUser(params): Observable<any> {
        const url = `${this.baseUrl}/permission-users`

        return this.http.get<any>(url, { params })
    }

    save(params): Observable<any> {
        const url = `${this.baseUrl}/add-employee-permission`

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
    detail(params): Observable<any> {
        const url = `${this.baseUrl}/detail`

        return this.http.post<any>(url, params)
    }

    getPermissionsList(params): Observable<any> {
        const url = `${this.baseUrl}/permission-list`

        return this.http.get<any>(url,{params})
    }

    employeeList(params): Observable<any> {
        const url = `${apis.baseUrl}/employee/list`

        return this.http.get<any>(url, { params })
    }

    deleteUserPermission(params): Observable<any> {
        const url = `${this.baseUrl}/delete-user-permission`

        return this.http.post<any>(url, params)
    }



}
