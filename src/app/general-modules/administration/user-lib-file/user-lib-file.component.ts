import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ApiService } from 'src/app/services/api.service'
import { DataService } from './data.service'

@Component({
    selector: 'app-user-lib-file',
    templateUrl: './user-lib-file.component.html',
    styleUrls: ['./user-lib-file.component.css']
})
export class UserLibFileComponent implements OnInit, OnDestroy {
    dataStatus = 'fetching'
    dataList = []
    thumbnail: any = '/assets/images/no_image.jpg'
    dataForm: FormGroup
    selectedIndex = -1
    modalRef: BsModalRef
    folderName: any = ''
    selectedId: any
    folderId: any = ''
    modalTitle: any = ''
    loginLoading = false
    LoadingActive = false
    LoadingDeactive = false
    selectedStatus = ''
    pId = null
    selectedFile: any
    isChecked = false
    breadCrum = [
        {
            link: this.api.checkUser() + '/user-lib',
            value: 'Folders',
            params: { id: this.pId, name: this.folderName }
        }
    ]
    pagination: any = []
    page = 1
    searchKeyword: string = ''
    searchKeyword$: Subject<string> = new Subject<string>()
    searchKeywordSub: any
    loaderOptions = {
        rows: 5,
        cols: 5,
        colSpans: {
            0: 1,
        }
    }
    filters = {
        orderBy: '',
        order: '',
        perPage: 15
    }

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
            type: new FormControl(null, [Validators.required]),
        })

        this.route.queryParams.subscribe(params => {
            if (params.page) {
                this.page = params.page
            }
            if (params.id) {
                this.folderId = params.id
            }
            if (params.pId) {
                this.pId = params.pId
            }
            if (params.name) {
                this.folderName = params.name
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
            if (params) {
                this.getList()
            }

            if (this.folderId != '' && this.folderName != '' && this.pId != '') {
                this.breadCrum.push({
                    link: this.api.checkUser() + '/user-lib-file',
                    params: { id: this.folderId, name: this.folderName },
                    value: this.folderName
                })

                this.breadCrum[0].params.id = this.pId
                this.breadCrum[0].params.name = this.folderName
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

    browseThumbnail(event: any) {
        event.preventDefault()
        const element = document.getElementById('thumbnail-image')
        element.click()
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
        const params = {
            page: this.page,
            keyword: this.searchKeyword,
            order_by: this.filters.orderBy,
            order: this.filters.order,
            per_page: this.filters.perPage,
            id: this.folderId
        }

        const list = this.ds.list(params)
        list.subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.router.navigate([this.api.checkUser() + '/dashboard'])
            } else {
                this.dataList = resp.data.data

                this.dataList.forEach(e => { e.imgTime = new Date().getTime() })
                console.log(this.dataList)

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
            per_page: this.filters.perPage
        }
        this.router.navigate([this.api.checkUser() + '/user-lib-file'], { queryParams: filtersParam, replaceUrl: true })
    }

    openModal(formModal, index) {
        this.modalTitle = 'Add New File'
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

    statusConfirmingModal(changeStatus: TemplateRef<any>, id: number, index: number, status: string) {
        this.selectedId = id
        this.selectedIndex = index
        this.selectedStatus = status
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
        const formData = this.api.jsonToFormData(this.dataForm.value)
        formData.append('file', this.selectedFile)
        if (this.dataForm.value.id == null) {
            formData.append('user_lib_folder_id', this.folderId)
        }



        let saveUpdate = this.ds.add(formData)
        if (this.dataForm.value.id !== null) {
            saveUpdate = this.ds.update(formData)
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
                if (this.dataForm.value.id !== null) {
                    this.alert.success('Changes done successfully!!')
                    this.dataList[this.selectedIndex] = this.dataForm.value
                    this.dataForm.controls.id.setValue(null)
                    this.dataList[this.selectedIndex].imgTime = new Date().getTime()


                } else {

                    this.dataForm.value.id = resp.data.id
                    const data = {
                        name: this.dataForm.value.name,
                        type: this.dataForm.value.type,
                        id: resp.data,
                        imgTime: new Date().toTimeString()
                    }
                    this.alert.success('Added successfully!!')
                    this.dataList.push(data)
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
                const deletingIndex = this.dataList.findIndex((d: any) => {
                    return d.id === this.selectedId
                })
                this.dataList.splice(deletingIndex, 1)
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
        this.selectedFile = null
        this.thumbnail = '/assets/images/no_image.jpg'
    }

    changeStatusAct() {
        this.loginLoading = true
        const params = {
            id: this.selectedId
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
            id: this.selectedId
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

}
