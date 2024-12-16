import { ConstantsService } from 'src/app/services/constants.service'
import { QuillEditorComponent } from 'ngx-quill'
import { Observable, zip } from 'rxjs'
import { Component, OnInit, ViewChild } from '@angular/core'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
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

@Component({
    selector: 'app-product-detail',
    templateUrl: './product-detail.component.html',
    styleUrls: ['./product-detail.component.css'],
})
export class ProductDetailComponent implements OnInit {
    @ViewChild(QuillEditorComponent, { static: false })
    editor: QuillEditorComponent
    editorConfig: any = {}
    loginLoading = false
    modalTitle: any
    modalRef: BsModalRef
    dataForm: FormGroup
    dataFormCat: FormGroup
    productDetailLoading = false
    dataStatus = 'fetching'
    fetchFulFilments = false
    fetchingCategories = false
    dataList = []
    selectedIndex = -1
    selectedId: any
    tagsList: any = []
    selectedTags = []
    categoriesList = []
    fulFilmentList = []
    productDetailList: any = []
    parentId: any = 0
    parentIndex: any
    constructor(
        public cs: ConstantsService,
        public ms: BsModalService,
        private ds: DataService,
        private fb: FormBuilder,
        public ui: UIHelpers,
        public alert: IAlertService,
        private router: Router,
        private route: ActivatedRoute,
        public api: ApiService
    ) {

        this.dataFormCat = this.fb.group({
            id: new FormControl(null),
            name: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
            status: new FormControl('active'),
            // parent_id: new FormControl(null)
        })

        this.ds.activeTab = 'product-detail'
        this.ds.productId = this.route.snapshot.queryParamMap.get('id')

        this.ds.tagsList().subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)

