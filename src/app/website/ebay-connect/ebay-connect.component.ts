import { ActivatedRoute, Router } from '@angular/router'
import { ApiService } from 'src/app/services/api.service'
import { Component, OnInit } from '@angular/core'
import { DataService } from './data.service'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'

@Component({
    selector: 'app-ebay-connect',
    templateUrl: './ebay-connect.component.html',
    styleUrls: ['./ebay-connect.component.css']
})
export class EbayConnectComponent implements OnInit {
    qData: any = null
    data: any = null
    constructor(
        public api: ApiService,
        public ds: DataService,
        private route: ActivatedRoute,
        private router: Router,
        private alert: IAlertService
    ) {

        if (this.route.snapshot.queryParamMap.has('data')) {
            this.qData = this.route.snapshot.queryParamMap.get('data')
            this.data = JSON.parse(atob(this.qData))
        }
    }

    ngOnInit() {
        if (this.api.user.token) {
            this.ds.createStore(this.data).subscribe((resp: any) => {
                if (resp.success) {
                    this.alert.success(resp.msg)
                    // window.location = resp.data.installationURL
                } else {
                    // handle errors here
                }
            })
        } else {
            this.router.navigate(['/registration'], { queryParams: { data: this.qData, connect: 'ebay' }, replaceUrl: true })
        }
    }

}
