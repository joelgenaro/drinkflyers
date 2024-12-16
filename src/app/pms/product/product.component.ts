import { ActivatedRoute, Router } from '@angular/router'
import { DataService } from './data.service'
import { Component, OnInit } from '@angular/core'

@Component({
    selector: 'app-product',
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {


    constructor(
        public ds: DataService,
        private route: ActivatedRoute
    ) {
        this.ds.baseProductId = this.route.snapshot.queryParamMap.get('base_id')
        this.ds.productId = this.route.snapshot.queryParamMap.get('id')
    }

    ngOnInit() {

    }

    getActiveTabIndex() {
        return this.ds.tabs.findIndex((t: any) => t.link === this.ds.activeTab)
    }
}
