import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { apis } from 'src/environments/environment'
@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}/font`
    private artworkUrl = `${apis.artworkUrl}`
    private data = new BehaviorSubject<Array<any>>([{ fetching: true }])
    public driverDoc = new BehaviorSubject<number>(0)
    $data = this.data.asObservable()

    constructor(
        private http: HttpClient
    ) { }

    list(params): Observable<any> {
        const url = `${this.baseUrl}/list`

        return this.http.get<any>(url, { params })
    }

    add(params): Observable<any> {
        const url = `${this.baseUrl}/add`

        return this.http.post<any>(url, params)
    }

    saveMissingFonts(params): Observable<any> {
        const url = `${this.baseUrl}/add-font-file`

        return this.http.post<any>(url, params)
    }

    addFontFile(params): Observable<any> {
        const url = `${this.baseUrl}/add-font-file`

        return this.http.post<any>(url, params)
    }

    fontFileList(params): Observable<any> {
        const url = `${this.baseUrl}/font-file-list`

        return this.http.get<any>(url, { params })
    }

    update(params): Observable<any> {
        const url = `${this.baseUrl}/update`

        return this.http.post<any>(url, params)
    }

    updateFontFile(params): Observable<any> {
        const url = `${this.baseUrl}/update-font-file`

        return this.http.post<any>(url, params)
    }

    // checkUploadLimit(params): Observable<any> {
    //     const url = `${this.baseUrl}/count-driver-document`

    //     return this.http.post<any>(url, params)
    // }

    delete(params): Observable<any> {
        const url = `${this.baseUrl}/delete`

        return this.http.post<any>(url, params)
    }

    deleteFontFile(params): Observable<any> {
        const url = `${this.baseUrl}/delete-font-file`

        return this.http.post<any>(url, params)
    }

    downloadFile(id): any {
        const url = `${this.baseUrl}/download/${id}`
        const options: any = {
            headers: new HttpHeaders({
                'Content-Type': 'application/octet-stream',
            }),
            responseType: 'blob'
        }

        return this.http.get(url, options).pipe(map(
            (res: any) => {
                // console.log('blob', res)
                return res
                // return new Blob([res.blob()], { type: 'application/pdf' })
            })
        )
    }

    addFontType(params): Observable<any> {
        const url = `${this.artworkUrl}/font-type`
        const options: any = {
            headers: new HttpHeaders({
                'Content-Type': 'multipart/form-data',
                Accept: 'application/json'
            })
        }

        // return this.http.post<any>(url, params, options)
        return this.http.post<any>(url, params, {})
    }

    fontTypeList(): Observable<any> {
        const url = `${this.artworkUrl}/font-type`

        return this.http.get<any>(url)
    }

    addArtworkFont(params): Observable<any> {
        const url = `${apis.baseUrl}/artwork/font/add`

        return this.http.post<any>(url, params)
    }
}
