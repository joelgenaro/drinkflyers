import { UIHelpers } from '../../helpers/ui-helpers'
import { ApiService } from '../../services/api.service'
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
import { IAlertService } from '../../libs/ialert/ialerts.service'
import { DataService } from './data.service'

@Component({
    selector: 'app-sepod-store-product',
    templateUrl: './sepod-store-product.component.html',
    styleUrls: ['./sepod-store-product.component.css'],
})
export class SepodStoreProductComponent implements OnInit, OnDestroy {
    dataForm: FormGroup
    moment = moment
    dataStatus = 'fetching'
    modalDataStatus = 'fetching'
    dataStatusInner = 'fetching'
    userHasPermissions = []
    dataList = []
    productList = []
    productListLoading: boolean = false
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
    storeId = -1
    storeDataList: any = []
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
        storeId: 0,
    }
    modalFilters = {
        perPage: 10,
        storeId: 0,
    }
    storeProId: any = ''
    breadCrum = [
        {
            link: '/user/sepod-stores/list',
            value: 'SEPOD Store',
            params: { store_id: this.storeProId }
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
        this.storeProId = this.route.snapshot.queryParamMap.get('store_id')

        this.breadCrum.push({
            link: '/user/sepod-store-products',
            params: { store_id: this.storeProId },
            value: 'SEPOD Store Products List'
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
            if (params.store_id) {
                this.filters.storeId = params.store_id
                this.storeId = params.store_id
            }
            if (params) {
                this.getList()
            }

            this.ds.userHasStorePermissions({ store_id: this.storeId }).subscribe(resp => {
                if (resp.success == true) {
                    this.userHasPermissions = resp.data
                    console.log(this.userHasPermissions)

                }
            })


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
            .subscribe((modalSearchKeyword) => {
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

        const params = { id: this.storeId }
        this.ds.storeDetail(params).subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
            } else {
                this.storeDataList = resp.data
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
            store_id: this.storeId,
            page: this.modalPage,
            per_page: this.modalFilters.perPage,
            keyword: this.modalSearchKeyword,
        }
        this.productListLoading = true
        this.ds.productList(param).subscribe((resp) => {
            if (resp.success === true) {
                this.productListLoading = false
                // this.dataList.forEach(data => {
                //     const index = resp.data.data.findIndex(d => d.id === data.product_id)
                //     resp.data.data.splice(index, 1)
                // })
                this.productList = resp.data.data
                this.modalPagination = resp.data
                this.modalDataStatus = 'done'

            } else {
                this.productListLoading = false
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
            store_id: this.filters.storeId,
        }

        const list = this.ds.list(params)
        list.subscribe((resp: any) => {
            this.dataStatus = 'fetching'
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
            } else {
                this.dataList = resp.data.data
                this.pagination = resp.data
                this.dataStatus = 'done'
                console.log('List Data', this.dataList)
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
        this.router.navigate(['/user/store-products'], {
            queryParams: filtersParam,
            replaceUrl: true,
        })
    }

    setModalPagination(page: number) {
        this.modalPage = page
        this.getModalList()
    }

    openModal(formModal) {
        this.productList = []
        // this.productListLoading = true;
        this.getModalList()

        this.modalRef = this.ms.show(formModal, {
            class: 'modal-lg modal-dialog-centered admin-panel',
            backdrop: 'static',
            ignoreBackdropClick: true,
            keyboard: false,
        })
    }

    // statusConfirmingModal(
    //     changeStatus: TemplateRef<any>,
    //     id: number,
    //     i: number,
    //     j: number,
    //     status: string
    // ) {
    //     this.selectedId = id
    //     this.selectedIndex = i
    //     this.selectedInnerIndex = j
    //     this.selectedStatus = status
    //     this.modalRef = this.ms.show(changeStatus, {
    //         class: 'modal-md modal-dialog-centered admin-panel',
    //         backdrop: 'static',
    //         ignoreBackdropClick: true,
    //         keyboard: false,
    //     })
    // }

    padLeadingZeros(num, size) {
        let s = num + ''
        while (s.length < size) s = '0' + s
        return s
    }

    statusConfirmingModal(changeStatus: TemplateRef<any>, id: number, index: number, status: string) {
        this.selectedId = id
        this.selectedIndex = index
        this.selectedStatus = status
        this.modalRef = this.ms.show(
            changeStatus,
            {
                class: 'modal-md modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
    }
    changeStatusUnPub() {
        this.loginLoading = true
        const params = {
            id: this.selectedId,
            status: this.selectedStatus

        }
        this.ds.changeStatusUnpublish(params).subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.loginLoading = false

                return false
            } else {
                this.dataList[this.selectedIndex].publish_status = this.selectedStatus
                this.alert.success(`Status changed to ${this.selectedStatus}`)
                this.modalRef.hide()
            }
        })
    }
    changeStatusPub() {
        this.loginLoading = true
        const params = {
            id: this.selectedId,
            status: this.selectedStatus

        }
        this.ds.changeStatusPublish(params).subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.loginLoading = false

                return false
            } else {
                this.dataList[this.selectedIndex].publish_status = this.selectedStatus
                this.alert.success(`Status changed to ${this.selectedStatus}`)
                this.modalRef.hide()
            }
        })
    }

    save() {
        this.Loading = true
        if (this.productIds.length === 0) {
            this.alert.error('No product is selected.')
            this.Loading = false

            return false
        }
        const params = {
            store_id: this.storeId,
            productIds: this.productIds,
        }

        this.ds.add(params).subscribe((resp) => {
            this.Loading = false
            if (resp.success == true) {
                this.getList()
                this.alert.success('Products added successfully!!')
                // this.productIds.forEach((e) => {
                //     const row = this.productList.find((r) => r.id == e)
                //     console.log('row is', row)
                //     const newParam = {
                //         id: moment().format(),
                //         name: row.name,
                //         sku: row.sku,
                //         category: { id: row.category.id, name: row.category.name },
                //         store_id: +this.storeId,
                //         product_id: e,
                //         product: row,
                //         publish_status: 'Publish',
                //     }
                //     this.dataList.push(newParam)
                // })
            }
            this.cancelButton()
        })
    }

    delete() {
        this.loginLoading = true
        const params = {
            base_product_id: this.selectedRow.id,
            store_id: this.storeId,
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
