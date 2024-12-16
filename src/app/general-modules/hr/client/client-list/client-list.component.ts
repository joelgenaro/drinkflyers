import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms'
import { ApiService } from './../../../../services/api.service'
import { ActivatedRoute, Router } from '@angular/router'
import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core'
import { BsModalRef } from 'ngx-bootstrap/modal'
import { BsModalService } from 'ngx-bootstrap/modal'
import { DataService } from './../data.service'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'

@Component({
    selector: 'app-list',
    templateUrl: './client-list.component.html',
    styleUrls: ['./client-list.component.css']
})
export class ClientListComponent implements OnInit, OnDestroy {
    sendEmailForm: FormGroup
    dataStatus = 'fetching'
    empList = []
    selectedIndex: any
    modalRef: BsModalRef
    selectedId: any
    serialNum: any
    perPage: any
    pagination: any = []
    page = 1
    searchKeyword: string = ''
    searchKeyword$: Subject<string> = new Subject<string>()
    searchKeywordSub: any
    loginLoading = false
    loaderOptions = {
        rows: 5,
        cols: 5,
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
            value: 'Clients'
        }
    ]

    constructor(
        private ds: DataService,
        public ui: UIHelpers,
        private alert: IAlertService,
        private ms: BsModalService,
        public route: ActivatedRoute,
        public router: Router,
        public api: ApiService,
        private fb: FormBuilder
    ) {
        this.sendEmailForm = this.fb.group({
            id: new FormControl(null),
            cc: new FormControl(null),
            subject: new FormControl(null, [Validators.required]),
            message: new FormControl(null, [Validators.required])
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
                this.getEmployeeList()
            }
        })

        this.searchKeywordSub = this.searchKeyword$.pipe(
            debounceTime(1000), // wait 1 sec after the last event before emitting last event
            distinctUntilChanged(), // only emit if value is different from previous value
        ).subscribe(searchKeyword => {
            this.page = 1
            this.getEmployeeList()
        })
    }
    ngOnDestroy(): void {
        this.searchKeywordSub.unsubscribe()
    }

    ngOnInit() { }

    get g() {
        return this.sendEmailForm.controls
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

        this.getEmployeeList()
    }

    selectPerPage(e: any) {
        this.filters.perPage = e.target.value
        this.page = 1

        this.getEmployeeList()
    }

    getEmployeeList() {
        let params = {
            page: this.page,
            keyword: this.searchKeyword,
            order_by: this.filters.orderBy,
            order: this.filters.order,
            per_page: this.filters.perPage
        }

        const list = this.ds.get(params)
        list.subscribe((resp: any) => {
            if (resp.success === true) {
                this.empList = resp.data.data
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
        this.router.navigate(['/user/client/list'], { queryParams: filtersParam, replaceUrl: true })
    }

    delete() {
        this.loginLoading = true
        const params = {
            id: this.selectedId,
            keyword: this.searchKeyword
        }
        this.ds.delete(params).subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.modalRef.hide()
                this.loginLoading = false

                return false
            } else {
                const deletingIndex = this.empList.findIndex((d: any) => {
                    return d.id === this.selectedId
                })
                this.empList.splice(deletingIndex, 1)
                this.modalRef.hide()
                this.alert.success('Employee deleted successfully!!')
            }
        })
    }

    confirmingModal(template: TemplateRef<any>, id: any, i: any) {
        this.selectedId = id
        this.selectedIndex = i
        this.modalRef = this.ms.show(template, { class: 'modal-sm admin-panel' })
    }

    searchKeywordChange(value: string) {
        this.searchKeyword$.next(value)
    }

    getSerialNumber(i: number) {
        return ((this.pagination.current_page - 1) * this.pagination.per_page) + i + 1
    }

    sendEmailModal(sendEmailModal: TemplateRef<any>, id: any, i: any) {
        this.selectedId = id
        this.selectedIndex = i
        this.modalRef = this.ms.show(
            sendEmailModal,
            {
                class: 'modal-xl modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
    }
    sendEmail(f: any) {
        this.loginLoading = true
        if (this.sendEmailForm.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.loginLoading = false

            return false
        }
        const params = {
            id: this.sendEmailForm.value.id,
            user_id: this.selectedId,
            cc: this.sendEmailForm.value.cc,
            subject: this.sendEmailForm.value.subject,
            message: this.sendEmailForm.value.message
        }

        this.ds.sendEmail(params).subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.loginLoading = false

                return false
            } else {
                this.alert.success('Email sended successfully!!')
            }
            this.modalRef.hide()
            f.resetForm()
        })
    }
}


