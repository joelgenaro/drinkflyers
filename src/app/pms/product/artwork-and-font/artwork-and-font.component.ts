import { DataService } from '../data.service'
import { Component, OnInit } from '@angular/core'

@Component({
    selector: 'app-artwork-and-font',
    templateUrl: './artwork-and-font.component.html',
    styleUrls: ['./artwork-and-font.component.css']
})
export class ArtworkAndFontComponent implements OnInit {
    Loading = false

    constructor(private ds: DataService) {
        ds.activeTab = 'artwork-and-font'
    }

    ngOnInit() {
    }

}
