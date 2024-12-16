import { ConstantsService } from 'src/app/services/constants.service';
import { ActivatedRoute } from '@angular/router'
import { DataService } from './data.service'
import { Component, OnInit } from '@angular/core'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'

@Component({
    selector: 'app-invoice-preview',
    templateUrl: './invoice-preview.component.html',
    styleUrls: ['./invoice-preview.component.css']
})
export class InvoicePreviewComponent implements OnInit {
    dataStatus = 'fetching'
    invoiceData: any = []
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
            id: this.id
        }

        const list = this.ds.items(params)
        list.subscribe((resp: any) => {
            if (resp.success === true) {
                this.invoiceData = resp.data
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
