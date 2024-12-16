import { ConstantsService } from 'src/app/services/constants.service'
import { Component, OnInit, TemplateRef } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ApiService } from 'src/app/services/api.service'
import { DataService } from './data.service'
import * as moment from 'moment'

@Component({
    selector: 'app-outstanding-orders',
    templateUrl: './outstanding-orders.component.html',
    styleUrls: ['./outstanding-orders.component.css']
})
export class OutstandingOrdersComponent implements OnInit {

    modalRef: BsModalRef
    selectedIndex = -1
    selectedId: any
    moment = moment
    page: number = 1
    dataStatus = 'fetching'
    loginLoading = false
    dataList = []
    pagination: any = []
    searchKeyword = ''
    searchKeyword$: Subject<string> = new Subject<string>()
    searchKeywordSub: any
    responseForm: FormGroup
    orderIds = []
    orderUserEmail: any
    orderUserId: any
    orderStoreId: any

    breadCrum = [
        {
            link: '',
            value: 'Outstanding Orders'
        }
    ]
    filters = {
        orderBy: '',
        order: '',
        perPage: 15,
    }
    loaderOptions = {
        rows: 5,
        cols: 6,
        colSpans: {
            0: 1,
        }
    }
    constructor(
        public ds: DataService,
        public ui: UIHelpers,
        private alert: IAlertService,
        public ms: BsModalService,
        public api: ApiService,
        private router: Router,
        public cs: ConstantsService,
        public route: ActivatedRoute,
        private fb: FormBuilder,

    ) {
        this.responseForm = this.fb.group({
            invoice_date: new FormControl(null, [Validators.required]),
            client_email: new FormControl(null, [Validators.required]),
            cc_email: new FormControl(null),
            bcc_email: new FormControl(null),
            note: new FormControl(null),


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
            // if (params.request_type) {
            //     this.filters.request_type = params.request_type
            // }
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

    ngOnInit() {
    }
    getList() {
        const params = {
            page: this.page,
            keyword: this.searchKeyword,
            order_by: this.filters.orderBy,
            order: this.filters.order,
            per_page: this.filters.perPage,
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

    get g() {
        return this.responseForm.controls
    }

    showItem(i: any, id) {
        this.dataList[i].collapse = !this.dataList[i].collapse
        if (this.dataList[i].orderItems) {
            return
        }
        this.dataList[i].dataStatusInner = 'fetching'
        const param = {
            order_id: id
        }
        this.ds.orderItem(param).subscribe((resp: any) => {
            if (resp.success === true) {
                this.dataList[i].orderItems = resp.data
                this.dataList[i].dataStatusInner = 'done'
            }
        })

    }

    selectPerPage(e: any) {
        this.filters.perPage = e.target.value
        this.page = 1

        this.getList()
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
        this.router.navigate(['/user/outstanding-orders'], { queryParams: filtersParam, replaceUrl: true })
    }
    searchKeywordChange(value: string) {
        this.searchKeyword$.next(value)
    }

    openModal(template) {
        this.responseForm.controls.client_email.setValue(this.orderUserEmail)

        this.modalRef = this.ms.show(template, {
            class: 'modal-md admin-panel',
            backdrop: 'static',
            ignoreBackdropClick: true,
            keyboard: false,
        })
    }
    addOrders(id, email, userId, storeId) {
        if (this.orderIds.length == 0) {
            this.orderUserEmail = email
            this.orderUserId = userId
            this.orderStoreId = storeId
        }
        if (storeId !== this.orderStoreId) {
            this.alert.error(`You cann't select this order`)

            return false
        }
        const getIndex = this.orderIds.findIndex((e) => e === id)

        if (getIndex !== -1) {
            this.orderIds.splice(getIndex, 1)
        } else {
            this.orderIds.push(id)
        }
    }
    checkExistance(id) {
        const getIndex = this.orderIds.findIndex((e) => e === id)

        if (getIndex !== -1) {
            return true
        } else {
            return false
        }
    }
    SaveResponse(data, f) {

        this.loginLoading = true
        if (data.status === 'INVALID') {
            this.alert.error('Please fill-in valid data and try again.')
            this.loginLoading = false
            return false
        }
        if (this.orderIds.length === 0) {
            this.alert.error('No order is selected.')
            this.loginLoading = false
            return false
        }

        const params = {
            client_email: data.value.client_email,
            cc_email: data.value.cc_email,
            bcc_email: data.value.bcc_email,
            notes: data.value.note,
            invoice_date: moment(data.value.invoice_date).format('YYYY-MM-DD'),
            orderIds: this.orderIds,
            user_id: this.orderUserId
        }

        this.ds.createInvoice(params).subscribe(resp => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.loginLoading = false
                return false
            } else {
                this.orderIds = []
                this.loginLoading = false
                this.router.navigate(['/user/invoice'], { replaceUrl: true })
                this.alert.success('Invoice created successfully!!')
                f.resetForm()
                this.modalRef.hide()
            }
        })
    }
    closeModal(d: any) {
        this.orderIds = []
        d.resetForm()
        this.modalRef.hide()
    }

    getStatusFormat(status: string) {
        const statusFormat = {
            received: 'Received',
            in_factory: 'In Factory',
            in_packing: 'In Packing',
            dispatched: 'Dispatched',
            delivered: 'Delivered',
            rejected: 'Rejected',
            returned: 'Returned',
            returned_received: 'Returned Received',
        }

        return statusFormat[status]
    }
}
