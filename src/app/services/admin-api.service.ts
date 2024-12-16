import { apis } from './../../environments/environment.prod';
import { Observable, BehaviorSubject } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'

@Injectable({
    providedIn: 'root'
})
export class AdminApiService {
    baseUrl: any
    tutorProfile: any
    userLoggedInSource = new BehaviorSubject(false)
    constructor(
        public http: HttpClient) {
        this.baseUrl = `${apis.baseUrl}/admin`
        console.log(this.baseUrl)
    }

    // Users
    getUsers( params: any): Observable<any> {
        const url = `${this.baseUrl}/user-list`
    console.log(url)
        return this.http.get<any>(url, { params })
    }
    
    cancelClaim(params): Observable<any> {
        const url = `${this.baseUrl}/cancel-claim`

        return this.http.post<any>(url, params)
    }

    featuredUser(params): Observable<any> {
        const url = `${this.baseUrl}/save-featured-user`

        return this.http.post<any>(url, params)
    }

    featuredUserCancel(params): Observable<any> {
        const url = `${this.baseUrl}/cancel-featured-user`

        return this.http.post<any>(url, params)
    }

    deleteUser(params): Observable<any> {
        const url = `${this.baseUrl}/delete-user`

        return this.http.post<any>(url, params)
    }

    // Education Level Calls
    getEducationLevels(): Observable<any> {
        const url = `${this.baseUrl}/levels`

        return this.http.get<any>(url)
    }

    deleteEducationLevel(params): Observable<any> {
        const url = `${this.baseUrl}/delete-level`

        return this.http.post<any>(url, params)
    }

    addEducationLevel(params): Observable<any> {
        const url = `${this.baseUrl}/add-level`

        return this.http.post<any>(url, params)
    }

    updateEducationLevel(params): Observable<any> {
        const url = `${this.baseUrl}/edit-level`

        return this.http.post<any>(url, params)
    }



    // Subject Categories Calls
    getSubjectCategories(): Observable<any> {
        const url = `${this.baseUrl}/subject-category-list`

        return this.http.get<any>(url)
    }

    deleteSubjectCategory(params): Observable<any> {
        const url = `${this.baseUrl}/delete-subject-category`

        return this.http.post<any>(url, params)
    }

    addSubjectCategory(params): Observable<any> {
        const url = `${this.baseUrl}/add-subject-category`

        return this.http.post<any>(url, params)
    }

    updateSubjectCategory(params): Observable<any> {
        const url = `${this.baseUrl}/edit-subject-category`

        return this.http.post<any>(url, params)
    }


    // Subject Calls
    getSubjects(): Observable<any> {
        const url = `${this.baseUrl}/subject-list`

        return this.http.get<any>(url)
    }

    deleteSubject(params): Observable<any> {
        const url = `${this.baseUrl}/delete-subject`

        return this.http.post<any>(url, params)
    }

    addSubject(params): Observable<any> {
        const url = `${this.baseUrl}/add-subject`

        return this.http.post<any>(url, params)
    }

    updateSubject(params): Observable<any> {
        const url = `${this.baseUrl}/edit-subject`

        return this.http.post<any>(url, params)
    }

}
