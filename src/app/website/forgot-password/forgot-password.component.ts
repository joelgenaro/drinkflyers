import { SafeHtml, DomSanitizer } from '@angular/platform-browser'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { DataService } from './data.service'
import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { ApiService } from '../../services/api.service'

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
    forgotError: string
    loginLoading = false
    loginContent: any
    dataStatus = 'fetching'
    thumbnail: any = '/assets/images/no_image.jpg'
    spinnerSVG = `/assets/images/rolling-main.svg`

    constructor(
        private dataService: DataService,
        private router: Router,
        public apiService: ApiService,
        public alert: IAlertService,
        private api: ApiService,
        private sanitizer: DomSanitizer
    ) {
        this.api.getLoginContent().subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)

                return false
            } else {
                if (resp.data) {
                    this.loginContent = resp.data
                    this.thumbnail = this.api.getLoginImg(resp.data.id)
                    console.log('loginContent', this.loginContent)
                } else {
                    this.thumbnail = '/assets/images/no_image.jpg'
                }
                this.dataStatus = 'done'
            }
        })
    }

    forgotPassword(data: any): boolean {
        this.loginLoading = true
        if (data.status == 'INVALID') {
            this.alert.error('Please provide email.')
            this.loginLoading = false
            return false
        }
        this.dataService.forgotPassword(data.value).subscribe((resp: any) => {
            if (resp.success === false) {
                this.forgotError = resp.errors.general
                this.alert.error(resp.errors.general)
                this.loginLoading = false
                return false
            } else {
                this.loginLoading = false
                this.alert.success('Password link has been sent successfully!!')
                this.router.navigate(['/'])
            }

        })
    }
    ngOnInit() {
    }

    goToUrl() {
        window.open(this.loginContent.link, '_blank')
    }
    transformHtml(htmlTextWithStyle): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(htmlTextWithStyle)
    }
}
