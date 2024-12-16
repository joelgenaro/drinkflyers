import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms'
import { Component, OnInit } from '@angular/core'
import { DataService } from './data.service'
import { UIHelpers } from 'src/app/helpers/ui-helpers';
;
import { Router } from '@angular/router'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'

@Component({
    selector: 'app-super-password',
    templateUrl: './super-password.component.html',
    styleUrls: ['./super-password.component.css']
})
export class SuperPasswordComponent implements OnInit {
    registrationError: string
    superPasswordForm: FormGroup
    newPass: any
    conPass: any
    constructor(
        private fb: FormBuilder,
        private dataService: DataService,
        public ui: UIHelpers,

        private router: Router,
        private alert: IAlertService,
    ) {
        this.superPasswordForm = this.fb.group({
            password: new FormControl(null, [Validators.required]),
            password_confirmation: new FormControl(null, [Validators.required]),
        })
    }

    get g() {
        return this.superPasswordForm.controls
    }

    ngOnInit() {
    }

    changePassword(data: any): boolean {
        this.newPass = this.superPasswordForm.get('password').value
        this.conPass = this.superPasswordForm.get('password_confirmation').value
        console.log(this.newPass)
        console.log(this.conPass)


        if (data.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')

            return false
        } else if (this.newPass !== this.conPass) {
            this.alert.error('New and confirm password are not matched.')


            return false

        }
        console.log(data)
        this.dataService.superPassword(data.value).subscribe((resp: any) => {
            if (resp.success === false) {
                this.registrationError = resp.errors.general

                return false
            } else {
                this.alert.success('Password change successfully!!')
            }
        })
    }

}
