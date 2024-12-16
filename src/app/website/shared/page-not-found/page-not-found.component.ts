import { Routes, ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core'

@Component({
    selector: 'app-page-not-found',
    templateUrl: './page-not-found.component.html',
    styleUrls: ['./page-not-found.component.css']
})
export class PageNotFoundComponent implements OnInit {
    message = ''
    constructor(private route: ActivatedRoute) { }

    ngOnInit() {
        this.route.data.subscribe(m => this.message = m.message )
    }

}
