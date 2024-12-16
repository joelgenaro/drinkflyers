import { DataService } from './data.service'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ApiService } from 'src/app/services/api.service'

@Component({
    selector: 'app-user-lib',
    templateUrl: './user-lib.component.html',
    styleUrls: ['./user-lib.component.css']
})
export class UserLibComponent implements OnInit, OnDestroy {
    dataStatus = 'fetching'
    dataList = []
    backIds = []
    dataForm: FormGroup
    fileDataForm: FormGroup
    fileList = []
    selectedIndex = -1
    modalRef: BsModalRef
    selectedId: any
    selectedServiceId: any
    modalTitle: any = ''
    loginLoading = false
    LoadingActive = false
    LoadingDeactive = false
    backLoading = false
    selectedStatus = ''
    isChecked = false
    selectedFolderId
    parentListStatus = "fetch"
    thumbnail: any = '/assets/images/no_image.jpg'
    selectedFile
    parentId = 0
    catName
    parentFolderList
    pagination: any = []
    page = 1
    backId = 0

    searchKeyword: string = ''
    searchKeyword$: Subject<string> = new Subject<string>()
    searchKeywordSub: any
    loaderOptions = {
        rows: 5,
        cols: 3,
        colSpans: {
            0: 1,
        }
    }
    filters = {
        orderBy: '',
        order: '',
        perPage: 15,
        parent_id: 0
    }
    breadCrum = [
        {
            link: this.api.checkUser() + '/user-lib',
            value: 'Root',
            params: { id: 0 }
        }
    ]
    uploadedFiles = []
    spinnerSVG = `/assets/images/rolling-gray.svg`

    constructor(
        public ds: DataService,
        private fb: FormBuilder,
        public ui: UIHelpers,
        private alert: IAlertService,
        public ms: BsModalService,
        public api: ApiService,
        private router: Router,
        public route: ActivatedRoute
    ) {
        this.dataForm = this.fb.group({
            id: new FormControl(null),
            name: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
            status: new FormControl('active'),
            // parent_id: new FormControl(null)
        })

        this.fileDataForm = this.fb.group({
            id: new FormControl(null),
            name: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
            type: new FormControl(null, [Validators.required]),
        })

        this.route.queryParams.subscribe(params => {
            if (params.page) {
                this.page = params.page
            }
            if (params.keyword) {
                this.searchKeyword = params.keyword
            }
            if (params.order_by) {
                this.filters.orderBy = params.order_by
            }
            if (params.order) {
                this.filters.order = params.order
            }
            if (params.per_page) {
                this.filters.perPage = params.per_page
            }
            if (params.id) {
                this.parentId = params.id
                this.filters.parent_id = params.id
            }

            if (params) {
                this.getList()
            }
            if (this.parentId > 0) {
                this.ds.parentList(this.parentId).subscribe((resp: any) => {
                    this.parentFolderList = resp.data
                    this.parentListStatus = 'done'

                    this.breadCrum = [
                        {
                            link: this.api.checkUser() + '/user-lib',
                            value: 'Root',
                            params: { id: 0 }
                        }
                    ]
                    this.parentFolderList.forEach(e => {
                        this.breadCrum.push({
                            link: this.api.checkUser() + '/user-lib',
                            params: { id: e.id },
                            value: e.name
                        })
                    })
                })
            }
        })

        this.searchKeywordSub = this.searchKeyword$.pipe(
            debounceTime(1000), // wait 1 sec after the last event before emitting last event
            distinctUntilChanged(), // only emit if value is different from previous value
        ).subscribe(searchKeyword => {
            this.page = 1
            this.getList()
        })
    }
    ngOnDestroy(): void {
        this.searchKeywordSub.unsubscribe()
    }

    ngOnInit() {
        this.parentId = this.filters.parent_id

    }

    get g() {
        return this.dataForm.controls
    }

    getArrowClass(fieldName, order) {
        const className = 'arrow ' + order
        if (this.filters.orderBy === fieldName && this.filters.order === order) {

            return className + ' active'
        }
        return className
    }
    getSubFolderList(fId, bId) {
        this.dataStatus = 'fetching'
        this.backId = bId
        const ind = this.backIds.findIndex(d => d == bId)
        if (ind == -1) {
            this.backIds.push(this.backId)
        }
        this.parentId = fId
        console.log('ParentId', this.parentId)

        this.getList()
    }

    doSort(e: any, order) {
        this.filters.orderBy = e.target.value
        this.filters.order = order

        this.getList()
    }

    selectPerPage(e: any) {
        this.filters.perPage = e.target.value
        this.page = 1

        this.getList()
    }

