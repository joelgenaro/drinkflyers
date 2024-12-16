import { ThrowStmt } from '@angular/compiler'
import { parseI18nMeta } from '@angular/compiler/src/render3/view/i18n/meta'
import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core'
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { Subject } from 'rxjs'
import { debounceTime } from 'rxjs/operators'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ApiService } from 'src/app/services/api.service'
import { DataService } from './data.service'

@Component({
    selector: 'app-product-bulk-upload-data',
    templateUrl: './product-bulk-upload-data.component.html',
    styleUrls: ['./product-bulk-upload-data.component.css']
})
export class ProductBulkUploadDataComponent implements OnInit, OnDestroy {
    dataForm: FormGroup
    experienceLoading = false
    documentLoading = false
    id: any
    Loading = false
    formName: any = 'Add Font'
    childCategories = []
    baseProductList = []
    tagList = []
    btnName: any = 'Browse'
    dataList = []
    resultStatus = false
    fileIndex: any

    dataStatus = 'fetching'
    selectedTags: any

    selectedIndex = -1
    submitData: any
    modalRef: BsModalRef
    EditModalRef: BsModalRef
    DeleteModalRef: BsModalRef
    selectedId: any
    fontFileStatus = 'fetching'
    fontId: any
    modalTitle: any = ''
    isChecked = false
    fontWeightData: any
    pagination: any = []
    page = 1
    searchKeyword: any = ''
    productIds = []
    totalProduct = 0
    totalSuccess = 0
    totalFailed = 0
    searchKeyword$: Subject<string> = new Subject<string>()
    searchKeywordSub: any
    insertion: boolean = false
    loaderOptions = {
        rows: 5,
        cols: 7,
        colSpans: {
            0: 1,
        }
    }
    filters = {
        orderBy: '',
        order: '',
        perPage: 15
    }
    prodBulkUploadDataId: any = ''
    breadCrum = [
        {
            link: '/user/product-bulk-upload-list',
            value: 'Product Bulk Upload List',
            params: { id: this.prodBulkUploadDataId }
        }
    ]

