import { Component, OnInit } from '@angular/core'
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { timeInterval } from 'rxjs/operators'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ApiService } from 'src/app/services/api.service'
import { DataService } from '../data.service'

@Component({
    selector: 'app-add-discount-product',
    templateUrl: './add-discount-product.component.html',
    styleUrls: ['./add-discount-product.component.css'],
})
export class AddDiscountProductComponent implements OnInit {
    modalRef: BsModalRef
    employeeId = -1
    campaignId
    selectedIndex = -1
    selectedId = -1
    productId = -1
    employeeDetails: any
    dataForm: FormGroup
    permissionsList = []
    selectedProducts = []
    storeProducts = []
    dataStatus = 'fetching'
    baseDataStatus = 'fetching'
    Loading = false
    searchString: any
    loaderOptions = {
        rows: 5,
        cols: 4,
        colSpans: {
            0: 1,
        }
    }
    deleteLoading = false

    storeId
    types = ['percentage', 'absolute']

    constructor(
        private ds: DataService,
        public ms: BsModalService,
        private fb: FormBuilder,
        public ui: UIHelpers,
        private alert: IAlertService,
        private route: ActivatedRoute,
        public router: Router,
        public api: ApiService
    ) {
        this.ds.step = 'add-discount-product'
        this.route.queryParams.subscribe((params) => {
            if (params.id) {
                this.campaignId = params.id

            }

            if (params.store_id) {
                this.storeId = params.store_id
                this.ds.storeId = params.store_id

            }
        })

        this.ds.storeProducts({ store_id: this.storeId }).subscribe(resp => {
            if (resp.success == true) {
                console.log(resp.data)
                this.storeProducts = resp.data

            }

            this.ds.discountProduct({ discount_campaign_id: this.campaignId }).subscribe(presp => {
                if (presp.success == true) {
                    console.log(presp)
                    presp.data.forEach(e => {
                        e.state = false
                        this.addProduct(null, e)

                    })
                }
                this.baseDataStatus = 'done'
                this.dataStatus = 'done'
            })


        })


    }

    openModal(variantModal, index) {
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

    ngOnInit() {
        this.dataForm = this.fb.group({
            'products': this.fb.array([])
        })
    }

    get products() {
        return this.dataForm.get('products') as FormArray
    }


    addProduct(r, d) {
        console.log('row', r)
        console.log('db', d)

        if (r !== null && r !== 'null') {
            this.selectedProducts.push(r)
        }
        const fg = this.fb.group({
            discount: new FormControl(null, [Validators.required]),
            discount_type: new FormControl(null, [Validators.required]),
            state: true,
            id: null,
            name: r != null ? r.product.name : null,
            discount_campaign_id: +this.campaignId,
            product_id: r != null ? r.product_id : null,
        })

        fg.patchValue(d)


        if (d !== null && d !== 'null') {

            const vIndex = this.storeProducts.findIndex(c => c.product_id == d.product_id)
            const storeP = this.storeProducts.find(e => e.product_id == d.product_id)
            this.selectedProducts.push(storeP)
            console.log('p', storeP)
            console.log('addSP', this.selectedProducts)

            this.storeProducts.splice(vIndex, 1)
            fg.patchValue({ state: false })


        }
        const pId = r != null ? r.product_id : null
        this.products.push(fg)
        const index = this.storeProducts.findIndex(d => d.product_id == pId)
        if (index > -1) {

            this.storeProducts.splice(index, 1)
        }

    }

    save(i) {
        this.products.controls[i].value.state = true
    }
    edit(i) {
        if (this.products.controls[i].status == 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            return false
        }
        this.products.controls[i].value.state = false
    }


    confirmingModal(template, v: any, i: any) {
        console.log(v)

        this.selectedIndex = i
        this.selectedId = v.id
        this.productId = v.product_id
        this.modalRef = this.ms.show(template, { class: 'modal-sm admin-panel' })
    }


    delete() {
        this.deleteLoading = true
        console.log('selectedPr', this.selectedProducts)
        console.log('pid', this.productId)

        const pIndex = this.selectedProducts.findIndex(e => e.product_id == this.productId)
        const pRow = this.selectedProducts.find(e => e.product_id == this.productId)
        if (this.selectedId != null) {
            this.ds.deleteDiscountProduct({ id: this.selectedId }).subscribe(resp => {
                if (resp.success == true) {
                    this.storeProducts.push(pRow)
                    this.products.removeAt(this.selectedIndex)
                    this.selectedProducts.splice(pIndex)
                    this.deleteLoading = false
                    this.modalRef.hide()
                    this.alert.success('Deleted successfully!!')
                } else {
                    this.alert.error(resp.errors.general)
                }
            })

        } else {
            this.storeProducts.push(pRow)
            this.products.removeAt(this.selectedIndex)
            this.selectedProducts.splice(pIndex)
            this.deleteLoading = false
            this.modalRef.hide()
            this.alert.success('Deleted successfully!!')
        }

    }


    cancelButton(f: any) {
        //f.resetForm()
        this.modalRef.hide()
        this.selectedIndex = -1
    }

    saveForm(data, f) {
        this.Loading = true
        console.log(data.value.products)
        console.log(data)

        if (data.status == 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            return false
        }

        const params = {
            products: data.value.products
        }

        this.ds.addDiscountProducts(params).subscribe(resp => {
            if (resp.success == true) {
                this.alert.success('Added successfully!!')
            } else {
                this.alert.error(resp.errors.general)
            }
            this.Loading = false
        })
    }
}
