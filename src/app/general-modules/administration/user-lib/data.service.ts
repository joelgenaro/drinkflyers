import { HttpClient } from '@angular/common/http'
import { BehaviorSubject, Observable } from 'rxjs'
import { Injectable } from '@angular/core'
import { apis } from 'src/environments/environment'

@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}/user-lib`
    private data = new BehaviorSubject<Array<any>>([{ fetching: true }])
    data$ = this.data.asObservable()

    constructor(public http: HttpClient) { }

    list(params): Observable<any> {
        const url = `${this.baseUrl}/sub-folders`

        return this.http.get<any>(url, { params })
    }

    add(params): Observable<any> {
        const url = `${this.baseUrl}/create-folder`

        return this.http.post<any>(url, params)
    }

    update(params): Observable<any> {
        const url = `${this.baseUrl}/update`

        return this.http.post<any>(url, params)
    }

    delete(params): Observable<any> {
        const url = `${this.baseUrl}/delete-file`

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

    parentList(parent_id) {
        const url = `${this.baseUrl}/parent-folders`
        const params = { id: parent_id }
        return this.http.get<any>(url, { params })
    }

    fileList(params): Observable<any> {
        const url = `${this.baseUrl}/folder-files`

        return this.http.get<any>(url, { params })
    }

    addFile(params): Observable<any> {
        const url = `${this.baseUrl}/add-file`

        return this.http.post<any>(url, params)
    }

    updateFile(params): Observable<any> {
        const url = `${this.baseUrl}/update-file`

        return this.http.post<any>(url, params)
    }

    deleteFile(params): Observable<any> {
        const url = `${this.baseUrl}/update-file`

        return this.http.post<any>(url, params)
    }

}
