import { ConstantsService } from 'src/app/services/constants.service';
import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core'
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
    selector: 'app-rejected-po-request',
    templateUrl: './rejected-po-request.component.html',
    styleUrls: ['./rejected-po-request.component.css']
})
export class RejectedPoRequestComponent implements OnInit, OnDestroy {
    dataStatus = 'fetching'
    moment = moment
    dataStatusInner = 'fetching'
    dataList = []
    responseNotes = 'Rejection Response Note'
    selectedIndex = -1
    responseForm: FormGroup
    modalRef: BsModalRef
    selectedId: any
    rejectedPoItems
    poRequestStatus
    modalTitle: any = ''
    loginLoading = false
    LoadingActive = false
    LoadingDeactive = false
    selectedStatus = ''
    isChecked = false
    pagination: any = []
    page = 1
    searchKeyword = ''
    totalCost: number = 0
    searchKeyword$: Subject<string> = new Subject<string>()
    searchKeywordSub: any
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
        perPage: 15,
    }
    breadCrum = [
        {
            link: '',
            value: 'Rejected PO Requests'
        }
    ]

    constructor(
        public cs: ConstantsService,
        public ds: DataService,
        public ui: UIHelpers,
        private alert: IAlertService,
        public ms: BsModalService,
        public api: ApiService,
        private router: Router,
        private fb: FormBuilder,
        public route: ActivatedRoute,

    ) {
        this.responseForm = this.fb.group({
            response_note: new FormControl(null, [Validators.required]),
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

    ngOnDestroy(): void {
        this.searchKeywordSub.unsubscribe()
    }

    ngOnInit() {
    }

    showItems(i: any, id) {
        this.dataList[i].collapse = !this.dataList[i].collapse
        if (this.dataList[i].rejectedPoItems) {
            return
        }
        this.dataList[i].dataStatusInner = 'fetching'
        this.ds.rejectedPoItems({ id }).subscribe((resp: any) => {
            if (resp.success === true) {
                this.dataList[i].rejectedPoItems = resp.data
                this.dataList[i].dataStatusInner = 'done'

                this.dataList[i].totalCost = 0
                this.dataList[i].rejectedPoItems.forEach(e => {
                    this.dataList[i].totalCost = this.dataList[i].totalCost + (+e.base_cost) + (+e.base_additional_cost)
                })
            }
        })

    }

    sumLastCP(data: any) {
        let sum = 0
        data.forEach(element => {
            sum += parseFloat(element.base_product_variant.cp)
        });
        return sum
    }

    sumPOCP(data: any) {
        let sum = 0
        data.forEach(element => {
            sum += parseFloat(element.cost_price)
        });
        return sum
    }

    getArrowClass(fieldName, order) {
        const className = 'arrow ' + order
        if (this.filters.orderBy === fieldName && this.filters.order === order) {

            return className + ' active'
        }
        return className
    }

    get g() {
        return this.responseForm.controls
    }

    doSort(orderBy, order) {
        this.filters.orderBy = orderBy
        this.filters.order = order

        this.getList()
    }

    selectPerPage(e: any) {
        this.filters.perPage = e.target.value
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
        this.router.navigate(['/user/po-request-list'], { queryParams: filtersParam, replaceUrl: true })
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

    openResponseModal(template: TemplateRef<any>, id: any, i: any, status) {
        this.responseNotes = 'Rejection Response Note'
        if (status === 'approve') {
            this.responseNotes = 'Approval Response Note'
        }
        this.poRequestStatus = status

        this.selectedId = id
        this.selectedIndex = i
        this.modalRef = this.ms.show(template, { class: 'modal-md admin-panel' })
    }

    SaveResponse(data, f) {

        this.loginLoading = true
        if (data.status === 'INVALID') {
            this.alert.error('Please fill-in valid data and try again.')
            this.loginLoading = false
            return false
        }
        const params = {
            response_notes: data.value.response_note,
            id: this.selectedId
        }


        if (this.poRequestStatus === 'approve') {
            this.ds.poRequestApprove(params).subscribe(resp => {
                if (resp.success === true) {
                    this.alert.success('PO request approved successfully!!')
                    this.dataList.splice(this.selectedIndex, 1)
                }
                this.loginLoading = false
                f.resetForm()
                this.modalRef.hide()
                this.dataList.splice(this.selectedIndex, 1)
            })
        } else {
            this.ds.poRequestReject(params).subscribe(resp => {
                if (resp.success === true) {
                    this.alert.success('PO request rejected successfully!!')
                    this.dataList.splice(this.selectedIndex, 1)
                }
                this.loginLoading = false
                f.resetForm()
                this.modalRef.hide()
                this.dataList.splice(this.selectedIndex, 1)
            })
        }
    }

    closeModal(d: any) {
        d.resetForm()
        this.modalRef.hide()
    }
}
