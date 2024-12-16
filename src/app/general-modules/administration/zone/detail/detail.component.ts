import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ApiService } from 'src/app/services/api.service'
import { DataService } from '../data.service'

@Component({
    selector: 'app-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {
    dataForm: FormGroup
    zoneId: any = -1
    zoneForm = false
    loginLoading = false

    constructor(
        public dataService: DataService,
        private fb: FormBuilder,
        public ui: UIHelpers,
        public api: ApiService,
        private alert: IAlertService,
        private route: ActivatedRoute,
        public router: Router,
    ) {
        this.dataForm = this.fb.group({
            id: new FormControl(null),
            name: new FormControl(null, [Validators.required, Validators.maxLength(200)]),
            code: new FormControl(null)
        })
        this.dataService.step = 'detail'

        this.route.queryParams.subscribe(params => {
            if (params.id) {
                this.zoneId = params.id
                const param: any = { id: this.zoneId }
                this.dataService.zoneDetail(param).subscribe((resp: any) => {
                    if (resp.success === false) {
                        this.alert.error(resp.errors.general)
                        this.router.navigate(['/user/client/list'])
                    }
                    if (resp.success === true) {
                        this.dataForm.patchValue(resp.data)
                        this.zoneForm = true
                    }
                })
            } else {
                this.zoneForm = true
            }
        })
    }

    ngOnInit() {
    }

    get g() {
        return this.dataForm.controls
    }

    save(data: any): boolean {
        this.loginLoading = true
        if (data.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.loginLoading = false

            return false
        }

        let saveMethod = this.dataService.add(data.value)
        if (this.zoneId > -1) {
            saveMethod = this.dataService.update(data.value)
        }
        saveMethod.subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.loginLoading = false

                return false
            } else {
                if (this.zoneId > -1) {
                    this.alert.success('Zone updated successfully')
                } else {
                    this.zoneId = resp.data
                    this.alert.success('Zone created successfully')
                }
                this.router.navigate(['/user/zone/countries'], { queryParams: { id: this.zoneId }, replaceUrl: true })
            }
        })
    }

}
