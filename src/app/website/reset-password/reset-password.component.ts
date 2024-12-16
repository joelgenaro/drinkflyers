import { Component, OnInit } from '@angular/core'
import { ApiService } from 'src/app/services/api.service'
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ActivatedRoute, Params, Router } from '@angular/router'

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
    resetPassForm: FormGroup
    code: any
    codeStatus: any
    lang: any
    constructor(
        private api: ApiService,
        private fb: FormBuilder,
        public ui: UIHelpers,
        private alert: IAlertService,
        private route: ActivatedRoute,
        private router: Router,

    ) {
        this.resetPassForm = this.fb.group({
            code: new FormControl(null),
            new_password: new FormControl('', [Validators.required]),
            new_password_confirmation: new FormControl('', [Validators.required]),

        })
        this.code = this.route.snapshot.paramMap.get('code')
    }

    get g() {
        return this.resetPassForm.controls
    }

    ngOnInit() {
        const params = {
            code: this.code
        }
        this.api.checkResetCode(params).subscribe((resp: any) => {
            if (resp.success === false) {
                this.codeStatus = 'expire'

                return false
            } else {
                this.codeStatus = 'valid'
                this.resetPassForm.controls.code.setValue(this.code)
            }
        })
    }

    proceedResetPass(data: any, f: any) {
        if (data.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')

            return false
        }
        if (data.value.new_password !== data.value.new_password_confirmation) {
            this.alert.error('Password and confirm password are not matched.')

            return false
        }

        this.api.resetPass(data.value).subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)

                return false
            } else {
                this.alert.success('Success')
                localStorage.setItem('token', resp.data.token)
                localStorage.setItem('user', JSON.stringify(resp.data))
                this.api.user = resp.data
                this.api.userLoggedInSource.next(true)
            }
            this.api.doUserRedirects(resp, this.router)
        })
    }

}