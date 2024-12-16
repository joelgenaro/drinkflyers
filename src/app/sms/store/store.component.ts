import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { Subject } from 'rxjs'
import { DataService } from './data.service'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ApiService } from 'src/app/services/api.service'
import { ActivatedRoute, Router } from '@angular/router'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'

@Component({
    selector: 'app-store',
    templateUrl: './store.component.html',
    styleUrls: ['./store.component.css']
})
export class StoreComponent implements OnInit, OnDestroy {
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
    clientList = []
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
    breadCrum = [
        {
            link: '',
            value: 'Client Stores'
        }
    ]
    ebay = {
        link: '',
        clientId: '',
        redirectUri: '',
        responseType: '',
        promt: ''
    }
    ebayConnectionData: any
    etsy = {
        link: '',
        codeChallenge: '',
        codeChallengeMethod: '',
        clientId: '',
        redirectUri: '',
        responseType: '',
        scope: '',
        state: ''
    }
    etsyConnectionData: any
    amazon = {
        link: '',
        applicationId: '',
        version: ''
    }
    amazonConnectionData: any

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
            user_id: new FormControl(null, [Validators.required]),
            store_credentials: new FormControl(null),
            store_name: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
            web: new FormControl(null, [Validators.required]),
            builtin_technology: new FormControl(null, [Validators.required]),
            store_type: new FormControl(null, [Validators.required]),
            web_secrete: new FormControl(null),
            shopify_token: new FormControl(null)
            // full_name: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
            // discount_percentage: new FormControl(null),
            // short_name: new FormControl(null, [Validators.required]),
            // poc_name: new FormControl(null, [Validators.required]),
            // poc_contact: new FormControl(null, [Validators.required]),
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
            debounceTime(1000), // wait 1 sec after the last event before emitting last event
            distinctUntilChanged(), // only emit if value is different from previous value
        ).subscribe(searchKeyword => {
            this.page = 1
            this.getList()
        })

        this.ds.getEbayConnectionData().subscribe(resp => {
            if (resp.success === true) {
                this.ebayConnectionData = resp.data
                this.ebay.link = resp.data.url
                this.ebay.clientId = resp.data.clientId
                this.ebay.redirectUri = resp.data.redirect_uri
                this.ebay.responseType = resp.data.response_type
                this.ebay.promt = resp.data.promt
            } else {
                this.alert.error(resp.general.errors)
            }
        })
        this.ds.getEtsyConnectionData().subscribe(resp => {
            if (resp.success === true) {
                this.etsyConnectionData = resp.data
                this.etsy.link = resp.data.url
                this.etsy.codeChallenge = resp.data.code_challenge
                this.etsy.codeChallengeMethod = resp.data.code_challenge_method
                this.etsy.clientId = resp.data.client_id
                this.etsy.redirectUri = resp.data.redirect_uri
                this.etsy.responseType = resp.data.response_type
                this.etsy.scope = resp.data.scope
                this.etsy.state = resp.data.state
            } else {
                this.alert.error(resp.general.errors)
            }
        })
        this.ds.getAmazonConnectionData().subscribe(resp => {
            if (resp.success === true) {
                this.amazonConnectionData = resp.data
                this.amazon.link = resp.data.url
                this.amazon.applicationId = resp.data.application_id
                this.amazon.version = resp.data.version
            } else {
                this.alert.error(resp.general.errors)
            }
        })
    }

    ngOnDestroy(): void {
        this.searchKeywordSub.unsubscribe()
    }

    ngOnInit() {
        this.ds.getClientList().subscribe(resp => {
            if (resp.success === true) {
                this.clientList = resp.data
            }
        })
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
            per_page: this.filters.perPage
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
            per_page: this.filters.perPage
        }
        this.router.navigate([this.api.checkUser() + '/store'], { queryParams: filtersParam, replaceUrl: true })
    }

    openModal(formModal, index) {
        this.modalTitle = 'Add New Store'
        if (index > -1) {
            this.selectedIndex = index
            this.dataForm.controls.id.setValue(this.dataList[index].id)
            this.dataForm.patchValue(this.dataList[index])
            this.modalTitle = 'Edit Store'
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

    save(f: any) {
        this.loginLoading = true
        if (this.dataForm.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.loginLoading = false

            return false
        }
        const params: any = {
            id: this.dataForm.value.id,
            user_id: this.dataForm.value.user_id,
            store_name: this.dataForm.value.store_name,
            web: this.dataForm.value.web,
            builtin_technology: this.dataForm.value.builtin_technology,
            store_type: this.dataForm.value.store_type,
            web_secrete: this.dataForm.value.web_secrete,
            shopify_token: this.dataForm.value.shopify_token,
            store_credentials: this.dataForm.value.store_credentials
        }

        let saveUpdate = this.ds.add(params)
        if (this.dataForm.value.id !== null) {
            saveUpdate = this.ds.update(params)
            this.selectedId = -1
        } else {
            params.status = 'active'
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

    viewStore(siteTech: any) {
        if (siteTech === 'shopify') {
            window.open('https://www.shopify.com/', '_blank')
        }
        if (siteTech === 'woocommerce') {
            window.open('https://woocommerce.com/', '_blank')
        }
        if (siteTech === 'wordpress') {
            window.open('https://wordpress.org/download/', '_blank')
        }
        if (siteTech === 'API') {
            window.open('https://www.google.com/search?q=api', '_blank')
        }
    }

    ebayConnetFunction() {
        if (this.ebayConnectionData) {
            window.open(this.ebay.link + '?client_id=' + this.ebay.clientId + '&redirect_uri=' + this.ebay.redirectUri + '&response_type=' + this.ebay.responseType + '&promt=' + this.ebay.promt)
        } else {
            this.alert.error('Some data is missing from Ebay.')
        }
    }

    etsyConnetFunction() {
        if (this.ebayConnectionData) {
            window.open(this.etsy.link + '?code_challenge=' + this.etsy.codeChallenge + '&code_challenge_method=' + this.etsy.codeChallengeMethod + '&client_id=' + this.etsy.clientId + '&redirect_uri=' + this.etsy.redirectUri + '&response_type=' + this.etsy.responseType + '&scope=' + this.etsy.scope + '&state=' + this.etsy.state)
        } else {
            this.alert.error('Some data is missing from Etsy.')
        }
    }
    amazonConnetFunction() {
        // window.open('https://sellercentral-europe.amazon.com/apps/authorize/consent' + '?application_id=' + 'amzn1.application-oa2-client.4fd021b0c03d45aab7d1fa275bccfbbd' + '&version=' + 'beta')
        if (this.amazonConnectionData) {
            window.open(this.amazon.link + '?application_id=' + this.amazon.applicationId + '&version=' + this.amazon.version)
        } else {
            this.alert.error('Some data is missing from Amazon.')
        }
    }
}
