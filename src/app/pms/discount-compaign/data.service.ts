import { apis } from './../../../environments/environment'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { Router } from '@angular/router'
import { ApiService } from 'src/app/services/api.service'


@Injectable()
export class DataService {
    step = 'discount-compaign-info'
    private baseUrl = `${apis.baseUrl}/discount-campaign`
    private data = new BehaviorSubject<Array<any>>([{ fetching: true }])
    data$ = this.data.asObservable()
    storeId = -1

    constructor(public http: HttpClient, private router: Router, public api: ApiService) {
    }

    navigateWindow(obj: any) {
        this.step = obj.step
        this.router.navigate(['/user/discount-compaign/' + obj.step], { queryParams: { id: obj.id,store_id:this.storeId }, replaceUrl: true })
    }
    // designationList(): Observable<any> {
    //     const url = `${apis.baseUrl}/designation/list`

    //     return this.http.get<any>(url)
    // }

    get(params): Observable<any> {
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
    getDetail(params): Observable<any> {
        const url = `${this.baseUrl}/detail`

        return this.http.post<any>(url, params)
    }

    storeProducts(params): Observable<any> {
        const url = `${this.baseUrl}/store-product`

        return this.http.get<any>(url, {params})
    }

    discountProduct(params): Observable<any> {
        const url = `${this.baseUrl}/products`

        return this.http.get<any>(url, {params})
    }

    deleteDiscountProduct(params): Observable<any> {
        const url = `${this.baseUrl}/delete-product`

        return this.http.post<any>(url, params)
    }

    getPermissionsList(): Observable<any> {
        const url = `${apis.baseUrl}/authorization/permission-list`

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
    changeStatusActive(params): Observable<any> {
        const url = `${this.baseUrl}/activate`
        return this.http.post<any>(url, params)
    }

    changeStatusInactive(params): Observable<any> {
        const url = `${this.baseUrl}/deactivate`
        return this.http.post<any>(url, params)
    }

    addDiscountProducts(params): Observable<any> {
        const url = `${this.baseUrl}/add-products`
        return this.http.post<any>(url, params)
    }
}
