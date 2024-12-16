import { BsModalRef } from 'ngx-bootstrap/modal'
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
    productSKU: any = null
    productId: any = -1
    elevationId: any = -1
    elevationObg: any = []
    mockupId: any = -1
    pAModal: BsModalRef
    mockups = []
    elevations = []
    activeTab = 'product-detail'
    tabs = [
        {
            link: 'product-detail',
            title: 'Details'
        },
        {
            link: 'mockup',
            title: 'Print Areas'
        },
        // {
        //     link: 'picture',
        //     title: 'Pictures'
        // },
        // {
        //     link: 'print-areas',
        //     title: 'Print Areas'
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
            link: 'variants',
            title: 'Product Data'
        }
        // {
        //     link: 'summary',
        //     title: 'Summary'
        // }
    ]
    constructor(private http: HttpClient) { }

    addProductDetail(params): Observable<any> {
        const url = `${apis.baseUrl}/base-product/add`

        return this.http.post<any>(url, params)
    }
    updateProductDetail(params): Observable<any> {
        const url = `${this.baseUrl}/base-product/update`

        return this.http.post<any>(url, params)
    }
    productDetail(params): Observable<any> {
        const url = `${this.baseUrl}/base-product/detail`

        return this.http.post<any>(url, params)
    }

    categoriesList(params): Observable<any> {
        const url = `${apis.baseUrl}/public/category/list`

        return this.http.get<any>(url, { params })
    }
    addCategory(params): Observable<any> {
        const url = `${apis.baseUrl}/category/add`

        return this.http.post<any>(url, params)
    }
    getFulfilmentList(): Observable<any> {
        const url = `${apis.baseUrl}/public/fulfillment-center`

        return this.http.get<any>(url)
    }
    tagsList(): Observable<any> {
        const url = `${apis.baseUrl}/public/tag/list`

        return this.http.get<any>(url)
    }

    variantProductSKU(): Observable<any> {
        const url = `${apis.baseUrl}/public/base-product-sku/${this.productId}`

        return this.http.get<any>(url)
    }
    variantList(params): Observable<any> {
        const url = `${apis.baseUrl}/base-product-variant/list`

        return this.http.get<any>(url, { params })
    }
    addVariant(params): Observable<any> {
        const url = `${this.baseUrl}/base-product-variant/add`

        return this.http.post<any>(url, params)
    }
    updateVariant(params): Observable<any> {
        const url = `${this.baseUrl}/base-product-variant/update`

        return this.http.post<any>(url, params)
    }
    deleteVariant(params): Observable<any> {
        const url = `${this.baseUrl}/base-product-variant/delete`

        return this.http.post<any>(url, params)
    }
    getSimpleVariantDetail(params): Observable<any> {
        const url = `${apis.baseUrl}/base-product-variant/detail`

        return this.http.get<any>(url, { params })
    }
    
    getVariableVariantDetail(params): Observable<any> {
        const url = `${apis.baseUrl}/base-product-variant/default`

        return this.http.get<any>(url, { params })
    }
    deleteElevation(params): Observable<any> {
        const url = `${apis.baseUrl}/elevation/delete`
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
        const url = `${apis.baseUrl}/public/base-product-artwork/list`

        return this.http.get<any>(url, { params })
    }
    productArtworkAdd(params): Observable<any> {
        const url = `${apis.baseUrl}/base-product-artwork/add`

        return this.http.post<any>(url, params)
    }

    fontList(): Observable<any> {
        const url = `${apis.baseUrl}/public/font/list`

        return this.http.get<any>(url)
    }
    productFontList(params): Observable<any> {
        const url = `${apis.baseUrl}/public/base-product-font/list`

        return this.http.get<any>(url, { params })
    }
    productFontAdd(params): Observable<any> {
        const url = `${apis.baseUrl}/base-product-font/add`

        return this.http.post<any>(url, params)
    }
    productFontDelete(params): Observable<any> {
        const url = `${apis.baseUrl}/base-product-font/delete`

        return this.http.post<any>(url, params)
    }

    getPrintAreas(params): Observable<any> {
        const url = `${apis.baseUrl}/print-areas/design-content/detail`

        return this.http.get<any>(url, { params })
    }

    updatePrintAreas(params): Observable<any> {
        const url = `${apis.baseUrl}/print-areas/design-content/update`

        return this.http.post<any>(url, params)
    }

    addImgTitle(params): Observable<any> {
        const url = `${apis.baseUrl}/base-product/image/add-update-title `

        return this.http.post<any>(url, params)
    }

    addMockup(params): Observable<any> {
        const url = `${apis.baseUrl}/mockup/add`

        return this.http.post<any>(url, params)
    }

    updateMockup(params): Observable<any> {
        const url = `${apis.baseUrl}/mockup/update`

        return this.http.post<any>(url, params)
    }

    mockupList(params): Observable<any> {
        const url = `${apis.baseUrl}/mockup/list`

        return this.http.get<any>(url, { params })
    }

    elevationList(params): Observable<any> {
        const url = `${apis.baseUrl}/elevation/list`

        return this.http.get<any>(url, { params })
    }

    addElevation(params): Observable<any> {
        const url = `${apis.baseUrl}/elevation/add`
        return this.http.post<any>(url, params)
    }


    updateElevation(params): Observable<any> {
        const url = `${apis.baseUrl}/elevation/update`

        return this.http.post<any>(url, params)
    }

    addElevationImage(params): Observable<any> {
        const url = `${apis.baseUrl}/base-product/images/add`

        return this.http.post<any>(url, params)
    }

    makeDuplicatePrintArea(params): Observable<any> {
        const url = `${apis.baseUrl}/elevation/duplicate`
        return this.http.post<any>(url, params)
    }

    checkImage(mocId, eleId): Observable<any> {
        const url = `${apis.baseUrl}/public/base-product/check-image/${mocId}/${eleId}`

        return this.http.get<any>(url)
    }
    getClients(): Observable<any> {
        const url = `${apis.baseUrl}/client/list`

        return this.http.get<any>(url)
    }

    getCurrencies(): Observable<any> {
        const url = `${apis.baseUrl}/currency/list`

        return this.http.get<any>(url)
    }
    addTradePrice(params): Observable<any> {
        const url = `${this.baseUrl}/base-product-variant/add-variant-price`

        return this.http.post<any>(url, params)
    }
    updateTradePrice(params): Observable<any> {
        const url = `${this.baseUrl}/base-product-variant/update-variant-price`

        return this.http.post<any>(url, params)
    }
    deleteTradePrice(params): Observable<any> {
        const url = `${this.baseUrl}/base-product-variant/delete-variant-price`

        return this.http.post<any>(url, params)
    }
    updateMultiplier(params): Observable<any> {
        const url = `${this.baseUrl}/base-product-variant/update-variant-factor`

        return this.http.post<any>(url, params)
    }

    varientOptions(): Observable<any> {
        const url = `${this.baseUrl}/variant-option/list`

        return this.http.get<any>(url)
    }
    baseProdChangeStatusActive(params: any): Observable<any> {
        const url = `${apis.baseUrl}/base-product/activate`

        return this.http.post<any>(url, params)
    }
}
