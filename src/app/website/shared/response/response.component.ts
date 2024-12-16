import { Component, Input } from '@angular/core'

@Component({
    selector: 'app-response',
    templateUrl: './response.component.html',
    styleUrls: ['./response.component.css']
})
export class ResponseComponent {
    @Input() response: any

    constructor() { }
}
