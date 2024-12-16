import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { Component, OnInit } from '@angular/core'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { DataService } from './data.service'
import * as moment from 'moment'
import { ApiService } from 'src/app/services/api.service'
@Component({
    selector: 'new-order',
    templateUrl: './new-order.component.html',
    styleUrls: ['./new-order.component.css']
})
export class NewOrderComponent implements OnInit {
    dataForm: FormGroup
    dataStatus = 'fetching'
    loginLoading = false
    breadCrum = [
        {
            link: '',
            value: 'Setting'
        }
    ]

    constructor(
        private fb: FormBuilder,
        public ui: UIHelpers,
        private alert: IAlertService,
        public ds: DataService,
        public api: ApiService
    ) {
        this.dataForm = this.fb.group({
            tax_percentage: new FormControl(null, [Validators.required])
        })

        this.ds.getSettings().subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)

                return false
            } else {
                this.dataForm.patchValue(resp.data)
                this.dataStatus = 'done'
            }
        })
    }

    ngOnInit() { }

    get g() {
        return this.dataForm.controls
    }

    update() {
        this.loginLoading = true
        if (this.dataForm.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.loginLoading = false

            return false
        }
        const params = {
            tax_percentage: this.dataForm.value.tax_percentage
        }

        if (params.tax_percentage > 100) {
            this.alert.error('Tax percentage should not be greater than 100.')
            this.loginLoading = false

            return false
        }

        this.ds.updateSettings(params).subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.loginLoading = false

                return false
            } else {
                this.alert.success('Settings Updated Successfully!!')
            }
        })
    }
}
