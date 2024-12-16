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
    selector: 'app-shipping',
    templateUrl: './shipping.component.html',
    styleUrls: ['./shipping.component.css']
})
export class ShippingComponent implements OnInit {
    modalRef: BsModalRef
    selectedIndex = -1
    selectedId: any
    moment = moment;
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
            value: 'My Orders'
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
    storeList: any = []
    shippingMethodRateList: any = []
    selectedStores = []
    selectedRate: any
    clientShippingLoading = false
    clientShippingStatus = 'fetching'

    constructor(
        public ds: DataService,
        public ui: UIHelpers,
        private alert: IAlertService,
        public ms: BsModalService,
        public api: ApiService,
        private router: Router,
        private fb: FormBuilder,
        public cs: ConstantsService,
        public route: ActivatedRoute,
    ) {
        this.ds.clientShippingDetail().subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)

                return false
            } else {
                if (resp.data.length > 0) {
                    this.selectedRate = resp.data[0].shipping_method_rate_id
                    resp.data.forEach(e => {
                        this.selectedStores.push(e.store_id)
                    })
                }
                this.clientShippingStatus = 'done'
            }
        })
        this.ds.storeList().subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)

                return false
            } else {
                this.storeList = resp.data
            }
        })
        this.ds.shippingMethodRate().subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)

                return false
            } else {
                this.shippingMethodRateList = resp.data
            }
        })
    }

    ngOnInit(): void { }

    saveClientShipping() {
        this.clientShippingLoading = true
        console.log(this.selectedRate, this.selectedStores)

        if (this.selectedStores.length == 0 && this.selectedRate == null) {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.clientShippingLoading = false

            return false
        } else if (this.selectedStores.length == 0) {
            this.alert.error('Please select store.')
            this.clientShippingLoading = false

            return false
        } else if (this.selectedRate == null) {
            this.alert.error('Please select rate.')
            this.clientShippingLoading = false

            return false
        }
        const params = {
            method_id: this.selectedRate,
            store_ids: this.selectedStores
        }
        this.ds.clientShippingAddUpdate(params).subscribe((resp: any) => {
            this.clientShippingLoading = false
            if (resp.success === true) {
                this.alert.success('Change successfully!!')
                if (resp.data.length > 0) {
                    this.selectedRate = resp.data[0].shipping_method_rate_id
                    resp.data.forEach(e => {
                        this.selectedStores.push(e.store_id)
                    })
                }
            } else {
                this.alert.error(resp.errors.general)
                this.clientShippingLoading = false

                return false
            }
        })
    }

}
