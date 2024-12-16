import { Observable, zip } from 'rxjs'
import { Component, OnInit } from '@angular/core'
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import * as moment from 'moment'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ApiService } from 'src/app/services/api.service'
import { DataService } from '../data.service'

@Component({
    selector: 'app-product-detail',
    templateUrl: './product-info.component.html',
    styleUrls: ['./product-info.component.css']
})
export class ProductInfoComponent implements OnInit {
    dataForm: FormGroup
    productDetailLoading = false
    fetchingCategories = false
    dataStatus = 'fetching'
    dataList = []
    selectedIndex = -1
    selectedId: any
    tagsList: any = []
    selectedTags = []
    categoriesList = []
    productDetailList: any = []

    constructor(
        private ds: DataService,
        private fb: FormBuilder,
        public ui: UIHelpers,
        public alert: IAlertService,
        private router: Router,
        private route: ActivatedRoute,
        private api: ApiService
    ) {
        this.ds.activeTab = 'product-info'
        this.ds.productId = this.route.snapshot.queryParamMap.get('id')

        this.ds.tagsList().subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)

                return false
            } else {
                this.tagsList = resp.data
            }
        })

        this.dataForm = this.fb.group({
            id: new FormControl(null),
            name: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
            sku: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
            // categories: this.fb.array([]),
            // type: new FormControl(null, [Validators.required]),
            personalize: new FormControl(null, [Validators.required]),
            tag_ids: new FormControl(null)
        })
        if (this.ds.productId < 0) {
            this.fetchCategories(0)
        }
    }

    ngOnInit() {
        const params = {
            id: this.ds.productId
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
                    this.selectedTags = resp.data.tag_ids.split(',').map(i => +i)
                    // const selectedCatId: Array<string> = resp.data.category_ids.split(',')
                    // const all = [0, ...selectedCatId.slice(0, -1)]
                    // const obs = []
                    // // 0, 1, 3, 4
                    // // 1, 3, 4, 21
                    // all.forEach((id, i) => {
                    //     obs.push(this.ds.categoriesList({ parent_id: id }))
                    // })
                    // zip(...obs).subscribe(result => {
                    //     result.forEach((resp: any, i) => {
                    //         this.fetchingCategories = false
                    //         if (resp.data.length > 0) {
                    //             this.categoriesList.push(resp.data)
                    //             this.addCategoryGroup(selectedCatId[i])
                    //         }
                    //     })
                    // })
                    // this.dataForm.controls.tag_ids.setValue(resp.data.user.tag_ids)
                }
            })
        }
    }

    get g() {
        return this.dataForm.controls
    }

    get categories() {
        return this.dataForm.get('categories') as FormArray
    }

    fetchCategories(parentId, selectedId = null) {
        const categoryParam = {
            parent_id: parentId
        }
        this.ds.categoriesList(categoryParam).subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)

                return false
            } else {
                if (resp.data.length > 0) {
                    this.categoriesList.push(resp.data)
                    this.addCategoryGroup(selectedId)
                }
            }
        })
    }

    addCategoryGroup(selectedId) {
        this.categories.push(this.fb.group({
            category_id: new FormControl(selectedId, [Validators.required])
        }))
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

    addInfo(data: any, f: any) {
        this.productDetailLoading = true
        if (data.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.productDetailLoading = false

            return false
        }

        if (this.selectedTags === null) {
            this.alert.error('Tag is requried.')
        }

        // const lastIndex = this.categories.length - 1
        // const categories = []
        // this.categories.controls.forEach(cat => {
        //     categories.push(cat.value.category_id)
        // })

        const params = {
            id: this.dataForm.value.id,
            sku: this.dataForm.value.sku,
            // name: this.dataForm.value.name,
            // category_id: this.categories.controls[lastIndex].value.category_id,
            // category_ids: categories.join(','),
            // type: this.dataForm.value.type,
            personalize: this.dataForm.value.personalize,
            tag_ids: this.selectedTags
        }

        let saveMethod = this.ds.addProductDetail(params)
        if (this.ds.productId > -1) {
            saveMethod = this.ds.updateProductDetail(params)
        }
        // saveMethod.subscribe((resp: any) => {
        //     this.productDetailLoading = false
        //     if (resp.success === false) {
        //         this.alert.error(resp.errors.general)
        //         this.productDetailLoading = false

        //         return false
        //     } else {
        //         if (this.ds.productId > -1) {
        //             this.alert.success('Product updated successfully!!')
        //         } else {
        //             this.ds.productId = resp.data
        //             this.alert.success('Product created successfully!!')
        //         }
        //         this.router.navigate([this.api.checkUser() + '/product/picture'], { queryParams: { id: this.ds.productId }, replaceUrl: true })
        //     }
        // })
        this.router.navigate([this.api.checkUser() + '/products/personalized-region'], { queryParams: { id: this.ds.productId }, replaceUrl: true })
    }
}
