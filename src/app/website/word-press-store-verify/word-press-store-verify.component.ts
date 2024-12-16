import { ApiService } from 'src/app/services/api.service'
import { Router, ActivatedRoute } from '@angular/router'
import { Component, OnInit } from '@angular/core'

@Component({
    selector: 'app-word-press-store-verify',
    templateUrl: './word-press-store-verify.component.html',
    styleUrls: ['./word-press-store-verify.component.css']
})
export class WordPressStoreVerifyComponent implements OnInit {
    website: any
    tech:any
    codeStatus = 'inProgress'
    verificationData: any = []
    webUrl: any

    constructor(
        public api: ApiService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.website = this.route.snapshot.queryParamMap.get('website')
        this.tech = this.route.snapshot.queryParamMap.get('tech')
        this.api.storeVerificationData = this.website
    }

    ngOnInit() {
        const params = {
            web: this.website,
            tech: this.tech
        }

        if (this.api.user.token) {
            this.api.checkStoreVerification(params).subscribe((resp: any) => {
                if (resp.success === false) {
                    this.codeStatus = 'expire'

                    return false
                } else {
                    this.verificationData = resp

                    this.webUrl = resp.data
                    if (resp.msg === 'new store') {
                        window.location.href = this.webUrl
                    }
                    this.codeStatus = 'valid'
                }
            })
        } else {
            this.router.navigate(['/login'], { queryParams: params, replaceUrl: true })
        }
    }

    resendCode() {

        const params = {
            web: this.website
        }
        this.api.resendVerificationCode(params).subscribe((resp: any) => {
            if (resp.success === true) {
                this.codeStatus = 'resent'
                return false
            }
            this.codeStatus = 'invalidCode'
        })
    }

}
