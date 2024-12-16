import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { socialLoginUrls } from 'src/environments/environment'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ApiService } from '../../services/api.service'
import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { timeStamp } from 'console'

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    isActive = true
    loginForm: FormGroup
    loginLoading = false

    qData: any = null
    data: any = null
    connect: any
    thumbnail: any = '/assets/images/no_image.jpg'
    spinnerSVG = `/assets/images/rolling-main.svg`
    loginContent: any
    dataStatus = 'fetching'

    constructor(
        private api: ApiService,
        private router: Router,
        private fb: FormBuilder,
        public ui: UIHelpers,
        public alert: IAlertService,
        private route: ActivatedRoute,
        private sanitizer: DomSanitizer
    ) {

        if (this.route.snapshot.queryParamMap.has('data')) {
            this.qData = this.route.snapshot.queryParamMap.get('data')
            this.connect = this.route.snapshot.queryParamMap.get('connect')
            this.data = JSON.parse(atob(this.qData))
        }

        this.api.getLoginContent().subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)

                return false
            } else {
                if (resp.data) {
                    this.loginContent = resp.data
                    this.thumbnail = this.api.getLoginImg(resp.data.id)
                } else {
                    this.thumbnail = '/assets/images/no_image.jpg'
                }
                this.dataStatus = 'done'
            }
        })
    }

    ngOnInit() {
        this.loginForm = this.fb.group({
            youremail: new FormControl(null, [Validators.required, Validators.maxLength(100), Validators.email]),
            yourpassword: new FormControl(null, [Validators.required]),
        })
    }

    get g() {
        return this.loginForm.controls
    }

    login(data: any): boolean {
        this.loginLoading = true
        if (data.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.loginLoading = false

            return false
        }
        data.device_name = 'web'
        const params = {
            email: data.value.youremail,
            password: data.value.yourpassword
        }
        this.api.login(params).subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)

                return false
            } else {
                this.alert.success('Login successfully!!')

                if (this.data?.storeName != null) {
                    this.router.navigate(['/shopify-connect'], { queryParams: { data: this.qData } })
                } else if (this.connect === 'ebay') {
                    this.router.navigate(['/ebay-connect'], { queryParams: { data: this.qData } })
                } else if (this.connect === 'etsy') {
                    this.router.navigate(['/etsy-connect'], { queryParams: { data: this.qData } })
                } else if (this.connect === 'amazon') {
                    this.router.navigate(['/amazon-connect'], { queryParams: { data: this.qData } })
                } else {
                    this.api.doUserRedirects(resp, this.router)
                }

                // if (this.webSite !== null) {
                //     this.router.navigate(['/plugin-connect'], { queryParams: { website: this.webSite,tech:this.tech } })
                // } else {
                //     this.api.doUserRedirects(resp, this.router)
                // }
            }
        })
    }
    setType() {
        if (this.isActive) {
            this.isActive = false
        } else {
            this.isActive = true
        }
    }
    goToUrl() {
        window.open(this.loginContent.link, '_blank')
    }
    transformHtml(htmlTextWithStyle): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(htmlTextWithStyle)
    }
}
