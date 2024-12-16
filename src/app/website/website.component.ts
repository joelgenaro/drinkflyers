import { ApiService } from './../services/api.service'
import { Router } from '@angular/router'
import { Component, OnInit } from '@angular/core'
import { WebsiteService } from '../services/website.service'

@Component({
    selector: 'app-website',
    templateUrl: './website.component.html',
    styleUrls: ['./website.component.css']
})
export class WebsiteComponent implements OnInit {
    isLoading: boolean

    constructor(
        private route: Router,
        public api: ApiService,
        public web: WebsiteService
    ) {
    }

    ngOnInit() {
    }
}
