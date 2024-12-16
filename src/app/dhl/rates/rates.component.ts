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

@Component({
    selector: 'app-rates',
    templateUrl: './rates.component.html',
    styleUrls: ['./rates.component.css']
})
export class RatesComponent implements OnInit{
    dataStatus = 'fetching'
    dataList = []
    bankList = []
    totalPrice=0
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
        cols: 8,
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
            link: '/user/dhl-rates',
            value: 'Dhl Rates & duties'
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
        public route: ActivatedRoute
    ) {
        this.dataForm = this.fb.group({
            id: new FormControl(null),
            origin_country_code: new FormControl(null, [Validators.required]),
            origin_city_name: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
            destination_city_name: new FormControl(null, [Validators.required]),
            destination_country_code: new FormControl(null, [Validators.required]),
            weight: new FormControl(null, [Validators.required]),
            length: new FormControl(null, [Validators.required]),
            width: new FormControl(null, [Validators.required]),
            height: new FormControl(null, [Validators.required]),
            unit_measure: new FormControl(null, [Validators.required]),

        })


    }

    ngOnInit() {
    }

    get g() {
        return this.dataForm.controls
    }




    openModal(formModal, index) {
        this.modalTitle = 'Add New Account'
        if (index > -1) {
            this.selectedIndex = index
            this.dataForm.controls.id.setValue(this.dataList[index].id)
            this.dataForm.patchValue(this.dataList[index])
            this.modalTitle = 'Edit Account'
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


    getRate(f: any) {
        this.loginLoading = true
        if (this.dataForm.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.loginLoading = false

            return false
        }



        this.ds.getRate(this.dataForm.value).subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.loginLoading = false

                return false
            } else {
                console.log(resp);
                this.totalPrice = resp.data.products[0].totalPrice[0].price
                console.log(this.totalPrice);

            }

            //f.resetForm()
        })
    }

    clearForm(f){
        f.resetForm()
        this.totalPrice = 0
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

}
