import { Component, ElementRef, OnInit, ViewChild, OnDestroy, TemplateRef } from '@angular/core'
import {
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import * as moment from 'moment'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ApiService } from 'src/app/services/api.service'
import { DataService } from '../data.service'
import { Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'

@Component({
    selector: 'app-prices',
    templateUrl: './prices.component.html',
    styleUrls: ['./prices.component.css'],
})
export class PricesComponent implements OnInit, OnDestroy {
    dataList = []
    dataStatus = 'fetching'
    modalRef: BsModalRef
    actions: any = {
        aBy: 'increase',
        aCurrency: 'pound',
        aValue: 0
    }
    skuEdit = false
    priceLoading = false
    priceLoad = true
    productData: any = []
    baseProductId: any = ''
    selectedBaseProductId: any
    spinnerSVG = `/assets/images/rolling-gray.svg`
    productNewPrices: any = []
    productOldPrices: any = []
    constructor(
        public ds: DataService,
        public ms: BsModalService,
        private fb: FormBuilder,
        public ui: UIHelpers,
        public alert: IAlertService,
        private router: Router,
        private route: ActivatedRoute,
        private api: ApiService
    ) {
        this.priceLoading = true
        ds.activeTab = 'prices'
        this.api.isfullScreen = false
        this.ds.productId = this.route.snapshot.queryParamMap.get('id')
        this.ds.baseProductId = this.route.snapshot.queryParamMap.get('base_id')
        this.selectedBaseProductId = this.route.snapshot.queryParamMap.get('base_id')
        const params = {
            id: this.ds.productId,
        }
        this.ds.productDetail(params).subscribe((resp: any) => {
            if (resp.success === true) {
                this.productData = resp.data
                this.baseProductId = this.productData.base_product_id
                const priceParams = {
                    product_id: this.ds.productId,
                    base_product_id: this.baseProductId,
                    product_variant_data: []
                }
                this.ds.productPrices(priceParams).subscribe((resp: any) => {
                    if (resp.success === true) {

                        this.productNewPrices = resp.data.variants
                        this.ds.productPrices(priceParams).subscribe((resp: any) => {
                            if (resp.success === true) {

                                this.productOldPrices = resp.data.variants
                                this.priceLoading = false
                                this.priceLoad = false
                            }
                        })
                    }
                })
            }
        })
    }

    ngOnInit() {
        this.ds.activeTab = 'prices'
        this.api.isfullScreen = false
        this.getStores()
    }

    ngOnDestroy(): void {

    }
    calucateVales() {
        if (this.actions.aValue == null) {
            return
        }
        this.productNewPrices.forEach((element, index) => {

            if (this.actions.aCurrency == 'pound') {
                if (this.actions.aBy == 'increase') {
                    this.productNewPrices[index].rp = Number(this.productNewPrices[index].tp) + Number(this.actions.aValue)
                }
                if (this.actions.aBy == 'decrease') {
                    this.productNewPrices[index].rp = Number(this.productNewPrices[index].tp) - Number(this.actions.aValue)
                }
            }
            else if (this.actions.aCurrency == 'percent') {

                const percentVal = (Number(this.productNewPrices[index].tp) / 100) * Number(this.actions.aValue)
                if (this.actions.aBy == 'increase') {
                    this.productNewPrices[index].rp = Number(this.productNewPrices[index].tp) + percentVal
                }
                if (this.actions.aBy == 'decrease') {
                    this.productNewPrices[index].rp = Number(this.productNewPrices[index].tp) - percentVal
                }

            }
        });
    }
    resetPrices() {
        this.actions.aValue = 0
        this.actions.aCurrency = 'pound'
        this.actions.aBy = 'increase'
        this.productNewPrices = this.productOldPrices
        this.save()
    }
    save() {
        const varients: any = []
        const otherVarients: any = []
        this.priceLoading = true
        this.productNewPrices.forEach(element => {
            varients.push({ id: element.id, rp: element.rp, sku: element.sku })
            otherVarients.push(element.sku)
        });

        let uniqueVariants = []
        uniqueVariants = otherVarients.filter((elem, index, self) => {
            return index === self.indexOf(elem)
        })

        if (uniqueVariants.length !== varients.length) {
            this.alert.error('Sku already exists')
            this.priceLoading = false
            return
        }

        const params: any = {
            product_id: this.ds.productId,
            base_product_id: this.baseProductId,
            product_variant_data: varients
        }
        this.ds.productPrices(params).subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.priceLoading = false
                return false
            }
            if (resp.success === true) {
                this.actions.aValue = 0
                this.actions.aCurrency = 'pound'
                this.actions.aBy = 'increase'
                this.productNewPrices = resp.data.variants
                this.alert.success('Prices updated successfully')
                this.priceLoading = false
            }
        })
    }

    minMaxTrade(data) {
        let minValue: number
        let minNumbers = []
        let maxValue: number
        let maxNumbers = []

        if (data != undefined) {
            data.forEach(element => {
                minNumbers.push(+element.tp)
            })
            minValue = Math.min.apply(null, minNumbers)

            data.forEach(element => {
                maxNumbers.push(+element.tp)
            })
            maxValue = Math.max.apply(null, maxNumbers)
        } else {
            minValue = 0
            maxValue = 0
        }
        let values = ''
        if (minValue == maxValue) {
            values = '£' + minValue
        } else {
            values = '£' + minValue + '-£' + maxValue
        }
        return values
    }

    minMaxRetail(data) {
        let minValue: number
        let minNumbers = []
        let maxValue: number
        let maxNumbers = []

        if (data != undefined) {
            data.forEach(element => {
                minNumbers.push(+element.rp)
            })
            minValue = Math.min.apply(null, minNumbers)

            data.forEach(element => {
                maxNumbers.push(+element.rp)
            })
            maxValue = Math.max.apply(null, maxNumbers)
        } else {
            minValue = 0
            maxValue = 0
        }

        let values = ''
        if (minValue == maxValue) {
            values = '£' + minValue
        } else {
            values = '£' + minValue + '-£' + maxValue
        }

        return values
    }

    openModal(viewModal: TemplateRef<any>) {
        this.modalRef = this.ms.show(
            viewModal,
            {
                class: 'modal-lg modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
    }
    closeModal() {
        this.modalRef.hide()
    }
    getStores() {
        const list = this.ds.storeList()
        list.subscribe((resp: any) => {
            if (resp.success === true) {
                this.dataList = resp.data
                this.dataStatus = 'done'
            }
        })
    }

    publish(storeId) {
        const params = {
            store_id: storeId,
            productIds: [this.ds.productId],
            publish_status: 'Publish'
        }

        this.ds.publishProduct(params).subscribe((resp) => {
            if (resp.success === true) {
                this.alert.success('Product added successfully!!')
            } else {
                this.alert.error(resp.errors.general)
            }
        })
    }
    setSKU() {
        if (this.skuEdit) {
            this.skuEdit = false
        } else {
            this.skuEdit = true
        }
    }
}
