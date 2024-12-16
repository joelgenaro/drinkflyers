import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core'
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import iro from '@jaames/iro'
import * as moment from 'moment'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ApiService } from 'src/app/services/api.service'
import { DataService } from './data.service'

@Component({
    selector: 'app-supplier-product',
    templateUrl: './supplier-product.component.html',
    styleUrls: ['./supplier-product.component.css'],
})
export class SupplierProductComponent implements OnInit, OnDestroy {
    dataForm: FormGroup
    moment = moment
    dataStatus = 'fetching'
    modalDataStatus = 'fetching'
    dataStatusInner = 'fetching'
    dataList = []
    productList = []
    selectedId: any
    selectedRow
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
    productIds = []
    isChecked = false
    pagination: any = []
    modalPagination: any = []
    page = 1
    modalPage = 1
    supplierId = -1
    supplierDataList: any = []
    searchKeyword = ''
    searchKeyword$: Subject<string> = new Subject<string>()
    modalSearchKeyword = ''
    modalSearchKeyword$: Subject<string> = new Subject<string>()
    searchKeywordSub: any
    modalSearchKeywordSub: any
    loaderOptions = {
        rows: 5,
        cols: 8,
        colSpans: {
            0: 1,
        },
    }
    filters = {
        orderBy: '',
        order: '',
        perPage: 15,
        supplierId: 0,
    }
    modalFilters = {
        perPage: 5,
        supplierId: 0,
    }
    supplierProId: any = ''
    breadCrum = [
        {
            link: '/user/suppliers',
            value: 'Supplier',
            params: { supplier_id: this.supplierProId }
        }
    ]

    productSKU: any
    productId: any
    productVariantSKUSplit: any

    constructor(
        public ds: DataService,
        private alert: IAlertService,
        public ms: BsModalService,
        public api: ApiService,
        private router: Router,
        public route: ActivatedRoute,
        private fb: FormBuilder,
        public ui: UIHelpers
    ) {
        this.supplierProId = this.route.snapshot.queryParamMap.get('supplier_id')

        this.breadCrum.push({
            link: '/user/supplier-products',
            params: { supplier_id: this.supplierProId },
            value: 'Supplier Products List'
        })

        this.dataForm = this.fb.group({
            id: new FormControl(null),
            size: new FormControl(null, [Validators.required]),
            sku: new FormControl(null, [Validators.required]),
            price: new FormControl(null, [Validators.required]),
            additional_price: new FormControl(null),
            description: new FormControl(null, [Validators.maxLength(1000)]),
            color_code: new FormControl(null, [Validators.required]),
        })

        this.route.queryParams.subscribe((params) => {
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
            if (params.supplier_id) {
                this.filters.supplierId = params.supplier_id
                this.supplierId = params.supplier_id
            }
            if (params) {
                this.getList()
            }
        })

        this.searchKeywordSub = this.searchKeyword$
            .pipe(
                debounceTime(1000), // wait 1 sec after the last event before emitting last event
                distinctUntilChanged() // only emit if value is different from previous value
            )
            .subscribe((searchKeyword) => {
                this.page = 1
                this.getList()
            })
        // Modal Search
        this.modalSearchKeywordSub = this.modalSearchKeyword$
            .pipe(
                debounceTime(1000), // wait 1 sec after the last event before emitting last event
                distinctUntilChanged() // only emit if value is different from previous value
            )
            .subscribe((searchKeyword) => {
                this.modalPage = 1
                this.getModalList()
            })
    }

    ngOnDestroy(): void {
        this.searchKeywordSub.unsubscribe()
        this.modalSearchKeywordSub.unsubscribe()
    }

