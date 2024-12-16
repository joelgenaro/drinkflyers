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
import { debounceTime, dematerialize, distinctUntilChanged } from 'rxjs/operators'

@Component({
    selector: 'app-product-data',
    templateUrl: './product-data.component.html',
    styleUrls: ['./product-data.component.scss'],
})
export class ProductDataComponent implements OnInit {
    variantFactors: any = []
    tradePrice: any = []
    activeTab = 'trade'
    productData: any = []
    dataForm: FormGroup
    Loading = false
    dataStatus = 'fetching'
    dataList: any = []
    selectedIndex = -1
    modalRef: BsModalRef
    selectedId: any
    modalTitle: any = ''
    colorPicker: any
    copyRow: any
    quantityCheck: boolean = false
    pagination: any = []
    page = 1
    prodId = -1
    searchKeyword: string = ''
    searchKeyword$: Subject<string> = new Subject<string>()
    searchKeywordSub: any
    loaderOptions = {
        rows: 5,
        cols: 7,
        colSpans: {
            0: 1,
        },
    }
    filters = {
        orderBy: '',
        order: '',
        perPage: 15,
    }
    productSKU: any
    productVariantSKUSplit: any
    productDetail: any = []
    fetchProduct = false
    clientsList: any = []
    currencyList: any = []
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
        this.prodId = +this.route.snapshot.queryParamMap.get('prod_id')
        if (this.prodId > 0) {
            this.getProductData()
        }
        this.dataForm = this.fb.group({
            id: new FormControl(null),
            title: new FormControl(null, [Validators.required]), // new
            option_name: new FormControl(null), // new
            option_value: new FormControl(null), // new
            size: new FormControl(null),
            sku: new FormControl(null, [Validators.required]),
            cp: new FormControl(null),
            tp: new FormControl(null, [Validators.required]),
            rrp: new FormControl(null, [Validators.required]),
            description: new FormControl(null, [Validators.maxLength(1000)]),
            color_code: new FormControl('#000000'),
            color_name: new FormControl(null), // new
            weight: new FormControl(null, [Validators.required]),
            hs_code: new FormControl(null, [Validators.required]),
            taxable_info: new FormControl(null, [Validators.required]),
            width: new FormControl(null, [Validators.required]),
            height: new FormControl(null, [Validators.required]),
            depth: new FormControl(null, [Validators.required]),
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

        // this.changeColor(this.colorPicker)
    }

    getClients() {
        const list = this.ds.getClients()
        list.subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
            } else {
                this.clientsList = resp.data
            }
        })
    }
    getCurrency() {
        const list = this.ds.getCurrencies()
        list.subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
            } else {
                this.currencyList = resp.data
            }
        })
    }

    getProductData() {
        this.getClients()
        this.getCurrency()
        const params = {
            id: this.prodId
        }
        const list = this.ds.getSimpleVariantDetail(params)
        list.subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
            } else {
                this.productData = resp.data
                this.productVariantSKUSplit = this.productData.sku.split(
                    '_'
                )
                let i = 0
                let skuVal: any = ''
                this.productVariantSKUSplit.forEach(element => {
                    if (i > 0) {
                        if (skuVal == '') {
                            skuVal = element
                        } else {
                            skuVal = skuVal + '_' + element
                        }
                    }
                    i++
                })
                this.dataForm.patchValue(this.productData)

                if (this.productData.color_code === null || this.productData.color_code === '') {
                    this.dataForm.controls.color_code.setValue('#000000')
                }
                this.dataForm.controls.id.setValue(this.productData.id)
                this.dataForm.controls.sku.setValue(skuVal)
                this.tradePrice = this.productData.variant_prices
                this.variantFactors = this.productData.variant_factors
                console.log('sdfsdfsdfsdf', this.variantFactors)
            }
        })

    }
    ngOnDestroy(): void {

    }

    ngOnInit() {
        this.getProductDetail()
        this.colorPicker = iro.ColorPicker('#picker', {
            width: 45,
            color: '#66f7ff',
        })
        this.colorPicker.on(['color:init', 'color:change'], (color) => {
            this.dataForm.get('color_code').setValue(color.hexString)
        })
        this.dataForm.get('color_code').valueChanges.subscribe((value) => {
            if (value !== null && value.length === 7) {
                // this.colorPicker.color.hexString = value
                this.colorPicker = value
                this.colorPicker = value
            }
        })
    }

    get g() {
        return this.dataForm.controls
    }







    padLeadingZeros(num, size) {
        let s = num + ''
        while (s.length < size) s = '0' + s
        return s
    }

    save(data: any, f: any) {
        this.Loading = true
        if (this.dataForm.status === 'INVALID') {
            this.alert.error(
                'Please fill-in valid data in all fields & try again.'
            )
            this.Loading = false

            return false
        }


        const params = {
            base_product_id: this.ds.productId,
            size: this.dataForm.value.size,
            sku: this.dataForm.value.sku,
            cp: this.dataForm.value.cp,
            tp: this.dataForm.value.tp,
            rrp: this.dataForm.value.rrp,
            description: this.dataForm.value.description,
            color_code: this.dataForm.value.color_code,
            color_name: this.dataForm.value.color_name,
            title: this.dataForm.value.title,
            option_name: this.dataForm.value.option_name,
            option_value: this.dataForm.value.option_value,
            weight: this.dataForm.value.weight,
            hs_code: this.dataForm.value.hs_code,
            taxable_info: this.dataForm.value.taxable_info,
            width: this.dataForm.value.width,
            height: this.dataForm.value.height,
            depth: this.dataForm.value.depth,
        }

        // if (this.dataForm.value.sku?.indexOf('-') > -1) {
        //     this.alert.error('SKU must not have any hyphens (-).')
        //     this.Loading = false

        //     return false
        // }

        if (this.dataForm.value.sku === null) {
            params.sku = this.productSKU + '_'
        } else {
            params.sku =
                this.productSKU + '_' +
                this.dataForm.value.sku
        }
        let paramsToSend = {}
        let saveUpdate = this.ds.addVariant(params)
        if (this.dataForm.value.id !== null) {
            // delete params.base_product_id
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
                    this.getProductData()
                    let filtersParam = {
                        id: this.ds.productId,
                        prod_id: this.prodId,
                    }
                    this.router.navigate(['/user/base-product/product-data'], {
                        queryParams: filtersParam,
                        replaceUrl: true,
                    })
                } else {
                    this.prodId = resp.data.id
                    let filtersParam: any = {}

                    filtersParam = {
                        id: this.ds.productId,
                        prod_id: this.prodId,
                    }
                    this.getProductData()
                    this.router.navigate(['/user/base-product/product-data'], {
                        queryParams: filtersParam,
                        replaceUrl: true,
                    })
                    this.alert.success('Added successfully!!')

                }
            }
        })
    }

    confirmingModal(template: TemplateRef<any>, id: any, i: any) {
        this.selectedId = id
        this.selectedIndex = i
        this.modalRef = this.ms.show(template, {
            class: 'modal-sm admin-panel',
        })
    }

    cancelButton(f: any) {
        f.resetForm()
        this.modalRef.hide()
        this.selectedIndex = -1
        this.quantityCheck = false
    }
    getProductDetail() {
        const params = {
            id: this.ds.productId,
        }
        this.ds.productDetail(params).subscribe((resp: any) => {

            if (resp.success === true) {
                this.productDetail = resp.data
                this.fetchProduct = true
                this.ds.productDetails = this.productDetail
                // console.log('this.productDetail', this.productDetail)
            }

            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                return false
            }
        })
    }
    openTabs(evt, cityName) {
        if (evt == '') {
            document.getElementById("defaultOpen").click()
        }
        let i: any
        let tabcontent: any
        let tablinks: any
        tabcontent = document.getElementsByClassName("tabcontent")
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none"
        }
        tablinks = document.getElementsByClassName("tablinks")
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "")
        }
        document.getElementById(cityName).style.display = "block"
        evt.currentTarget.className += " active"
    }
    setTradePrice() {
        const params = {
            id: 0,
            rrp: this.productData.rrp,
            tp: this.productData.tp,
            base_product_variant_id: this.prodId,
            quantity: 1,
            client_id: null,
            currency_id: null
        }
        this.tradePrice.push(params)
    }
    saveTradePrice(d, tp) {
        let params
        if (d.id === 0) {
            params = {
                rrp: d.rrp,
                tp: d.tp,
                base_product_variant_id: d.base_product_variant_id,
                quantity: d.quantity,
                client_id: d.client_id,
                currency_id: d.currency_id
            }
            this.ds.addTradePrice(params).subscribe((resp: any) => {
                if (resp.success === false) {
                    this.alert.error(resp.errors.general)
                    this.Loading = false

                    return false
                } else {
                    this.tradePrice[tp].id = resp.data.id
                    this.alert.success('Trade price added successfully!!')
                }
            })


        } else {
            params = {
                id: d.id,
                rrp: d.rrp,
                tp: d.tp,
                base_product_variant_id: d.base_product_variant_id,
                quantity: d.quantity,
                client_id: d.client_id,
                currency_id: d.currency_id
            }

            this.ds.updateTradePrice(params).subscribe((resp: any) => {
                if (resp.success === false) {
                    this.alert.error(resp.errors.general)
                    this.Loading = false

                    return false
                } else {
                    this.alert.success('Trade price updated successfully!!')
                }
            })


        }
    }

    deleteTradePrice() {
        this.Loading = true
        if (this.selectedId == 0) {
            const deletingIndex = this.tradePrice.findIndex((d: any) => {
                return d.id === this.selectedId
            })
            this.tradePrice.splice(deletingIndex, 1)
            this.modalRef.hide()
            this.alert.success('Trade price deleted successfully!!')
            this.selectedIndex = -1
            this.Loading = false
            return
        }

        const params = {
            id: this.selectedId,
        }

        this.ds.deleteTradePrice(params).subscribe((resp: any) => {
            this.Loading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.modalRef.hide()
                this.Loading = false

                return false
            } else {
                const deletingIndex = this.tradePrice.findIndex((d: any) => {
                    return d.id === this.selectedId
                })
                this.tradePrice.splice(deletingIndex, 1)
                this.modalRef.hide()
                this.alert.success('Deleted successfully!!')
                this.selectedIndex = -1
            }
        })
    }

    savePrintArea(d, tp) {
        if (d.multiplier > 1) {
            this.alert.error(
                'Multiplier must be less than equal to 1'
            )
            return
        }
        const params = {
            id: d.id,
            multiplier: d.multiplier
        }

        this.ds.updateMultiplier(params).subscribe((resp: any) => {
            if (resp.success === false) {
                // this.alert.error(resp.errors.general)
                this.alert.error(
                    'Please fill-in valid data in all fields & try again.'
                )
                this.Loading = false

                return false
            } else {
                this.alert.success('Print area updated successfully!!')
            }
        })
    }
    changeMultiplier(val, data, index, type) {
        let newMultiple
        if (type == 'w') {
            newMultiple = (val.target.value / data.print_area.p_width)
        } else {
            newMultiple = (val.target.value / data.print_area.p_height)
        }

        this.variantFactors[index].multiplier = newMultiple.toFixed(2)
    }

}