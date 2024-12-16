import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { UIHelpers } from 'src/app/helpers/ui-helpers';
import { DataService } from './../data.service'
import { ApiService } from 'src/app/services/api.service';
import { IAlertService } from 'src/app/libs/ialert/ialerts.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment'

@Component({
    selector: 'app-personal-info',
    templateUrl: './personal-info.component.html',
    styleUrls: ['./personal-info.component.css']
})
export class PersonalInfoComponent implements OnInit {
    formFG: FormGroup
    employeeId: any = -1
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
        this.dataService.step = 'personal-info'

        this.route.queryParams.subscribe(params => {
            if (params.id) {
                this.employeeId = params.id
                const param: any = { id: this.employeeId }
                this.dataService.getEmployee(param).subscribe((resp: any) => {
                    if (resp.success === false) {
                        this.alert.error(resp.errors.general)
                        this.router.navigate(['/user/client/list'])
                    }
                    if (resp.success === true) {
                        this.formFG.patchValue(resp.data)
                        this.formFG.patchValue(resp.data.user)
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
            //title: new FormControl(null, [Validators.required]),
            email: new FormControl(null, [Validators.required, Validators.email]),
            first_name: new FormControl(null, [Validators.required, Validators.maxLength(100)]),
            last_name: new FormControl(null, [Validators.maxLength(100)]),
            //gender: new FormControl(null, [Validators.required]),
            //dob: new FormControl(null, [Validators.required]),
            contact_1: new FormControl(null, [Validators.maxLength(15)]),
            //contact_2: new FormControl(null, [Validators.required, Validators.maxLength(15)]),
            //address: new FormControl(null, [Validators.required, Validators.maxLength(200)]),
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
        data.value.dob = moment(data.value.dob).format('YYYY-MM-DD')

        let saveMethod = this.dataService.add(data.value)
        if (this.employeeId > -1) {
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
                if (this.employeeId > -1) {
                    this.alert.success('Profile updated successfully')
                } else {
                    this.employeeId = resp.data.id
                    this.alert.success('Profile created successfully')
                }
                if (this.api.checkPermission('permissions')) {
                    this.router.navigate(['/user/client/permissions'], { queryParams: { id: this.employeeId }, replaceUrl: true })
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
