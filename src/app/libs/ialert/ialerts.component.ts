import { IAlertService } from './ialerts.service'
import { Component, OnInit } from '@angular/core'
import { trigger, transition, style, animate } from '@angular/animations'

@Component({
    selector: 'ialerts',
    templateUrl: './ialerts.component.html',
    styleUrls: ['./ialerts.component.css'],
    animations: [
        trigger('ialert', [
            transition(':enter', [
                style({ transform: 'translateX(100%)' }),
                animate('250ms ease-in', style({ transform: 'translateX(0%)' }))
            ]),
            transition(':leave', [
                animate('500ms ease-in', style({ opacity: 0 }))
            ])
        ])
    ]
})
export class IAlertsComponent implements OnInit {
    public alerts: any

    constructor(public ialert: IAlertService) { }
    ngOnInit() {
        this.ialert.alerts.asObservable().subscribe((items: any) => {
            this.alerts = items
        })
    }
}
