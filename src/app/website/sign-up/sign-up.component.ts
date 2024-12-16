import { ApiService } from 'src/app/services/api.service'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { DataService } from './data.service'
import { socialLoginUrls } from 'src/environments/environment'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { timeStamp } from 'console'

@Component({
    selector: 'app-sign-up',
    templateUrl: './sign-up.component.html',
    styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
    dataForm: FormGroup
    SignUpLoading = false
    thumbnail: any = '/assets/images/no_image.jpg'
    spinnerSVG = `/assets/images/rolling-main.svg`
    signupContent: any
    dataStatus = 'fetching'

    constructor(
        private ds: DataService,
        private router: Router,
        private fb: FormBuilder,
        public ui: UIHelpers,
        public alert: IAlertService,
        private route: ActivatedRoute,
        private sanitizer: DomSanitizer,
        private api: ApiService,
    ) {
        this.api.getSignupContent().subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)

                return false
            } else {
                if (resp.data) {
                    this.signupContent = resp.data
                    this.thumbnail = this.api.getSignupImg(resp.data.id)
                } else {
                    this.thumbnail = '/assets/images/no_image.jpg'
                }
                this.dataStatus = 'done'
            }
        })
    }

    ngOnInit() {
        this.dataForm = this.fb.group({
            first_name: new FormControl(null, [Validators.required, Validators.maxLength(100)]),
            email: new FormControl(null, [Validators.required, Validators.email]),
            password: new FormControl(null, [Validators.required]),
            terms: new FormControl(false, [Validators.required]),
            receive_email: new FormControl(false, [Validators.required]),
        })
    }

    get g() {
        return this.dataForm.controls
    }

    signUp(data: any): boolean {
        this.SignUpLoading = true
        console.log('this.dataForm', this.dataForm.value)

        if (data.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.SignUpLoading = false

            return false
        }
        if (!data.value.terms && !data.value.receive_email) {
            this.alert.error('Please agreed to Star Dropship terms & try again.')
            this.SignUpLoading = false

            return false
        }
        const params = {
            first_name: data.value.first_name,
            email: data.value.email,
            password: data.value.password
        }
        this.ds.signup(params).subscribe((resp: any) => {
            this.SignUpLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)

                return false
            } else {
                this.alert.success('Signup successfully!!')
            }
        })
    }

    goToUrl() {
        window.open(this.signupContent.link, '_blank')
    }
    transformHtml(htmlTextWithStyle): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(htmlTextWithStyle)
    }
}
