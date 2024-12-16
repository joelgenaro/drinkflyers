import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { DataService } from './../data.service'
import { ApiService } from 'src/app/services/api.service'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ActivatedRoute, Router } from '@angular/router'
import * as moment from 'moment'

@Component({
    selector: 'app-add-edit',
    templateUrl: './add-edit.component.html',
    styleUrls: ['./add-edit.component.css']
})
export class AddEditComponent implements OnInit {
    formFG: FormGroup
    storeId: any = -1
    userType: any
    data: any
    employeeForm = false
    loginLoading = false
    constructor(private fb: FormBuilder,
        public ui: UIHelpers,
        public dataService: DataService,
        public api: ApiService,
        private alert: IAlertService,
        private route: ActivatedRoute,
        public router: Router,
    ) {
        this.makeForm()
        this.dataService.step = 'store-detail'

        this.route.queryParams.subscribe(params => {
            if (params.id) {
                this.storeId = params.id
                const param: any = { id: this.storeId }
                this.dataService.detail(param).subscribe((resp: any) => {
                    if (resp.success === false) {
                        this.alert.error(resp.errors.general)
                        this.router.navigate(['/user/sepod-stores/list'])
                    }
                    if (resp.success === true) {
                        this.formFG.patchValue(resp.data)
                        this.employeeForm = true
                    }
                })
            } else {
                this.employeeForm = true
            }
        })
        this.userType = this.api.user.user_type
    }
    get g() {
        return this.formFG.controls
    }
    ngOnInit() {
    }

    makeForm() {
        this.formFG = this.fb.group({
            id: new FormControl(null),
            store_name: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
            // poc_name: new FormControl(null, [Validators.required]),
            // poc_contact: new FormControl(null, [Validators.required]),
            web: new FormControl(null, []),
            builtin_technology: new FormControl(null, [Validators.required]),
            store_type: new FormControl('sepod'),
            user_id: new FormControl(-1)
            // description: new FormControl(null, [Validators.required, Validators.maxLength(1000)])
        })
    }

    save(data: any): boolean {
        this.loginLoading = true
        if (data.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.loginLoading = false

            return false
        }


        let saveMethod = this.dataService.add(data.value)
        if (this.storeId > -1) {
            delete data.value.email
            saveMethod = this.dataService.update(data.value)
        }
        saveMethod.subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.loginLoading = false

                return false
            } else {
                if (this.storeId > -1) {
                    this.alert.success('Store updated successfully!!')
                } else {
                    this.storeId = resp.data.id
                    this.alert.success('Store created successfully!!')
                }
                if (this.api.checkPermission('permissions')) {
                    this.router.navigate(['/user/sepod-stores/permissions'], { queryParams: { id: this.storeId }, replaceUrl: true })
                }
            }
        })
    }
    findInvalidControls() {
        const invalid = []
        const controls = this.formFG.controls
        for (const name in controls) {
            if (controls[name].invalid) {
                invalid.push(name)
            }
        }
        return invalid
    }
}
