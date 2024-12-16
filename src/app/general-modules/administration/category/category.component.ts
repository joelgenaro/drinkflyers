import { DataService } from './data.service'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ApiService } from 'src/app/services/api.service'

@Component({
    selector: 'app-category',
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit, OnDestroy {
    dataStatus = 'fetching'
    dataList: any = []
    dataForm: FormGroup
    selectedIndex = -1
    modalRef: BsModalRef
    selectedId: any
    selectedServiceId: any
    modalTitle: any = ''
    loginLoading = false
    LoadingActive = false
    LoadingDeactive = false
    selectedStatus = ''
    isChecked = false
    parentListStatus = "fetch"
    parentId: number = 0
    catName
    parentCategoriesList
    pagination: any = []
    page = 1
    searchKeyword: string = ''
    searchKeyword$: Subject<string> = new Subject<string>()
    searchKeywordSub: any
    loaderOptions = {
        rows: 5,
        cols: 4,
        colSpans: {
            0: 1,
        }
    }
    filters = {
        orderBy: '',
        order: '',
        perPage: 15,
        parent_id: 0
    }
    breadCrum = [
        {
            link: this.api.checkUser() + '/category',
            value: 'Product Categories',
            params: { id: 0 }
        }
    ]

    constructor(
        public ds: DataService,
        private fb: FormBuilder,
        public ui: UIHelpers,
        private alert: IAlertService,
        public ms: BsModalService,
        public api: ApiService,
        private router: Router,
        public route: ActivatedRoute
    ) {
        this.dataForm = this.fb.group({
            id: new FormControl(null),
            name: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
            status: new FormControl('active'),
            // parent_id: new FormControl(null)
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
            if (params.id) {
                this.parentId = params.id
                this.filters.parent_id = params.id
            }

            if (params) {
                this.getCategoryList()
            }
            if (this.parentId > 0) {
                this.ds.parentCategoriesList(this.parentId).subscribe((resp: any) => {
                    this.parentCategoriesList = resp.data
                    this.parentListStatus = 'done'

                    this.breadCrum = [
                        {
                            link: this.api.checkUser() + '/category',
                            value: 'Product Categories',
                            params: { id: 0 }
                        }
                    ]
                    this.parentCategoriesList.forEach(cat => {
                        this.breadCrum.push({
                            link: this.api.checkUser() + '/category',
                            params: { id: cat.id },
                            value: cat.name
                        })
                    })
                })
            }
        })

        this.searchKeywordSub = this.searchKeyword$.pipe(
            debounceTime(1000), // wait 1 sec after the last event before emitting last event
            distinctUntilChanged(), // only emit if value is different from previous value
        ).subscribe(searchKeyword => {
            this.page = 1
            this.getCategoryList()
        })
    }
    ngOnDestroy(): void {
        this.searchKeywordSub.unsubscribe()
    }

    ngOnInit() {
        this.parentId = this.filters.parent_id

    }

    get g() {
        return this.dataForm.controls
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

        this.getCategoryList()
    }

    selectPerPage(e: any) {
        this.filters.perPage = e.target.value
        this.page = 1

        this.getCategoryList()
    }

    getCategoryList() {
        let params = {
            page: this.page,
            keyword: this.searchKeyword,
            order_by: this.filters.orderBy,
            order: this.filters.order,
            per_page: this.filters.perPage,
            parent_id: this.filters.parent_id
        }

        const list = this.ds.list(params)
        list.subscribe((resp: any) => {
            if (resp.success === true) {
                this.dataList = resp.data.data
                this.pagination = resp.data
                this.dataStatus = 'done'
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
            per_page: this.filters.perPage,
            id: this.filters.parent_id
        }
        this.router.navigate([this.api.checkUser() + '/category'], { queryParams: filtersParam, replaceUrl: true })
    }

    openModal(designationModal, index) {
        this.modalTitle = 'Add New Product Category'
        if (index > -1) {
            this.selectedIndex = index
            this.dataForm.controls.id.setValue(this.dataList[index].id)
            this.dataForm.patchValue(this.dataList[index])
            this.modalTitle = 'Edit Product Categories'
        }
        this.modalRef = this.ms.show(
            designationModal,
            {
                class: 'modal-md modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
    }

    statusConfirmingModal(changeStatus: TemplateRef<any>, id: number, index: number, status: string, name: string) {
        this.selectedServiceId = id
        this.selectedIndex = index
        this.selectedStatus = status
        this.catName = name

        this.modalRef = this.ms.show(
            changeStatus,
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
        if (this.dataForm.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.loginLoading = false

            return false
        }
        const params = {
            id: this.dataForm.value.id,
            name: this.dataForm.value.name,
            status: this.dataForm.value.status,
            parent_id: this.parentId,
        }

        let saveUpdate = this.ds.add(params)
        if (this.dataForm.value.id !== null) {
            saveUpdate = this.ds.update(params)
            this.selectedId = -1
        } else {
            params.status = 'active'
            params.parent_id = this.parentId
        }

        saveUpdate.subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.loginLoading = false

                return false
            } else {
                if (this.dataForm.value.id !== null) {
                    this.alert.success('Changes done successfully!!')
                    this.dataList[this.selectedIndex] = params
                    this.dataForm.controls.id.setValue(null)

                } else {
                    params.id = resp.data
                    this.alert.success('Added successfully!!')
                    this.dataList.push(params)
                }
            }
            if (!this.isChecked) {
                this.modalRef.hide()
            }
            f.resetForm()
        })
    }

    delete() {
        this.loginLoading = true
        const params = {
            id: this.selectedId
        }
        this.ds.delete(params).subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.modalRef.hide()
                this.loginLoading = false

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
        this.modalRef = this.ms.show(template, { class: 'modal-sm admin-panel' })
    }

    cancelButton(f: any) {
        f.resetForm()
        this.modalRef.hide()
        this.selectedIndex = -1
    }

    changeStatusAct() {
        this.loginLoading = true
        const params = {
            id: this.selectedServiceId,
            // status: this.selectedStatus
        }
        this.ds.changeStatusActive(params).subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.loginLoading = false

                return false
            } else {
                this.dataList[this.selectedIndex].status = this.selectedStatus
                this.alert.success(`Status changed to ${this.selectedStatus}`)
                this.modalRef.hide()
            }
        })
    }

    changeStatusInact() {
        this.loginLoading = true
        const params = {
            id: this.selectedServiceId
        }
        this.ds.changeStatusInactive(params).subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.loginLoading = false

                return false
            } else {
                this.dataList[this.selectedIndex].status = this.selectedStatus
                this.alert.success(`Status changed to ${this.selectedStatus}`)
                this.modalRef.hide()
            }
        })
    }

    searchKeywordChange(value: string) {
        this.searchKeyword$.next(value)
    }

    getSerialNumber(i: number) {
        return ((this.pagination.current_page - 1) * this.pagination.per_page) + i + 1
    }
}
