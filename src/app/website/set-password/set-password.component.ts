import { DataService } from './data.service'
import { Component, OnInit, AfterViewInit } from '@angular/core'
import { ApiService } from 'src/app/services/api.service'
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ActivatedRoute, Params, Router } from '@angular/router'

@Component({
    selector: 'app-set-password',
    templateUrl: './set-password.component.html',
    styleUrls: ['./set-password.component.css']
})
export class SetPasswordComponent implements OnInit {
    dataForm: FormGroup
    code: any
    codeStatus: any

    constructor(
        private api: ApiService,
        public ds: DataService,
        private fb: FormBuilder,
        public ui: UIHelpers,
        private alert: IAlertService,
        private route: ActivatedRoute,
        private router: Router,

    ) {
        this.dataForm = this.fb.group({
            code: new FormControl(null),
            password: new FormControl('', [Validators.required]),
            password_confirmation: new FormControl('', [Validators.required]),

        })
        this.code = this.route.snapshot.paramMap.get('code')
    }

    get g() {
        return this.dataForm.controls
    }

    ngOnInit() {
        const params = {
            code: this.code
        }

        console.log(params)
        //return false
        this.ds.checkVCode(params).subscribe((resp: any) => {
            if (resp.success === false) {
                this.codeStatus = 'expire'

                return false
            } else {
                this.codeStatus = 'valid'
                this.dataForm.controls.code.setValue(this.code)
            }
        })
    }

    submit(data: any, f: any) {
        console.log(data.value)

        if (data.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')

            return false
        }
        if (data.value.password !== data.value.password_confirmation) {
            this.alert.error('Password and confirm password are not matched.')

            return false
        }

        this.ds.submit(data.value).subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)

                return false
            } else {
                this.alert.success('Success')
                console.log(resp.data)
                localStorage.setItem('token', resp.data.token)
                localStorage.setItem('user', JSON.stringify(resp.data))
                this.api.user = resp.data
                this.api.userLoggedInSource.next(true)
            }
            this.api.doUserRedirects(resp, this.router)
        })
    }

    sendCodeAgain() {
        const params = {
            code: this.code
        }
        this.ds.sendCAgain(params).subscribe((resp: any) => {
            if (resp.success == true) {
                this.codeStatus = 'sent'
            } else {
                this.alert.error('Some error!!')
            }
        }
        )
    }
}