    getList() {
        let params = {
            // page: this.page,
            keyword: this.searchKeyword,
            // order_by: this.filters.orderBy,
            // order: this.filters.order,
            // per_page: this.filters.perPage,
            parent_id: this.parentId


        }

        const list = this.ds.list(params)
        list.subscribe((resp: any) => {
            if (resp.success === true) {
                this.dataList = resp.data

                this.pagination = resp.data
                this.dataStatus = 'done'
                this.backLoading = false


            }
        })

        const fileParams = {
            // page: this.page,
            keyword: this.searchKeyword,
            // order_by: this.filters.orderBy,
            // order: this.filters.order,
            // per_page: this.filters.perPage,
            id: this.parentId
        }

        this.ds.fileList(fileParams).subscribe((resp: any) => {
            if (resp.success === true) {
                this.fileList = resp.data
                this.fileList.forEach(e => { e.imgTime = new Date().getTime() })
                this.pagination = resp.data
                this.dataStatus = 'done'
            }
        })
    }

    setPagination(page: number) {
        let filtersParam: any = {}

        filtersParam = {
            page,
            keyword: this.searchKeyword,
            order_by: this.filters.orderBy,
            order: this.filters.order,
            per_page: this.filters.perPage,
            id: this.filters.parent_id
        }
        this.router.navigate([this.api.checkUser() + '/user-lib'], { queryParams: filtersParam, replaceUrl: true })
    }

