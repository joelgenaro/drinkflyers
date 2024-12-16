import { ConstantsService } from 'src/app/services/constants.service';
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
    selector: 'app-invoice',
    templateUrl: './invoice.component.html',
    styleUrls: ['./invoice.component.css']
})
export class InvoiceComponent implements OnInit, OnDestroy {
    dataStatus = 'fetching'
    dataStatusInvoice = 'fetching'
    dataList = []
    documentsList = []
    accountList = []
    invoiceData: any = []
    clientList = []
    storeList = []
    dataForm: FormGroup
    reminderEmailForm: FormGroup
    selectedIndex = -1
    modalRef: BsModalRef
    selectedId: any
    clientId = null
    modalTitle: any = ''
    loginLoading = false
    LoadingActive = false
    LoadingDeactive = false
    filename: 'Upload Proof Document'
    seletcedFile: any
    selectedStatus = ''
    isChecked = false
    pagination: any = []
    page = 1
    searchKeyword: string = ''
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
        fromDate: '',
        toDate: '',
        client_id: '',
        store_id: '',
        status: ''
    }
    breadCrum = [
        {
            link: '',
            value: 'Invoices'
        }
    ]
    bsRangeValue: Date[]
    invoiceObj: any

    constructor(
        public cs: ConstantsService,
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
            pay_date: new FormControl(null, [Validators.required]),
            pay_description: new FormControl(null, [Validators.required, Validators.maxLength(500)]),
            account_id: new FormControl(null, [Validators.required])
        })
        this.reminderEmailForm = this.fb.group({
            cc_email: new FormControl(null),
            note: new FormControl(null, [Validators.required])
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
            if (params.clientId) {
                this.filters.client_id = params.clientId
                this.clientId = params.clientId
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
        this.ds.getAccountsList().subscribe(resp => {
            if (resp.success === true) {
                this.accountList = resp.data
            }
        })

        this.ds.getClientList().subscribe(resp => {
            if (resp.success === true) {
                this.clientList = resp.data
            }
        })
        this.ds.getStoreList().subscribe(resp => {
            if (resp.success === true) {
                this.storeList = resp.data
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
    get e() {
        return this.reminderEmailForm.controls
    }

    rangeDate() {
        if (this.bsRangeValue != null) {
            this.filters.fromDate = moment(this.bsRangeValue[0]).format('YYYY-MM-DD')
            this.filters.toDate = moment(this.bsRangeValue[1]).format('YYYY-MM-DD')
        }
        this.getList()
    }

    browseFile(event: any) {
        event.preventDefault()
        const element = document.getElementById('csv-file')
        element.click()
    }
    onFileChange(event: any) {
        const file = event.target.files[0]
        const allowedExtensions = ['pdf', 'docx', 'doc', 'xls', 'xlsx', 'jpeg', 'png', 'jpg']
        this.filename = file.name
        const extension = file.name.split('.').pop().toLowerCase()
        const fileSize = file.size / 1024 / 1024
        if (fileSize > 10) {
            this.alert.error('Invalid file size. File size must not exceeds 10MB.')
            // this.domFileElement.nativeElement.value = ''
        } else if (allowedExtensions.indexOf(extension) < 0) {
            this.alert.error('Invalid file type. Only pdf, docx, doc file is allowed.')
            // this.domFileElement.nativeElement.value = ''
        } else {
            this.seletcedFile = file
        }
    }

    uploadProofDoc() {
        const formData = new FormData()
        formData.append('file', this.seletcedFile)
        formData.append('file_name', this.filename)
        formData.append('id', this.selectedId)

        this.ds.uploadDoc(formData).subscribe((resp: any) => {
            if (resp.success === true) {
                this.getDocsList(this.selectedId)
                this.alert.success('File Added successfully!!')
            } else {
                this.alert.error(resp.errors.general)
            }
        })
    }

    downloadProofDoc(id, name) {
        const extention = name.split('.').pop()
        // this.loginLoading = true
        this.ds.downloadDocument(id).subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                return false
            }
            const blob = new Blob([resp], {
                type: `application/${extention}`
            })
            const downloadURL = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = downloadURL
            link.download = name
            link.click()
            // this.loginLoading = false
        })
    }

    getArrowClass(fieldName, order) {
        const className = 'arrow ' + order
        if (this.filters.orderBy === fieldName && this.filters.order === order) {

            return className + ' active'
        }
        return className
    }

    doSort(e: any, order) {
        // if (e.target.value == 'paid' || e.target.value == 'outstanding') {

        //     this.filters.status = e.target.value
        // } else {
        this.filters.orderBy = e.target.value
        this.filters.order = order
        // }
        this.getList()
    }
    doStatusSort(e: any, order) {
        this.filters.status = e.target.value
        this.filters.order = order
        this.getList()
    }
    doClientSort(e: any, order) {
        this.filters.client_id = e.target.value
        this.filters.store_id = null
        this.filters.order = order
        this.getList()
    }
    doStoreSort(e: any, order) {
        this.filters.store_id = e.target.value
        this.filters.client_id = null
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
            client_id: this.filters.client_id,
            status: this.filters.status
        }

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
        this.router.navigate(['/user/invoice'], { queryParams: filtersParam, replaceUrl: true })
    }

    sendReminderEmailModal(reminderEmail: TemplateRef<any>, email, id: number) {
        this.reminderEmailForm.controls.cc_email.setValue(email)

        this.selectedId = id
        this.modalRef = this.ms.show(
            reminderEmail,
            {
                class: 'modal-xl modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
    }
    sendReminderEmail(d) {
        this.loginLoading = true
        if (this.reminderEmailForm.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.loginLoading = false
            return false
        }

        const params = {
            invoice_id: this.selectedId,
            cc_email: this.reminderEmailForm.value.cc_email,
            note: this.reminderEmailForm.value.note
        }

        this.ds.sendReminder(params).subscribe((resp) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.modalRef.hide()
                return false
            } else {
                this.alert.success('Mail send successfully!!')
                d.resetForm()
                this.modalRef.hide()
            }
        })
    }
    closeModal(d: any) {
        d.resetForm()
        this.modalRef.hide()
    }

    deleteProofDoc(id) {
        this.ds.deleteDocument({ id }).subscribe(resp => {
            if (resp.success === true) {
                this.getDocsList(this.selectedId)
                this.alert.success('File Deleted successfully')
            } else {
                this.alert.error(resp.errors.general)
            }
        })

    }
    getDocsList(id) {
        this.ds.documentsList({ id }).subscribe(resp => {
            if (resp.success === true) {
                this.documentsList = resp.data
            }
        })
    }

    markAsPaidModal(reminderEmail: TemplateRef<any>, id: number, index: number) {
        this.modalTitle = 'Mark As Paid'
        this.selectedId = id
        this.selectedIndex = index
        this.getDocsList(this.selectedId)
        // this.ds.documentsList({ id: this.selectedId }).subscribe(resp => {
        //     if (resp.success === true) {
        //         this.documentsList = resp.data
        //     }
        // })

        this.modalRef = this.ms.show(
            reminderEmail,
            {
                class: 'modal-md modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
    }
    markAsPaid(f: any) {
        this.loginLoading = true
        if (this.dataForm.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.loginLoading = false

            return false
        }
        const params = {
            id: this.selectedId,
            pay_date: moment(this.dataForm.value.pay_date).format('YYYY-MM-DD'),
            pay_description: this.dataForm.value.pay_description,
            account_id: this.dataForm.value.account_id
        }

        this.ds.markAsPaid(params).subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.loginLoading = false

                return false
            } else {
                this.alert.success('Marked as paid successfully!!')
                this.dataList[this.selectedIndex].invoice_status = 'paid'
                this.modalRef.hide()
            }
            f.resetForm()
        })
    }

    openViewModal(viewModal: TemplateRef<any>, id: number, index: number) {
        this.selectedId = id
        this.selectedIndex = index
        this.modalRef = this.ms.show(
            viewModal,
            {
                class: 'modal-lg modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
    }
    invoiceItem(invoiceId) {
        this.loginLoading = true
        const params = {
            id: invoiceId
        }
        this.ds.items(params).subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.modalRef.hide()
                this.loginLoading = false

                return false
            } else {
                this.dataStatusInvoice = 'done'
                this.invoiceData = resp.data
                this.invoiceObj = Object.keys(this.invoiceData).length
            }
        })
    }

    downloadInvoice(id) {
        this.loginLoading = true
        this.ds.downloadInvoice({ id }).subscribe((resp: any) => {

            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                return false
            }
            const blob = new Blob([resp], {
                type: 'application/pdf'
            })
            const downloadURL = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = downloadURL
            link.download = 'invoice.pdf'
            link.click()
            this.loginLoading = false
        })
    }

    padLeadingZeros(num: any, size: any) {
        let s = num + ''
        while (s.length < size) s = '0' + s
        return s
    }

    searchKeywordChange(value: string) {
        this.searchKeyword$.next(value)
    }

    getSerialNumber(i: number) {
        return ((this.pagination.current_page - 1) * this.pagination.per_page) + i + 1
    }

}
