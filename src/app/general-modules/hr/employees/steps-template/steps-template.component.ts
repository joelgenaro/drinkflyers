import { Component, OnInit, Input } from '@angular/core'
import { DataService } from '../data.service'
import { ActivatedRoute } from '@angular/router'
import { ApiService } from 'src/app/services/api.service'

@Component({
    selector: 'app-steps-template',
    templateUrl: './steps-template.component.html',
    styleUrls: ['./steps-template.component.css']
})
export class StepsTemplateComponent implements OnInit {
    lang: any
    @Input() step: string
    selectedId = -1
    constructor(
        public ds: DataService,
        public api: ApiService,
        private route: ActivatedRoute,
    ) {
        this.route.queryParams.subscribe((params: any) => {
            if (params.id) {
                this.selectedId = params.id
            }
        })
    }

    ngOnInit() {
    }

}
