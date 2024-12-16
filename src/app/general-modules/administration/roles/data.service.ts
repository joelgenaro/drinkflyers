import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { apis } from 'src/environments/environment'


@Injectable()
export class DataService {

    private baseUrl = `${apis.baseUrl}`

    constructor(public http: HttpClient) {
    }
    rolesList(params): Observable<any> {
        const url = `${apis.baseUrl}/authorization/role-list`

        return this.http.get<any>(url, { params })
    }

    getPermissionsList(): Observable<any> {
        const url = `${apis.baseUrl}/authorization/permission-list`

        return this.http.get<any>(url)
    }

    addRole(params): Observable<any> {
        const url = `${apis.baseUrl}/authorization/create-role`

        return this.http.post<any>(url, params)
    }
    updateRole(params): Observable<any> {
        const url = `${apis.baseUrl}/authorization/update-role-permission`

        return this.http.post<any>(url, params)
    }

    deleteRole(params): Observable<any> {
        const url = `${apis.baseUrl}/authorization/delete-role`

        return this.http.post<any>(url, params)
    }

}

