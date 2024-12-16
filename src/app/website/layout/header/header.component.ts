import { ActivatedRoute, Params, Router } from '@angular/router'
import { BsDropdownConfig } from 'ngx-bootstrap/dropdown'
import { ApiService } from '../../../services/api.service'
import { Component, OnInit, AfterViewInit, Renderer2 } from '@angular/core'
import { ConstantsService } from 'src/app/services/constants.service'

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    providers: [{ provide: BsDropdownConfig, useValue: { isAnimated: false, autoClose: true } }]
})
export class HeaderComponent implements OnInit {
    isCollapsed = true
    carSubscribe: any
    isAuthenticated = false
    isUser = false

    constructor(
        public api: ApiService,
        public cs: ConstantsService,
        public router: Router,
        private route: ActivatedRoute,
        public renderer2: Renderer2
    ) {
        api.userLoggedInObs.subscribe(m => {
            this.isAuthenticated = m
            if (this.isAuthenticated) {
                this.loginUpdates()
            }
        })
    }
    loginUpdates(): void {
        this.isUser = this.api.isUser()
    }

    ngOnInit() {
    }

    logOut(): void {
        this.api.logOutSession().subscribe((resp: any) => {
            const check = this.api.logOut()
            if (check) {
                location.reload()
            }
        })
    }

    setCollapsed() {
        this.isCollapsed = !this.isCollapsed;
    }
}
