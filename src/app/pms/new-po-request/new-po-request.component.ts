import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { ApiService } from 'src/app/services/api.service'
import {
    FormGroup,
    FormBuilder,
    FormControl,
    FormArray,
    Validators,
} from '@angular/forms'
import { BsModalService } from 'ngx-bootstrap/modal'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ActivatedRoute, Router } from '@angular/router'
import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core'
import { DataService } from './data.service'
import * as moment from 'moment'
import { Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'

@Component({
    selector: 'app-new-po-request',
    templateUrl: './new-po-request.component.html',
    styleUrls: ['./new-po-request.component.css'],
})
export class NewPoRequestComponent implements OnInit, OnDestroy {
    productId: any
    PoItemForm: FormGroup
    loading = false;
    dataStatus = 'fetching'
    dataStatusInner = 'fetching'
    productDetail: any
    variantList: any
    selectedVariant: any
    supplierId = null
    productList
    unitList: any
    supplierList
    modalTitle: any
    modalRef: any
    removedVariantList = []
    addVariantList = []
    selectedId: any
    selectedIndex = -1
    breadCrum = [
        {
            link: '',
            value: 'Purchase Order',
        },
    ];
    loaderOptions = {
        rows: 5,
        cols: 4,
        colSpans: {
            0: 1,
        },
    };
    filters = {
        orderBy: '',
        order: '',
        perPage: 15,
    };
    placeholder = 'Enter the Country Name'
    keyword = 'full_name'
    pagination: any = []
    page = 1
    searchKeyword = ''
    searchKeyword$: Subject<string> = new Subject<string>()
    searchKeywordSub: any

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private ds: DataService,
        private alert: IAlertService,
        private ms: BsModalService,
        public api: ApiService,
        public ui: UIHelpers
    ) {
        // this.productId = this.route.snapshot.queryParamMap.get('id')

        this.PoItemForm = this.fb.group({
            po_no: new FormControl(null),
            purchase_date: new FormControl(null, [Validators.required]),
            purchaser_notes: new FormControl(null),
            poItems: this.fb.array([]),
        })

        this.dataStatus = 'done'
        this.ds.supplierList().subscribe((resp) => {
            if (resp.success == true) {
                this.supplierList = resp.data
            }
        })

        this.ds.unitList(this.productId).subscribe((resp) => {
            if (resp.success === true) {
                this.unitList = resp.data
            } else {
                this.alert.error(resp.errors.general)
            }
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
    }

    ngOnInit() { }

    ngOnDestroy(): void {
        this.searchKeywordSub.unsubscribe()
    }

    get g() {
        return this.PoItemForm.controls
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

    getList() {
        const params = {
            page: this.page,
            keyword: this.searchKeyword,
            order_by: this.filters.orderBy,
            order: this.filters.order,
            per_page: this.filters.perPage,
            supplier_id: this.supplierId,
        }

        const list = this.ds.productList(params)
        list.subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
            } else {
                this.productList = resp.data.data
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
            supplier_id: this.supplierId,
        }
        this.router.navigate(['/user/new-po-request'], {
            queryParams: filtersParam,
            replaceUrl: true,
        })
    }

    searchKeywordChange(value: string) {
        this.searchKeyword$.next(value)
    }

    selectEvent(item) {
        this.supplierId = item.id
        this.changeSupplier()
        // do something with selected item
    }

    onChangeSearch(val: string) {
        // fetch remote data from here
        // And reassign the 'data' which is binded to 'data' property.
    }

    onFocused(e) {
        // do something when input is focused
    }

    showVariant(id, i: any) {
        if (!this.productList[i].hasOwnProperty('variants')) {
            this.dataStatusInner = 'fetching'
            this.productList[i].collapse = true
            this.ds.variantList({ id }).subscribe((resp: any) => {
                if (resp.success === false) {
                    this.alert.error(resp.errors.general)
                    this.productList[i].collapse =
                        !this.productList[i].collapse
                } else {
                    this.productList[i].variants = resp.data
                    this.dataStatusInner = 'done'
                }
            })
        } else {
            this.productList[i].collapse = !this.productList[i].collapse
        }
    }
    changeSupplier() {
        this.removedVariantList = []
        while (this.poItems.length !== 0) {
            this.poItems.removeAt(0)
        }

        if (this.supplierId !== 'null') {
            this.ds
                .productList({ supplier_id: this.supplierId })
                .subscribe((resp) => {
                    if (resp.success == true) {
                        this.productList = resp.data
                    }
                })
        }
    }

    openModal(formModal) {
        if (this.supplierId === 'null' || this.supplierId === null) {
            this.alert.error('Plese select supplier')
            return false
        }
        this.modalTitle = 'Add Variant to PO'

        this.modalRef = this.ms.show(formModal, {
            class: 'modal-lg modal-dialog admin-panel',
            backdrop: 'static',
            ignoreBackdropClick: true,
            keyboard: false,
        })
    }
    confirmingModal(template: TemplateRef<any>, id: any, i: any) {
        this.selectedId = id.value.base_product_variant_id
        this.selectedIndex = i
        this.modalRef = this.ms.show(template, {
            class: 'modal-sm admin-panel',
        })
    }

    cancelButton(f: any) {
        f.resetForm()
        this.modalRef.hide()
        this.selectedIndex = -1
    }

    addVariant(pId, pIndex, variant, id, j) {
        this.poItems.push(
            this.fb.group({
                quantity: new FormControl(null, [Validators.required]),
                unit_id: new FormControl(null, [Validators.required]),
                cost_price: new FormControl(null, [Validators.required]),
                tp: new FormControl(null, [Validators.required]),
                rrp: new FormControl(null, [Validators.required]),
                base_product_id: pId,
                base_product_variant_id: id,
            })
        )
        this.removedVariantList.push(variant)
        this.productList[pIndex].variants.splice(j, 1)
    }

    get poItems() {
        return this.PoItemForm.get('poItems') as FormArray
    }

    saveForm(data, f) {
        this.loading = true
        if (data.status === 'INVALID') {
            this.alert.error('Please fill-in valid data and try again.')
            this.loading = false

            return false
        }

        if (data.value.poItems.length == 0) {
            this.alert.error('Please select items first.')
            this.loading = false

            return false
        }

        const params = {
            purchaser_notes: data.value.purchaser_notes,
            purchase_date: moment(data.value.purchase_date).format(
                'YYYY-MM-DD'
            ),
            items: data.value.poItems,
            po_no: data.value.po_no,
            supplier_id: this.supplierId,
        }
        this.ds.savePoRequest(params).subscribe((resp) => {
            this.loading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.loading = false
                return false
            } else {
                this.alert.success(
                    'Your request has been send successfully for approval'
                )
                if (this.api.checkRole()) {
                    this.router.navigate(['/user/pending-po-request'])
                } else {
                    this.router.navigate(['/user/my-pending-po-request'])
                }
            }
            f.resetForm()
        })
    }

    delete(id: any) {
        this.selectedId = id.value.base_product_variant_id

        const rIndex = this.removedVariantList.findIndex(
            (e) => e.id == this.selectedId
        )
        const pIndex = this.productList.findIndex(
            (r) => r.id == id.value.base_product_id
        )
        this.productList[pIndex].variants.push(this.removedVariantList[rIndex])
        this.poItems.removeAt(this.selectedIndex)
        this.removedVariantList.splice(rIndex, 1)
    }
}
