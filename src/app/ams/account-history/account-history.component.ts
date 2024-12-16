import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import * as moment from 'moment'
import { Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ApiService } from 'src/app/services/api.service'
import { DataService } from './data.service'

@Component({
    selector: 'app-account-history',
    templateUrl: './account-history.component.html',
    styleUrls: ['./account-history.component.css']
})
export class AccountHistoryComponent implements OnInit, OnDestroy {
    dataStatus = 'fetching'
    accountId: any = ''
    exportParams
    dataList = []
    loginLoading = false
    pagination: any = []
    accountDetail: any
    page = 1
    searchKeyword: string = ''
    searchKeyword$: Subject<string> = new Subject<string>()
    searchKeywordSub: any
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
        toDate: ''
    }
    breadCrum = [
        {
            link: '/user/accounts',
            value: 'Accounts',
            params: { id: this.accountId }
        }
    ]
    bsRangeValue: Date[]

    constructor(
        public ds: DataService,
        private router: Router,
        public route: ActivatedRoute,
        private alert: IAlertService,
        public api: ApiService
    ) {
        this.accountId = this.route.snapshot.queryParamMap.get('id')

        this.breadCrum.push({
            link: '/user/account-history',
            params: { id: this.accountId },
            value: 'Account History'
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
        const param = {
            id: this.accountId
        }
        this.ds.accountDetail(param).subscribe((resp) => {
            if (resp.success == true) {
                this.accountDetail = resp.data
                // console.log('Account Detail', this.accountDetail)
            }
        })
    }

    ngOnDestroy(): void {
        this.searchKeywordSub.unsubscribe()
    }

    ngOnInit() {
    }
    detailFun(detail: any) {
        let data = JSON.parse(detail)
        // console.log('Data', data)
        if (data != null) {
            if (this.accountId == data.from_account.id) {
                return `Amount Transfer to Account no:  ${data.tAccount.account_no}`
            }
            if (this.accountId == data.tAccount.id) {
                return `Amount Transfer from Account no:  ${data.from_account.account_no}`
            }
        }
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

    convertValue(val) {
        return Math.abs(val)
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
            account_id: this.accountId,
            page: this.page,
            keyword: this.searchKeyword,
            order_by: this.filters.orderBy,
            order: this.filters.order,
            per_page: this.filters.perPage,
            from_date: this.filters.fromDate,
            to_date: this.filters.toDate,
        }
        this.exportParams = params
        const list = this.ds.list(params)
        list.subscribe((resp: any) => {
            if (resp.success === true) {
                this.dataList = resp.data.data
                this.pagination = resp.data
                this.filters.fromDate = ''
                this.filters.toDate = ''
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
        this.router.navigate(['/user/account-history'], { queryParams: filtersParam, replaceUrl: true })
    }

    searchKeywordChange(value: string) {
        this.searchKeyword$.next(value)
    }

    getSerialNumber(i: number) {
        return ((this.pagination.current_page - 1) * this.pagination.per_page) + i + 1
    }

    downloadProveFiles(id) {
        this.loginLoading = true
        this.ds.downloadProveFiles({ invoice_id: id }).subscribe((resp: any) => {

            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                return false
            }
            const blob = new Blob([resp], {
                type: 'application/zip'
            })
            const downloadURL = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = downloadURL
            link.download = 'prove-documents.zip'
            link.click()
            this.loginLoading = false
        })
    }

    exportCsv() {
        this.ds.exportCsv(this.exportParams).subscribe(resp => {
            if (resp.success == false) {
                this.alert.error('Error ecour!!')
                return false
            }

            const blob = new Blob([resp], { type: "text/plain" });
            const downloadURL = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = downloadURL
            link.download = 'account-wallet-history.xlsx'
            link.click()
            this.loginLoading = false
        })
    }

    exportPdf() {
        this.ds.exportPdf(this.exportParams).subscribe(resp => {
            if (resp.success == false) {
                this.alert.error('Error ecour!!')
                return false
            }

            const blob = new Blob([resp], { type: "text/plain" });
            const downloadURL = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = downloadURL
            link.download = 'account-wallet-history.pdf'
            link.click()
            this.loginLoading = false
        })
    }

}
