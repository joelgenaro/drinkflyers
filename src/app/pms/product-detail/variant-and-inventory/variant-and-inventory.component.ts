import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { Component, OnInit, TemplateRef } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { DataService } from '../data.service'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ActivatedRoute, Router } from '@angular/router'
import { ApiService } from 'src/app/services/api.service'
import iro from '@jaames/iro'
import { Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'

@Component({
    selector: 'app-variant-and-inventory',
    templateUrl: './variant-and-inventory.component.html',
    styleUrls: ['./variant-and-inventory.component.css']
})
export class VariantAndInventoryComponent implements OnInit {
    dataForm: FormGroup
    Loading = false
    dataStatus = 'fetching'
    dataList: any = []
    selectedIndex = -1
    modalRef: BsModalRef
    selectedId: any
    modalTitle: any = ''
    colorPicker: any

    pagination: any = []
    page = 1
    searchKeyword: string = ''
    searchKeyword$: Subject<string> = new Subject<string>()
    searchKeywordSub: any
    loaderOptions = {
        rows: 5,
        cols: 7,
        colSpans: {
            0: 1,
        }
    }
    filters = {
        orderBy: '',
        order: '',
        perPage: 15
    }

    constructor(
        private ds: DataService,
        private fb: FormBuilder,
        public ui: UIHelpers,
        public alert: IAlertService,
        private router: Router,
        private route: ActivatedRoute,
        public ms: BsModalService,
        public api: ApiService
    ) {
        ds.activeTab = 'variants'
        this.ds.productId = this.route.snapshot.queryParamMap.get('id')

        this.dataForm = this.fb.group({
            id: new FormControl(null),
            size: new FormControl(null, [Validators.required]),
            quantity: new FormControl(null, [Validators.required]),
            sku: new FormControl(null, [Validators.required]),
            price: new FormControl(null, [Validators.required]),
            additional_price: new FormControl(null),
            description: new FormControl(null, [Validators.maxLength(1000)]),
            color_code: new FormControl(null, [Validators.required])
        })

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

        // this.changeColor(this.colorPicker)

    }

    ngOnDestroy(): void {
        this.searchKeywordSub.unsubscribe()
    }

    ngOnInit() {
        this.dataForm.get('color_code').valueChanges.subscribe((value) => {
            if (value.length === 7) {
                this.colorPicker.color.hexString = value
            }
        })
    }

    // changeColor(variantColor: string) {
    //     document.documentElement.style.setProperty('--variant-color', variantColor)
    // }

    get g() {
        return this.dataForm.controls
    }

    searchKeywordChange(value: string) {
        this.searchKeyword$.next(value)
    }

    getArrowClass(fieldName, order) {
        const className = 'arrow ' + order
        if (this.filters.orderBy === fieldName && this.filters.order === order) {

            return className + ' active'
        }
        return className
    }

    doSort(orderBy, order) {
        this.filters.orderBy = orderBy
        this.filters.order = order

        this.getList()
    }

    selectPerPage(e) {
        this.filters.perPage = e.target.value
        this.page = 1

        this.getList()
    }

    getList() {
        const params = {
            id: this.ds.productId,
            page: this.page,
            keyword: this.searchKeyword,
            order_by: this.filters.orderBy,
            order: this.filters.order,
            per_page: this.filters.perPage
        }
        if (params.id == -1) {
            this.dataStatus = 'done'

            return false
        } else {
            const list = this.ds.variantList(params)
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
    }

    getSerialNumber(i: number) {
        return ((this.pagination.current_page - 1) * this.pagination.per_page) + i + 1
    }

    setPagination(page: number) {
        let filtersParam: any = {}

        filtersParam = {
            page,
            keyword: this.searchKeyword,
            order_by: this.filters.orderBy,
            order: this.filters.order,
            per_page: this.filters.perPage
        }
        this.router.navigate([this.api.checkUser() + '/products/variants'], { queryParams: filtersParam, replaceUrl: true })
    }
}
