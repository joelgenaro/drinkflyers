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
    selector: 'app-base-products-list',
    templateUrl: './base-products-list.component.html',
    styleUrls: ['./base-products-list.component.css']
})
export class BaseProductsListComponent implements OnInit, OnDestroy {
    dataForm: FormGroup
    dataStatus = 'fetching'
    dataStatusInner = 'fetching'
    spinnerSVG = `/assets/images/rolling-main.svg`
    allSelector: boolean = false
    dataList = []
    selectedDataList: Array<any> = []
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
    isChecked = false
    pagination: any = []
    page = 1
    searchKeyword = ''
    searchKeyword$: Subject<string> = new Subject<string>()
    searchKeywordSub: any
    loaderOptions = {
        rows: 5,
        cols: 5,
        colSpans: {
            0: 1,
        }
    }

    filters = {
        orderBy: 'id',
        order: 'desc',
        perPage: 15,
        sortBy: 'idDesc'
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
        this.dataForm = this.fb.group({
            id: new FormControl(null),
            size: new FormControl(null, [Validators.required]),
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
            if (params.sortBy) {
                this.filters.sortBy = params.sortBy
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
        this.dataForm.get('color_code').valueChanges.subscribe((value) => {
            if (value !== null && value.length === 7) {
                this.colorPicker.color.hexString = value
            }
        })
    }

    get g() {
        return this.dataForm.controls
    }

    showVariant(i: any) {
        if (!this.dataList[i].hasOwnProperty('variants')) {
            this.dataList[i].collapse = true
            this.ds.variantList({ id: this.dataList[i].id }).subscribe((resp: any) => {
                if (resp.success === false) {
                    this.alert.error(resp.errors.general)
                    this.dataList[i].collapse = !this.dataList[i].collapse
                } else {
                    this.dataList[i].variants = resp.data
                    this.dataStatusInner = 'done'
                }
            })
        } else {
            this.dataList[i].collapse = !this.dataList[i].collapse
        }
    }

    getArrowClass(fieldName, order) {
        const className = 'arrow ' + order
        if (this.filters.orderBy === fieldName && this.filters.order === order) {

            return className + ' active'
        }
        return className
    }

    doSort(e: any, order) {
        if (e.target.value == 'idAsc') {
            this.filters.orderBy = 'id'
            this.filters.order = 'asc'
        } else if (e.target.value == 'idDesc') {
            this.filters.orderBy = 'id'
            this.filters.order = 'desc'
        } else if (e.target.value == 'nameAsc') {
            this.filters.orderBy = 'name'
            this.filters.order = 'asc'
        } else if (e.target.value == 'nameDesc') {
            this.filters.orderBy = 'name'
            this.filters.order = 'desc'
        } else if (e.target.value == 'statusActive') {
            this.filters.orderBy = 'status'
            this.filters.order = 'asc'
        } else if (e.target.value == 'statusInActive') {
            this.filters.orderBy = 'status'
            this.filters.order = 'desc'
        } else if (e.target.value == 'skuAsc') {
            this.filters.orderBy = 'sku'
            this.filters.order = 'asc'
        } else if (e.target.value == 'skuDesc') {
            this.filters.orderBy = 'sku'
            this.filters.order = 'desc'
        } else if (e.target.value == 'updatedAt') {
            this.filters.orderBy = 'updated_at'
            this.filters.order = 'desc'
        } else {
            this.filters.orderBy = ''
            this.filters.order = ''
        }
        this.filters.sortBy = e.target.value
        // this.filters.orderBy = e.target.value
        // this.filters.order = order

        this.page = 1
        this.getList()
    }

    selectPerPage(e: any) {
        this.filters.perPage = e.target.value
        this.page = 1

        this.getList()
    }

    getList() {

        const params = {
            page: this.page,
            keyword: this.searchKeyword,
            order_by: this.filters.orderBy,
            order: this.filters.order,
            per_page: this.filters.perPage,
            sortBy: this.filters.sortBy
        }

        const list = this.ds.list(params)
        list.subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
            } else {
                this.dataList = resp.data.data
                // this.productSKU = resp.data.data.sku
                // this.productId = resp.data.data.id

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
            sortBy: this.filters.sortBy
        }
        this.router.navigate(['/user/base-products-list'], { queryParams: filtersParam, replaceUrl: true })
    }

    openModal(variantModal, mainId, index, innerId, innerIndex) {
        this.selectedId = mainId
        this.selectedInnerId = innerId
        this.selectedIndex = index
        this.selectedInnerIndex = innerIndex
        this.modalTitle = 'Add Variant'
        if (index > -1) {
            this.selectedIndex = index
            this.productVariantSKUSplit = this.dataList[this.selectedIndex].variants[this.selectedInnerIndex].sku.split('-', 3)
            this.productSKU = this.productVariantSKUSplit[0] + '-' + this.productVariantSKUSplit[1]

            this.dataForm.patchValue(this.dataList[this.selectedIndex].variants[this.selectedInnerIndex])
            this.dataForm.controls.id.setValue(this.dataList[this.selectedIndex].variants[this.selectedInnerIndex].id)
            this.dataForm.controls.sku.setValue(this.productVariantSKUSplit[2])
            this.modalTitle = 'Edit Variant'
        }
        this.modalRef = this.ms.show(
            variantModal,
            {
                class: 'modal-lg modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )

        this.colorPicker = iro.ColorPicker('#picker', {
            width: 200,
            color: '#66f7ff'
        })
        this.colorPicker.on('color:change', (color) => {
            this.dataForm.get('color_code').setValue(color.hexString)
        })
    }

    statusConfirmingModal(changeStatus: TemplateRef<any>, id: number, i: number, j: number, status: string) {
        this.selectedId = id
        this.selectedIndex = i
        this.selectedInnerIndex = j
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

    padLeadingZeros(num, size) {
        let s = num + ''
        while (s.length < size) s = '0' + s
        return s
    }

    save(data: any, f: any) {
        this.Loading = true
        if (this.dataForm.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.Loading = false

            return false
        }
        const params = {
            // product_id: this.ds.productId,
            size: this.dataForm.value.size,
            sku: this.dataForm.value.sku,
            price: this.dataForm.value.price,
            additional_price: this.dataForm.value.additional_price,
            description: this.dataForm.value.description,
            color_code: this.dataForm.value.color_code
        }
        params.sku = this.productSKU + '-' + this.dataForm.value.sku

        let paramsToSend = {}

        let saveUpdate = this.ds.addVariant(params)
        if (this.dataForm.value.id !== null) {
            // delete params.product_id
            paramsToSend = { ...params, id: this.dataForm.value.id }
            saveUpdate = this.ds.updateVariant(paramsToSend)
            this.selectedId = -1
        }
        saveUpdate.subscribe((resp: any) => {
            this.Loading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.Loading = false

                return false
            } else {
                if (this.dataForm.value.id !== null) {
                    this.alert.success('Changes done successfully!!')
                    this.dataList[this.selectedIndex].variants[this.selectedInnerIndex] = resp.data
                    this.dataForm.controls.id.setValue(null)

                } else {
                    // params.id = resp.data.id
                    this.alert.success('Added successfully!!')
                    this.dataList.push(resp.data)

                    // this.dataList.push(params)
                }
            }
            this.modalRef.hide()
            f.resetForm()
        })
    }

    confirmingModalForDuplicate(template: TemplateRef<any>, id: any, i: any) {
        this.selectedId = id
        this.selectedIndex = i
        this.modalRef = this.ms.show(template, { class: 'modal-md admin-panel' })
    }
    duplicateBaseProduct() {
        this.loginLoading = true
        const params = {
            id: this.selectedId
        }
        this.ds.duplicateBaseProduct(params).subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.modalRef.hide()
                this.loginLoading = false

                return false
            } else {
                this.dataList.unshift(resp.data)
                this.modalRef.hide()
                this.alert.success('Blank product duplicated successfully!!')
                this.selectedIndex = -1
            }
            this.modalRef.hide()
        })
    }

    delete() {
        this.loginLoading = true
        const params = {
            id: this.selectedId
        }
        this.ds.delete(params).subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === true) {
                const deletingIndex = this.dataList.findIndex((d: any) => {
                    return d.id === this.selectedId
                })
                this.dataList.splice(deletingIndex, 1)
                this.modalRef.hide()
                this.alert.success('Deleted successfully!!')
                this.selectedIndex = -1
            } else {
                this.alert.error(resp.errors.general)
                this.modalRef.hide()
                this.loginLoading = false

                return false
            }
            this.modalRef.hide()
        })
    }

    confirmingModal(template: TemplateRef<any>, id: any, i: any) {
        this.selectedId = id
        this.selectedIndex = i
        this.modalRef = this.ms.show(template, { class: 'modal-sm admin-panel' })
    }

    changeStatusAct() {
        this.loginLoading = true
        const params = {
            id: this.selectedId,
        }
        this.ds.changeStatusActive(params).subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.loginLoading = false

                return false
            } else {
                this.dataList[this.selectedIndex].variants[this.selectedInnerIndex].status = this.selectedStatus
                this.alert.success(`Status changed to ${this.selectedStatus}`)
                this.modalRef.hide()
            }
        })
    }

    changeStatusInact() {
        this.loginLoading = true
        const params = {
            id: this.selectedId
        }
        this.ds.changeStatusInactive(params).subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.loginLoading = false

                return false
            } else {
                this.dataList[this.selectedIndex].variants[this.selectedInnerIndex].status = this.selectedStatus
                this.alert.success(`Status changed to ${this.selectedStatus}`)
                this.modalRef.hide()
            }
        })
    }

    cancelButton(f: any) {
        f.resetForm()
        this.modalRef.hide()
        this.selectedIndex = -1
    }

    searchKeywordChange(value: string) {
        this.searchKeyword$.next(value)
    }

    getSerialNumber(i: number) {
        return ((this.pagination.current_page - 1) * this.pagination.per_page) + i + 1
    }

    baseProdStatusConfirmingModal(changeStatus: TemplateRef<any>, id: number, index: number, status: string) {
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

    baseProdChangeStatusAct() {
        this.loginLoading = true
        const params = {
            id: this.selectedId
        }
        this.ds.baseProdChangeStatusActive(params).subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.loginLoading = false

                return false
            } else {
                this.dataList[this.selectedIndex].status = this.selectedStatus
                this.alert.success(`Status changed to ${this.selectedStatus}`)
                this.modalRef.hide()
            }
        })
    }

    baseProdChangeStatusInact() {
        this.loginLoading = true
        const params = {
            id: this.selectedId
        }
        this.ds.baseProdChangeStatusInactive(params).subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.loginLoading = false

                return false
            } else {
                this.dataList[this.selectedIndex].status = this.selectedStatus
                this.alert.success(`Status changed to ${this.selectedStatus}`)
                this.modalRef.hide()
            }
        })
    }

    selectAllProducts() {
        if (this.selectedDataList.length === this.dataList.length) {
            this.selectedDataList = []
            this.allSelector = false
        } else {
            this.selectedDataList = [...this.dataList]
            this.allSelector = true
        }
    }
}
