import { DataService } from './data.service'
import { Component, OnInit } from '@angular/core'

@Component({
    selector: 'app-discount-compaign',
    templateUrl: './discount-compaign.component.html',
    styleUrls: ['./discount-compaign.component.css']
})
export class DiscountCompaignComponent implements OnInit {

    constructor(public ds: DataService) { }

    ngOnInit() {
    }

}
