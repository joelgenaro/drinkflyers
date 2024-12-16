
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms'
import { Component, OnInit } from '@angular/core'
import { DataService } from './data.service'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { Router } from '@angular/router'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'

@Component({
    selector: 'app-contact-us-page',
    templateUrl: './contact-us-page.component.html',
    styleUrls: ['./contact-us-page.component.css']
})
export class ContactUsPageComponent implements OnInit {
    registrationError: string
    dataStatus = false
    contactUsPageForm: FormGroup
    pageContent: any
    waiting = {
        update: false
    }
    constructor(
        private fb: FormBuilder,
        private dataService: DataService,
        public ui: UIHelpers,
        private router: Router,
        private alert: IAlertService,

    ) {

        this.contactUsPageForm = this.fb.group({
            address: new FormControl(null, [Validators.required]),
            phone: new FormControl(null, [Validators.required]),
            contact_email: new FormControl(null, [Validators.required]),
            support_email: new FormControl(null, [Validators.required]),
            sales_email: new FormControl(null, [Validators.required])
        })

        const params = { route: 'contact-us' }
        this.dataService.getPageContent(params).subscribe((resp: any) => {
            this.pageContent = JSON.parse(resp.data.page_data)
            console.log(this.pageContent)
            this.dataStatus = true
            this.contactUsPageForm.patchValue(this.pageContent)

        })


    }

    get g() {
        return this.contactUsPageForm.controls
    }

    ngOnInit() {

    }

    savePageContent(data: any) {
        this.waiting.update = true
        if (data.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.waiting.update = false

            return false
        }

        const params = {
            route: 'contact-us',
            page_data: {
                address: data.value.address,
                phone: data.value.phone,
                contact_email: data.value.contact_email,
                support_email: data.value.support_email,
                sales_email: data.value.sales_email
            }
        }
        console.log(params)
        this.dataService.savePageContent(params).subscribe((resp: any) => {
            this.waiting.update = false
            if (resp.success == true) {
                this.alert.success('Data updated successfully!!')
                this.contactUsPageForm.patchValue(data.value)
            } else {
                this.alert.error(resp.msg)
            }
        })

    }
}
