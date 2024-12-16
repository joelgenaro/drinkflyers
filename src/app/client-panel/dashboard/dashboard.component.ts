import { Router } from '@angular/router'
import { ApiService } from 'src/app/services/api.service'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { IAlertsModule } from 'src/app/libs/ialert/ialerts.module'
import { DataService } from './data.service'
import { Component, OnInit } from '@angular/core'

@Component({
    selector: 'app-driver-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    dataStatus = 'fetching'
    spinnerSVG = `/assets/images/rolling-main.svg`
    trendingProduct: any = []

    constructor(
        private ds: DataService,
        private alert: IAlertService,
        public api: ApiService,
        private router: Router
    ) {
        this.ds.recentelyProductData().subscribe((resp: any) => {
            if (resp.success === true) {
                this.trendingProduct = resp.data
                this.dataStatus = 'done'
                console.log('this.trendingProduct', resp)
                console.log('this.trendingProduct', this.trendingProduct)
            } else {
                this.alert.error(resp.errors)
            }
        })
    }

    ngOnInit() { }

    addProduct(dataValue) {
        const random = Math.round(new Date().getTime())
        let selectedTags: any = []
        if (dataValue.tag_ids != '') {
            selectedTags = dataValue.tag_ids.split(',').map((i) => +i)
        }
        const params = {
            id: null,
            sku: random + '' + dataValue.sku,
            name: dataValue.name,
            personalize: 1, // this.dataForm.value.personalize,
            tag_ids: selectedTags,
            base_product_id: dataValue.id
        }

        let saveMethod = this.ds.addProductDetail(params)

        saveMethod.subscribe((resp: any) => {
            this.dataStatus = 'fetching'
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.dataStatus = 'done'

                return false
            } else {

                this.router.navigate([this.api.checkUser() + '/product/personalized-region'], {
                    queryParams: {
                        id: resp.data,
                        base_id: dataValue.id,
                    },
                    replaceUrl: true,
                })
            }
        })
    }
}
