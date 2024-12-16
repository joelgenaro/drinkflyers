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
    selector: 'app-returns',
    templateUrl: './returns.component.html',
    styleUrls: ['./returns.component.css']
})
export class ReturnsComponent implements OnInit {
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
    items = [
        {id: 1, name: 'All Stores', image: ''},
        {id: 1, name: 'stardrop ship fee shipping store', image: 'images/shopify-icon.svg'},
        {id: 1, name: 'stardrop ship fee shipping store', image: 'images/shopify-icon.svg'},
        {id: 1, name: 'stardrop ship fee shipping store', image: 'images/shopify-icon.svg'},
        {id: 1, name: 'stardrop ship fee shipping store', image: 'images/shopify-icon.svg'},
        {id: 1, name: 'stardrop ship fee shipping store', image: 'images/shopify-icon.svg'},
        {id: 1, name: 'Store 2', image: 'images/shopify-icon.svg'}
      ]
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
        
    }

    ngOnInit(): void {
        // this.dataStatus = 'done'
    }

    
    
}
