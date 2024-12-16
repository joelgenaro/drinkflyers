import { DataService } from './data.service'
import { ActivatedRoute, Router } from '@angular/router'
import { Component, OnInit } from '@angular/core'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ApiService } from 'src/app/services/api.service'
import * as moment from 'moment'
import { ConstantsService } from 'src/app/services/constants.service'


@Component({
    selector: 'app-order-detail',
    templateUrl: './order-detail.component.html',
    styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {
    dataList: any = []
    orderId: any = ''
    dataStatus = 'fetching'
    moment = moment
    orderDetailObj: any
    user: any
    breadCrum = [
        {
            link: '/user/orders',
            value: 'Orders',
            params: { id: this.orderId }
        }
    ]
    href: any

    constructor(
        private alert: IAlertService,
        public api: ApiService,
        private router: Router,
        public route: ActivatedRoute,
        public cs: ConstantsService,
        public ds: DataService
    ) {
        this.orderId = this.route.snapshot.queryParamMap.get('id')

        this.user = JSON.parse(localStorage.getItem('user'))
        const userRole = this.user.user_roles.map(r => { return r.role.name })
        if (userRole[0] === 'client') {
            this.breadCrum.map(b => { b.link = '/user/my-orders' })
        }

        this.breadCrum.push({
            link: '/user/order-detail',
            params: { id: this.orderId },
            value: 'Order Detail'
        })

        const params = {
            id: this.orderId,
        }

        this.ds.list(params).subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
            } else {
                this.dataList = resp.data
                this.dataStatus = 'done'
                this.orderDetailObj = Object.keys(this.dataList).length
            }
        })

        this.href = this.router.url
        console.log(this.href)
        console.log(this.router.url)
    }

    ngOnInit() {
    }

    getStatusFormat(status: string) {
        const statusFormat = {
            received: 'Received',
            in_factory: 'In Factory',
            in_packing: 'In Packing',
            dispatched: 'Dispatched',
            delivered: 'Delivered',
            rejected: 'Rejected',
            returned: 'Returned',
            returned_received: 'Returned Received',
        }

        return statusFormat[status]
    }
}
