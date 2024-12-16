import { ConstantsService } from 'src/app/services/constants.service'
import { Component, OnInit, OnDestroy } from '@angular/core'
import { FormBuilder } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ApiService } from 'src/app/services/api.service'
import { DataService } from '../data.service'

@Component({
    selector: 'app-create-virtual-product',
    templateUrl: './create-virtual-product.component.html',
    styleUrls: ['./create-virtual-product.component.css']
})
export class CreateVirtualProductComponent implements OnInit, OnDestroy {
    variantColors = []
    variantImages = []
    selectedBaseProductId: any
    variantSizes = []
    defaultImage = '/assets/images/logos/star-edition-logo.svg'
    catList = []
    dataStatus = 'fetching'
    dataStatusInner = 'fetching'
    dataList = []
    selectedId: any
    selectedInnerId: any
    selectedIndex = -1
    selectedInnerIndex = -1
    modalRef: BsModalRef
    modalTitle: any = ''
    colorPicker: any
    Loading = false
    loginLoading = false
    LoadingActive = false
    LoadingDeactive = false
    selectedStatus = ''
    pagination: any = []
    page = 1
    searchKeyword = ''
    searchKeyword$: Subject<string> = new Subject<string>()
    searchKeywordSub: any
    loaderOptions = {
        rows: 5,
        cols: 8,
        colSpans: {
            0: 1,
        }
    }
    filters = {
        categoriesIds: [],
        orderBy: '',
        order: '',
        perPage: 15
    }
    breadCrum = [
        {
            link: '',
            value: 'Products'
        }
    ]
    productSKU: any
    productId: any
    productVariantSKUSplit: any
    spinnerSVG = `/assets/images/rolling-gray.svg`

    constructor(
        public cs: ConstantsService,
        public ds: DataService,
        private router: Router,
        private route: ActivatedRoute,
        private alert: IAlertService,
        public ms: BsModalService,
        public api: ApiService,
        private fb: FormBuilder,
        public ui: UIHelpers,
    ) {
        this.ds.activeTab = 'create-virtual-product'
        this.ds.productId = this.route.snapshot.queryParamMap.get('id')
        this.ds.baseProductId = this.route.snapshot.queryParamMap.get('base_id')
        this.selectedBaseProductId = this.route.snapshot.queryParamMap.get('baseProductId')


        this.getCategories()
        this.route.queryParams.subscribe(params => {
            if (params.page) {
                this.page = params.page
            }
            if (params.keyword) {
                this.searchKeyword = params.keyword
            }
            if (params.order_by) {
                this.filters.orderBy = params.order_by
            }
            if (params.order) {
                this.filters.order = params.order
            }
            if (params.per_page) {
                this.filters.perPage = params.per_page
            }
            if (params.categories_ids) {
                console.log(params.categories_ids)
                this.filters.categoriesIds = params.categories_ids.split(',').map(i => Number(i))
            }

            if (params) {
                this.getList()
            }
        })

        this.searchKeywordSub = this.searchKeyword$.pipe(
            debounceTime(1000), // wait 1 sec after the last event before emitting last event
            distinctUntilChanged(), // only emit if value is different from previous value
        ).subscribe(searchKeyword => {
            this.page = 1
            this.getList()
        })
    }

    ngOnDestroy(): void {
        this.searchKeywordSub.unsubscribe()
    }

    ngOnInit() {
    }

    doSort(e: any, order) {
        this.filters.orderBy = e.target.value
        this.filters.order = order

        this.getList()
    }

    selectPerPage(e: any) {
        this.filters.perPage = e.target.value
        this.page = 1

        this.getList()
    }

