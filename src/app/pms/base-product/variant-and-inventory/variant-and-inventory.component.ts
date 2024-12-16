import { ImageCroppedEvent } from 'ngx-image-cropper';
import { element } from 'protractor';
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
import { CommaSeparationPipe } from 'src/app/pipes/commaSeparation.pipe';
import { keyframes } from '@angular/animations';


@Component({
    selector: 'app-variant-and-inventory',
    templateUrl: './variant-and-inventory.component.html',
    styleUrls: ['./variant-and-inventory.component.scss'],
})
export class VariantAndInventoryComponent implements OnInit {
    color = ''
    selectedVarientkeyIndex: any = -1
    variantData: any = []
    loadVariant = false
    baseVariants: any = []
    baseVariantsValues: any = []
    variantName: any = ''
    variantId: any = ''
    variantKey: any = ''
    tempValue = ''
    variations: any = []
    varientsKeys: any = []
    baseVarientOptions: any = []
    activeTab = 'trade'
    clientsList: any = []
    currencyList: any = []
    variantFactors: any = []
    tradePrice: any = []
    dataForm: FormGroup
    dataFormVariant: FormGroup
    Loading = false
    saveVariantRecord = false
    dataStatus = 'fetching'
    dataList: any = []
    selectedIndex = -1
    modalRef: BsModalRef
    modalVariantRef: BsModalRef
    selectedId: any
    modalTitle: any = ''
    colorPicker: any
    copyRow: any
    quantityCheck: boolean = false
    pagination: any = []
    page = 1
    searchKeyword: string = ''
    searchKeyword$: Subject<string> = new Subject<string>()
    searchKeywordSub: any
    variantOptions: Array<
        {
            id: number, // 1, 2, 3, 
            title: string //color, size, fabric
            show: boolean,
            values: Array<{
                id: number,
                frontId: number,
                name: string // Small, medium, Large, Red, Green, Blue
                placeHolder?: string
            }>
        }
    > = []

    variants: {
        [key: string]: {
            id: number,
            name: string,
            //variantOptionValueId: Array<number>,
            tradePrice?: number,
            sku?: string,
            deleted?: boolean,
            save?: boolean
        }
    } = {}

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

    getOptionValueId(variantOptionsIndex: number) {
        let id: number, index: number
        do {
            id = new Date().getUTCMilliseconds() + +(Math.random().toString().substr(2, 10))
            index = -1
            this.variantOptions.forEach((variantOption: any, variantOptionIndex: any) => {
                index = variantOption.values.findIndex((d: any) => d.frontId == id)

                if (index > -1) {
                    return
                }
            })
        } while (index > -1)
        // console.log('returning', id)
        return id
    }

