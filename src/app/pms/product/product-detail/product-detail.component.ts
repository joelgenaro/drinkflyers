import { Observable, zip } from 'rxjs'
import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core'
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
import { ConstantsService } from 'src/app/services/constants.service'

@Component({
    selector: 'app-product-detail',
    templateUrl: './product-detail.component.html',
    styleUrls: ['./product-detail.component.css'],
})
export class ProductDetailComponent implements OnInit, OnDestroy {
    editorConfig: any = {}
    dataForm: FormGroup
    modalRef: BsModalRef
    productDetailLoading = false
    dataStatus = 'fetching'
    fetchingCategories = false
    dataList = []
    baseProductList = []
    selectedIndex = -1
    selectedId: any
    pagination: any = []
    page = 1
    perPage = 10
    searchKeyword = ''
    searchKeyword$: Subject<string> = new Subject<string>()
    searchKeywordSub: any
    tagsList: any = []
    selectedTags = []
    categoriesList = []
    productDetailList: any = []
    baseProductId: any
    fontProp = false
    selectedBaseProductId: any
    @ViewChild('modalBtn', { static: true }) modal: ElementRef
    spinnerSVG = `/assets/images/rolling-gray.svg`
    productSku: any
    customSku = false

    constructor(
        public ds: DataService,
        private fb: FormBuilder,
        public cs: ConstantsService,
        public ui: UIHelpers,
        public alert: IAlertService,
        private router: Router,
        private route: ActivatedRoute,
        private api: ApiService,
        public ms: BsModalService
    ) {
        this.ds.activeTab = 'product-detail'
        this.api.isfullScreen = false
        this.ds.productId = this.route.snapshot.queryParamMap.get('id')
        this.ds.baseProductId = this.route.snapshot.queryParamMap.get('base_id')
        this.selectedBaseProductId = this.route.snapshot.queryParamMap.get('base_id')
        console.log(this.ds.baseProductId)
        this.fontProp = false
        this.ds.tagsList().subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)

