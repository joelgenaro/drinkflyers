import { DataService } from './data.service'
import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { ApiService } from 'src/app/services/api.service'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ActivatedRoute, Router } from '@angular/router'
import { UIHelpers } from 'src/app/helpers/ui-helpers'

@Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html',
    styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
    registrationForm: FormGroup
    registrationFormLoading = false
    modalTitle: any = ''
    modalRef: BsModalRef
    designationList: any = []
    registrationSuccess = false

    qData: any = null
    data: any = null
    connect: any


    constructor(
        public ds: DataService,
        private fb: FormBuilder,
        public api: ApiService,
        public alert: IAlertService,
        public router: Router,
        public route: ActivatedRoute,
        public ui: UIHelpers
    ) {
        this.registrationForm = this.fb.group({
            id: new FormControl(null),
            first_name: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
            last_name: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
            password: new FormControl(null, [Validators.required, Validators.maxLength(15)]),
            password_confirmation: new FormControl(null, [Validators.required, Validators.maxLength(15)]),
            email: new FormControl(null, [Validators.required, Validators.email]),

        })


        if (this.route.snapshot.queryParamMap.has('data')) {
            this.qData = this.route.snapshot.queryParamMap.get('data')
            this.data = JSON.parse(atob(this.qData))
            this.connect = this.route.snapshot.queryParamMap.get('connect')
        }
    }

    ngOnInit() {
    }

    get g() {
        return this.registrationForm.controls
    }

    registration(data: any, f: any) {
        this.registrationFormLoading = true
        if (data.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.registrationFormLoading = false

            return false
        }
        if (data.value.password !== data.value.password_confirmation) {
            this.alert.error('Password and confirm password are not matched.')
            this.registrationFormLoading = false

            return false
        }

        // console.log('FormData', data.value)

        const params = {
            id: this.registrationForm.value.id,
            first_name: this.registrationForm.value.first_name,
            last_name: this.registrationForm.value.last_name,
            password: this.registrationForm.value.password,
            password_confirmation: this.registrationForm.value.password_confirmation,
            email: this.registrationForm.value.email,
            position: this.registrationForm.value.position,
            data: this.data
        }



        this.ds.userRegistration(params).subscribe((resp: any) => {
            this.registrationFormLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.registrationFormLoading = false

                return false
            } else {
                this.registrationSuccess = true
                localStorage.setItem('token', resp.data.token)
                localStorage.setItem('user', JSON.stringify(resp.data))
                this.api.user = resp.data
                this.api.userLoggedInSource.next(true)

                if (this.data.storeName != null) {
                    this.router.navigate(['/shopify-connect'], { queryParams: { data: this.qData } })
                } else {
                    // redirect to dashboard
                    f.resetForm()
                }
            }
        })
    }

    connectToChannel() {
        if (this.connect === 'ebay') {
            this.router.navigate(['/login'], { queryParams: { data: this.qData, connect: 'ebay' }, replaceUrl: true })
        }
        else if (this.connect === 'etsy') {
            this.router.navigate(['/login'], { queryParams: { data: this.qData, connect: 'etsy' }, replaceUrl: true })
        }
        else if (this.connect === 'amazon') {
            this.router.navigate(['/login'], { queryParams: { data: this.qData, connect: 'amazon' }, replaceUrl: true })
        }
        else {
            this.router.navigate(['/login'], { queryParams: { data: this.qData }, replaceUrl: true })
        }
    }
}