    ngOnInit() {
        this.dataForm.get('color_code').valueChanges.subscribe((value) => {
            if (value !== null && value.length === 7) {
                this.colorPicker.color.hexString = value
            }
        })

        const params = { id: this.supplierId }
        this.ds.supplierDetail(params).subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
            } else {
                this.supplierDataList = resp.data
            }
        })
    }

    get g() {
        return this.dataForm.controls
    }
    getArrowClass(fieldName, order) {
        const className = 'arrow ' + order
        if (
            this.filters.orderBy === fieldName &&
            this.filters.order === order
        ) {
            return className + ' active'
        }
        return className
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

    modalSelectPerPage(e: any) {
        this.modalFilters.perPage = e.target.value
        this.modalPage = 1
        this.getModalList()
    }

    getModalList() {
        const param = {
            supplier_id: this.supplierId,
            page: this.modalPage,
            per_page: this.modalFilters.perPage,
            keyword: this.modalSearchKeyword,
        }
        this.ds.productList(param).subscribe((resp) => {
            if (resp.success === true) {
                this.productList = resp.data.data
                this.modalPagination = resp.data
                this.modalDataStatus = 'done'
            }
        })
    }

    getList() {
        const params = {
            page: this.page,
            keyword: this.searchKeyword,
            order_by: this.filters.orderBy,
            order: this.filters.order,
            per_page: this.filters.perPage,
            supplier_id: this.filters.supplierId,
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

    addProduct(id, i) {
        const getIndex = this.productIds.findIndex((e) => e === id)

        if (getIndex !== -1) {
            this.productIds.splice(getIndex, 1)
        } else {
            this.productIds.push(id)
        }
    }

    setPagination(page: number) {
        let filtersParam: any = {}

        filtersParam = {
            page,
            keyword: this.searchKeyword,
            order_by: this.filters.orderBy,
            order: this.filters.order,
            per_page: this.filters.perPage,
        }
        this.router.navigate(['/user/supplier-products'], {
            queryParams: filtersParam,
            replaceUrl: true,
        })
    }

    setModalPagination(page: number) {
        this.modalPage = page
        this.getModalList()
    }

    openModal(formModal) {
        this.getModalList()

        this.modalRef = this.ms.show(formModal, {
            class: 'modal-lg modal-dialog-centered admin-panel',
            backdrop: 'static',
            ignoreBackdropClick: true,
            keyboard: false,
        })
    }

    statusConfirmingModal(
        changeStatus: TemplateRef<any>,
        id: number,
        i: number,
        j: number,
        status: string
    ) {
        this.selectedId = id
        this.selectedIndex = i
        this.selectedInnerIndex = j
        this.selectedStatus = status
        this.modalRef = this.ms.show(changeStatus, {
            class: 'modal-md modal-dialog-centered admin-panel',
            backdrop: 'static',
            ignoreBackdropClick: true,
            keyboard: false,
        })
    }

    padLeadingZeros(num, size) {
        let s = num + ''
        while (s.length < size) s = '0' + s
        return s
    }

    save() {
        this.Loading = true
        if (this.productIds.length === 0) {
            this.alert.error('No prodduct is selected')
            this.Loading = false

            return false
        }
        const params = {
            supplier_id: this.supplierId,
            base_product_ids: this.productIds,
        }

        this.ds.add(params).subscribe((resp) => {
            this.Loading = false
            if (resp.success == true) {
                this.alert.success('Products added successfully!!')

                this.productIds.forEach((e) => {
                    const row = this.productList.find((r) => r.id == e)
                    const newParam = {
                        id: moment().format(),
                        name: row.name,
                        sku: row.sku,
                        category: { id: row.category.id, name: row.category.name },
                        supplier_id: +this.supplierId,
                        product_id: e,
                        product: row,
                    }
                    this.dataList.push(newParam)
                })
            }
            this.cancelButton()
        })
    }

    delete() {
        this.loginLoading = true
        const params = {
            base_product_id: this.selectedRow.id,
            supplier_id: this.supplierId,
        }
        this.ds.delete(params).subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.modalRef.hide()
                this.loginLoading = false

                return false
            } else {
                const deletingIndex = this.dataList.findIndex((d: any) => {
                    return d.id === this.selectedId
                })
                this.dataList.splice(deletingIndex, 1)
                this.modalRef.hide()
                this.alert.success('Deleted successfully!!')
                this.selectedIndex = -1
            }
        })
    }

    confirmingModal(template: TemplateRef<any>, id: any, i: any) {
        this.selectedRow = this.dataList[i]
        this.selectedId = id
        this.selectedIndex = i
        this.modalRef = this.ms.show(template, {
            class: 'modal-sm admin-panel',
        })
    }

    cancelButton() {
        //f.resetForm()
        this.productIds = []
        this.modalRef.hide()
        this.selectedIndex = -1
    }

    searchKeywordChange(value: string) {
        this.searchKeyword$.next(value)
    }

    modalSearchKeywordChange(value: string) {
        this.modalSearchKeyword$.next(value)
    }

    getSerialNumber(i: number) {
        return (
            (this.pagination.current_page - 1) * this.pagination.per_page +
            i +
            1
        )
    }
}
