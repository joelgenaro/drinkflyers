import { ConstantsService } from 'src/app/services/constants.service'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { Component, OnInit } from '@angular/core'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { DataService } from './data.service'
import { ApiService } from 'src/app/services/api.service'

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
    // public Editor = ClassicEditor
    editorConfig: any = {};
    dataForm: FormGroup
    dataStatus = 'fetching';
    loginLoading = false;
    thumbnail: any = '/assets/images/no_image.jpg';
    spinnerSVG = `/assets/images/rolling-main.svg`;
    selectedFile: any
    breadCrum = [
        {
            link: '',
            value: 'Login Content',
        },
    ];

    constructor(
        private fb: FormBuilder,
        public ui: UIHelpers,
        private alert: IAlertService,
        public ds: DataService,
        public api: ApiService,
        public cs: ConstantsService
    ) {
        this.dataForm = this.fb.group({
            id: new FormControl(null),
            title1: new FormControl(null),
            link: new FormControl(null),
            btn_text: new FormControl(null),
            btn_color: new FormControl(null),
            btn_text_color: new FormControl(null),
            content: new FormControl(null),
        })

        this.ds.getContent().subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)

                return false
            } else {
                if (resp.data) {
                    this.dataForm.patchValue(resp.data)
                    this.thumbnail = this.api.getLoginImg(resp.data.id)
                    this.selectedFile = this.thumbnail
                } else {
                    this.thumbnail = '/assets/images/no_image.jpg'
                }
                this.dataStatus = 'done'
            }
        })
    }

    ngOnInit() {
        this.editorConfig = this.cs.KOLKOV_EDITOR_CONFIG
    }

    get g() {
        return this.dataForm.controls
    }

    browseThumbnail(event: any) {
        event.preventDefault()
        const element = document.getElementById('thumbnail-image')
        element.click()
    }

    onThumbnailChange(event: any) {
        const file = event.target.files[0]
        this.selectedFile = file
        const allowedExtensions = ['png', 'jpg', 'jpeg']
        const extension = file.name.split('.').pop().toLowerCase()
        const fileSize = file.size / 1024 / 1024
        if (fileSize > 3) {
            this.alert.error('File size must not exceed 3MB.')
        } else if (allowedExtensions.indexOf(extension) < 0) {
            this.alert.error(
                'Format type is invalid.Required formats are PNG,JPG,JPEG.'
            )
        } else {
            const reader = new FileReader()
            reader.onload = () => {
                this.thumbnail = reader.result as string
            }
            reader.readAsDataURL(file)
        }
    }

    update() {
        this.loginLoading = true
        if (this.dataForm.status === 'INVALID') {
            this.alert.error(
                'Please fill-in valid data in all fields & try again.'
            )
            this.loginLoading = false

            return false
        }

        if (this.selectedFile === undefined) {
            this.alert.error('Please select image & try again.')
            this.loginLoading = false

            return false
        }

        const formData = this.api.jsonToFormData(this.dataForm.value)
        formData.append('image', this.selectedFile)

        if (this.dataForm.value.content === null) {
            formData.append('content', '')
        }
        if (this.dataForm.value.title1 === null) {
            formData.append('title1', '')
        }
        if (this.dataForm.value.link === null) {
            formData.append('link', '')
        }
        if (this.dataForm.value.btn_text === null) {
            formData.append('btn_text', '')
        }
        if (this.dataForm.value.btn_color === null) {
            formData.append('btn_color', '')
        }
        if (this.dataForm.value.btn_text_color === null) {
            formData.append('btn_text_color', '')
        }

        this.ds.updateContent(formData).subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.loginLoading = false

                return false
            } else {
                this.alert.success('Login Content Updated Successfully!!')
            }
        })
    }
}
