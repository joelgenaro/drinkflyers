import { Component, OnInit } from '@angular/core'
import { DataService } from '../data.service'

@Component({
    selector: 'app-summary',
    templateUrl: './summary.component.html',
    styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit {

    constructor(private ds: DataService) {
        ds.activeTab = 'summary'
    }

    ngOnInit() {
    }

}
