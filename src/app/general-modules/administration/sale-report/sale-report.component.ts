import { Component, OnInit, TemplateRef } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import * as moment from 'moment'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { Subject } from 'rxjs'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ApiService } from 'src/app/services/api.service'
import { DataService } from './data.service'

@Component({
    selector: 'app-sale-report',
    templateUrl: './sale-report.component.html',
    styleUrls: ['./sale-report.component.css']
})
export class SaleReportComponent implements OnInit {
    dataStatus = 'fetching'
    dataList: any = []
    years = []
    reportType = null
    selectedIndex = -1
    selectedId: any
    cId = null
    accumulation = null
    loginLoading = false
    pagination: any = []
    page = 1
    searchKeyword: string = ''
    loaderOptions = {
        rows: 5,
        cols: 6,
        colSpans: {
            0: 1,
        }
    }
    filters = {
        orderBy: '',
        order: '',
        perPage: 15,
        fromDate: '',
        toDate: '',
        accumulation: '',
        store_id: '',
        status: '',
        user_id: ''
    }
    breadCrum = [
        {
            link: '/user/sale-report',
            value: 'Sale Reports',
            params: {},
        }
    ]
    bsRangeValue: Date[]
    invoiceObj: any

    constructor(
        public ds: DataService,
        public ui: UIHelpers,
        public ms: BsModalService,
        public api: ApiService,
        private router: Router,
        public route: ActivatedRoute,
        private alert: IAlertService
    ) {

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
            if (params.accumulation) {
                // this.filters.client_id = params.accumulation
                // this.accumulation = params.accumulation
                this.filters.user_id = params.accumulation
            }

            if (params) {
                this.getList()
            }
        })

    }


    ngOnInit() {
    }


    rangeDate() {
        if (this.bsRangeValue != null) {
            this.filters.fromDate = moment(this.bsRangeValue[0]).format('YYYY-MM-DD')
            this.filters.toDate = moment(this.bsRangeValue[1]).format('YYYY-MM-DD')
        }
        this.getList()
    }



    getArrowClass(fieldName, order) {
        const className = 'arrow ' + order
        if (this.filters.orderBy === fieldName && this.filters.order === order) {

            return className + ' active'
        }
        return className
    }

    doSort(e: any, order) {
        if (e.target.value == 'paid' || e.target.value == 'outstanding') {


            this.filters.status = e.target.value
        } else {
            this.filters.orderBy = e.target.value
            this.filters.order = order
        }
        this.getList()
    }
    doTypeSort(e: any, order) {
        this.filters.accumulation = e.target.value
        this.filters.store_id = null
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
            from_date: this.filters.fromDate,
            to_date: this.filters.toDate,
            store_id: this.filters.store_id,
            accumulation: this.filters.accumulation,
            user_id: this.filters.user_id,
            status: this.filters.status
        }

        if (params.accumulation === 'year' || params.accumulation === 'half' || params.accumulation === 'quarter' || params.accumulation === 'month') {
            if (params.from_date === '' || params.to_date === '') {
                this.alert.error('Please select date range before report type..')

                return false
            }
        }

        const list = this.ds.list(params)
        list.subscribe((resp: any) => {
            if (resp.success === true) {

                if (this.accumulation == null) {
                    this.dataList = resp.data.data
                    this.pagination = resp.data
                    // this.filters.fromDate = ''
                    // this.filters.toDate = ''
                    this.dataStatus = 'done'
                    this.reportType = this.accumulation
                } else {

                    for (let c in resp.data) {
                        if (resp.data.hasOwnProperty(c)) {
                            resp.data[c].collapse = false
                        }

                    }

                    this.dataStatus = 'done'
                    this.reportType = this.accumulation
                    this.dataList = resp.data

                }
            }
        })
    }

    show(key) {
        this.dataList[key].collapse = true
        // document.getElementById('plus' + key).classList.remove("show")
        // document.getElementById('minus' + key).classList.remove("hide")
        // document.getElementById('minus' + key).classList.add("show")
        // document.getElementById('plus' + key).classList.add("hide")

        // document.getElementById('detail' + key).classList.remove("hide")
        // document.getElementById('detail' + key).classList.add("show")
    }
    hide(key) {
        this.dataList[key].collapse = false
        // document.getElementById('minus' + key).classList.remove("show")
        // document.getElementById('plus' + key).classList.remove("hide")
        // document.getElementById('plus' + key).classList.add("show")
        // document.getElementById('minus' + key).classList.add("hide")

        // document.getElementById('detail' + key).classList.remove("show")
        // document.getElementById('detail' + key).classList.add("hide")
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
        this.router.navigate(['/user/invoice'], { queryParams: filtersParam, replaceUrl: true })
    }

    padLeadingZeros(num: any, size: any) {
        let s = num + ''
        while (s.length < size) s = '0' + s
        return s
    }

    getSerialNumber(i: number) {
        return ((this.pagination.current_page - 1) * this.pagination.per_page) + i + 1
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
