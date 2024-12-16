import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { apis } from 'src/environments/environment'

@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}`
    private data = new BehaviorSubject<Array<any>>([{ fetching: true }])
    $data = this.data.asObservable()
    // productPicture: any = {}
    productDetails: any = []
    productSKU: any
    productId: any = -1
    activeTab = 'product-info'
    tabs = [
        {
            link: 'product-info',
            title: 'Details'
        },
        // {
        //     link: 'picture',
        //     title: 'Pictures'
        // },
        // {
        //     link: 'artwork',
        //     title: 'Artworks'
        // },
        // {
        //     link: 'font',
        //     title: 'Fonts'
        // },
        {
            link: 'personalized-region',
            title: 'Personalize'
        },
        {
            link: 'variants',
            title: 'Variants'
        },
        // {
        //     link: 'summary',
        //     title: 'Summary'
        // }
    ]
    constructor(private http: HttpClient) { }

    addProductDetail(params): Observable<any> {
        const url = `${apis.baseUrl}/product/add`

        return this.http.post<any>(url, params)
    }
    updateProductDetail(params): Observable<any> {
        const url = `${this.baseUrl}/product/update`

        return this.http.post<any>(url, params)
    }
    productDetail(params): Observable<any> {
        const url = `${this.baseUrl}/product/detail`

        return this.http.post<any>(url, params)
    }

    addImage(formData: FormData) {
        const url = `${apis.baseUrl}/product/add-image`

        return this.http.post<any>(url, formData)
    }
    imagesList(params: any) {
        const url = `${apis.baseUrl}/product/images`

        return this.http.post<any>(url, params)
    }
    deleteImage(params: any) {
        const url = `${apis.baseUrl}/product/delete-image`

        return this.http.post<any>(url, params)
    }

    categoriesList(params): Observable<any> {
        const url = `${apis.baseUrl}/public/category/list`

        return this.http.get<any>(url, { params })
    }
    tagsList(): Observable<any> {
        const url = `${apis.baseUrl}/public/tag/list`

        return this.http.get<any>(url)
    }

    variantList(params): Observable<any> {
        const url = `${apis.baseUrl}/public/product-variant/list`

        return this.http.get<any>(url, { params })
    }
    addVariant(params): Observable<any> {
        const url = `${this.baseUrl}/product-variant/add`

        return this.http.post<any>(url, params)
    }
    updateVariant(params): Observable<any> {
        const url = `${this.baseUrl}/product-variant/update`

        return this.http.post<any>(url, params)
    }
    deleteVariant(params): Observable<any> {
        const url = `${this.baseUrl}/product-variant/delete`

        return this.http.post<any>(url, params)
    }

    artworkCategoryList(): Observable<any> {
        const url = `${apis.baseUrl}/public/artwork-category/list`

        return this.http.get<any>(url)
    }
    artworkList(params): Observable<any> {
        const url = `${apis.baseUrl}/public/artwork/category-list`

        return this.http.get<any>(url, { params })
    }
    productArtworkList(params): Observable<any> {
        const url = `${apis.baseUrl}/public/product-artwork/list`

        return this.http.get<any>(url, { params })
    }
    productArtworkAdd(params): Observable<any> {
        const url = `${apis.baseUrl}/product-artwork/add`

        return this.http.post<any>(url, params)
    }

    fontList(params): Observable<any> {
        const url = `${apis.baseUrl}/public/font/list`
        // const url = `${apis.baseUrl}/product-font/font-list`

        return this.http.get<any>(url, { params })
    }
    productFontList(params): Observable<any> {
        const url = `${apis.baseUrl}/public/product-font/list`

        return this.http.get<any>(url, { params })
    }
    productFontAdd(params): Observable<any> {
        const url = `${apis.baseUrl}/product-font/add`

        return this.http.post<any>(url, params)
    }
    productFontDelete(params): Observable<any> {
        const url = `${apis.baseUrl}/product-font/delete `

        return this.http.post<any>(url, params)
    }

}
