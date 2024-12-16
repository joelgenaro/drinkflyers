import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { DataService } from '../data.service'
import { ApiService } from 'src/app/services/api.service'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ActivatedRoute, Router } from '@angular/router'
import * as moment from 'moment'

@Component({
    selector: 'app-discount-compaign-info',
    templateUrl: './discount-compaign-info.component.html',
    styleUrls: ['./discount-compaign-info.component.css']
})
export class DiscountCompaignInfoComponent implements OnInit {
    formFG: FormGroup
    compaignId: any = -1
    storeId: any
    userType: any
    data: any
    employeeForm = false
    thumbnail: any = '/assets/images/no_image.jpg'
    selectedFile: any
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
        this.dataService.step = 'discount-compaign-info'

        this.route.queryParams.subscribe(params => {
            if (params.store_id) {
                this.storeId = params.store_id
                this.dataService.storeId = params.store_id

            }
            if (params.id) {
                this.compaignId = params.id
                const param: any = { id: this.compaignId }
                this.dataService.getDetail(param).subscribe((resp: any) => {
                    if (resp.success === false) {
                        this.alert.error(resp.errors.general)
                        this.router.navigate(['user/discount-compaign/list'], { queryParams: { store_id: this.storeId }, replaceUrl: true })
                    }
                    if (resp.success === true) {
                        this.formFG.patchValue(resp.data)
                        this.selectedFile = api.getCompaignImage(this.compaignId)
                        this.thumbnail = this.selectedFile
                        // this.formFG.patchValue(resp.data.user)
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
    onThumbnailChange(event: any) {
        const file = event.target.files[0]
        this.selectedFile = file
        console.log('File', this.selectedFile)
        const allowedExtensions = ['png', 'jpg', 'jpeg']
        const extension = file.name.split('.').pop().toLowerCase()
        const fileSize = file.size / 1024 / 1024
        if (fileSize > 3) {
            this.alert.error('File size must not exceed 3MB.')
        } else if (allowedExtensions.indexOf(extension) < 0) {
            this.alert.error('Format type is invalid.Required formats are PNG,JPG,JPEG.')
        } else {
            // this.thumbnail = file
            const reader = new FileReader()
            reader.onload = () => {
                this.thumbnail = reader.result as string
            }
            reader.readAsDataURL(file)
        }
    }

    browseThumbnail(event: any) {
        event.preventDefault()
        const element = document.getElementById('thumbnail-image')
        element.click()
    }

    makeForm() {
        this.formFG = this.fb.group({
            id: new FormControl(null),
            store_id: new FormControl(null),
            name: new FormControl(null, [Validators.required]),
            start_date: new FormControl(null, [Validators.required]),
            end_date: new FormControl(null, [Validators.required]),
            // gender: new FormControl(null, [Validators.required]),
            // dob: new FormControl(null, [Validators.required]),
            // contact_1: new FormControl(null, [Validators.required, Validators.maxLength(15)]),
            // contact_2: new FormControl(null, [Validators.required, Validators.maxLength(15)]),
            // address: new FormControl(null, [Validators.required, Validators.maxLength(200)]),
            description: new FormControl(null)
        })
    }

    save(data: any): boolean {
        this.loginLoading = true
        if (data.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.loginLoading = false

            return false
        }
        data.value.start_date = moment(data.value.start_date).format('YYYY-MM-DD')
        data.value.end_date = moment(data.value.end_date).format('YYYY-MM-DD')

        const formData = this.api.jsonToFormData(data.value)
        formData.append('store_id', this.storeId)
        formData.append('image', this.selectedFile)

        let saveMethod = this.dataService.add(formData)
        if (this.compaignId > -1) {
            saveMethod = this.dataService.update(formData)
        }
        saveMethod.subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.loginLoading = false

                return false
            } else {
                if (this.compaignId > -1) {
                    this.alert.success('Compaign updated successfully!!')
                } else {
                    this.compaignId = resp.data
                    this.alert.success('Compaign created successfully!!')
                }
                this.router.navigate(['/user/discount-compaign/add-discount-product'], { queryParams: { id: this.compaignId, store_id: this.storeId }, replaceUrl: true })

                // if (this.api.checkPermission('permissions')) {
                //     this.router.navigate(['/user/discount-compaign/add-discount-product'], { queryParams: { id: this.compaignId }, replaceUrl: true })
                // }
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
