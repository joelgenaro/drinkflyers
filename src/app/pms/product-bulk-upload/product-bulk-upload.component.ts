import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { HttpClient } from '@angular/common/http'
import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { DataService } from './data.service'

@Component({
    selector: 'app-product-bulk-upload',
    templateUrl: './product-bulk-upload.component.html',
    styleUrls: ['./product-bulk-upload.component.css']
})
export class ProductBulkUploadComponent implements OnInit {
    @ViewChild('f', { static: false }) domFileElement: ElementRef
    document: any

    seletcedFile: any
    filename: 'Upload CSV File'
    modalRef: BsModalRef
    bulkUploadData = []
    CSVDuplicateUsers = []
    totalCSVDuplicates = 0
    totalFailed = 0
    totalProduct = 0
    totalSuccess = 0
    resultStatus = false
    subjectDistrictList = []
    latLngStatus = false
    userArray: any = []
    userData: any = []
    colArray: any = []
    modalTitle: any = ''
    selectedIndex = -1
    selectedId: any
    dataForm: FormGroup
    Loading = false
    insertion: boolean = false;
    breadCrum = [
        {
            link: '',
            value: 'Base Product Bulk Uploads'
        }
    ]
    tagList = []
    lastChildCatList = []
    baseProductList = []
    productIds = []
    bulkUploadId: any
    loginLoading = false
    bulkId: any

    constructor(
        private alert: IAlertService,
        public ds: DataService,
        private ms: BsModalService,
        private http: HttpClient,
        public ui: UIHelpers,
        public fb: FormBuilder
    ) {
        this.dataForm = this.fb.group({
            id: new FormControl(null),
            name: new FormControl(null, [Validators.required]),
            sku: new FormControl(null, [Validators.required]),
            tag: new FormControl(null, [Validators.required]),
            category: new FormControl(null, [Validators.required]),
            base_product_sku: new FormControl(null, [Validators.required])
        })

        this.ds.tagList().subscribe(resp => {
            if (resp.success == true) {
                this.tagList = resp.data
            }
        })
        this.ds.lastChildCatList().subscribe(resp => {
            if (resp.success == true) {
                this.lastChildCatList = resp.data
            }
        })
        this.ds.baseProductList().subscribe(resp => {
            if (resp.success == true) {
                this.baseProductList = resp.data
            }
        })
    }

    ngOnInit() {
    }

    get g() {
        return this.dataForm.controls
    }
    checkAllProducts() {
        if (this.productIds.length == 0) {
            this.bulkUploadData.forEach(data => {
                if (data.status) {
                    this.productIds.push(data.id)
                }
            })
        } else {
            this.productIds = []
        }
    }
    addBulkProducts() {
        if (this.productIds.length === 0) {
            this.alert.error('No prodduct is selected')
            // this.Loading = false

            return false
        }
        const params = {
            id: this.bulkId,
            bulk_upload_ids: this.productIds
        }
        this.ds.uploadBulkProducts(params).subscribe(resp => {
            if (resp.success == true) {
                this.alert.success("Data Inserted Successfully")
                this.insertion = true
                this.resultStatus = true
                this.totalFailed = resp.data.failed_record
                this.totalProduct = resp.data.total_record
                this.totalSuccess = resp.data.success_record
                this.bulkId = resp.data.id
                if (resp.data.bulk_upload_data.length > 0) {
                    this.bulkUploadData = resp.data.bulk_upload_data
                }
                this.productIds = []
                // console.log('Data is', resp)
            } else {
                this.alert.error(resp.errors.general)
            }
        })
    }
    checkProductId(id) {
        const getIndex = this.productIds.findIndex((e) => e === id)

        if (getIndex !== -1) {
            return true
        } else {
            return false
        }
    }
    viewSample() {
        this.colArray = []
        this.userArray = []
        this.http.get('assets/sample/sample-data.csv', { responseType: 'text' }).subscribe(data => {
            const csvToRowArray = data.split('\n')

            for (let index = 0; index < csvToRowArray.length - 1; index++) {
                const row = csvToRowArray[index].split('|')
                if (index == 0) {
                    this.colArray = csvToRowArray[index].split('|')
                } else {
                    this.userArray.push(csvToRowArray[index].split('|'))
                }
            }
        })
    }

    confirmingModal(template: TemplateRef<any>, id: any, i: any) {
        this.selectedId = id
        this.selectedIndex = i
        this.modalRef = this.ms.show(template, { class: 'modal-sm admin-panel' })
    }

