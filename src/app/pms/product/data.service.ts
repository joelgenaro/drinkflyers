import { Params } from '@angular/router'
import { HttpClient, HttpErrorResponse, HttpHandler, HttpHeaders } from '@angular/common/http'
import { EventEmitter, Injectable } from '@angular/core'
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { Subscription } from 'rxjs/internal/Subscription'
import { apis } from 'src/environments/environment'

@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}`
    private artworkUrl = `${apis.artworkUrl}`
    private data = new BehaviorSubject<Array<any>>([{ fetching: true }])
    $data = this.data.asObservable()
    // productPicture: any = {}
    productDetails: any = []
    productSKU: any = null
    productId: any = -1
    defaultMockupId = null
    newMockupId = new Subject<number>()
    baseProductId: any = -1
    activeTab = 'create-virtual-product'
    tabs = [
        {
            link: 'create-virtual-product',
            title: 'Product',
            disabled: true
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
            title: 'Product Design',
            disabled: false
        },
        {
            link: 'mock-ups',
            title: 'Mockups',
            disabled: false
        },
        {
            link: 'product-detail',
            title: 'Details',
            disabled: false
        },
        {
            link: 'prices',
            title: 'Prices',
            disabled: false
        },
        // {
        //     link: 'mockups',
        //     title: 'Mockups'
        // }
    ]
    constructor(private http: HttpClient) { }


    addFile(params): Observable<any> {
        const url = `${this.baseUrl}/user-lib/add-system-file`
        // const url = `${this.baseUrl}/add-system-file`
        return this.http.post<any>(url, params, {
            reportProgress: true,
            observe: 'events'
        }).pipe(
            catchError(this.errorMgmt)
        )
    }
    errorMgmt(error: HttpErrorResponse) {
        let errorMessage = ''
        if (error.error instanceof ErrorEvent) {
            // Get client-side error
            errorMessage = error.error.message
        } else {
            // Get server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`
        }
        console.log(errorMessage)
        return throwError(errorMessage)
    }


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

    getUserLibList(params): Observable<any> {
        const url = `${apis.baseUrl}/user-lib/all-files`

        return this.http.get<any>(url, { params })
    }
    deleteUserLib(params): Observable<any> {
        const url = `${this.baseUrl}/user-lib/delete-file`

        return this.http.post<any>(url, params)
    }

    variantProductSKU(): Observable<any> {
        const url = `${apis.baseUrl}/public/product-sku/${this.productId}`

        return this.http.get<any>(url)
    }
    variantList(params): Observable<any> {
        const url = `${apis.baseUrl}/public/product-variant/list`

        return this.http.get<any>(url, { params })
    }
    baseVariantList(params): Observable<any> {
        const url = `${apis.baseUrl}/public/base-product-variant/list`

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

        return this.http.get<any>(url, { params })
    }
    productFontList(params): Observable<any> {
        const url = `${apis.baseUrl}/public/product-font/list`

        return this.http.get<any>(url, { params })
    }
    allFontList(): Observable<any> {
        const url = `${apis.baseUrl}/public/font/all-files`

        return this.http.get<any>(url)
    }
    productFontFileList(params): Observable<any> {
        const url = `${apis.baseUrl}/public/font/file-list`

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

    baseProductList(params): Observable<any> {
        const url = `${apis.baseUrl}/public/base-product/list`

        return this.http.get<any>(url, { params })
    }

    baseProductArtworkList(params): Observable<any> {
        const url = `${apis.baseUrl}/public/base-product-artwork/list`

        return this.http.get<any>(url, { params })
    }

    baseProductFontList(params): Observable<any> {
        const url = `${apis.baseUrl}/public/base-product-font/list`

        return this.http.get<any>(url, { params })
    }

    getPrintAreas(params): Observable<any> {
        const url = `${apis.baseUrl}/print-areas/virtual-design-content/detail`

        return this.http.get<any>(url, { params })
    }

    getFile(id): Observable<any> {
        const options: any = {
            responseType: 'blob',
        }
        const url = `${apis.baseUrl}/public/user-lib/file/${id}`

        return this.http.get<any>(url, options)
    }

    updateVPContent(params): Observable<any> {
        const url = `${apis.baseUrl}/print-areas/update-vp-content`

        return this.http.post<any>(url, params)
    }

    getSubFolder(params): Observable<any> {
        const url = `${apis.baseUrl}/user-lib/sub-folders`

        return this.http.get<any>(url, { params })
    }
    getFolderFile(params): Observable<any> {
        const url = `${apis.baseUrl}/user-lib/folder-files`

        return this.http.get<any>(url, { params })
    }
    getRecentFile(): Observable<any> {
        const url = `${apis.baseUrl}/user-lib/recent-files`

        return this.http.get<any>(url)
    }
    addNewFolder(params): Observable<any> {
        const url = `${apis.baseUrl}/user-lib/create-folder`

        return this.http.post<any>(url, params)
    }
    baseProductImageURL(imageId: number) {
        const url = `${apis.baseUrl}/public/base-product-image/${imageId}`
        return url
    }

    baseProductDefaultImage(bpId: number) {
        const url = `${apis.baseUrl}/public/base-product/default-image/${bpId}`
        return url
    }

    mockupList(params): Observable<any> {
        const url = `${apis.baseUrl}/mockup/list`

        return this.http.get<any>(url, { params })
    }

    elevationList(params): Observable<any> {
        const url = `${apis.baseUrl}/elevation/list`

        return this.http.get<any>(url, { params })
    }

    vpDesigneContent(params): Observable<any> {
        const url = `${apis.baseUrl}/product/vp-images`

        return this.http.get<any>(url, { params })
    }
    getVpDesigneContent(params): Observable<any> {
        const url = `${apis.baseUrl}/product/vp-image`

        return this.http.get<any>(url, { params })
    }

    checkImage(mocId, id): Observable<any> {


        const url = `${apis.baseUrl}/public/check-img/${mocId}/${id}`

        return this.http.get<any>(url, {})
    }

    productImages(params): Observable<any> {
        const url = `${apis.baseUrl}/product/mockup-images`

        return this.http.post<any>(url, params)
    }

    changeDefaultMockup(params): Observable<any> {
        const url = `${apis.baseUrl}/product/change-default-mockup`

        return this.http.post<any>(url, params)
    }

    list(params): Observable<any> {
        const url = `${apis.baseUrl}/base-product/active-list`

        return this.http.get<any>(url, { params })
    }
    artwork(params): Observable<any> {
        const url = `${this.artworkUrl}/artwork`

        return this.http.post<any>(url, params)
    }
    createArtworkTemplate(params): Observable<any> {
        const url = `${this.artworkUrl}/template`

        return this.http.post<any>(url, params)
    }
    addArtworkTemplate(params): Observable<any> {
        const url = `${apis.baseUrl}/artwork-template/add`

        return this.http.post<any>(url, params)
    }

    updateArtworkTemplate(params): Observable<any> {
        const url = `${apis.baseUrl}/artwork-template/update`

        return this.http.post<any>(url, params)
    }

    productPrices(params): Observable<any> {
        const url = `${apis.baseUrl}/product-variant/add`

        return this.http.post<any>(url, params)
    }
    storeList(): Observable<any> {
        const url = `${apis.baseUrl}/client-store/list`

        return this.http.get<any>(url, {  })
    }
    publishProduct(params): Observable<any> {
        const url = `${apis.baseUrl}/client-store/publish-product`

        return this.http.post<any>(url, params)
    }
}
