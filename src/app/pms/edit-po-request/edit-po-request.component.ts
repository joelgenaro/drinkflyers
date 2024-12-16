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
import { ActivatedRoute } from '@angular/router'
import { Component, OnInit, TemplateRef, OnDestroy } from '@angular/core'
import { DataService } from './data.service'
import { Subject } from 'rxjs'
import * as moment from 'moment'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'

@Component({
    selector: 'app-edit-po-request',
    templateUrl: './edit-po-request.component.html',
    styleUrls: ['./edit-po-request.component.css'],
})
export class EditPoRequestComponent implements OnInit, OnDestroy {
    productId: any
    moment = moment
    PoItemForm: FormGroup
    loading = false
    dataStatus = 'fetching'
    dataStatusInner = 'fetching'
    productDetail: any
    variants
    variantId
    variantList: any
    selectedVariants = []
    request_id
    selectedBaseProductId
    selectedBaseVariantId
    productList
    unitList: any
    ListdataStatus = 'fetching'
    modalTitle: any
    modalRef: any
    removedVariantList = []
    selectedId: any
    supplierId
    selectedIndex = -1
    pagination: any = []
    page = 1
    perPage = 5
    searchKeyword = ''
    searchKeyword$: Subject<string> = new Subject<string>()
    searchKeywordSub: any
    breadCrum = [
        {
            link: '',
            value: 'update purchase order',
        },
    ]
    loaderOptions = {
        rows: 5,
        cols: 4,
        colSpans: {
            0: 1,
        },
    }

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private ds: DataService,
        private alert: IAlertService,
        private ms: BsModalService,
        public api: ApiService,
        public ui: UIHelpers
    ) {
        this.request_id = this.route.snapshot.queryParamMap.get('request_id')

        this.ds.poRequestDetail({ id: this.request_id }).subscribe((resp) => {
            if (resp.success == true && resp.data != null) {
                this.supplierId = resp.data.supplier_id
                this.PoItemForm.patchValue(resp.data)
                this.PoItemForm.patchValue({
                    purchase_date: moment(resp.data.purchase_date).format(
                        'MMMM Do YYYY'
                    ),
                })

                if (resp.data.po_request_items != null) {
                    let pVari
                    resp.data.po_request_items.forEach((r, i) => {
                        //this.selectedVariants.push(r.base_product_variant_id)
                        this.addVariant(r, pVari, -1, -1)
                    })
                }
            }

            this.ds.unitList().subscribe((resp) => {
                if (resp.success === true) {
                    this.unitList = resp.data
                } else {
                    this.alert.error(resp.errors.general)
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
                this.getModalList()
            })
    }

    ngOnInit() {
        this.PoItemForm = this.fb.group({
            id: new FormControl(null),
            po_no: new FormControl(null, [Validators.required]),
            purchaser_notes: new FormControl(null, [Validators.required]),
            purchase_date: new FormControl(null, [Validators.required]),
            poItems: this.fb.array([]),
        })
    }

    ngOnDestroy(): void {
        this.searchKeywordSub.unsubscribe()
    }

    get g() {
        return this.PoItemForm.controls
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
                    this.poItems.controls.forEach((r) => {
                        if (id === r.value.base_product_id) {
                            let index = resp.data.findIndex(
                                (e) => e.id == r.value.base_product_variant_id
                            )
                            if (index > -1) {
                                resp.data.splice(index, 1)
                            }
                        }
                    })

                    this.productList[i].variants = resp.data
                    this.dataStatusInner = 'done'
                }
            })
        } else {
            this.productList[i].collapse = !this.productList[i].collapse
        }
    }

    openModal(formModal) {
        this.getModalList()

        this.modalTitle = 'Add Variant to PO'
        this.modalRef = this.ms.show(formModal, {
            class: 'modal-lg modal-dialog admin-panel',
            backdrop: 'static',
            ignoreBackdropClick: true,
            keyboard: false,
        })
    }

    getModalList() {
        const params = {
            supplier_id: this.supplierId,
            page: this.page,
            per_page: this.perPage,
            keyword: this.searchKeyword,
        }
        if (this.supplierId !== 'null') {
            this.ds.productList(params).subscribe((resp) => {
                this.dataStatus = 'done'
                if (resp.success == true) {
                    this.productList = resp.data.data
                    this.pagination = resp.data
                }
            })
        }
    }

    selectPerPage(e: any) {
        this.perPage = e.target.value
        this.page = 1

        this.getModalList()
    }

    setPagination(page: number) {
        this.page = page
        this.getModalList()
    }

    confirmingModal(template: TemplateRef<any>, item: any, i: any) {
        this.selectedBaseProductId =
            this.poItems.controls[i].value.base_product_id
        this.selectedBaseVariantId =
            this.poItems.controls[i].value.base_product_variant_id
        this.selectedIndex = i
        this.variantId = this.poItems.controls[i].value.base_product_variant_id
        this.modalRef = this.ms.show(template, {
            class: 'modal-sm admin-panel',
        })
    }

    cancelButton(f: any) {
        f.resetForm()
        this.modalRef.hide()
        this.selectedIndex = -1
    }

    addVariant(r, variant, pIndex, vIndex) {
        this.productId =
            variant != null ? variant.base_product_id : r.base_product_id
        const fg = this.fb.group({
            id: new FormControl(null),
            quantity: new FormControl(null, [Validators.required]),
            unit_id: new FormControl(null, [Validators.required]),
            cost_price: new FormControl(null, [Validators.required]),
            tp: new FormControl(null, [Validators.required]),
            rrp: new FormControl(null, [Validators.required]),
            base_product_id: this.productId,
            base_product_variant_id: new FormControl(null),
            po_request_id: this.request_id,
        })
        if (variant) {
            this.productList[pIndex].variants.splice(vIndex, 1)

            // const vIndex = this.selectedVariants.findIndex(v =>v == variant.id)
            // if (vIndex > -1) {
            //     this.alert.error('This item is already in your List.')
            //     return false
            // } else {
            //     this.selectedVariants.push(variant.id)
            // }
            fg.patchValue({ base_product_variant_id: variant.id })
        }
        fg.patchValue(r)
        this.poItems.push(fg)
    }
    searchKeywordChange(value: string) {
        this.searchKeyword$.next(value)
    }

    get poItems() {
        return this.PoItemForm.get('poItems') as FormArray
    }

    saveForm(data, f) {
        this.loading = true
        if (data.status === 'INVALID') {
            this.alert.error('Please fill valid data and try again.')
            this.loading = false

            return false
        }

        if (data.value.poItems.length == 0) {
            this.alert.error('Please select items first.')
            this.loading = false

            return false
        }

        const params = {
            id: data.value.id,
            purchaser_notes: data.value.purchaser_notes,
            purchase_date: moment(data.value.purchase_date, 'MMMM Do YYYY')
                .format('YYYY-MM-DD')
                .toString(),
            items: data.value.poItems,
        }
        this.ds.savePoRequest(params).subscribe((resp) => {
            this.loading = false
            if (resp.success === true) {
                this.alert.success('Added successfully!!')
            } else {
                this.alert.error(resp.errors.general)
            }
        })
    }

    delete() {
        this.loading = true
        this.ds
            .deleteItem({
                base_product_id: this.selectedBaseProductId,
                base_product_variant_id: this.selectedBaseVariantId,
            })
            .subscribe((resp) => {
                if (resp.success === true) {
                    this.poItems.removeAt(this.selectedIndex)
                    this.alert.success('Item deleted successfully!!')
                }
                this.loading = false
                this.modalRef.hide()
            })
    }
}