                return false
            } else {
                this.tagsList = resp.data
            }
        })

        this.ds.getFulfilmentList().subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)

                return false
            } else {
                this.fulFilmentList = resp.data
                this.fetchFulFilments = true
            }
        })

        this.dataForm = this.fb.group({
            id: new FormControl(null),
            name: new FormControl(null, [Validators.required, Validators.maxLength(50),]),
            fulfillment_center_id: new FormControl(null, [Validators.required]),
            variable: new FormControl(0, null),
            sku: new FormControl(null, [Validators.required, Validators.maxLength(50),]),
            categories: this.fb.array([]),
            tag_ids: new FormControl(null),
            description: new FormControl(null, [Validators.required, Validators.maxLength(10000),])
        })
        if (this.ds.productId < 0) {
            this.fetchCategories(0)
        }
    }

    ngOnInit() {
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
                    this.ds.productSKU = resp.data.sku
                    this.dataForm.patchValue(resp.data)

                    if (resp.data.tag_ids) {
                        this.selectedTags = resp.data.tag_ids
                            .split(',')
                            .map((i) => +i)
                    }

                    const selectedCatId: Array<string> =
                        resp.data.category_ids.split(',')
                    const all = [0, ...selectedCatId.slice(0, -1)]
                    const obs = []
                    // 0, 1, 3, 4
                    // 1, 3, 4, 21
                    all.forEach((id, i) => {
                        obs.push(this.ds.categoriesList({ parent_id: id }))
                    })
                    zip(...obs).subscribe((result) => {
                        result.forEach((resp: any, i) => {
                            this.fetchingCategories = false
                            if (resp.data.length > 0) {
                                this.categoriesList.push(resp.data)
                                const parentIndex = resp.data.findIndex((item: any) => {
                                    return item.id == selectedCatId[i]
                                })
                                // console.log('resp.data', resp.data, selectedCatId[i])
                                const parentId = parentIndex > -1 ? resp.data[parentIndex].parent_id : 0
                                this.addCategoryGroup(selectedCatId[i], parentId)
                            }
                        })
                    })
                    // this.dataForm.controls.tag_ids.setValue(resp.data.user.tag_ids)
                }
            })
        }
    }

    get g() {
        return this.dataForm.controls
    }

    get cat() {
        return this.dataFormCat.controls
    }

    get categories() {
        return this.dataForm.get('categories') as FormArray
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
                    this.addCategoryGroup(selectedId, parentId)
                } else {
                    this.fetchingCategories = false
                }
            }
        })
    }

    addCategoryGroup(selectedId, parentId) {
        if (parentId === 0 && (selectedId > 0 || selectedId == null)) {
            this.categories.push(
                this.fb.group({
                    category_id: new FormControl(selectedId, [Validators.required]),
                    parent_id: new FormControl(parentId, [])
                })
            )
        } else {
            this.categories.push(
                this.fb.group({
                    category_id: new FormControl(selectedId),
                    parent_id: new FormControl(parentId, [])
                })
            )
        }
    }

    deleteCategoryGroup(i: any) {
        while (this.categories.length - 1 > i) {
            this.categories.removeAt(i + 1)
        }
        this.categoriesList.splice(i + 1)
    }

    addInfo(data: any, f: any) {
        this.productDetailLoading = true
        if (data.status === 'INVALID') {
            this.alert.error(
                'Please fill-in valid data in all fields & try again.'
            )
            this.productDetailLoading = false

            return false
        }

        if (this.selectedTags === null) {
            this.alert.error('Tag is requried.')
        }

        // if (this.dataForm.value.sku.indexOf('-') > -1) {
        //     this.alert.error('SKU must not have any hyphens (-).')
        //     this.productDetailLoading = false

        //     return false
        // }

        const lastIndex = this.categories.length - 1
        const categories = []
        this.categories.controls.forEach((cat) => {
            categories.push(cat.value.category_id)
        })
        let cat_id
        console.log(this.categories.controls[lastIndex].value.category_id)
        if (this.categories.controls[lastIndex].value.category_id === null || this.categories.controls[lastIndex].value.category_id == '') {
            cat_id = this.categories.controls[lastIndex - 1].value.category_id
        } else {
            cat_id = this.categories.controls[lastIndex].value.category_id
        }

        this.ds.productSKU = this.dataForm.value.sku
        const params = {
            id: this.dataForm.value.id,
            sku: this.dataForm.value.sku,
            name: this.dataForm.value.name,
            fulfillment_center_id: this.dataForm.value.fulfillment_center_id,
            variable: this.dataForm.value.variable,
            description: this.dataForm.value.description,
            category_id: cat_id,
            category_ids: categories.join(','),
            tag_ids: this.selectedTags,
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
                    this.alert.success('Product updated successfully!!')
                } else {
                    this.ds.productId = resp.data
                    this.alert.success('Product created successfully!!')
                }
                this.router.navigate(['/user/base-product/mockup'], {
                    queryParams: { id: this.ds.productId },
                    replaceUrl: true,
                })
            }
        })
    }
    selectCategory(e: any, i: any) {
        const id = e.target.value
        if (i < this.categories.length - 1) {
            this.deleteCategoryGroup(i)
        }

        this.fetchCategories(id)
    }
    openCategoryModal(modal, i: any) {
        this.parentIndex = i
        this.parentId = this.categories.controls[i].get('parent_id').value
        this.modalTitle = 'Add Category'

        this.modalRef = this.ms.show(
            modal,
            {
                class: 'modal-md modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
    }
    save(f: any) {
        this.loginLoading = true
        if (this.dataFormCat.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.loginLoading = false

            return false
        }
        const params = {
            id: this.dataFormCat.value.id,
            name: this.dataFormCat.value.name,
            status: 'active',
            parent_id: this.parentId,
        }

        let saveUpdate = this.ds.addCategory(params)
        saveUpdate.subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.loginLoading = false

                return false
            } else {
                this.categoriesList[this.parentIndex].push(resp.data)
                this.categories.controls[this.parentIndex].get('category_id').setValue(resp.data.id)
                this.selectCategory({
                    target: {
                        value: resp.data.id
                    }
                }, this.parentIndex)

                this.alert.success('Added successfully!!')

            }
            this.modalRef.hide()
            f.resetForm()
        })
    }
    cancelButton(f: any) {
        f.resetForm()
        this.modalRef.hide()
    }
}