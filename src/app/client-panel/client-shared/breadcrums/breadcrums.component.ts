import { Component, Input, OnInit } from '@angular/core'

@Component({
    selector: 'app-breadcrums',
    templateUrl: './breadcrums.component.html',
    styleUrls: ['./breadcrums.component.css']
})
export class BreadcrumsComponent implements OnInit {
    @Input()
    data: any

    constructor() { }

    ngOnInit() {
    }

}
