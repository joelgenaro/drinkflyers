import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { BsModalRef } from 'ngx-bootstrap/modal'
import { BsModalService } from 'ngx-bootstrap/modal'
import { Subject } from 'rxjs'
import { debounceTime } from 'rxjs/operators'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ApiService } from 'src/app/services/api.service'
import { DataService } from './data.service'
import { ImageCroppedEvent } from 'ngx-image-cropper'
import { ThrowStmt } from '@angular/compiler'

@Component({
    selector: 'app-artwork',
    templateUrl: './artwork.component.html',
    styleUrls: ['./artwork.component.css']
})
export class ArtworkComponent implements OnInit, OnDestroy {
    dataForm: FormGroup
    experienceLoading = false
    documentLoading = false
    userId: any
    thumbnail: any = '/assets/images/no_image.jpg'
    imageChangedEvent: any = ''
    cropperModalRef: BsModalRef

    croppedImage: any = ''
    formName: any = 'Add Artwork'
    selectedFile: any
    btnName: string = 'Browse File'
    uploadedFiles = []
    totalDoc: number
    file: any
    artworkCatId: any
    artworkCatName = ''

    dataStatus = 'fetching'
    dataList = []
    selectedIndex = -1
    submitData: any
    modalRef: BsModalRef
    selectedId: any
    modalTitle: any = ''
    isChecked = false
    pagination: any = []
    artworkCategories: any
    page = 1
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
        perPage: 15
    }
    breadCrum = [
        {
            link: '/user/artwork-category',
            value: 'Artwork Categories',
            params: { id: this.artworkCatName, name: this.artworkCatName }
        }
    ]

    constructor(
        private fb: FormBuilder,
        public ui: UIHelpers,
        public alert: IAlertService,
        private ds: DataService,
        private router: Router,
        private route: ActivatedRoute,
        public ms: BsModalService,
        public api: ApiService
    ) {
        this.artworkCatId = this.route.snapshot.queryParamMap.get('id')
        this.artworkCatName = this.route.snapshot.queryParamMap.get('name')
        this.breadCrum.push({
            link: '/user/artwork',
            params: { id: this.artworkCatId, name: this.artworkCatName },
            value: this.artworkCatName
        })
        this.getList()

        this.dataForm = this.fb.group({
            id: new FormControl(null),
            artwork_category_id: new FormControl(null),
            public: new FormControl(null),
        })

        this.userId = this.route.snapshot.paramMap.get('userId')

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

            if (params) {
                this.getList()
            }
        })

        this.searchKeywordSub = this.searchKeyword$.pipe(
            debounceTime(1000), // only emit if value is different from previous value
        ).subscribe(searchKeyword => {
            this.getList()
        })
    }

    ngOnDestroy(): void {
        this.searchKeywordSub.unsubscribe()
    }

    ngOnInit() {
    }

    getArrowClass(fieldName, order) {
        const className = 'arrow ' + order
        if (this.filters.orderBy === fieldName && this.filters.order === order) {

            return className + ' active'
        }
        return className
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

    browseFile() {
        const element = document.getElementById('file')
        element.click()
    }

    getList() {
        const params = {
            page: this.page,
            keyword: this.searchKeyword,
            order_by: this.filters.orderBy,
            order: this.filters.order,
            per_page: this.filters.perPage,
            artwork_cat_id: this.artworkCatId
        }

        const list = this.ds.list(params)
        list.subscribe((resp: any) => {
            if (resp.success === true) {
                this.dataList = resp.data.data
                this.dataList.forEach(v => { v.thumbnailTime = new Date().getTime() })
                this.pagination = resp.data
                this.dataStatus = 'done'
            }
        })
    }

    openModal(form, index, id) {
        this.selectedId = id
        this.selectedIndex = index
        if (index > -1) {
            this.formName = 'Update Artwork'
            this.selectedIndex = index
            this.dataForm.controls.id.setValue(this.dataList[index].id)
            this.dataForm.controls.artwork_category_id.setValue(this.dataList[index].artwork_category_id)
            this.dataForm.controls.public.setValue(this.dataList[index].public)
            this.thumbnail = this.api.artworkImage(id)
        }
        this.modalRef = this.ms.show(
            form,
            {
                class: 'modal-sm modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
    }

    saveForm(data: any, f: any): boolean {
        this.documentLoading = true
        if (data.status === 'INVALID') {
            this.alert.error('Please fill valid data and try again.')
            return false
        }
        this.dataForm.controls.artwork_category_id.setValue(this.artworkCatId)
        data.value.public = data.value.public === null ? 0 : data.value.public
        this.submitData = data.value

        const formData: FormData = this.api.jsonToFormData(data.value)
        formData.append('file', this.selectedFile)

        this.sendCall(formData, f)
    }

    sendCall(formData, f: any): void {
        let saveUpdate = this.ds.add(formData)
        if (this.dataForm.value.id !== null) {
            saveUpdate = this.ds.update(formData)
        }
        saveUpdate.subscribe((resp: any) => {
            this.documentLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.modalRef.hide()
                f.resetForm()
                return false
            } else {
                if (this.dataForm.value.id !== null) {
                    // console.log('this.selectedId', this.selectedId)

                    // this.getArtworkUrl(this.selectedId)
                    this.alert.success('Changes done successfully!!')
                    this.thumbnail = '/assets/images/no_image.jpg'
                    resp.data.thumbnailTime = new Date().getTime()
                    this.dataList[this.selectedIndex] = resp.data
                } else {
                    this.alert.success('Added successfully!!')
                    resp.data.thumbnailTime = new Date().getTime()
                    this.dataList.push(resp.data)
                    this.thumbnail = '/assets/images/no_image.jpg'
                }
            }
            this.btnName = 'Browse File'
            this.formName = 'Add Artwork '
            this.modalRef.hide()
            f.resetForm()
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
        this.router.navigate([`/user/artwork/`], { queryParams: filtersParam, replaceUrl: true })
    }

    confirmingModal(template: TemplateRef<any>, id: any, i: any) {
        this.selectedId = id
        this.selectedIndex = i
        this.modalRef = this.ms.show(template, { class: 'modal-sm admin-panel' })
    }

    resetIndex() {
        this.selectedIndex = -1
    }

    searchKeywordChange(value: string) {
        this.searchKeyword$.next(value)
    }

    getSerialNumber(i: number) {
        return ((this.pagination.current_page - 1) * this.pagination.per_page) + i + 1
    }

    browseThumbnail(event: any) {
        event.preventDefault()
        const element = document.getElementById('thumbnail-image')
        element.click()
    }

    onThumbnailChange(event: any, template: TemplateRef<any>) {
        const file = event.target.files[0]
        this.selectedFile = file
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

    get g() {
        return this.dataForm.controls
    }

    deleteFile() {
        this.documentLoading = true
        const params = {
            id: this.selectedId
        }
        this.ds.delete(params).subscribe(resp => {
            this.documentLoading = false
            this.dataList.splice(this.selectedIndex, 1)
            this.ds.driverDoc.next(this.ds.driverDoc.getValue() - 1)
            this.modalRef.hide()
            this.alert.success('Deleted successfully!!')
            this.selectedIndex = -1
            this.totalDoc = this.totalDoc - 1
        })
    }

    cancelButton(f: any) {
        f.resetForm()
        this.modalRef.hide()
        this.btnName = 'Browse File'
        this.formName = 'Add Artwork'
        this.thumbnail = '/assets/images/no_image.jpg'
    }

    getArtworkUrl(id: number, thumbnailTime) {
        // console.log('getArtworkUrl', id)
        return this.ds.getArtworkUrl(id, thumbnailTime)
    }
}
