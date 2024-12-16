import { ConstantsService } from 'src/app/services/constants.service'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { Router, ActivatedRoute } from '@angular/router'
import { ApiService } from 'src/app/services/api.service'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { DataService } from './data.service'
import { Component, OnInit, TemplateRef, OnDestroy } from '@angular/core'
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { Subject } from 'rxjs'
import * as moment from 'moment'

@Component({
    selector: 'app-shipment-created',
    templateUrl: './shipment-created.component.html',
    styleUrls: ['./shipment-created.component.css']
})
export class ShipmentCreatedComponent implements OnInit, OnDestroy {
    dataStatus = 'fetching'
    moment = moment
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
        perPage: 15
    }
    storeId: any = ''
    breadCrum = [
        {
            link: '/user/shipment-list',
            value: 'Shipments',

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
        public route: ActivatedRoute,
        public cs: ConstantsService
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
        }

        const list = this.ds.list(params)
        list.subscribe((resp: any) => {
            if (resp.success === true) {
                this.dataList = resp.data.data
                this.pagination = resp.data
                this.dataStatus = 'done'
            }else{
                this.dataStatus='done'
            }
        })
    }

    // showItem(i: any, id) {
    //     this.dataList[i].collapse = !this.dataList[i].collapse
    //     if (this.dataList[i].orderItems) {
    //         return
    //     }
    //     this.dataList[i].dataStatusInner = 'fetching'
    //     const param = {
    //         order_id: id
    //     }
    //     this.ds.orderItem(param).subscribe((resp: any) => {
    //         if (resp.success === true) {
    //             this.dataList[i].orderItems = resp.data
    //             this.dataList[i].dataStatusInner = 'done'
    //         }
    //     })

    // }

    setPagination(page: number) {
        let filtersParam: any = {}

        filtersParam = {
            page,
            keyword: this.searchKeyword,
            order_by: this.filters.orderBy,
            order: this.filters.order,
            per_page: this.filters.perPage,
            //id: this.storeId,
        }
        this.router.navigate(['/user/shipment-list'], { queryParams: filtersParam, replaceUrl: true })
    }

    confirmingModal(template: TemplateRef<any>, id: any, i: any) {
        this.selectedId = id
        this.selectedIndex = i
        this.modalRef = this.ms.show(template, { class: 'modal-md admin-panel' })
    }

    changePickupStatus() {
        this.loginLoading = true
        const params = {
            id: this.selectedId,
            dhl_pickup_status: 'picked'
        }
        this.ds.changeStatus(params).subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.loginLoading = false

                return false
            } else {
                this.dataList[this.selectedIndex].dhl_pickup_status = 'picked'
                this.alert.success('Status changed successfully')
                this.modalRef.hide()
            }
        })
    }

    printLabel(id,trackNo){

        this.ds.printLabel(id).subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                return false
            }
            const blob = new Blob([resp], {
                type: `application/pdf`
            })
            const downloadURL = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = downloadURL
            link.download = trackNo
            link.click()
        })


    }

    searchKeywordChange(value: string) {
        this.searchKeyword$.next(value)
    }
}
