import { DataService } from './data.service'
import { ApiService } from 'src/app/services/api.service'
import { Router, ActivatedRoute } from '@angular/router'
import { Component, OnInit } from '@angular/core'

@Component({
    selector: 'app-shopify-connect',
    templateUrl: './shopify-connect.component.html',
    styleUrls: ['./shopify-connect.component.css']
})
export class ShopifyConnectComponent implements OnInit {


    qData: any = null

    data: any = null
    constructor(
        public api: ApiService,
        public ds: DataService,
        private route: ActivatedRoute,
        private router: Router
    ) {

        if(this.route.snapshot.queryParamMap.has('data')) {
            this.qData = this.route.snapshot.queryParamMap.get('data')
            this.data = JSON.parse(atob(this.qData))
        }

    }

    ngOnInit() {

        if (this.api.user.token) {
            const params = {
                store_name: this.data.storeName
            }

            this.ds.createStore(params).subscribe( (resp: any) => {
                if (resp.success) {
                    window.location = resp.data.installationURL
                } else {
                    // handle errors here
                }
            })
        } else {

            this.router.navigate(['/registration'], { queryParams: {data: this.qData}, replaceUrl: true })

        }
    }
}
