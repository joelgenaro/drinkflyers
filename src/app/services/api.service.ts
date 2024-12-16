import { Router } from '@angular/router'
import { ConstantsService } from './constants.service'
import { map } from 'rxjs/operators'
import { apis } from '../../environments/environment'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, BehaviorSubject, Subject } from 'rxjs'

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    totalItems = new BehaviorSubject<any>(true)
    cartItmes = new BehaviorSubject<number>(0)
    public activeTab = ''
    public homeBannerPrice = ''
    searchKeyword = ''
    showLoading = new Subject<boolean>()
    baseUrl: string
    searchFilter: any
    public isfullScreen = false
    userLoggedInSource = new BehaviorSubject(false)
    scrollBottom: boolean
    scrollBottomChange = new Subject<boolean>()
    userImage = new Subject<string>()
    userName = new Subject<string>()
    userLoggedInObs = this.userLoggedInSource.asObservable()
    cartData: any = null
    IncrementSalaryModalRef: any
    user: any = {
        id: 0,
        user_name: '',
        email: '',
        user_type: '',
        api_token: '',
        balance: 0,
        status: '',
        last_login: ''
    }
    storeVerificationData: any
    constructor(
        public http: HttpClient,
        public cs: ConstantsService
    ) {
        this.baseUrl = apis.baseUrl + '/public'
        this.scrollBottom = false
        this.scrollBottomChange.subscribe((value) => {
            this.scrollBottom = value
        })
        if (localStorage.getItem('token')) {
            this.user = JSON.parse(localStorage.getItem('user'))
            this.userLoggedInSource.next(true)
        } else {
            this.userLoggedInSource.next(false)
        }

        if (localStorage.getItem('cart')) {
            this.cartData = JSON.parse(localStorage.getItem('cart'))
            console.log('new value 1', this.cartData.documents.length)
            this.cartItmes.next(this.cartData.documents.length)
        }
    }

    toggleScrollBottom(value: boolean): void {
        this.scrollBottomChange.next(value)
    }

    login(params: any): Observable<any> {
        const url = `${this.baseUrl}/login`

        return this.http.post<any>(url, params)
            .pipe(
                map(resp => {
                    if (resp && resp.success && resp.data.token) {
                        localStorage.setItem('token', resp.data.token)
                        localStorage.setItem('user', JSON.stringify(resp.data))
                        this.user = resp.data
                        console.log(this.user)
                        this.userLoggedInSource.next(true)
                    }

                    return resp
                })
            )
    }

    googleLogin(): Observable<any> {
        const url = `${this.baseUrl}/login/${'google'}`

        return this.http.get<any>(url)
            .pipe(
                map(resp => {
                    if (resp && resp.success && resp.data.token) {
                        localStorage.setItem('token', resp.data.token)
                        localStorage.setItem('user', JSON.stringify(resp.data))
                        this.user = resp.data
                        console.log(this.user)
                        this.userLoggedInSource.next(true)
                    }

                    return resp
                })
            )
    }

    register(params: any): Observable<any> {
        const url = `${this.baseUrl}/register`

        return this.http.post<any>(url, params)
            .pipe(
                map(resp => {
                    if (resp && resp.success && resp.data.token) {
                        localStorage.setItem('token', resp.data.token)
                        localStorage.setItem('user', JSON.stringify(resp.data))
                        this.user = resp.data
                        this.userLoggedInSource.next(true)
                    }

                    return resp
                })
            )
    }

    doUserRedirects(resp: any, router: Router) {
        // switch (resp.data.user_type) {
        switch (resp.data.user_roles[0].role.name) {
            case 'admin': {
                router.navigate(['/user/dashboard'])
                break
            }
            case 'employee': {
                router.navigate(['/user/dashboard'])
                break
            }
            case 'client': {
                router.navigate(['/client/dashboard'])
                break
            }
        }
    }

    logOut(): boolean {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        this.user.id = 0
        this.userLoggedInSource.next(false)

        return true
    }

    isAuthenticated(): boolean {
        if (localStorage.getItem('token')) {
            return true
        } else {
            return false
        }
    }

    isUser(): boolean {
        if (this.isAuthenticated() && this.user.user_roles[0].role.name === ConstantsService.USER_ROLES.USER) {
            return true
        } else {
            return false
        }
    }
    isClient(): boolean {
        if (this.isAuthenticated() && this.user.user_roles[0].role.name === ConstantsService.USER_ROLES.CLIENT) {
            return true
        } else {
            return false
        }
    }

    isAdmin(): boolean {
        if (this.isAuthenticated() && this.user.user_type === ConstantsService.USER_ROLES.ADMIN) {
            return true
        } else {
            return false
        }
    }

    // public Api call
    saveContactUs(postData): Observable<any> {
        const url = `${this.baseUrl}/contact-us`

        return this.http.post<any>(url, postData)
    }

    jsonToFormData(jsonObject: object, parentKey?: any, carryFormData?: FormData): FormData {

        const formData = carryFormData || new FormData()
        let index = 0

        // tslint:disable-next-line: forin
        for (const key in jsonObject) {
            if (jsonObject.hasOwnProperty(key)) {
                if (jsonObject[key] !== null && jsonObject[key] !== undefined) {
                    let propName = parentKey || key
                    if (parentKey && this.isObject(jsonObject)) {
                        propName = parentKey + '[' + key + ']'
                    }
                    if (parentKey && this.isArray(jsonObject)) {
                        propName = parentKey + '[' + index + ']'
                    }
                    if (jsonObject[key] instanceof File) {
                        formData.append(propName, jsonObject[key])
                    } else if (jsonObject[key] instanceof FileList) {
                        for (let j = 0; j < jsonObject[key].length; j++) {
                            formData.append(propName + '[' + j + ']', jsonObject[key].item(j))
                        }
                    } else if (this.isArray(jsonObject[key]) || this.isObject(jsonObject[key])) {
                        this.jsonToFormData(jsonObject[key], propName, formData)
                    } else if (typeof jsonObject[key] === 'boolean') {
                        formData.append(propName, +jsonObject[key] ? '1' : '0')
                    } else {
                        formData.append(propName, jsonObject[key])
                    }
                }
            }
            index++
        }

        return formData
    }
    isArray(val: any) {
        const toString = ({}).toString

        return toString.call(val) === '[object Array]'
    }

    isObject(val: any) {
        return !this.isArray(val) && typeof val === 'object' && !!val
    }

    searchableLocations(keyword: string, noLoader?: boolean): Observable<any> {
        const loader = noLoader === true ? '?no-loader=true' : ''
        const url = `${apis.baseUrl}/public/searchable-locations/${keyword}${loader}`

        return this.http.get<any>(url)
    }

    logOutSession(): Observable<any> {
        const url = `${this.baseUrl}/logout`

        return this.http.post<any>(url, {})
    }

    checkVerificationCode(data): Observable<any> {
        const url = `${this.baseUrl}/verify-email`

        return this.http.post<any>(url, data)
    }

    resendVerificationCode(data): Observable<any> {
        const url = `${this.baseUrl}/resend-code`

        return this.http.post<any>(url, data)
    }

    checkStoreVerification(data): Observable<any> {
        const url = `${this.baseUrl}/verify-sepod-store`

        return this.http.post<any>(url, data)
    }

    // Profile update
    productImageUrl(id?: number) {
        id = id ? id : -1
        const productUrl = `${this.baseUrl}/product-image/${id}`

        return productUrl
    }
    // baseProductImageUrl(id?: number) {
    //     id = id ? id : -1
    //     const productUrl = `${this.baseUrl}/base-product-image/${id}`

    //     return productUrl
    // }
    baseProductImageUrl(Id?: number) {
        Id = Id ? Id : -1

        return `${apis.baseUrl}/public/base-product/download-image/${Id}`
    }
    virtualProductImageUrl(Id?: number) {
        Id = Id ? Id : -1

        return `${apis.baseUrl}/public/product-image/${Id}`
    }
    getFolderFileImg(id?: number) {
        id = id ? id : -1
        const productUrl = `${this.baseUrl}/user-lib/file/${id}`

        return productUrl
    }
    // artworkImageUrl(id?: number) {
    //     id = id ? id : -1

    //     return `${this.baseUrl}/artwork-image/${id}`
    // }

    getElevationImage(id?: number) {
        id = id ? id : -1

        return `${this.baseUrl}/base-product/download-image/${id}`
    }

    downloadProductImage(id?: number) {
        id = id ? id : -1

        return `${this.baseUrl}/product/download-image/${id}`
    }

    elevationImg(mocId, id?: number) {
        id = id ? id : -1
        const productUrl = `${this.baseUrl}/elevation-img/${mocId}/${id}`

        return productUrl
    }

    artworkImage(id?: number) {
        id = id ? id : -1
        const productUrl = `${this.baseUrl}/download/${id}`

        return productUrl
    }
    productThumbnailUrl(id?: number) {
        id = id ? id : -1

        return `${this.baseUrl}/product/add-thumbnail/${id}`
    }

    companyImageUrl(Id?: number) {
        Id = Id ? Id : -1

        return `${apis.baseUrl}/public/company-image/${Id}`
    }
    userImageUrl(userId?: number) {
        userId = userId ? userId : -1

        return `${apis.baseUrl}/public/profile-image/${userId}`
    }
    clientRecentProductImageUrl(Id?: number) {
        Id = Id ? Id : -1

        return `${apis.baseUrl}/public/product/download-image/${Id}`
    }
    checkResetCode(data): Observable<any> {
        const url = `${this.baseUrl}/verify-code`

        return this.http.post<any>(url, data)
    }

    resetPass(data): Observable<any> {
        const url = `${this.baseUrl}/reset-password`

        return this.http.post<any>(url, data)
    }

    getPlanholdersList(): Observable<any> {
        const url = `${this.baseUrl}/plan-holders-list`

        return this.http.get<any>(url)
    }

    getIndexPageCounters(): Observable<any> {
        const url = `${this.baseUrl}/home-page-counters`

        return this.http.get<any>(url)
    }

    getPageContent(params): Observable<any> {
        const url = `${this.baseUrl}/page-content`

        return this.http.get<any>(url, { params })
    }
    vehicleImage(id) {
        const url = `${this.baseUrl}/vehicle-image/${id}`
        return url
    }

    mockImage(id) {
        const url = `${this.baseUrl}/mock-image/${id}`
        return url
    }

    checkPermissions(permissions: Array<string>): boolean {
        const checkUrserRole = this.user.user_roles.findIndex(r => r.role.name == ConstantsService.USER_ROLES.ADMIN)

        if (checkUrserRole > -1) {
            return true
        }

        const index = this.user.permissions.findIndex((item: any) => permissions.indexOf(item.name) > -1)
        if (index > -1) {
            return true
        } else {
            return false
        }
    }

    checkRole() {
        const checkUrserRole = this.user.user_roles.findIndex(r => r.role.name == ConstantsService.USER_ROLES.ADMIN)

        if (checkUrserRole > -1) {
            return true
        } else {
            return false
        }
    }

    checkUser() {
        const checkUserRole = this.user.user_roles.findIndex(r => r.role.name === ConstantsService.USER_ROLES.ADMIN)

        if (checkUserRole > -1) {
            return '/user'
        } else {
            return '/client'
        }
    }

    checkPermission(permission: string): boolean {
        const checkUrserRole = this.user.user_roles.findIndex(r => r.role.name == ConstantsService.USER_ROLES.ADMIN)

        if (checkUrserRole > -1) {
            return true
        }

        const index = this.user.permissions.findIndex((item: any) => item.name === permission)
        // console.log('asdsad',index,permission,this.user.permissions[index]);

        if (index > -1) {
            return true
        } else {
            return false
        }
    }
    getCourierLogo(id) {
        id = id ? id : -1
        const courierUrl = `${this.baseUrl}/courier-service/logo/${id}`

        return courierUrl
        // const url = `${apis.baseUrl}/public/courier-service/logo/${id}`
        // return this.http.get<any>(url)
    }

    getLibFile(id, thumbnailTime) {
        id = id ? id : -1
        const url = `${this.baseUrl}/user-lib/file/${id}?t=${thumbnailTime}`
        return url

    }

    getCompaignImage(id) {
        id = id ? id : -1
        const compaignUrl = `${this.baseUrl}/discount-campaign/image/${id}`
        return compaignUrl
    }

    getLoginImg(id) {
        id = id > 0 ? id : -1
        const loginImgUrl = `${apis.baseUrl}/public/page-content/login/image/${id}`

        return loginImgUrl
    }
    getSignupImg(id) {
        id = id > 0 ? id : -1
        const SignupImgUrl = `${apis.baseUrl}/public/page-content/registration/image/${id}`

        return SignupImgUrl
    }
    getLoginContent(): Observable<any> {
        const url = `${this.baseUrl}/page-content/login/detail`

        return this.http.get<any>(url)
    }
    getSignupContent(): Observable<any> {
        const url = `${this.baseUrl}/page-content/registration/detail`

        return this.http.get<any>(url)
    }

    blankImageUrl(id?: number) {
        id = id ? id : -1
        const url = `${this.baseUrl}/base-product-variant-image/${id}`

        return url
    }

    getFlagImage(iso2: string) {
        iso2 = iso2 ? iso2.toLowerCase() : ''
        let flagUrl: any

        if (iso2 == 'an') {
            flagUrl = `https://www.worldatlas.com/r/w1200-q80/upload/41/06/ee/flag-netherlands-antiles-petch-one.jpg`
        } else {
            flagUrl = `https://flagcdn.com/24x18/${iso2}.png`
        }

        return flagUrl
    }
}
