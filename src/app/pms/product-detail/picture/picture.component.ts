import { ActivatedRoute } from '@angular/router'
import { ApiService } from 'src/app/services/api.service'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { Component, OnInit, TemplateRef } from '@angular/core'
import { DataService } from '../data.service'
import { ImageCroppedEvent } from 'ngx-image-cropper'

@Component({
    selector: 'app-picture',
    templateUrl: './picture.component.html',
    styleUrls: ['./picture.component.css']
})
export class PictureComponent implements OnInit {
    addProductLoading = false
    uploadedFiles = []
    spinnerSVG = `/assets/images/rolling-gray.svg`

    constructor(
        public api: ApiService,
        public ds: DataService,
        private alert: IAlertService,
        public ms: BsModalService,
        private route: ActivatedRoute
    ) {
        ds.activeTab = 'picture'
        this.ds.productId = this.route.snapshot.queryParamMap.get('id')
    }

    ngOnInit() {
        const param = {
            id: this.ds.productId
        }
        if (this.ds.productId > -1) {
            this.ds.imagesList(param).subscribe(resp => {
                if (resp.success === true) {
                    this.uploadedFiles = resp.data

                } else {
                    this.alert.error(resp.errors.general)
                }
            })
        }
    }

    browseFiles(event: any) {
        event.preventDefault()
        const element = document.getElementById('img-files')
        element.click()
    }

    onDocumentChange(event: any) {
        this.uploadFiles(event.target.files)
    }

    uploadFiles(files: FileList) {
        const allowedExtensions = ['png', 'jpg', 'jpeg']
        const defaulterFiles = []

        Array.from(files).forEach((file: any) => {
            const extension = file.name.split('.').pop().toLowerCase()
            if (allowedExtensions.indexOf(extension) > -1) {
                this.readFile(file)
            } else {
                defaulterFiles.push(file.name)
                this.alert.error(`${file.name} has an invalid file type. Only jpg, png are allowed`)
            }
        })
    }

    readFile(file: any) {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onloadend = (e: any) => {
            const index = this.uploadedFiles.length
            this.uploadedFiles.push({
                id: -1,
                file: reader.result,
                uploading: true
            })
            this.uploadDocument(reader.result, index, file)
        }
    }

    uploadDocument(fileData: any, index: number, file: any) {
        fetch(fileData)
            .then(res => res.blob())
            .then(blob => {
                const myFile = new Blob([blob]) // for microsoft edge support
                const formData = new FormData()
                formData.append('product_id', this.ds.productId)
                formData.append('image', myFile)
                formData.append('name', file.name)
                this.ds.addImage(formData).subscribe((resp: any) => {
                    if (resp.success === true) {
                        this.uploadedFiles[index].id = resp.data
                        this.uploadedFiles[index].name = file.name
                        this.uploadedFiles[index].size = 56
                        this.uploadedFiles[index].uploading = false
                        this.alert.success(`${file.name.split(".")[0]} uploaded successfully`)
                    } else {
                        this.alert.error(resp.errors.general)
                        this.uploadedFiles[index].uploading = false
                    }
                })//upload api
            })
    }

    deleteImage(index: number) {
        const delId = this.uploadedFiles[index].id
        this.uploadedFiles.splice(index, 1)
        this.uploadedFiles.splice(index, 0, {
            deletion: true
        })

        const params = {
            id: delId
        }
        this.ds.deleteImage(params).subscribe(resp => {
            this.uploadedFiles.splice(index, 1)
            this.alert.success('Deleted successfully!!')
        })
    }

    fileDragStart(e: any): void {
        e.preventDefault()
        e.target.classList.add('highlight')

    }

    fileDragEnd(e: any): void {
        e.preventDefault()
        e.target.classList.remove('highlight')
    }

    fileDropped(e: any): void {
        e.preventDefault()
        e.stopPropagation()
        if (e.dataTransfer && e.dataTransfer.files.length) {
            this.uploadFiles(e.dataTransfer.files)
        }
        e.target.classList.remove('highlight')
    }
}
