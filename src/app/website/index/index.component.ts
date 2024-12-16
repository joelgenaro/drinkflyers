import { DataService } from './data.service'
import { Component, OnDestroy, OnInit } from '@angular/core'
import { ApiService } from 'src/app/services/api.service'

@Component({
    selector: 'app-index',
    templateUrl: './index.component.html',
    styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit, OnDestroy {
    data: any
    exploreLoading = false
    buyLoading = false
    subscriptionLoading = false
    getQuoteLoading = false
    companyImagesData = []
    lastImageId = 0
    totalImageDataLength = 0
    intervalValue: any
    isAuthenticated = false
    isUser = false
    isAdmin = false
    isClient = false

    constructor(
        public api: ApiService,
        public ds: DataService
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
        this.isAdmin = this.api.isAdmin()
        this.isClient = this.api.isClient()
    }

    ngOnInit() {
    }

    ngOnDestroy(): void {
        clearInterval(this.intervalValue)
    }
}