    openModal(sample, index) {
        this.modalRef = this.ms.show(
            sample,
            {
                class: 'modal-xl modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
        this.viewSample()
    }

    openProductModal(sample, index) {
        this.modalTitle = 'Add New Product'
        if (index > -1) {
            this.selectedIndex = index
            this.bulkUploadId = this.bulkUploadData[index].id
            this.dataForm.controls.id.setValue(this.bulkUploadData[index].id)
            this.dataForm.patchValue(this.bulkUploadData[index])
            this.modalTitle = 'Edit Product'
        }

        this.modalRef = this.ms.show(
            sample,
            {
                class: 'modal-md modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
    }

    save(formData: any, f) {
        this.Loading = true
        if (this.dataForm.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.Loading = false

            return false
        }
        this.ds.update(formData.value).subscribe(resp => {
            this.Loading = false
            if (resp.success == true) {
                this.totalFailed = this.totalFailed - 1
                this.totalSuccess = this.totalSuccess + 1
                this.bulkUploadData[this.selectedIndex] = resp.data
                this.alert.success('Updated successfully!!')
                this.Loading = false
                f.resetForm()
                this.modalRef.hide()
            } else {
                this.alert.error(resp.errors.general)
                this.Loading = false
            }
        })
    }

    cancelButton(f: any) {
        f.resetForm()
        this.modalRef.hide()
        this.selectedIndex = -1
    }

    browseFile(event: any) {
        event.preventDefault()
        const element = document.getElementById('csv-file')
        element.click()
    }

    onFileChange(event: any) {
        const file = event.target.files[0]
        const allowedExtensions = ['csv']
        this.filename = file.name
        const extension = file.name.split('.').pop().toLowerCase()
        const fileSize = file.size / 1024 / 1024
        if (fileSize > 10) {
            this.alert.error('Invalid file size. File size must not exceeds 10MB.')
            this.domFileElement.nativeElement.value = ''
        } else if (allowedExtensions.indexOf(extension) < 0) {
            this.alert.error('Invalid file type. Only CSV file is allowed.')
            this.domFileElement.nativeElement.value = ''
        } else {
            this.seletcedFile = file
        }
    }

    addProduct(id, i) {
        const getIndex = this.productIds.findIndex((e) => e === id)

        if (getIndex !== -1) {
            this.productIds.splice(getIndex, 1)
        } else {
            this.productIds.push(id)
        }
    }

    searchReviews() {
        if (this.domFileElement.nativeElement.value == '') {
            this.alert.error('Please select a valid CSV file to upload.')

            return false
        }

        const formData = new FormData()
        formData.append('file', this.seletcedFile)
        formData.append('file_name', this.filename)

        this.ds.uploadFile(formData).subscribe((resp: any) => {
            if (resp.success === true) {
                this.alert.success('Added successfully!!')
                this.resultStatus = true
                this.totalFailed = resp.data.Invalid
                this.totalProduct = resp.data.total_record
                this.totalSuccess = resp.data.Valid
                this.bulkId = resp.data.id
                if (resp.data.bulk_upload_data.length > 0) {
                    this.bulkUploadData = resp.data.bulk_upload_data
                }
                // if (resp.data.csv_duplicates.length > 0) {
                //     this.CSVDuplicateUsers = resp.csv_duplicates
                // }
                // if (resp.data.missing_lat_lng.length > 0) {
                //     this.subjectDistrictList = resp.missing_lat_lng
                //     this.latLngStatus = true
                // }
            } else {
                this.alert.error(resp.errors.general)
            }
            this.domFileElement.nativeElement.value = ''
        })
    }

    browseImages(event: any) {
        event.preventDefault()
        const element = document.getElementById('csv-file')
        element.click()
    }

    deleteRow() {
        this.loginLoading = true
        const params = {
            id: this.selectedId
        }
        this.ds.delete(params).subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.modalRef.hide()
                this.loginLoading = false

                return false
            } else {
                const deletingIndex = this.bulkUploadData.findIndex((d: any) => {
                    return d.id === this.selectedId
                })
                this.totalProduct = this.totalProduct - 1
                if (this.bulkUploadData[deletingIndex].status) {
                    this.totalSuccess -= 1
                } else {
                    this.totalFailed -= 1
                }
                this.bulkUploadData.splice(deletingIndex, 1)
                this.modalRef.hide()
                this.alert.success('Deleted successfully!!')
                this.selectedIndex = -1
            }
        })
    }

}
