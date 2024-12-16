import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ApiService } from 'src/app/services/api.service'
import { DataService } from './data.service'

@Component({
    selector: 'app-store-credential',
    templateUrl: './store-credential.component.html',
    styleUrls: ['./store-credential.component.css']
})
export class StoreCredentialComponent implements OnInit, OnDestroy {
    dataStatus = 'fetching'
    dataList = []
    dataForm: FormGroup
    selectedIndex = -1
    modalRef: BsModalRef
    selectedId: any
    modalTitle: any = ''
    loginLoading = false
    LoadingActive = false
    LoadingDeactive = false
    selectedStatus = ''
    isChecked = false
    pagination: any = []
    page = 1
    searchKeyword: string = ''
    searchKeyword$: Subject<string> = new Subject<string>()
    searchKeywordSub: any
    credentailToken: any
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
        perPage: 15
    }
    storeId: any = ''
    breadCrum1 = [
        {
            link: '/user/store',
            value: 'Store',
            params: { store_id: this.storeId }
        }
    ]

    breadCrum2 = [
        {
            link: '/user/sepod-stores/list',
            value: 'SEPOD Stores',
            params: { store_id: this.storeId }
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
        this.storeId = this.route.snapshot.queryParamMap.get('store_id')
        console.log(route.snapshot.data.breadCrum)

        if (this.route.snapshot.data.breadCrum == 'store') {
            this.breadCrum1.push({
                link: '/user/store-credential',
                params: { store_id: this.storeId },
                value: 'Store Credential List'
            })
        } else {
            if (this.route.snapshot.data.breadCrum == 'sepod-store') {
                this.breadCrum2.push({
                    link: '/user/store-credential',
                    params: { store_id: this.storeId },
                    value: 'Store Credential List'
                })
            }
        }

        this.dataForm = this.fb.group({
            id: new FormControl(null),
            identifier: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
            status: new FormControl('active')
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
            if (params.store_id) {
                this.storeId = params.store_id
            }
            if (params) {
                this.getList()
            }
        })

        this.searchKeywordSub = this.searchKeyword$.pipe(
            debounceTime(1000), // wait 1 sec after the last event before emitting last event
            distinctUntilChanged(), // only emit if value is different from previous value
        ).subscribe(searchKeyword => {
            this.page = 1
            this.getList()
        })
    }

    ngOnDestroy(): void {
        this.searchKeywordSub.unsubscribe()
    }

    ngOnInit() {
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

        this.getList()
    }

    selectPerPage(event) {
        this.filters.perPage = event.target.value
        this.page = 1

        this.getList()
    }

    getList() {
        const params = {
            page: this.page,
            keyword: this.searchKeyword,
            order_by: this.filters.orderBy,
            order: this.filters.order,
            per_page: this.filters.perPage,
            store_id: this.storeId,
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
            store_id: this.storeId,
        }
        this.router.navigate(['/user/store-credential'], { queryParams: filtersParam, replaceUrl: true })
    }

    openModal(formModal, index) {
        this.modalTitle = 'Add New Store Credential'
        if (index > -1) {
            this.selectedIndex = index
            this.dataForm.controls.id.setValue(this.dataList[index].id)
            this.dataForm.patchValue(this.dataList[index])
            this.modalTitle = 'Edit Store Credential'
        }
        this.modalRef = this.ms.show(
            formModal,
            {
                class: 'modal-md modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
    }

    credentialModal(credentialModal, id: any, index) {
        this.modalTitle = 'Store Credential'
        this.selectedId = id
        this.selectedIndex = index

        this.dataList.map(token => {
            if (token.id === this.selectedId) {
                this.credentailToken = token.token
            }
        })
        this.modalRef = this.ms.show(
            credentialModal,
            {
                class: 'modal-md modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
    }

    statusConfirmingModal(changeStatus: TemplateRef<any>, id: number, index: number, status: string) {
        this.selectedId = id
        this.selectedIndex = index
        this.selectedStatus = status
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

    copyFun(token) {
        token.select()
        document.execCommand('copy')
        token.setSelectionRange(0, 0)
        this.alert.success('Credentail key is copied!!')
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
            store_id: this.storeId,
            identifier: this.dataForm.value.identifier
        }

        let saveUpdate = this.ds.add(params)
        if (this.dataForm.value.id !== null) {
            saveUpdate = this.ds.update(params)
            this.selectedId = -1
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
                    this.dataList[this.selectedIndex] = resp.data
                    this.dataForm.controls.id.setValue(null)

                } else {
                    params.id = resp.data.id
                    this.alert.success('Added successfully!!')
                    resp.data.status = 'active'
                    this.dataList.push(resp.data)
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
            id: this.selectedId
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
            id: this.selectedId
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
