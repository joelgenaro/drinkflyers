import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { Component, OnInit, TemplateRef } from '@angular/core'
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
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
    deleteLoading = false
    deletingVariant
    dataStatus = 'fetching'
    baseDataStatus = 'fetching'
    dataList: any = []
    selectedIndex = -1
    modalRef: BsModalRef
    selectedId: any
    modalTitle: any = ''
    colorPicker: any
    selectedVariants = []
    profit
    searchKeyword: string = ''
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
        orderBy: '',
        order: ''
    }
    productSKU: any
    productVariantSKUSplit: any
    baseProductVariantList: any = []
    productDetail: any = []
    fetchProduct = false
    constructor(
        public ds: DataService,
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
        this.ds.baseProductId = this.route.snapshot.queryParamMap.get('base_id')

        this.ds.baseVariantList({ id: this.ds.baseProductId }).subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.baseDataStatus = 'done'
            } else {
                this.baseProductVariantList = resp.data
                this.baseDataStatus = 'done'
            }

            this.route.queryParams.subscribe(params => {
                if (params.keyword) {
                    this.searchKeyword = params.keyword
                }
                if (params.order_by) {
                    this.filters.orderBy = params.order_by
                }
                if (params.order) {
                    this.filters.order = params.order
                }
                if (params) {
                    this.getList()
                }
            })
        })


        this.searchKeywordSub = this.searchKeyword$.pipe(
            debounceTime(1000), // wait 1 sec after the last event before emitting last event
            distinctUntilChanged(), // only emit if value is different from previous value
        ).subscribe(searchKeyword => {
            // this.getList()
        })

        this.productSKU = this.ds.productSKU
        if (this.ds.productId > 0 && this.ds.productSKU === null) {
            this.ds.variantProductSKU().subscribe((resp: any) => {
                if (resp.success === false) {
                    this.alert.error(resp.errors.general)
                } else {
                    this.ds.productSKU = resp.data
                    this.productSKU = this.ds.productSKU
                }
            })
        }

    }

    ngOnDestroy(): void {
        this.searchKeywordSub.unsubscribe()
    }

    ngOnInit() {
        this.getProductDetail()
        this.dataForm = this.fb.group({
            id: new FormControl(null),
            variants: this.fb.array([])
        })
    }
    get variants() {
        return this.dataForm.get('variants') as FormArray
    }

    checkQty(e, v, i) {
        // const row = this.selectedVariants.find(r => r.id == v.value.base_product_variant_id)
        // if (e.target.value > row.quantity) {
        //     this.alert.error('Quantity should not greater than stock quantity.')
        //     this.variants.controls[i].patchValue({ quantity: 0 })
        // }
        this.variants.controls[i].value.state = true
    }
    changeRP(e, v, i) {
        const pr = e.target.value - v.value.tp
        const prp = ((pr) / (v.value.tp)) * 100
        if (v.value.tp > 0) {
            this.variants.controls[i].patchValue({ profit: (pr).toFixed(2) })
            this.variants.controls[i].patchValue({ profit_percentage: prp.toFixed(2) })
            this.variants.controls[i].value.state = true
        } else {
            this.variants.controls[i].patchValue({ profit: pr })
            this.variants.controls[i].patchValue({ profit_percentage: 0 })
            this.variants.controls[i].value.state = true
        }
    }

    changePP(e, v, i) {
        
        let rprice
        if (e.data !== null && e.data !== '') {
            rprice = (((e.target.value) / (100)) * v.value.tp) + (+v.value.tp)
        }

        const profitPrice = rprice - v.value.tp
        this.variants.controls[i].patchValue({ rp: rprice.toFixed(2) })
        this.variants.controls[i].patchValue({ profit: profitPrice.toFixed(2) })
        this.variants.controls[i].value.state = true
    }
    save(i) {
        this.variants.controls[i].value.state = true
    }
    edit(i) {
        if (this.variants.controls[i].status == 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            return false
        }
        this.variants.controls[i].value.state = false
    }

    addVariant(r, d) {
        // if (r.quantity === 0) {
        //     this.alert.error('Select product is not in stock.')
        //     return false
        // }
        this.selectedVariants.push(r)
        const fg = this.fb.group({
            //quantity: new FormControl(null, [Validators.required]),
            rp: new FormControl(null, [Validators.required]),
            rrp: r.rrp,
            base_product_variant_id: r.id,
            profit: null,
            state: true,
            profit_percentage: null,
            tp: r.tp,
            product_id: +this.ds.productId
        })

        fg.patchValue(d)


        if (d != 'null') {

            this.selectedVariants.push(d.base_product_variants)
            const vIndex = this.baseProductVariantList.findIndex(r => r.id == d.base_product_variants.id)
            this.baseProductVariantList.splice(vIndex, 1)

            const rp = d.rp
            const prp = ((rp - d.base_product_variants.tp) / (d.base_product_variants.tp)) * 100
            fg.patchValue({ profit: +(rp - d.base_product_variants.tp).toFixed(2) })
            fg.patchValue({ tp: d.base_product_variants.tp })
            fg.patchValue({ rrp: d.base_product_variants.rrp })
            fg.patchValue({ profit_percentage: +(prp).toFixed(2) })
            fg.patchValue({ state: false })
        }
        this.variants.push(fg)
        const index = this.baseProductVariantList.findIndex(d => d.id == r.id)
        if (index > -1) {

            this.baseProductVariantList.splice(index, 1)
        }
    }

    deleteVariant(v, i) {
        const row = this.selectedVariants.find(r => r.id == v.base_product_variant_id)
        this.baseProductVariantList.push(row)
        this.variants.removeAt(i)
    }

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

    getList() {
        const params = {
            id: this.ds.productId,
            keyword: this.searchKeyword,
            order_by: this.filters.orderBy,
            order: this.filters.order
        }
        if (this.ds.productId == -1) {
            this.dataStatus = 'done'

            return false
        } else {
            const list = this.ds.variantList(params)
            list.subscribe((resp: any) => {
                if (resp.success === false) {
                    this.alert.error(resp.errors.general)
                } else {
                    this.dataList = resp.data
                    this.dataStatus = 'done'

                    this.dataList.forEach(e => {
                        this.addVariant({}, e)
                    })
                }
            })
        }
    }

    openModal(variantModal, index) {
        this.modalTitle = 'Add Variant'
        this.modalRef = this.ms.show(
            variantModal,
            {
                class: 'modal-lg modal-dialog-centered admin-panel',
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

    saveForm(data: any, f: any) {
        this.Loading = true
        if (this.dataForm.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.Loading = false

            return false
        }

        const params = {
            variants: data.value.variants
        }


        this.ds.addVariant(params).subscribe(resp => {
            this.Loading = false
            if (resp.success == true) {
                this.alert.success('Variants added successfully!!')
            }
        })

    }

    delete() {
        this.deleteLoading = true
        const params = {
            product_id: this.deletingVariant.product_id,
            base_product_variant_id: this.deletingVariant.base_product_variant_id

        }
        this.ds.deleteVariant(params).subscribe((resp: any) => {
            this.deleteLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.modalRef.hide()
                this.deleteLoading = false

                return false
            } else {
                const deletingIndex = this.dataList.findIndex((d: any) => {
                    return d.id === this.selectedId
                })
                const row = this.selectedVariants.find(r => r.id == this.deletingVariant.base_product_variant_id)
                this.baseProductVariantList.push(row)
                this.variants.removeAt(this.selectedIndex)
                this.modalRef.hide()
                this.deleteLoading = false
                this.alert.success('Deleted successfully!!')
                this.selectedIndex = -1
            }
        })
    }

    confirmingModal(template: TemplateRef<any>, v: any, i: any) {
        this.deletingVariant = v
        this.selectedIndex = i
        this.modalRef = this.ms.show(template, { class: 'modal-sm admin-panel' })
    }

    cancelButton(f: any) {
        // f.resetForm()
        this.modalRef.hide()
        this.selectedIndex = -1
    }

    getProductDetail() {
        const params = {
            id: this.ds.productId,
        }
        this.ds.productDetail(params).subscribe((resp: any) => {

            if (resp.success === true) {
                this.productDetail = resp.data
                this.fetchProduct = true 
            }

            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                return false
            }
        })
    }
}