    getCategories() {
        const params = {
            parent_id: 0
        }

        const list = this.ds.categoriesList(params)
        list.subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
            } else {
                this.catList = resp.data
            }
        })
    }

    getList() {
        this.dataStatus = 'fetching'
        const params = {
            page: this.page,
            keyword: this.searchKeyword,
            order_by: this.filters.orderBy,
            order: this.filters.order,
            per_page: this.filters.perPage,
            category_ids: this.filters.categoriesIds.toString()
        }

        const list = this.ds.list(params)
        list.subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
            } else {
                this.variantColors = []
                this.variantImages = []
                this.dataList = resp.data.data
                this.dataList.forEach(pro => {
                    // variantColors
                    let colorCode = []
                    pro.variants.forEach(colors => {
                        if (colors.color_code !== null) {
                            colorCode.push(colors.color_code.toLowerCase())
                        } else {
                            colorCode.push(colors.color_code)
                        }
                    })
                    let uniqueColor = []
                    uniqueColor = colorCode.filter((elem, index, self) => {
                        return index === self.indexOf(elem)
                    })
                    const colors: any = []
                    uniqueColor.forEach(element => {
                        if (element !== null) {
                            const index = pro.variants.findIndex(d => d.color_code === element)
                            colors.push({ colorCode: pro.variants[index].color_code, colorName: pro.variants[index].color_name })
                        }
                    })
                    this.variantColors.push(colors)
                })
                
                this.dataList.forEach(pro => {
                    const colorCodes:any = []
                    pro.variants.forEach(colors => {
                        if (colors.image_exists === 1) {
                            colors.base_product_variant_values.forEach(bpvv => {
                                if (bpvv.variant_option_value.variant_option.id === 2) {
                                    console.log(colors.id, bpvv.variant_option_value.name)
                                    const index = colorCodes.findIndex(d => d.colorName === bpvv.variant_option_value.name)
                                    if (index === -1) {
                                        colorCodes.push({ id: colors.id, colorName: bpvv.variant_option_value.name })
                                    }
                                }
                            })
                        } 
                    })
                    this.variantImages.push(colorCodes)
                })
                
                // console.log('this.variantImagesArray',this.variantImagesArray)
                // this.variantImages = colorCodes
                // console.log(this.variantImages)
                // console.log(this.variantColors)

                this.pagination = resp.data
                this.dataStatus = 'done'
            }
        })
    }

    setPagination(page: number) {
        let filtersParam: any = {}
        filtersParam = {
            page,
            keyword: this.searchKeyword,
            order_by: this.filters.orderBy,
            order: this.filters.order,
            per_page: this.filters.perPage,
            categories_ids: this.filters.categoriesIds.toString()
        }
        this.router.navigate([this.api.checkUser() + '/product/create-virtual-product'], { queryParams: filtersParam, replaceUrl: true })
    }

    searchKeywordChange(value: string) {
        this.searchKeyword$.next(value)
    }

    getSerialNumber(i: number) {
        return ((this.pagination.current_page - 1) * this.pagination.per_page) + i + 1
    }

    isChecked(id) {
        let checked: boolean = true
        if (this.filters.categoriesIds.findIndex(d => d === id) === -1) {
            checked = false
        }
        return checked
    }

    setCategories(id) {
        const index = this.filters.categoriesIds.findIndex(d => d === id)
        if (index === -1) {
            this.filters.categoriesIds.push(id)
        } else {
            this.filters.categoriesIds.splice(index, 1)
        }
        this.page = 1
        this.setPagination(this.page)
    }

    totalTradePrice(data) {
        const tradePrices: any = []
        data.forEach(element => {
            tradePrices.push(+element.tp)
        })

        let uniqueTradePrice = []
        uniqueTradePrice = tradePrices.filter(function (elem, index, self) {
            return index === self.indexOf(elem)
        })

        return uniqueTradePrice.length
    }

    tradePrice(data) {
        let minValue: number
        let numbers = []
        if (data != undefined) {
            data.forEach(element => {
                numbers.push(+element.tp)
            })
            minValue = Math.min.apply(null, numbers)
        } else {
            minValue = 0
        }
        return minValue
    }

    getSizes(data) {
        let size: string = ''
        size = data[0].size
        if (data.length > 0) {
            let lastElement = data.slice(-1)
            size = size + ' - ' + lastElement[0].size
        }
        return size
    }
    getVariantSizes(data) {
        let returnSizes: any = ''
        const variantSizes: any = []
        let variantName: any = []
        let sizes: any = []
        data.forEach(baseOptions => {
            variantName.push(baseOptions.name)
            baseOptions.base_product_variant_values.forEach(optionValues => {
                if (optionValues.variant_option_value.variant_option_id == 1) {
                    variantSizes.push(optionValues.variant_option_value.name)
                }
            })
        })

        if (variantName.length > 0) {
            variantName.forEach((names: any) => {
                if (names != null) {
                    names.split(' / ').forEach(vals => {

                        const index = variantSizes.findIndex(item => item === vals)
                        if (index > -1) {
                            sizes.push(variantSizes[index])
                        }
                    })
                }
            })
            let uniqueVariantSizes = []
            if (sizes.length > 0) {
                uniqueVariantSizes = sizes.filter(function (elem, index, self) {
                    return index === self.indexOf(elem)
                })

                uniqueVariantSizes.forEach(element => {
                    if (returnSizes == '') {
                        returnSizes = element
                    } else {
                        returnSizes += ' / ' + element
                    }
                })
            }
        }

        return returnSizes
    }

    addProduct(dataValue) {
        const random = Math.round(new Date().getTime())
        let selectedTags: any = []
        if (dataValue.tag_ids != '') {
            selectedTags = dataValue.tag_ids.split(',').map((i) => +i)
        }
        const user = JSON.parse(localStorage.getItem('user'))
        const params = {
            id: null,
            sku: null,
            name: dataValue.name,
            personalize: 1, // this.dataForm.value.personalize,
            tag_ids: selectedTags,
            base_product_id: dataValue.id,
            description: dataValue.description
        }

        // if (user.user_roles) {
        //     if (user.user_roles[0].role.name === 'admin') {
        //         params.sku = 'S0001_'
        //     } else if (user.user_roles[0].role.name === 'client') {
        //         params.sku = 'C0001_'
        //     }
        //     if (dataValue.variable === 1) {
        //         params.sku += dataValue.variants[0].sku
        //     } else if (dataValue.variable === 0) {
        //         params.sku += dataValue.variants[0].sku
        //     }
        // } else {
        //     params.sku = 'ABC0001_'
        //     params.sku += dataValue.variants[0].sku
        // }

        let saveMethod = this.ds.addProductDetail(params)
        saveMethod.subscribe((resp: any) => {
            this.dataStatus = 'fetching'
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.dataStatus = 'done'

                return false
            } else {

                this.router.navigate([this.api.checkUser() + '/product/personalized-region'], {
                    queryParams: {
                        id: resp.data,
                        base_id: dataValue.id,
                    },
                    replaceUrl: true,
                })
            }
        })
    }
}