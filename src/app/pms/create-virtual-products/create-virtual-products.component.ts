import { element } from 'protractor'
import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import iro from '@jaames/iro'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ApiService } from 'src/app/services/api.service'
import { DataService } from './data.service'

@Component({
    selector: 'app-create-virtual-products',
    templateUrl: './create-virtual-products.component.html',
    styleUrls: ['./create-virtual-products.component.css']
})
export class CreateVirtualProductsComponent implements OnInit, OnDestroy {
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
        public ds: DataService,
        private alert: IAlertService,
        public ms: BsModalService,
        public api: ApiService,
        private router: Router,
        public route: ActivatedRoute,
        private fb: FormBuilder,
        public ui: UIHelpers,
    ) {
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
                this.dataList = resp.data.data
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
        this.router.navigate(['/user/create-virtual-products'], { queryParams: filtersParam, replaceUrl: true })
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
    retailPrice(data) {
        let minValue: number
        let numbers = []
        data.forEach(element => {
            numbers.push(+element.rrp)
        })
        minValue = Math.min.apply(null, numbers)
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
}
