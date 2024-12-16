import { ConstantsService } from 'src/app/services/constants.service'
import { Component, OnInit, TemplateRef } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ApiService } from 'src/app/services/api.service'
import { DataService } from './data.service'
import * as moment from 'moment'

@Component({
    selector: 'app-order',
    templateUrl: './order.component.html',
    styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {
    selectStores = []
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
    normalForm: FormGroup
    dispatchedForm: FormGroup
    deliveredForm: FormGroup
    cancelForm: FormGroup
    returnedForm: FormGroup
    returnedReceivedForm: FormGroup
    changeStatusValue: any
    reasonList = []

    breadCrum = [
        {
            link: '',
            value: 'Orders'
        }
    ]

    filters = {
        orderBy: 'id',
        order: 'desc',
        perPage: 15,
        store: [],
        status: [],
        fromDate: '',
        toDate: ''
    }
    loaderOptions = {
        rows: 5,
        cols: 9,
        colSpans: {
            0: 1,
        }
    }
    builtInTechnology = {
        shopify: '/assets/img/Shopify.png',
        woocommerce: '/assets/img/WooCommerce.png',
        wordpress: '/assets/img/WordPress.png',
        API: '/assets/img/application-programming-interface.png',
        etsy: '/assets/img/Etsy.png',
        ebay: '/assets/img/Ebay.png'
    }
    bsRangeValue: Date[]
    allSelector: boolean = false
    selectedDataList: Array<any> = []
    selectStatuses = []
    statusesList = [
        { value: 'Received', name: 'Received' },
        { value: 'InProduction', name: 'InProduction' },
        { value: 'QCQuery', name: 'QCQuery' },
        { value: 'Consolidating', name: 'Consolidating' },
        { value: 'AwaitingDispatch', name: 'AwaitingDispatch' },
        { value: 'Dispatched', name: 'Dispatched' },
        { value: 'Delivered', name: 'Delivered' },
        { value: 'Canceled', name: 'Canceled' },
        { value: 'Drafts', name: 'Drafts' },
    ]
    storeList = []
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
        this.ds.getStoreList().subscribe((resp) => {
            if (resp.success == true) {
                this.storeList = resp.data
            }
        })
        this.normalForm = this.fb.group({
            order_status: new FormControl(null, [Validators.required]),
        })
        this.dispatchedForm = this.fb.group({
            order_status: new FormControl(null, [Validators.required]),
            // courier_service_id: new FormControl(1, [Validators.required]),
            // dispatch_time: new FormControl(null, [Validators.required]),
            dt_number: new FormControl(null, [Validators.required])
        })
        this.deliveredForm = this.fb.group({
            order_status: new FormControl(null, [Validators.required]),
            // received_time: new FormControl(null, [Validators.required])
        })
        this.cancelForm = this.fb.group({
            order_status: new FormControl(null, [Validators.required]),
            // cancel_date_time: new FormControl(null, [Validators.required]),
            reason_id: new FormControl(null, [Validators.required]),
            description: new FormControl(null)
        })
        this.returnedForm = this.fb.group({
            order_status: new FormControl(null, [Validators.required]),
            returned_date: new FormControl(null, [Validators.required]),
            reason_id: new FormControl(null, [Validators.required]),
            description: new FormControl(null)
        })
        this.returnedReceivedForm = this.fb.group({
            order_status: new FormControl(null, [Validators.required]),
            returned_received_date: new FormControl(null, [Validators.required]),
            // received_by: new FormControl(null, [Validators.required]),
            description: new FormControl(null)
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

        this.ds.getReasons().subscribe((resp) => {
            if (resp.success == true) {
                this.reasonList = resp.data
            }
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
            store_ids: this.filters.store,
            statuses: this.filters.status,
            from_date: this.filters.fromDate,
            to_date: this.filters.toDate,
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
    selectedStore() {
        this.filters.store = []
        this.filters.store = this.selectStores
        this.page = 1
        console.log(this.selectStores)
        this.getList()
    }
    selectedStatus() {

        this.filters.status = []
        this.filters.status = this.selectStatuses
        this.page = 1

        this.getList()
    }
    rangeDate() {
        if (this.bsRangeValue != null) {
            this.filters.fromDate = moment(this.bsRangeValue[0]).format('YYYY-MM-DD')
            this.filters.toDate = moment(this.bsRangeValue[1]).format('YYYY-MM-DD')
        }
        this.getList()
    }
    getTabData(tabName: any) {
        this.filters.status = []
        this.selectStatuses = []
        if (tabName) {
            this.filters.status.push(tabName)
        }
        this.page = 1

        this.getList()
    }

    get g1() {
        return this.dispatchedForm.controls
    }
    get g2() {
        return this.deliveredForm.controls
    }
    get g3() {
        return this.cancelForm.controls
    }
    get g4() {
        return this.returnedForm.controls
    }
    get g5() {
        return this.returnedReceivedForm.controls
    }
    get g6() {
        return this.normalForm.controls
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
                // this.dataList[i].totalCost = 0
                // this.dataList[i].pendingItems.forEach(e => {
                //     this.dataList[i].totalCost = this.dataList[i].totalCost + (+e.base_cost) + (+e.base_additional_cost)
                // })
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
        this.router.navigate(['/user/orders'], { queryParams: filtersParam, replaceUrl: true })
    }
    searchKeywordChange(value: string) {
        this.searchKeyword$.next(value)
    }

    confirmingModal(template: TemplateRef<any>, id: any, i: any) {
        this.selectedId = id
        this.selectedIndex = i
        this.modalRef = this.ms.show(template, {
            class: 'modal-sm modal-dialog-centered admin-panel',
            backdrop: 'static',
            ignoreBackdropClick: true,
            keyboard: false
        })
    }
    changeStatuscancel() {
        this.loginLoading = true
        const params = {
            id: this.selectedId,
            order_status: 'canceled'
        }
        this.ds.changeStatus(params).subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.loginLoading = false

                return false
            } else {
                this.dataList[this.selectedIndex].order_status = 'canceled'
                this.alert.success(`Status changed to Canceled`)
                this.modalRef.hide()
            }
        })
    }

    checkStatus(val: any) {
        this.changeStatusValue = val.target.value

        if (this.changeStatusValue == 'received' || this.changeStatusValue == 'in_factory' || this.changeStatusValue == 'in_packing') {
            this.normalForm.controls.order_status.setValue(this.changeStatusValue)
        } else if (this.changeStatusValue == 'dispatched') {
            this.dispatchedForm.controls.order_status.setValue(this.changeStatusValue)
        } else if (this.changeStatusValue == 'delivered') {
            this.deliveredForm.controls.order_status.setValue(this.changeStatusValue)
        } else if (this.changeStatusValue == 'rejected') {
            // else if (this.changeStatusValue == 'canceled_by_client' || this.changeStatusValue == 'canceled_by_SEPOD') {
            this.cancelForm.controls.order_status.setValue(this.changeStatusValue)
        } else if (this.changeStatusValue == 'returned') {
            this.returnedForm.controls.order_status.setValue(this.changeStatusValue)
        } else if (this.changeStatusValue == 'returned_received') {
            this.returnedReceivedForm.controls.order_status.setValue(this.changeStatusValue)
        }
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

    SaveResponse(data, f) {

        this.loginLoading = true
        if (data.status === 'INVALID') {
            this.alert.error('Please fill-in valid data and try again.')
            this.loginLoading = false
            return false
        }
        let formData: any
        if (data.value.order_status == 'returned') {
            const params = {
                description: data.value.description,
                reason_id: data.value.reason_id,
                returned_date: moment(data.value.returned_date).format('YYYY-MM-DD'),
                order_status: this.returnedForm.controls.order_status.value
            }
            formData = this.api.jsonToFormData(params)


        } else if (data.value.order_status == 'returned_received') {
            const params = {
                order_status: this.returnedReceivedForm.controls.order_status.value,
                returned_received_date: moment(data.value.returned_received_date).format('YYYY-MM-DD'),
                description: data.value.description
            }
            formData = this.api.jsonToFormData(params)

        } else {
            formData = this.api.jsonToFormData(data.value)
        }
        formData.append('id', this.selectedId)
        // const formData = this.api.jsonToFormData(data.value)
        // formData.append('id', this.selectedId)
        this.ds.changeStatus(formData).subscribe((resp) => {
            console.log('Resp is ', resp)
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.loginLoading = false
            } else {
                this.dataList[this.selectedIndex].order_status = formData.get('order_status')
                this.alert.success('Status change successfully!!')
                this.loginLoading = false
                this.changeStatusValue = null
                f.resetForm()
                this.modalRef.hide()
            }
        })
        // this.ds.changeStatus(formData).subscribe(resp => {

        // })
        // if (this.poRequestStatus === 'approve') {
        //     this.ds.poRequestApprove(params).subscribe(resp => {
        //         if (resp.success === true) {
        //             this.alert.success('PO request approved successfully!!')
        //             this.dataList.splice(this.selectedIndex, 1)
        //         }
        //         this.loginLoading = false
        //         f.resetForm()
        //         this.modalRef.hide()
        //         this.dataList.splice(this.selectedIndex, 1)
        //     })
        // } else {
        //     this.ds.poRequestReject(params).subscribe(resp => {
        //         if (resp.success === true) {
        //             this.alert.success('PO request rejected successfully!!')
        //             this.dataList.splice(this.selectedIndex, 1)
        //         }
        //         this.loginLoading = false
        //         f.resetForm()
        //         this.modalRef.hide()
        //         this.dataList.splice(this.selectedIndex, 1)
        //     })
        // }
    }

    closeModal(d: any) {
        this.changeStatusValue = null
        d.resetForm()
        this.modalRef.hide()
    }
    selectAllOrders() {
        if (this.selectedDataList.length === this.dataList.length) {
            this.selectedDataList = []
            this.allSelector = false
        } else {
            this.dataList.forEach(item => {
                const index = this.selectedDataList.findIndex((order) => order.id === item.id)
                if (index === -1) {
                    this.selectedDataList.push(item)
                }
            })
            this.allSelector = true
        }
    }
    checkOrder(id: any): any {
        if (this.selectedDataList) {
            if (this.selectedDataList.findIndex(x => x.id === id) > -1) {
                return true
            }
        }
    }
    selectOrder(id: any) {
        const index = this.selectedDataList.findIndex((order) => order.id === id)
        if (index === -1) {
            this.selectedDataList.push(this.dataList[this.dataList.findIndex((order) => order.id === id)])
            if (this.selectedDataList.length === this.dataList.length) {
                this.allSelector = true
            } else {
                this.allSelector = false
            }
        } else {
            this.selectedDataList.splice(index, 1)
            this.allSelector = false
        }
    }
    exportCsv() {
        const params = {
            keyword: this.searchKeyword,
            order_by: this.filters.orderBy,
            order: this.filters.order,
            per_page: this.filters.perPage,
            store_id: this.filters.store,
            order_status: this.filters.status,
            order_ids: ''
        }
        
        const temp = []
        this.selectedDataList.forEach((item) => {
            temp.push(item.id)
        })
        params.order_ids = temp.toString()

        if (params.order_ids === '') {
            this.alert.error('Please select the order for export.')

            return
        }

        this.ds.exportCsv(params).subscribe(resp => {
            if (resp.success == false) {
                this.alert.error('Error ecour!!')
                return false
            }

            const blob = new Blob([resp], { type: "text/plain" })
            const downloadURL = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = downloadURL
            link.download = 'client-order.xlsx'
            link.click()
            this.loginLoading = false
        })
    }
}
