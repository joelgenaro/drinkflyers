import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { HttpClient } from '@angular/common/http'
import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { DataService } from './data.service'
import { ActivatedRoute, Router } from '@angular/router'
import { Route } from '@angular/compiler/src/core'
import { ApiService } from 'src/app/services/api.service'

@Component({
    selector: 'app-bulk-uploader',
    templateUrl: './bulk-uploader.component.html',
    styleUrls: ['./bulk-uploader.component.css']
})
export class BulkUploaderComponent implements OnInit {
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
    LoadingZip = false
    dataStatus = 'fetching'
    insertion: boolean = false;
    breadCrum = [
        {
            link: '',
            value: 'Bulk Uploads'
        }
    ]
    tagList = []
    lastChildCatList = []
    baseProductList = []
    productIds = []
    bulkUploadId: any
    loginLoading = false
    bulkId: any
    baseProductId
    bProduct=null
    dataList = []


    constructor(
        private alert: IAlertService,
        public ds: DataService,
        private ms: BsModalService,
        private http: HttpClient,
        public ui: UIHelpers,
        public fb: FormBuilder,
        public api:ApiService,

        public route:ActivatedRoute

    ) {

        this.baseProductId =this.route.snapshot.queryParams.base_id
        console.log(this.baseProductId)
        this.dataForm = this.fb.group({
            id: new FormControl(null),
            name: new FormControl(null, [Validators.required]),
            sku: new FormControl(null, [Validators.required]),
            tag: new FormControl(null, [Validators.required]),
            category: new FormControl(null, [Validators.required]),
            base_product_sku: new FormControl(null, [Validators.required])
        })

        if(this.baseProductId !== undefined ){


            this.ds.baseProductDetail({id:this.baseProductId}).subscribe(resp => {
                if(resp.success == true){
                    this.bProduct = resp.data

                }else{
                    this.alert.error(resp.errors.general)
                }
                this.dataStatus = 'done'
            })
        }else{
            this.baseProductId = null
            this.dataStatus = 'done'
        }


        this.ds.baseProductList().subscribe(resp => {
            this.baseProductList = resp.data
        })



    }

    ngOnInit() {
    }

    get g() {
        return this.dataForm.controls
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

    downloadZip(){

        this.LoadingZip = true
        this.ds.downloadZip().subscribe((resp: any) => {

            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                return false
            }
            const blob = new Blob([resp], {
                type: 'application/zip'
            })
            const downloadURL = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = downloadURL
            link.download = 'sample-data.zip'
            link.click()
            this.LoadingZip = false
        })
    }


    save() {
        this.Loading = true
        if (this.seletcedFile === null) {
            this.alert.error('Please Select File')
            this.Loading = false

            return false
        }
        if(this.baseProductId == null ){
            this.alert.error('Please Select Base Product')
            this.Loading = false

            return false
        }

        const data = {
            base_product_id : this.baseProductId
        }
        const form = this.api.jsonToFormData(data)
        form.append('folder',this.seletcedFile)

        this.ds.uploadBulk(form).subscribe(resp=>{
            if(resp.success == true){
                console.log(resp);
                this.dataList = resp.data
                this.totalProduct = resp.data.length
                this.totalFailed = 0
                this.totalSuccess=this.totalProduct
            }else{
                this.alert.error(resp.errors.general)
            }
            this.Loading = false
        })
    }

    productDetail(event){
        this.dataStatus = 'fetching'
        const pId = event.target.value
        this.baseProductId = pId
        console.log('e',event.target, 'pid', pId);

        this.ds.baseProductDetail({id:pId}).subscribe(resp => {
            if(resp.success == true){
                this.bProduct = resp.data

            }else{
                this.alert.error(resp.errors.general)
            }
            this.dataStatus = 'done'
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
        // if (fileSize > 10) {
        //     this.alert.error('Invalid file size. File size must not exceeds 10MB.')
        //     this.domFileElement.nativeElement.value = ''
        // } else if (allowedExtensions.indexOf(extension) < 0) {
        //     this.alert.error('Invalid file type. Only CSV file is allowed.')
        //     this.domFileElement.nativeElement.value = ''
        // } else {
            this.seletcedFile = file
        //}
    }




}
