import { ConstantsService } from 'src/app/services/constants.service';
import { ActivatedRoute } from '@angular/router'
import { DataService } from './data.service'
import { Component, OnInit } from '@angular/core'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'

@Component({
    selector: 'app-invoice-detail',
    templateUrl: './invoice-detail.component.html',
    styleUrls: ['./invoice-detail.component.css']
})
export class InvoiceDetailComponent implements OnInit {
    dataStatus = 'fetching'
    invoiceData: any = []
    orderData: any = []
    invoiceObj: any
    id: any

    constructor(
        public ds: DataService,
        private route: ActivatedRoute,
        private alert: IAlertService,
        public cs: ConstantsService
    ) {
        this.id = this.route.snapshot.queryParamMap.get('id')
    }

    ngOnInit() {
        const params = {
            invoice_id: this.id
        }

        const list = this.ds.detail(params)
        list.subscribe((resp: any) => {
            if (resp.success === true) {
                this.invoiceData = resp.data
                this.orderData = resp.data.invoice_items[0].order_items
                this.dataStatus = 'done'
                this.invoiceObj = Object.keys(this.invoiceData).length
            } else {
                this.alert.error(resp.errors.general)
            }
        })
    }

    padLeadingZeros(num: any, size: any) {
        let s = num + ''
        while (s.length < size) s = '0' + s
        return s
    }
}
