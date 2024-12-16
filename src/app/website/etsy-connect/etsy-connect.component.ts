import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ActivatedRoute, Router } from '@angular/router'
import { DataService } from './data.service'
import { ApiService } from 'src/app/services/api.service'
import { Component, OnInit } from '@angular/core'

@Component({
    selector: 'app-etsy-connect',
    templateUrl: './etsy-connect.component.html',
    styleUrls: ['./etsy-connect.component.css']
})
export class EtsyConnectComponent implements OnInit {
    qData: any = null
    data: any = null
    connection = 'connecting'
    storeData: any
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
                    this.connection = 'success'
                    this.storeData = resp.data
                    // window.location = resp.data.installationURL
                } else {
                    this.alert.error('Sorry! Store Connection Failed, Try Again. ')
                    this.connection = 'error'
                }
            })
        } else {
            this.router.navigate(['/registration'], { queryParams: { data: this.qData, connect: 'etsy' }, replaceUrl: true })
        }
    }
}
