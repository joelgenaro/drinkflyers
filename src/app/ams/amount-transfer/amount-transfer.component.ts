import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import * as moment from 'moment'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ApiService } from 'src/app/services/api.service'
import { DataService } from './data.service'

@Component({
    selector: 'app-amount-transfer',
    templateUrl: './amount-transfer.component.html',
    styleUrls: ['./amount-transfer.component.css']
})
export class AmountTransferComponent implements OnInit, OnDestroy {
    dataStatus = 'fetching'
    dataList = []
    accountList = []
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
    showTransferType: boolean = false
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
        toDate: '',
        account_id: '',
        trans_type: ''
    }
    breadCrum = [
        {
            link: '',
            value: 'Transactions'
        }
    ]
    bsRangeValue: Date[]

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
            from_account_id: new FormControl(null, [Validators.required]),
            to_account_id: new FormControl(null, [Validators.required]),
            amount: new FormControl(null, [Validators.min(5), Validators.required]),
            trans_date: new FormControl(null, [Validators.required]),
            description: new FormControl(null, [Validators.maxLength(1000)]),
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

        this.ds.accountList().subscribe((resp) => {
            if (resp.success === true) {
                this.accountList = resp.data
            }
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

    convertValue(val) {
        return Math.abs(val)
    }
    accountChange(e: any) {
        this.filters.account_id = e.target.value
        this.showTransferType = true
        if (e.target.value == -1) {
            this.showTransferType = false
            this.filters.trans_type = ''
            this.getList()
        }

    }

    transFiler(e: any) {
        this.filters.trans_type = e.target.value
        this.getList()
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
            from_date: this.filters.fromDate,
            to_date: this.filters.toDate,
            account_id: this.filters.account_id,
            trans_type: this.filters.trans_type
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
        this.router.navigate(['/user/amount-transfer'], { queryParams: filtersParam, replaceUrl: true })
    }

    openModal(formModal, index) {
        this.modalTitle = 'Add New Transaction'
        if (index > -1) {
            this.selectedIndex = index
            this.dataForm.controls.id.setValue(this.dataList[index].id)
            this.dataForm.patchValue(this.dataList[index])
            this.modalTitle = 'Edit Transaction'
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

        if (this.dataForm.value.from_account_id === this.dataForm.value.to_account_id) {
            this.alert.error('Transaction accounts should not be equal.')
            this.loginLoading = false

            return false
        }
        if (this.dataForm.value.amount <= 0) {
            this.alert.error('Amount should be greater than zero.')
            this.loginLoading = false

            return false
        }

        const params = {
            id: this.dataForm.value.id,
            from_account_id: this.dataForm.value.from_account_id,
            to_account_id: this.dataForm.value.to_account_id,
            amount: this.dataForm.value.amount,
            trans_date: this.dataForm.value.trans_date,
            description: this.dataForm.value.description
        }
        params.trans_date = moment(this.dataForm.value.trans_date).format('YYYY-MM-DD')

        this.ds.add(params).subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.loginLoading = false

                return false
            } else {

                params.id = resp.data.id
                this.alert.success('Added successfully!!')
                this.dataList.push(resp.data)
            }
            f.resetForm()
            this.modalRef.hide()
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

    searchKeywordChange(value: string) {
        this.searchKeyword$.next(value)
    }

    getSerialNumber(i: number) {
        return ((this.pagination.current_page - 1) * this.pagination.per_page) + i + 1
    }

}