                return false
            } else {
                this.tagsList = resp.data
            }
        })

        // this.getBaseProductList()

        this.dataForm = this.fb.group({
            id: new FormControl(null),
            name: new FormControl(null, [
                Validators.required,
                Validators.maxLength(50),
            ]),
            description: new FormControl(null, [
                Validators.maxLength(10000),
            ]),
            sku: new FormControl(null, [
                Validators.required,
                Validators.maxLength(30),
            ]),
            categories: this.fb.array([]),
            type: new FormControl(null, [Validators.required]),
            personalize: new FormControl(1),
            tag_ids: new FormControl(null),
        })
        if (this.ds.productId < 0) {
            this.fetchCategories(0)
        }

        this.searchKeywordSub = this.searchKeyword$
            .pipe(
                debounceTime(1000), // wait 1 sec after the last event before emitting last event
                distinctUntilChanged() // only emit if value is different from previous value
            )
            .subscribe((searchKeyword) => {
                this.page = 1
                this.getBaseProductList()
            })
    }

    ngOnInit() {
        if (this.ds.productId == -1 && this.baseProductId == null) {
            // this.modal.nativeElement.click()
        }
        this.editorConfig = this.cs.KOLKOV_EDITOR_CONFIG
        const params = {
            id: this.ds.productId,
        }
        if (this.ds.productId > -1) {
            this.fetchingCategories = true
            this.ds.productDetail(params).subscribe((resp: any) => {
                if (resp.success === false) {
                    this.alert.error(resp.errors.general)
                    this.fetchingCategories = false
                    return false
                } else {
                    this.productDetailList = resp.data
                    this.ds.baseProductId = resp.data.base_product_id
                    this.selectedBaseProductId = resp.data.base_product_id
                    this.ds.productSKU = resp.data.sku
                    this.dataForm.patchValue(resp.data)
                    this.dataForm.controls.sku.setValue(resp.data.sku)
                    // if (resp.data.sku !== null) {
                    //     this.dataForm.controls.sku.setValue(resp.data.sku)
                    // } else {
                    //     if (resp.data.product_type) {
                    //         this.productSku = resp.data.product_type.charAt(0).toUpperCase()
                    //         this.productSku += '0001_'
                    //         if (resp.data.base_product.variable === 1) {
                    //             this.productSku += resp.data.base_product.variant.sku
                    //             this.dataForm.controls.sku.setValue(this.productSku)
                    //         } else if (resp.data.base_product.variable === 0) {
                    //             this.productSku += resp.data.base_product.sku
                    //             this.dataForm.controls.sku.setValue(this.productSku)
                    //         }
                    //         // console.log('this.productSku', this.productSku)
                    //     } else {
                    //         this.productSku = 'ABC0001_'
                    //         this.productSku += resp.data.base_product.sku
                    //         this.dataForm.controls.sku.setValue(this.productSku)
                    //         // console.log('this.productSku', this.productSku)
                    //     }
                    // }
                    this.selectedTags = resp.data.tag_ids
                        .split(',')
                        .map((i) => +i)
                    //     const selectedCatId: Array<string> =
                    //         resp.data.category_ids.split(',')
                    //     const all = [0, ...selectedCatId.slice(0, -1)]
                    //     const obs = []
                    //     // 0, 1, 3, 4
                    //     // 1, 3, 4, 21
                    //     all.forEach((id, i) => {
                    //         obs.push(this.ds.categoriesList({ parent_id: id }))
                    //     })
                    //     zip(...obs).subscribe((result) => {
                    //         result.forEach((resp: any, i) => {
                    //             this.fetchingCategories = false
                    //             if (resp.data.length > 0) {
                    //                 this.categoriesList.push(resp.data)
                    //                 this.addCategoryGroup(selectedCatId[i])
                    //             }
                    //         })
                    //     })
                    //     // this.dataForm.controls.tag_ids.setValue(resp.data.user.tag_ids)
                }
            })
        }
    }

    ngOnDestroy(): void {
        this.searchKeywordSub.unsubscribe()
    }

    get g() {
        return this.dataForm.controls
    }

    get categories() {
        return this.dataForm.get('categories') as FormArray
    }

    getBaseProductList() {
        const param = {
            page: this.page,
            keyword: this.searchKeyword,
            per_page: this.perPage,
        }
        this.ds.baseProductList(param).subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)

                return false
            } else {
                this.baseProductList = resp.data.data
                this.pagination = resp.data
                this.dataStatus = 'done'
            }
        })
    }

    searchKeywordChange(value: string) {
        this.searchKeyword$.next(value)
    }

    selectPerPage(e: any) {
        this.perPage = e.target.value
        this.page = 1

        this.getBaseProductList()
    }

    setPagination(page: number) {
        this.page = page
        this.getBaseProductList()
    }

    openModal(formModal) {
        this.modalRef = this.ms.show(formModal, {
            class: 'modal-lg modal-dialog-centered admin-panel',
            backdrop: 'static',
            ignoreBackdropClick: true,
            keyboard: false,
        })
    }

    fetchCategories(parentId, selectedId = null) {
        this.fetchingCategories = true
        const categoryParam = {
            parent_id: parentId,
        }
        this.ds.categoriesList(categoryParam).subscribe((resp: any) => {
            if (resp.success === false) {
                this.fetchingCategories = false
                this.alert.error(resp.errors.general)
                return false
            } else {
                if (resp.data.length > 0) {
                    this.fetchingCategories = false
                    this.categoriesList.push(resp.data)
                    this.addCategoryGroup(selectedId)
                } else {
                    this.fetchingCategories = false
                }
            }
        })
    }

    addCategoryGroup(selectedId) {
        this.categories.push(
            this.fb.group({
                category_id: new FormControl(selectedId, [Validators.required]),
            })
        )
    }

    deleteCategoryGroup(i: any) {
        while (this.categories.length - 1 > i) {
            this.categories.removeAt(i + 1)
        }
        this.categoriesList.splice(i + 1)
    }

    selectCategory(e: any, i: any) {
        const id = e.target.value
        if (i < this.categories.length - 1) {
            this.deleteCategoryGroup(i)
        }

        this.fetchCategories(id)
    }

    selectedBaseProduct(baseProId: any, i: any) {
        this.selectedBaseProductId = this.baseProductList[i].id
        this.ds.baseProductId = this.selectedBaseProductId
        console.log(this.selectedBaseProductId, this.ds.baseProductId)
        this.fontProp = true
        this.modalRef.hide()
    }

    addInfo(data: any, f: any) {
        this.productDetailLoading = true
        // if (this.dataForm.status === 'INVALID') {
        //     this.alert.error('Please fill-in valid data in all fields & try again.')
        //     this.productDetailLoading = false

        //     return false
        // }

        // if (this.dataForm.value.sku?.indexOf('-') > -1) {
        //     this.alert.error('SKU must not have any hyphens (-).')
        //     this.productDetailLoading = false

        //     return false
        // }

        if (this.selectedTags === null) {
            this.alert.error('Tag is requried.')
            this.productDetailLoading = false
        }

        const lastIndex = this.categories.length - 1
        const categories = []
        this.categories.controls.forEach((cat) => {
            categories.push(cat.value.category_id)
        })
        this.ds.productSKU = this.dataForm.value.sku
        const params = {
            id: this.dataForm.value.id,
            sku: this.dataForm.value.sku,
            name: this.dataForm.value.name,
            description: this.dataForm.value.description,
            personalize: 1, // this.dataForm.value.personalize,
            tag_ids: this.selectedTags,
            base_product_id: null,
        }

        // if (params.personalize === true) {
        //     params.personalize = 1
        // } else {
        //     params.personalize = 0
        // }

        if (this.ds.productId == -1) {
            params.base_product_id = this.selectedBaseProductId
        } else {
            params.base_product_id = this.ds.baseProductId
        }

        let saveMethod = this.ds.addProductDetail(params)
        if (this.ds.productId > -1) {
            saveMethod = this.ds.updateProductDetail(params)
        }
        saveMethod.subscribe((resp: any) => {
            this.productDetailLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.productDetailLoading = false

                return false
            } else {
                if (this.ds.productId > -1) {
                    this.productDetailLoading = false
                    this.alert.success('Product updated successfully!!')
                } else {
                    this.ds.productId = resp.data
                    this.productDetailLoading = false
                    this.alert.success('Product created successfully!!')

                }

                this.router.navigate([this.api.checkUser() + '/product/prices'], {
                    queryParams: {
                        id: this.ds.productId,
                        base_id: this.selectedBaseProductId,
                    },
                    replaceUrl: true,
                })
            }
        })
    }
    routeToPrices() {
        this.router.navigate([this.api.checkUser() + '/product/prices'], {
            queryParams: {
                id: this.ds.productId,
                base_id: this.selectedBaseProductId,
            },
            replaceUrl: true,
        })
    }
    getBaseProdUrl(images: Array<any>) {
        if (images.length === 0) {
            return ''
        } else {
            return this.ds.baseProductImageURL(images[0].id)
        }
    }

    cancelNewProduct() {
        this.modalRef.hide()
        this.router.navigate([this.api.checkUser() + '/products-list'])
    }
}