    constructor(
        private fb: FormBuilder,
        public ui: UIHelpers,
        public alert: IAlertService,
        private ds: DataService,
        private router: Router,
        private route: ActivatedRoute,
        public ms: BsModalService,
        public api: ApiService
    ) {
        this.id = this.route.snapshot.queryParamMap.get('id')
        this.ds.childCategories().subscribe(resp => {
            if (resp.success == true) {
                this.childCategories = resp.data
            }
        })

        this.ds.tagList().subscribe(resp => {
            if (resp.success == true) {
                this.tagList = resp.data
            }
        })

        this.prodBulkUploadDataId = this.route.snapshot.queryParamMap.get('id')

        this.breadCrum.push({
            link: '/user/product-bulk-upload-data',
            params: { id: this.prodBulkUploadDataId },
            value: 'Product Bulk Upload Data'
        })

        this.getList()
        this.dataForm = this.fb.group({
            id: new FormControl(null),
            name: new FormControl(null, [Validators.required]),
            sku: new FormControl(null, [Validators.required]),
            tag: new FormControl(null, [Validators.required]),
            category: new FormControl('select category', [Validators.required]),
            base_product_sku: new FormControl('null', [Validators.required])
        })

        this.route.queryParams.subscribe(params => {
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

        this.searchKeywordSub = this.searchKeyword$.pipe(
            debounceTime(1000), // only emit if value is different from previous value
        ).subscribe(searchKeyword => {
            this.page = 1
            this.getList()
        })

        this.ds.baseProductList().subscribe(resp => {
            if (resp.success == true) {
                this.baseProductList = resp.data
            }
        })
    }

    // checkUploadLimit(form){


    //     this.ds.checkUploadLimit({driver_id:this.userId}).subscribe((resp:any)=>{
    //         if(resp.data == 3){
    //             this.alert.error('Maximum uploeded file  limit is 3.')
    //         }else{

    //             this.openFormModal(form, -1, -1)
    //         }
    //     })


    // }

    ngOnDestroy(): void {
        this.searchKeywordSub.unsubscribe()
    }

    ngOnInit() {
    }

    getArrowClass(fieldName, order) {
        const className = 'arrow ' + order
        if (this.filters.orderBy === fieldName && this.filters.order === order) {

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


    browseFiles(f, i) {
        this.fileIndex = i
        const element = document.getElementById('document' + i)
        element.click()
    }

    checkAllProducts() {
        if (this.productIds.length == 0) {
            this.dataList.forEach(data => {
                if (data.status) {
                    this.productIds.push(data.id)
                }
            })
        } else {
            this.productIds = []
        }
    }

    addProduct(id, i) {
        const getIndex = this.productIds.findIndex((e) => e === id)

        if (getIndex !== -1) {
            this.productIds.splice(getIndex, 1)
        } else {
            this.productIds.push(id)
        }
    }

    checkProductId(id) {
        const getIndex = this.productIds.findIndex((e) => e === id)

        if (getIndex !== -1) {
            return true
        } else {
            return false
        }
    }

    getList() {
        const params = {
            page: this.page,
            keyword: this.searchKeyword,
            order_by: this.filters.orderBy,
            order: this.filters.order,
            per_page: this.filters.perPage,
            id: this.id
        }


        const list = this.ds.list(params)
        list.subscribe((resp: any) => {
            if (resp.success === true) {
                this.dataList = resp.data.data
                // console.log('Data is ', this.dataList)
                this.pagination = resp.data
                this.dataStatus = 'done'
            }
        })
    }

    openFormModal(form, index, d) {
        this.modalTitle = 'Add New Bulk Upload'
        if (index > -1) {
            this.selectedIndex = index
            this.dataForm.patchValue(d)
            this.modalTitle = 'Edit Bulk Upload'
        }
        this.modalRef = this.ms.show(
            form,
            {
                class: 'modal-md modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
    }

    save(data, f) {

        this.Loading = true

        if (data.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.Loading = false
            return false
        }

        this.ds.update(data.value).subscribe(resp => {
            if (resp.success == true) {
                this.dataList[this.selectedIndex] = resp.data
                this.alert.success('Updated successfully!!')
                this.Loading = false
                f.resetForm()
                this.modalRef.hide()
            } else {
                this.alert.error(resp.errors.general)
                this.Loading = false
            }
        })

    }

    addBulkProducts() {
        if (this.productIds.length === 0) {
            this.alert.error('No prodduct is selected')
            // this.Loading = false

            return false
        }
        const params = {
            id: this.prodBulkUploadDataId,
            bulk_upload_ids: this.productIds
        }
        this.ds.uploadBulkProducts(params).subscribe(resp => {
            if (resp.success == true) {
                this.alert.success("Data Inserted Successfully")
                // console.log('Response is ', resp)
                this.insertion = true
                this.resultStatus = true
                this.totalFailed = resp.data.failed_record
                this.totalProduct = resp.data.total_record
                this.totalSuccess = resp.data.success_record
                // this.bulkId = resp.data.id
                if (resp.data.bulk_upload_data.length > 0) {
                    this.dataList = resp.data.bulk_upload_data
                }
                this.productIds = []
                // console.log('Data is', resp)
            } else {
                this.alert.error(resp.errors.general)
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
            per_page: this.filters.perPage
        }
        this.router.navigate([`/user/product-bulk-upload-data/`], { queryParams: filtersParam, replaceUrl: true })
    }

    confirmingModal(template: TemplateRef<any>, id: any, i: any) {
        this.selectedId = id
        this.selectedIndex = i
        this.DeleteModalRef = this.ms.show(template, { class: 'modal-sm admin-panel' })
    }

    resetIndex() {
        this.selectedIndex = -1
    }

    searchKeywordChange(value: string) {
        this.searchKeyword$.next(value)
    }

    getSerialNumber(i: number) {
        return ((this.pagination.current_page - 1) * this.pagination.per_page) + i + 1
    }



    get g() {
        return this.dataForm.controls
    }

    cancelButton(f: any) {
        f.resetForm()
        this.modalRef.hide()
        this.btnName = 'Browse'
        this.formName = 'Add Font'
    }

    closeFileModal(f: any) {
        this.modalRef.hide()

    }

    closeFontEditModal(d: any) {
        d.resetForm()
        this.EditModalRef.hide()

    }


}