    productSKU: any
    productVariantSKUSplit: any
    productDetail: any = []
    varientsOptions: any = []
    fetchProduct = false
    productData: any = []
    prodId: any
    showVarients = false
    totalVarients = 0
    thumbnail = ''
    imageChangedEvent: any = ''
    croppedImage: any = ''
    cropperModalRef: BsModalRef
    colorName = ''
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
        this.dataFormVariant = this.fb.group({
            id: new FormControl(null),
            sku: new FormControl(null, [Validators.required]),
            tp: new FormControl(null, [Validators.required]),
            rrp: new FormControl(null, [Validators.required]),
            color_code: new FormControl('#ffffff'),
            color_name: new FormControl(),
            hs_code: new FormControl(null, [Validators.required]),
            taxable_info: new FormControl(null, [Validators.required]),
            width: new FormControl(null, [Validators.required]),
            weight: new FormControl(null, [Validators.required]),
            height: new FormControl(null, [Validators.required]),
            depth: new FormControl(null, [Validators.required]),

        })
        this.dataForm = this.fb.group({
            id: new FormControl(null),
            title: new FormControl(null, []), // new
            option_name: new FormControl(null), // new
            option_value: new FormControl(null), // new
            size: new FormControl(null),
            sku: new FormControl(null, []),
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

    ngOnDestroy(): void {
        this.searchKeywordSub.unsubscribe()
    }

    ngOnInit() {
        this.varientOptions()
        this.getProductDetail()
        this.dataForm.get('color_code').valueChanges.subscribe((value) => {
            if (value !== null && value.length === 7) {
                // this.colorPicker.color.hexString = value
                this.colorPicker = value
                this.colorPicker = value
            }
        })
    }

    // changeColor(variantColor: string) {
    //     document.documentElement.style.setProperty('--variant-color', variantColor)
    // }

    get g() {
        return this.dataForm.controls
    }

    get v() {
        return this.dataFormVariant.controls
    }

    searchKeywordChange(value: string) {
        this.searchKeyword$.next(value)
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
            per_page: this.filters.perPage,
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
                    this.dataList = resp.data.data
                    this.pagination = resp.data
                    this.dataStatus = 'done'
                    // this.productVariantSKUSplit = this.dataList[1].sku.split(
                    //     '-',
                    //     2
                    // )
                }
            })
        }
    }

    copyRecord(varient, index) {
        this.dataForm.patchValue(this.dataList[index])
        // if(this.dataList[index].quantity != 0){
        //     this.quantityCheck = true
        // }
        this.dataForm.controls.id.setValue(null)
        this.dataForm.controls.sku.setValue(null)
    }

    getSerialNumber(i: number) {
        return ((this.pagination.current_page - 1) * this.pagination.per_page + i + 1)
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
        this.router.navigate(['/user/base-product/variants'], {
            queryParams: filtersParam,
            replaceUrl: true,
        })
    }


    padLeadingZeros(num, size) {
        let s = num + ''
        while (s.length < size) s = '0' + s
        return s
    }

    save(data: any, f: any, proStatus: any) {
        this.Loading = true
        let showValueMsg = false
        if (this.productDetail.variable == 1 && this.variantOptions.length == 0) {
            this.alert.error('Varient options are required')
            this.Loading = false
            return false
        }
        if (this.variantOptions.length > 0) {
            this.variantOptions.forEach(element => {
                if (element.id == -1) {
                    showValueMsg = true
                    return false
                }
                if (element.values.length == 0) {
                    showValueMsg = true
                    return false
                }
                element.values.forEach(vals => {
                    if (vals.name == '') {
                        showValueMsg = true
                        return false
                    }
                })
            })
        }
        if (showValueMsg) {
            this.alert.error('Varient options are not fully filled')
            this.Loading = false
            return false
        }
        if (this.ds.productDetails.variable == 1 && Object.keys(this.variants).length == 0) {
            this.alert.error('Please enter at one varient.')
            this.Loading = false
            return false
        }
        if (this.dataForm.status === 'INVALID') {
            this.alert.error(
                'Please fill-in valid data in all fields & try again.'
            )
            this.Loading = false

            return false
        }
        let varientOption = []
        this.variantOptions.forEach(element => {
            let optionValues = []
            element.values.forEach(vals => {
                optionValues.push({
                    id: vals.id,
                    name: vals.name,
                    optionValueFrontId: vals.frontId
                })
            })
            varientOption.push({
                option_id: element.id,
                values: optionValues
            })
        })

        const variations = []

        if (Object.keys(this.variants).length > 0) {
            Object.keys(this.variants).forEach((vKey: string) => {
                if (vKey.length > 0) {
                    variations.push({
                        id: this.variants[vKey].id,
                        optionValueFrontIds: vKey.split('-'),
                        name: this.variants[vKey].name,
                        deleted: this.variants[vKey].deleted
                    })
                }
            })
        }

        const params = {
            base_product_id: this.ds.productId,
            sku: this.productDetail.sku,
            cp: this.dataForm.value.cp,
            tp: this.dataForm.value.tp,
            rrp: this.dataForm.value.rrp,
            description: this.dataForm.value.description,
            color_code: this.dataForm.value.color_code,
            color_name: this.dataForm.value.color_name,
            title: this.productDetail.name,
            weight: this.dataForm.value.weight,
            hs_code: this.dataForm.value.hs_code,
            taxable_info: this.dataForm.value.taxable_info,
            width: this.dataForm.value.width,
            height: this.dataForm.value.height,
            depth: this.dataForm.value.depth,
            variant_data: varientOption,
            variants: variations
        }
        let paramsToSend = {}

        if (proStatus == 'active') {
            const paramsActive = {
                id: this.ds.productId
            }
            this.ds.baseProdChangeStatusActive(paramsActive).subscribe((resp: any) => {

            })
        }
        let saveUpdate = this.ds.addVariant(params)
        if (this.dataForm.value.id !== null) {
            // delete params.base_product_id
            paramsToSend = { ...params, id: this.dataForm.value.id }
            saveUpdate = this.ds.addVariant(paramsToSend)
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
                    let filtersParam = {
                        id: this.ds.productId
                    }
                    this.getProductDetail()
                    this.router.navigate(['/user/base-product/variants'], {
                        queryParams: filtersParam,
                        replaceUrl: true,
                    })
                } else {
                    let filtersParam: any = {}

                    filtersParam = {
                        id: this.ds.productId
                    }
                    this.getProductDetail()
                    this.router.navigate(['/user/base-product/variants'], {
                        queryParams: filtersParam,
                        replaceUrl: true,
                    })
                    this.alert.success('Added successfully!!')

                }
            }
        })
    }


    saveVariant(data: any): boolean {
        this.Loading = true

        if (this.dataFormVariant.status === 'INVALID') {
            this.alert.error(
                'Please fill-in valid data in all fields & try again.'
            )
            this.Loading = false

            return false
        }


        const params = {
            base_product_id: this.ds.productId,
            sku: this.dataFormVariant.value.sku,
            tp: this.dataFormVariant.value.tp,
            rrp: this.dataFormVariant.value.rrp,
            color_code: this.color,
            weight: this.dataFormVariant.value.weight,
            hs_code: this.dataFormVariant.value.hs_code,
            taxable_info: this.dataFormVariant.value.taxable_info,
            width: this.dataFormVariant.value.width,
            height: this.dataFormVariant.value.height,
            depth: this.dataFormVariant.value.depth,
            title: this.productDetail.name,
            id: this.variantId
        }

        const requiredPromises: Array<any> = []
        const formData = this.api.jsonToFormData(data.value)
        if (this.thumbnail !== '') {

            const thumbnailPromise = fetch(this.thumbnail)
                .then(res => res.blob())
                .then(blob => {
                    const imageFile = new Blob([blob]) // for microsoft edge support
                    formData.append('image', imageFile)
                    formData.append('base_product_id', this.ds.productId)
                    formData.append('id', this.variantId)
                    formData.append('color_code', '')
                    // formData.append('color_name',this.colorName)
                    formData.append('title', this.productDetail.name)
                })
            requiredPromises.push(thumbnailPromise)

            Promise.all(requiredPromises)
                .then(_ => this.sendCall(formData))

        } else {
            formData.append('base_product_id', this.ds.productId)
            formData.append('id', this.variantId)
            formData.append('color_code', this.color)
            formData.append('title', this.productDetail.name)
            // formData.append('color_name',this.colorName)
            this.sendCall(formData)
        }
    }
    sendCall(formData: FormData): void {

        const saveUpdate = this.ds.updateVariant(formData)

        saveUpdate.subscribe((resp: any) => {
            this.Loading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.Loading = false

                return false
            } else {
                this.variants[this.selectedVarientkeyIndex].sku = this.dataFormVariant.value.sku
                this.variants[this.selectedVarientkeyIndex].tradePrice = this.dataFormVariant.value.tp
                this.selectedVarientkeyIndex = -1
                this.Loading = false
                this.modalVariantRef.hide()
                this.alert.success('Changes done successfully!!')
            }
        })
    }
    delete() {
        this.Loading = true
        const params = {
            id: this.selectedId,
        }
        this.ds.deleteVariant(params).subscribe((resp: any) => {
            this.Loading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.modalRef.hide()
                this.Loading = false

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

    varientOptions() {

        this.ds.varientOptions().subscribe((resp: any) => {

            if (resp.success === true) {
                this.varientsOptions = resp.data
            }
        })
    }
    getProductDetail() {
        const params = {
            id: this.ds.productId,
        }
        this.ds.productDetail(params).subscribe((resp: any) => {

            if (resp.success === true) {
                this.productDetail = resp.data

                if (this.productDetail.variable == 0) {
                    this.prodId = this.productDetail.variant_id

                    this.fetchProduct = true
                    this.ds.productDetails = this.productDetail
                    if (this.prodId > 0) {
                        this.getProductData()
                    }
                } else {
                    this.getVariantProductData()
                }

            }

            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                return false
            }
        })
    }
    getProductData() {  // for simple product
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
                this.dataForm.patchValue(this.productData)
                this.dataForm.controls.id.setValue(this.productData.id)
                this.tradePrice = this.productData.variant_prices
            }
        })

    }
    getVariantProductData() { // for variable product
        this.getClients()
        this.getCurrency()

        const params = {
            base_product_id: this.ds.productId,
            variable: this.ds.productDetails.variable
        }
        const list = this.ds.getVariableVariantDetail(params)
        list.subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
            } else {
                this.productData = resp.data
                if (this.productData != null) {
                    this.dataForm.patchValue(this.productData)

                    this.dataForm.controls.id.setValue(this.productData.id)
                }

                this.baseVarientOptions = this.productDetail.variant_option_values
                this.baseVariants = this.productDetail.variants
                // console.log(this.baseVariants)
                this.variantOptions = []

                if (this.baseVarientOptions.length > 0) {
                    let ids = this.baseVarientOptions.map(x => x.id);
                    ids.forEach((element, loopIndex) => {

                        let index = this.baseVarientOptions.findIndex(d => d.id == element)
                        let keyIndex = this.variantOptions.findIndex(d => d.id == this.baseVarientOptions[index].variant_option_id)
                        if (keyIndex == -1) {
                            let vairantOptionIndex = this.varientsOptions.findIndex(d => d.id == this.baseVarientOptions[index].variant_option_id)
                            this.variantOptions.push({
                                id: this.baseVarientOptions[index].variant_option_id,
                                title: this.varientsOptions[vairantOptionIndex].name,
                                values: [{
                                    id: this.baseVarientOptions[index].id,
                                    name: this.baseVarientOptions[index].name,
                                    frontId: 0,
                                    placeHolder: this.baseVarientOptions[index].variant_option._place_holder,
                                }],
                                show: false
                            })
                        } else {
                            this.variantOptions[keyIndex].values.push(
                                {
                                    id: this.baseVarientOptions[index].id,
                                    name: this.baseVarientOptions[index].name,
                                    frontId: 0,
                                    placeHolder: this.baseVarientOptions[index].variant_option._place_holder,
                                }
                            )
                        }

                    })

                    this.variantOptions.forEach((element, index) => {
                        element.values.forEach((vals, variantOptionIndex) => {
                            const variantOptionId = this.getOptionValueId(index)
                            this.variantOptions[index].values[variantOptionIndex].frontId = variantOptionId
                            this.variantOptions[index].values[variantOptionIndex].placeHolder = 'Enter Values'
                        })
                    })
                    // console.log('this.variantOptions', this.variantOptions)
                    // console.log('baseVariants', this.baseVariants)
                    this.variants = {}
                    this.variants = this.getVariantPrePairs()
                    this.baseVariants.forEach(baseV => {
                        Object.keys(this.variants).forEach((vKey: string) => {
                            if (this.variants[vKey].name.toLowerCase() == baseV.name.toLowerCase()) {
                                this.variants[vKey].id = baseV.id
                                // this.variants[vKey].name = baseV.name
                                this.variants[vKey].sku = baseV.sku
                                this.variants[vKey].tradePrice = baseV.tp
                                this.variants[vKey].deleted = false
                                this.variants[vKey].save = false
                            }
                        });

                    });
                    // this.baseVariants.forEach((baseV: any) => {
                    //     let key: any = []
                    //     if (baseV.base_product_variant_values.length > 0) {
                    //         console.log(baseV.base_product_variant_values.length)
                    //         baseV.base_product_variant_values.forEach((bpvv: any) => {
                    //             const optionValue = bpvv.variant_option_value

                    //             key.push(this.findVariantOptionValueFrontId(optionValue.id))
                    //         });

                    //         this.variants[key.join('-')] = {
                    //             id: baseV.id,
                    //             name: baseV.name,
                    //             tradePrice: baseV.tp,
                    //             sku: baseV.sku,
                    //             deleted: false
                    //         }
                    //     }
                    // })
                    // console.log('this.variants',this.variants)
                }
            }
        })

    }

    findVariantOptionValueFrontId(id: any) {
        let frontId = ''
        this.variantOptions.forEach((vOption: any) => {
            const index = vOption.values.findIndex((value: any) => {
                return value.id === id
            })
            if (index > -1) {
                frontId = vOption.values[index].frontId
                return frontId
            }
        })
        return frontId
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
    setVariantTradePrice() {
        const params = {
            id: 0,
            rrp: this.variantData.rrp,
            tp: this.variantData.tp,
            base_product_variant_id: this.variantId,
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
                currency_id: 2 // GBP
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

    saveVariantTradePrice(d, tp) {
        let params
        if (d.id === 0) {
            params = {
                rrp: d.rrp,
                tp: d.tp,
                base_product_variant_id: this.variantId,
                quantity: d.quantity,
                client_id: d.client_id,
                currency_id: 2 // GBP
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
                base_product_variant_id: this.variantId,
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
        let newMultiple;
        if (type == 'w') {
            newMultiple = (val.target.value / data.print_area.p_width)
        } else {
            newMultiple = (val.target.value / data.print_area.p_height)
        }

        this.variantFactors[index].multiplier = newMultiple.toFixed(2)
    }
    changeVariantMultiplier(val, data, index, type) {
        let newMultiple;
        if (type == 'w') {
            newMultiple = (val.target.value / data.print_area.p_width)
        } else {
            newMultiple = (val.target.value / data.print_area.p_height)
        }

        this.variantFactors[index].multiplier = newMultiple.toFixed(2)
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

    displayVarients() {
        if (this.varientsOptions.length > this.totalVarients) {
            this.totalVarients++
            this.varientsKeys.push({
                option_id: '-1',
                place_holder: 'Add values',
                values: [],
                show: false
            })
        }
    }

    addVariantOption() {
        this.variantOptions.push({
            id: -1,
            title: '',
            show: false,
            values: [
            ]
        })
    }

    variantOptionChanged(e: any, variantOptionIndex: number) {

        const optionId = e.target.value
        if (optionId == -1) {
            return
        }
        const index = this.variantOptions.findIndex((vo: any) => vo.id === optionId)

        if (index != variantOptionIndex) {
            this.alert.error('Variant already added')
            return
        }
        this.variantOptions[index].title = this.varientsOptions[index].name
        this.addVariantOptionValue(variantOptionIndex, '')

        this.variants = this.getVariantPairs()
        // console.log(this.variantOptions)
    }
    getVariantPairs(values: any = [], index: number = 0) {
        let keys = {}
        let optionId: any = '';
        if (values.length == 0 || index == 0) {
            this.variantOptions[index].values.forEach((subVal: any) => {
                optionId = this.variantOptions[index].id
                const keyIndex = Object.keys(this.variants).findIndex(item => item === keys[`${subVal.frontId}`])

                if (keyIndex == -1) {
                    if (!keys[`${subVal.frontId}`]) {
                        keys[`${subVal.frontId}`] = {
                            id: -1,
                            name: `${subVal.name}`,
                            deleted: false
                        }
                    }
                }
            });
        } else {
            Object.keys(values).forEach((key: string) => {
                this.variantOptions[index].values.forEach((subVal: any) => {

                    if (!keys[`${key}-${subVal.frontId}`]) {


                        const keyIndex = Object.keys(this.variants).findIndex(item => item === key + '-' + subVal.frontId)

                        if (keyIndex == -1) {
                            keys[`${key}-${subVal.frontId}`] = {
                                id: this.getVariantId(`${key}-${subVal.frontId}`, 'id'),
                                name: `${values[key].name} / ${subVal.name}`,
                                sku: this.getVariantId(`${key}-${subVal.frontId}`, 'sku'),
                                tradePrice: this.getVariantId(`${key}-${subVal.frontId}`, 'tradePrice'),
                                deleted: false
                            }
                        }
                    }
                });
            });
        }

        if (this.variantOptions.length > (index + 1)) {
            keys = this.getVariantPairs(keys, index + 1)
        }

        return keys
    }
    getVariantPrePairs(values: any = [], index: number = 0) {
        let keys = {}
        let optionId: any = '';

        if (values.length == 0 || index == 0) {
            this.variantOptions[index].values.forEach((subVal: any) => {
                optionId = this.variantOptions[index].id
                if (!keys[`${subVal.frontId}`]) {
                    keys[`${subVal.frontId}`] = {
                        id: -1,
                        name: `${subVal.name}`,
                        deleted: true,
                        save: false
                    }
                }
            });
        } else {
            Object.keys(values).forEach((key: string) => {
                this.variantOptions[index].values.forEach((subVal: any) => {
                    if (!keys[`${key}-${subVal.frontId}`]) {
                        keys[`${key}-${subVal.frontId}`] = {
                            id: this.getVariantId(`${key}-${subVal.frontId}`, 'id'),
                            name: `${values[key].name} / ${subVal.name}`,
                            sku: this.getVariantId(`${key}-${subVal.frontId}`, 'sku'),
                            tradePrice: this.getVariantId(`${key}-${subVal.frontId}`, 'tradePrice'),
                            deleted: true,
                            save: false
                        }
                    }
                });
            });
        }

        if (this.variantOptions.length > (index + 1)) {
            keys = this.getVariantPrePairs(keys, index + 1)
        }

        return keys
    }
    getVariantId(index, type) {
        let keyExist = false
        let val: any = ''
        Object.keys(this.variants).forEach((vKey: string) => {
            if (index == vKey) {
                keyExist = true
            }
        });
        if (keyExist) {
            if (type == 'id') {
                val = this.variants[index].id
            } else if (type == 'tradePrice') {
                val = this.variants[index].tradePrice
            } else if (type == 'sku') {
                val = this.variants[index].sku
            }
        } else {
            if (type == 'id') {
                val = -1
            } else if (type == 'tradePrice') {
                val = ''
            } else if (type == 'sku') {
                val = ''
            }
        }
        return val
    }
    addVariantOptionValue(variantOptionIndex: any, placeHolderValue: any) {
        const variantOptionId = this.getOptionValueId(variantOptionIndex)
        let placeholder: any = ''
        if (placeHolderValue != '') {
            placeholder = placeHolderValue
        } else {
            placeholder = this.varientsOptions[variantOptionIndex].place_holder
        }
        this.variantOptions[variantOptionIndex].values.push({
            id: -1,
            frontId: variantOptionId,
            name: '',
            placeHolder: placeholder
        })

        setTimeout(() => {
            const lastIndex = +this.variantOptions[variantOptionIndex].values.length - 1
            const optionValueIndex = `option-${variantOptionIndex}-${lastIndex}`
            document.getElementById(optionValueIndex).focus()
            this.variants = { ...this.variants, ...this.getVariantPairs() }
        }, 1)
    }

    variantOptionValueChanged(e: any, variantOptionValue: any, variantOptionIndex: number, variantOptionValueIndex: number) {
        console.log('this.variants', this.variants)
        const duplication = this.variantOptions[variantOptionIndex].values.filter(d => d.name.toLowerCase() === e.target.value.toLowerCase())
        if (duplication.length > 1) {
            this.alert.error(e.target.value + ' already exists')
            this.variantOptions[variantOptionIndex].values[variantOptionValueIndex].name = ''
            return false
        }
        Object.keys(this.variants).forEach((vKey: string) => {
            // console.log('checking', vKey, this.variants[vKey].name, 'with', variantOptionValue.frontId, variantOptionValue.name)
            if (vKey.includes(variantOptionValue.frontId)) {
                // console.log('matched')
                this.variants[vKey].name = ''
                vKey.split('-').forEach((frontId: string) => {
                    this.variants[vKey].name += this.variants[vKey].name.length > 0 ? ' / ' + this.getNameByFrontId(frontId) : this.getNameByFrontId(frontId)
                })
            }
        });
    }

    getNameByFrontId(frontId: string): string {
        let name = ''
        this.variantOptions.forEach((varOption: any) => {
            varOption.values.forEach((value: any) => {
                if (value.frontId == frontId) {
                    name = value.name
                    return
                }
            })
        })
        return name
    }

    deleteVariantOptionValue(variantOptionIndex: number, variantOptionValueIndex: number) {

        const value = this.variantOptions[variantOptionIndex].values[variantOptionValueIndex]
        this.variantOptions[variantOptionIndex].values.splice(variantOptionValueIndex, 1)

        Object.keys(this.variants).forEach((variantKey: string) => {
            if (variantKey.split('-').indexOf(value.frontId.toString()) > -1) {
                delete this.variants[variantKey]
            }
        })
        if (this.variantOptions.length == 0) {
            this.variants = {}
        }
    }

    deleteVariantOption(i) {
        this.variantOptions.splice(i, 1)
        if (this.variantOptions.length == 0) {
            this.variants = {}
        } else {
            this.variants = {}
            this.variants = this.getVariantPairs()
        }
    }
    deleteVariant(variantKey) {
        this.variants[variantKey].deleted = true
        let trueVarients = false
        if (Object.keys(this.variants).length > 0) {
            Object.keys(this.variants).forEach((vKey: string) => {
                if (this.variants[vKey].deleted === false) {
                    trueVarients = true
                }
            })
        }
        if (trueVarients === false) {
            this.variantOptions = []
            this.variants = {}
        }
    }
    getVarientName(id) {
        const index = this.varientsOptions.findIndex(d => d.id == id)
        return this.varientsOptions[index].name
    }
    showVarientDetail(index) {

        if (this.variantOptions[index].id == -1) {
            this.alert.error('Please select option')
            return
        }

        if (this.variantOptions[index].values.length == 0) {
            this.alert.error('Values are required')
            return
        }

        if (this.variantOptions[index].id > -1 && this.variantOptions[index].values.length > 0) {
            const totalValues = this.variantOptions[index].values.length
            let currentValues = 0
            this.variantOptions[index].values.forEach(element => {
                if (element.name != '') {
                    currentValues++
                }
            })

            if (totalValues > currentValues) {
                this.alert.error('Please fill all values')
                return
            }
            if (this.variantOptions[index].show) {
                this.variantOptions[index].show = false
            } else {
                this.variantOptions[index].show = true
            }
        }

    }

    editVarient(variant: any) {

        if (variant.value.sku == '') {
            this.alert.error('SKU is required')
            return false
        }
        if (variant.value.tradePrice === null || variant.value.tradePrice == 'null') {
            this.alert.error('Trade price is required')
            return false
        }

        this.saveVariantRecord = true

        const paramsData = {
            id: variant.value.id,
        }
        variant.value.save = true
        this.ds.getSimpleVariantDetail(paramsData).subscribe((resp: any) => {

            if (resp.success === true) {
                const params = {
                    base_product_id: this.ds.productId,
                    sku: variant.value.sku,
                    tp: variant.value.tradePrice,
                    rrp: resp.data.rrp,
                    color_code: resp.data.color_code,
                    weight: resp.data.weight,
                    hs_code: resp.data.hs_code,
                    taxable_info: resp.data.taxable_info,
                    width: resp.data.width,
                    height: resp.data.height,
                    depth: resp.data.depth,
                    title: resp.data.name,
                    id: variant.value.id
                }
                const saveUpdate = this.ds.updateVariant(params)
                saveUpdate.subscribe((resp: any) => {
                    this.Loading = false
                    if (resp.success === false) {
                        this.alert.error(resp.errors.general)
                        variant.value.save = false

                        return false
                    } else {
                        variant.value.save = false
                        this.alert.success('Changes done successfully!!')
                    }
                })
            }
        })

    }
    openModal(viewModal: TemplateRef<any>, variant: any) {
        this.colorName = ''
        this.variantFactors = []
        this.tradePrice = []
        this.selectedVarientkeyIndex = variant.key
        this.dataFormVariant.controls.id.setValue(null)
        this.loadVariant = false
        this.variantName = this.replaceVarientName(variant.value.name)
        this.variantId = variant.value.id
        this.variantKey = variant.key
        const baseIndex = this.baseVariants.findIndex((d: any) => d.id == variant.value.id)
        this.baseVariantsValues = this.baseVariants[baseIndex].base_product_variant_values

        this.baseVariantsValues.forEach(element => {
            if (element.variant_option_value.variant_option_id == 2) {
                this.colorName = element.variant_option_value.name
            }
        });

        const params = {
            id: this.variantId,
        }
        this.ds.getSimpleVariantDetail(params).subscribe((resp: any) => {

            if (resp.success === true) {
                this.variantData = resp.data
                console.log(this.variantData)
                this.variantFactors = this.variantData.variant_factors
                this.tradePrice = this.variantData.variant_prices
                this.loadVariant = true
                // console.log('this.productData',this.productData)
                // console.log('this.variantData.sku',this.variantData.sku)
                const vName = this.variantName.split(' ')
                let newSku = this.productData.sku
                if (this.variantData.sku == '') {
                    vName.forEach(element => {
                        newSku = newSku + '_' + element
                    });
                } else {
                    newSku = this.variantData.sku
                }
                newSku = newSku.toUpperCase()
                this.dataFormVariant.patchValue(this.variantData)
                this.dataFormVariant.controls.sku.setValue(newSku)
                this.dataFormVariant.controls.id.setValue(this.variantId)
                this.thumbnail = ''
                this.color = this.variantData.color_code

                if (this.variantData.image_exists === 1) {
                    this.thumbnail = this.api.blankImageUrl(this.variantId)
                }
            }
        })
        this.modalVariantRef = this.ms.show(
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
    replaceVarientName(text) {
        return text
        // return text.replace(" ", " / ")
    }

    browseThumbnail(event: any) {
        event.preventDefault()
        const element = document.getElementById('thumbnail-image')
        element.click()
    }

    onThumbnailChange(event: any, template: TemplateRef<any>) {
        const file = event.target.files[0]
        const allowedExtensions = ['png', 'jpg', 'jpeg']
        const extension = file.name.split('.').pop().toLowerCase()
        const fileSize = file.size / 1024 / 1024
        if (fileSize > 3) {
            this.alert.error('Invalid file size. File size must not exceeds 3MB')
        } else if (allowedExtensions.indexOf(extension) < 0) {
            this.alert.error('Invalid file type. Only png, jpg or jpeg are allowed')
        } else {

            const reader = new FileReader()
            reader.onload = () => {
                this.thumbnail = reader.result as string
                this.color = ''
                // (document.getElementById(this.elevationId + 'img-src' + this.fileIndex) as HTMLImageElement).src = this.thumbnail
            }
            reader.readAsDataURL(file)
            // this.imageChangedEvent = event
            // this.cropperModalRef = this.ms.show(
            //     template,
            //     Object.assign({}, { class: 'modal-sm admin-panel' })
            // )
        }
    }

    doneCroppingThumbnail() {
        this.thumbnail = this.croppedImage
        document.getElementById('color-img').setAttribute('src', this.thumbnail)
        this.cropperModalRef.hide()
    }


    imageCropped(event: ImageCroppedEvent) {
        this.croppedImage = event.base64
    }

    imageLoaded() {
        // show cropper
    }
    cropperReady() {
        // cropper ready
    }
    loadImageFailed() {
        // show message
    }
}

