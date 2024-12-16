import { Router } from '@angular/router'
import { DataService } from './data.service'
import { Component, OnInit } from '@angular/core'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
@Component({
    selector: 'app-base-product',
    templateUrl: './base-product.component.html',
    styleUrls: ['./base-product.component.css']
})
export class BaseProductComponent implements OnInit {

    productDetail: any = []
    constructor(
        public ds: DataService,
        private router: Router,
        public alert: IAlertService

    ) {
    }

    ngOnInit() {

    }

    getActiveTabIndex() {
        return this.ds.tabs.findIndex((t: any) => t.link === this.ds.activeTab)
    }
}
