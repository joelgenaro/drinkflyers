import { apis } from 'src/environments/environment'

import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { Router } from '@angular/router'


@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}/project`
    activeMenu = 'business'

    constructor(public http: HttpClient, private router: Router) {
    }

    dashboardData(): Observable<any> {
        const url = `${apis.baseUrl}/dashboard`

        return this.http.get<any>(url)
    }

    getFinancialStats(params): Observable<any> {
        //const url = `${apis.baseUrl}/lov/dashboard-data`
        const url = `${apis.baseUrl}/lov/financial-stats`

        return this.http.get<any>(url, { params })
    }

    getBDMstate(): Observable<any> {
        const url = `${apis.baseUrl}/project/bdm-dashboard`

        return this.http.get<any>(url)
    }
    getFMstate(): Observable<any> {
        const url = `${apis.baseUrl}/project/financial-dashboard`

        return this.http.get<any>(url)
    }
    getPMstate(): Observable<any> {
        const url = `${apis.baseUrl}/project/pm-dashboard`

        return this.http.get<any>(url)
    }
}
