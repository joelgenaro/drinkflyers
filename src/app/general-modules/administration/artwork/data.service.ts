import { ApiService } from './../../../services/api.service';

import { HttpClient, HttpHeaders} from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { apis } from 'src/environments/environment'

@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}/artwork`
    private data = new BehaviorSubject<Array<any>>([{ fetching: true }])
    public driverDoc = new BehaviorSubject<number>(0)
    $data = this.data.asObservable()

    constructor(private http: HttpClient, private api:ApiService ) { }

    getArtworkUrl(id: number,thumbnailTime) {
        return `${apis.baseUrl}/public/download/${id}?t=${thumbnailTime}`
    }

    list(params): Observable<any> {
        const url = `${this.baseUrl}/list`

        return this.http.get<any>(url, { params })
    }

    artworkCategoriesList(): Observable<any> {
        const url = `${apis.baseUrl}/artwork-category/list`

        return this.http.get<any>(url, { })
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

    // downloadFile(id): any {
    //     const url = `${this.baseUrl}/document/${id}`
    //     const options: any = {
    //         headers: new HttpHeaders({
    //             'Content-Type': 'application/octet-stream',
    //         }),
    //         responseType: 'blob'
    //     }

    //     return this.http.get(url, options).pipe(map(
    //         (res: any) => {
    //             console.log('blob', res)
    //             return res
    //             // return new Blob([res.blob()], { type: 'application/pdf' })
    //         })
    //     )
    // }
}
