import { Observable, zip } from 'rxjs'
import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core'
import {
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import * as moment from 'moment'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ApiService } from 'src/app/services/api.service'
import { DataService } from '../data.service'
import { Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'

@Component({
    selector: 'app-mockups',
    templateUrl: './mockups.component.html',
    styleUrls: ['./mockups.component.css'],
})
export class MockupsComponent implements OnInit, OnDestroy {
    selectedBaseProductId: any
    spinnerSVG = `/assets/images/rolling-gray.svg`
    mockupList = [
        {
            'id': 1,
            'title': 'Girl\'s Mockup',
            "src": "assets/images/sample2.jpg"
        },
        {
            'id': 2,
            'title': 'Girl\'s Mockup',
            "src": "assets/images/sample3.jpg"
        },
        {
            'id': 3,
            'title': 'Men\'s Mockup',
            "src": "assets/images/sample4.jpg"
        },
        {
            'id': 4,
            'title': 'Men\'s Mockup',
            "src": "assets/images/sample5.jpg"
        }
    ]
    mockupMain = []
    constructor(
        public ds: DataService,
        private fb: FormBuilder,
        public ui: UIHelpers,
        public alert: IAlertService,
        private router: Router,
        private route: ActivatedRoute,
        private api: ApiService
    ) {
        ds.activeTab = 'mock-ups'
        this.api.isfullScreen = false
        this.ds.productId = this.route.snapshot.queryParamMap.get('id')
        this.ds.baseProductId = this.route.snapshot.queryParamMap.get('base_id')
        this.selectedBaseProductId = this.route.snapshot.queryParamMap.get('base_id')
        //console.log(this.mockupList)
        this.ds.imagesList({ id: this.ds.productId }).subscribe(ele => {
            if (ele.success) {
                this.mockupMain = ele.data
            }
        });
    }

    ngOnInit() {

    }

    ngOnDestroy(): void {

    }

    routeToDetails() {
        this.router.navigate([this.api.checkUser() + '/product/product-detail'], {
            queryParams: {
                id: this.ds.productId,
                base_id: this.selectedBaseProductId,
            },
            replaceUrl: true,
        })
    }
}
