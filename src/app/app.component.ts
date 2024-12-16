import { Event, Router } from '@angular/router'
import { Component } from '@angular/core'

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    isLoading: boolean

    constructor(
        private route: Router,
    ) {

        this.route.events.subscribe((routerEvent: Event) => {
        })
    }
}