    openModal(designationModal, index) {
        this.modalTitle = 'Add New Folder'
        if (index > -1) {
            this.selectedIndex = index
            this.dataForm.controls.id.setValue(this.dataList[index].id)
            this.dataForm.patchValue(this.dataList[index])
            this.modalTitle = 'Edit Folder Name'
        }
        this.modalRef = this.ms.show(
            designationModal,
            {
                class: 'modal-md modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
    }

    statusConfirmingModal(changeStatus: TemplateRef<any>, id: number, index: number, status: string, name: string) {
        this.selectedServiceId = id
        this.selectedIndex = index
        this.selectedStatus = status
        this.catName = name

        this.modalRef = this.ms.show(
            changeStatus,
            {
                class: 'modal-md modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
    }

    save(f: any) {
        this.loginLoading = true
        if (this.dataForm.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.loginLoading = false

            return false
        }
        const params = {
            id: this.dataForm.value.id,
            name: this.dataForm.value.name,
            //status: this.dataForm.value.status,
            parent_id: this.parentId,
        }

        let saveUpdate = this.ds.add(params)
        if (this.dataForm.value.id !== null) {
            saveUpdate = this.ds.update(params)
            this.selectedId = -1
        } else {
            // params.status = 'active'
            params.parent_id = this.parentId
        }

        saveUpdate.subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.loginLoading = false

                return false
            } else {
                if (this.dataForm.value.id !== null) {
                    this.alert.success('Changes done successfully!!')
                    this.dataList[this.selectedIndex] = params
                    this.dataForm.controls.id.setValue(null)

                } else {
                    params.id = resp.data
                    this.alert.success('Added successfully!!')
                    this.dataList.push(params)
                }
            }
            if (!this.isChecked) {
                this.modalRef.hide()
            }
            f.resetForm()
        })
    }

    delete() {
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
                const deletingIndex = this.fileList.findIndex((d: any) => {
                    return d.id === this.selectedId
                })
                this.fileList.splice(deletingIndex, 1)
                this.modalRef.hide()
                this.alert.success('Deleted successfully!!')
                this.selectedIndex = -1
            }
        })
    }


    confirmingModal(template: TemplateRef<any>, id: any, i: any) {
        this.selectedId = id
        this.selectedIndex = i
        this.modalRef = this.ms.show(template, { class: 'modal-sm admin-panel' })
    }

    cancelButton(f: any) {
        f.resetForm()
        this.modalRef.hide()
        this.selectedIndex = -1
    }

    changeStatusAct() {
        this.loginLoading = true
        const params = {
            id: this.selectedServiceId,
            // status: this.selectedStatus
        }
        this.ds.changeStatusActive(params).subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.loginLoading = false

                return false
            } else {
                this.dataList[this.selectedIndex].status = this.selectedStatus
                this.alert.success(`Status changed to ${this.selectedStatus}`)
                this.modalRef.hide()
            }
        })
    }

    changeStatusInact() {
        this.loginLoading = true
        const params = {
            id: this.selectedServiceId
        }
        this.ds.changeStatusInactive(params).subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.loginLoading = false

                return false
            } else {
                this.dataList[this.selectedIndex].status = this.selectedStatus
                this.alert.success(`Status changed to ${this.selectedStatus}`)
                this.modalRef.hide()
            }
        })
    }

    searchKeywordChange(value: string) {
        this.searchKeyword$.next(value)
    }

    getSerialNumber(i: number) {
        return ((this.pagination.current_page - 1) * this.pagination.per_page) + i + 1
    }

    saveFile(f: any) {
        this.loginLoading = true
        if (this.fileDataForm.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.loginLoading = false

            return false
        }
        const formData = this.api.jsonToFormData(this.fileDataForm.value)
        formData.append('file', this.selectedFile)
        if (this.dataForm.value.id == null) {
            this.selectedFolderId = this.parentId
            formData.append('user_lib_folder_id', this.selectedFolderId)
        }



        let saveUpdate = this.ds.addFile(formData)
        if (this.dataForm.value.id !== null) {
            saveUpdate = this.ds.updateFile(formData)
            this.selectedId = -1
        } else {
            // params.status = 'active'
        }
        saveUpdate.subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.loginLoading = false

                return false
            } else {
                if (this.fileDataForm.value.id !== null) {
                    this.alert.success('Changes done successfully!!')
                    this.fileList[this.selectedIndex] = this.fileDataForm.value
                    this.fileDataForm.controls.id.setValue(null)
                    this.fileList[this.selectedIndex].imgTime = new Date().getTime()


                } else {

                    this.fileDataForm.value.id = resp.data.id
                    const data = {
                        name: this.fileDataForm.value.name,
                        type: this.fileDataForm.value.type,
                        id: resp.data,
                        imgTime: new Date().toTimeString()
                    }
                    this.alert.success('Added successfully!!')
                    this.fileList.push(data)
                }
            }
            if (!this.isChecked) {
                this.modalRef.hide()
            }
            f.resetForm()
        })
    }

    openFileModal(formModal, index) {
        this.modalTitle = 'Add New File'
        this.uploadedFiles = []
        if (index > -1) {
            this.selectedIndex = index
            this.dataForm.controls.id.setValue(this.dataList[index].id)
            this.dataForm.patchValue(this.dataList[index])
            this.modalTitle = 'Edit Courier Service'
            this.thumbnail = this.api.getLibFile(this.dataForm.controls.id.value, new Date().getTime())
            this.selectedFile = this.api.getLibFile(this.dataForm.controls.id.value, new Date().getTime())
        }
        this.modalRef = this.ms.show(
            formModal,
            {
                class: 'modal-lg modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
    }

    // browseThumbnail(event: any) {
    //     event.preventDefault()
    //     const element = document.getElementById('thumbnail-image')
    //     element.click()
    // }

    // onThumbnailChange(event: any) {
    //     const file = event.target.files[0]
    //     this.selectedFile = file
    //     console.log('File', this.selectedFile)
    //     const allowedExtensions = ['png', 'jpg', 'jpeg']
    //     const extension = file.name.split('.').pop().toLowerCase()
    //     const fileSize = file.size / 1024 / 1024
    //     if (fileSize > 3) {
    //         this.alert.error('File size must not exceed 3MB.')
    //     } else if (allowedExtensions.indexOf(extension) < 0) {
    //         this.alert.error('Format type is invalid.Required formats are PNG,JPG,JPEG.')
    //     } else {
    //         // this.thumbnail = file
    //         const reader = new FileReader()
    //         reader.onload = () => {
    //             this.thumbnail = reader.result as string
    //         }
    //         reader.readAsDataURL(file)
    //     }
    // }

    backFolder() {
        this.dataStatus = 'fetching'
        if (this.backIds.length > 0) {
            this.backLoading = true
            this.parentId = this.backIds[this.backIds.length - 1]
            this.backIds.splice((this.backIds.length - 1), 1)
            this.getList()
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
                // id: -1,
                id: this.parentId,
                file: reader.result,
                uploading: true
            })
            this.uploadDocument(reader.result, index, file)
        }
    }

    uploadDocument(fileData: any, index: number, file: any) {

        fetch(fileData).then(res => res.blob()).then(blob => {

                const myFile = new Blob([blob]) // for microsoft edge support
                const formData = new FormData()
                formData.append('user_lib_folder_id', this.uploadedFiles[index].id)
                formData.append('type', file.name.split('.').pop().toLowerCase())
                formData.append('name', file.name)
                formData.append('file', myFile)
                // this.ds.addImage(formData).subscribe((resp: any) => {
                this.ds.addFile(formData).subscribe((resp: any) => {
                    if (resp.success === true) {
                        this.uploadedFiles[index].id = resp.data
                        this.uploadedFiles[index].name = file.name
                        this.uploadedFiles[index].type = file.name.split('.').pop().toLowerCase()
                        this.uploadedFiles[index].uploading = false
                        this.alert.success(`${file.name.split('.')[0]} uploaded successfully`)
                        this.getList()
                        this.modalRef.hide()
                    } else {
                        this.alert.error(resp.errors.general)
                        this.uploadedFiles[index].uploading = false
                    }
                }) // upload api
        })
    }

    // deleteImage(index: number) {
    //     const delId = this.uploadedFiles[index].id
    //     this.uploadedFiles.splice(index, 1)
    //     this.uploadedFiles.splice(index, 0, {
    //         deletion: true
    //     })

    //     const params = {
    //         id: delId
    //     }
    //     this.ds.deleteImage(params).subscribe(resp => {
    //         this.uploadedFiles.splice(index, 1)
    //         this.alert.success('Deleted successfully!!')
    //     })
    // }

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
