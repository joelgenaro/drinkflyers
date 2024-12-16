import { ApiService } from 'src/app/services/api.service'
import { ActivatedRoute } from '@angular/router'
import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { DataService } from '../data.service'

@Component({
    selector: 'app-personalized-region',
    templateUrl: './personalized-region.component.html',
    styleUrls: ['./personalized-region.component.css']
})
export class PersonalizedRegionComponent implements OnInit {
    dataForm: FormGroup
    Loading = false

    constructor(
        public ds: DataService,
        private fb: FormBuilder,
        public ui: UIHelpers,
        private route: ActivatedRoute,
        public api: ApiService
    ) {
        ds.activeTab = 'personalized-region'
        this.ds.productId = this.route.snapshot.queryParamMap.get('id')

        this.dataForm = this.fb.group({
            id: new FormControl(null),
            width: new FormControl(null, [Validators.required]),
            height: new FormControl(null, [Validators.required]),
            x_coordinate: new FormControl(null, [Validators.required]),
            y_coordinate: new FormControl(null, [Validators.required])
        })
    }

    ngOnInit() { }

    get g() {
        return this.dataForm.controls
    }

    save(data: any, f: any) { }

}
