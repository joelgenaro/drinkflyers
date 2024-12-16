import { Router } from '@angular/router'
import { DataService } from './data.service'
import { Component, OnInit } from '@angular/core'

@Component({
    selector: 'app-product',
    templateUrl: './product-detail.component.html',
    styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {


    constructor(
        public ds: DataService,
        private router: Router
    ) {
        // this.router.navigate([this.api.checkUser() + '/product/product-detail'])
    }

    ngOnInit() {

    }

    getActiveTabIndex() {
        return this.ds.tabs.findIndex((t: any) => t.link === this.ds.activeTab)
    }
}
