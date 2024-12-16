import { async } from '@angular/core/testing'
import { parseI18nMeta } from '@angular/compiler/src/render3/view/i18n/meta'
import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core'
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { Subject } from 'rxjs'
import { debounceTime, retryWhen } from 'rxjs/operators'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ApiService } from 'src/app/services/api.service'
import { DataService } from './data.service'

@Component({
    selector: 'app-font',
    templateUrl: './font.component.html',
    styleUrls: ['./font.component.css']
})
export class FontComponent implements OnInit, OnDestroy {
    dataForm: FormGroup
    missingFont: FormGroup
    experienceLoading = false
    documentLoading = false
    artworkLoading = false
    userId: any
    formName: any = 'Add Font'
    selectedFile = []
    btnName: any = 'Browse'
    uploadedFiles = []
    totalDoc: number
    selectedFontFIle: any
    file: any
    fontCatId: any = ''
    fontEditForm: any
    fontCatName = ''
    fontFileList: any
    fontWeight = [0]
    fileIndex: any
    dataStatus = 'fetching'
    dataList = []
    selectedIndex = -1
    submitData: any
    modalRef: BsModalRef
    EditModalRef: BsModalRef
    DeleteModalRef: BsModalRef
    artworkModalRef: BsModalRef
    selectedId: any
    fontFileStatus = 'fetching'
    fontId: any
    modalTitle: any = ''
    isChecked = false
    fontWeightData: any
    pagination: any = []
    page = 1
    searchKeyword: any = ''
    searchKeyword$: Subject<string> = new Subject<string>()
    searchKeywordSub: any
    missingFontFile: any
    fileExtension: any
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
            link: '/user/font-category',
            value: 'Font Categories',
            params: { id: this.fontCatId, name: this.fontCatName }
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
        this.fontCatId = this.route.snapshot.queryParamMap.get('id')
        this.fontCatName = this.route.snapshot.queryParamMap.get('name')

        this.breadCrum.push({
            link: '/user/font',
            params: { id: this.fontCatId, name: this.fontCatName },
            value: this.fontCatName
        })

        this.getDocumentList()
        this.dataForm = this.fb.group({
            id: new FormControl(null),
            font_category_id: new FormControl(null),
            name: new FormControl(null, [Validators.required]),
            fontWeights: this.fb.array([])
        })

        this.fontEditForm = this.fb.group({
            id: new FormControl(null),
            weight: new FormControl(null),
            file_name: new FormControl(null),
            public: new FormControl(null),
            label: new FormControl(null)
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
                this.getDocumentList()
            }
        })

        this.searchKeywordSub = this.searchKeyword$.pipe(
            debounceTime(1000), // only emit if value is different fromm previous value
        ).subscribe(searchKeyword => {
            this.page = 1
            this.getDocumentList()
        })
    }

    // checkUploadLimit(form){
    //     this.ds.checkUploadLimit({driver_id:this.userId}).subscribe((resp:any)=>{
    //         if(resp.data == 3){
    //             this.alert.error('Maximum uploeded file  limit is 3.')
    //         }else{
    //             this.openFormModal(form, -1, -1)
    //         }
    //     })
    // }

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

        this.getDocumentList()
    }

    selectPerPage(e: any) {
        this.filters.perPage = e.target.value
        this.page = 1

        this.getDocumentList()
    }


    browseFiles(f, i) {
        this.fileIndex = i
        const element = document.getElementById('document' + i)
        element.click()
    }

    onFileChange(event: any) {
        const file = event.target.files[0]
        const data = {
            weightIndex: this.fileIndex,
            file: file
        }
        const allowedExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'text', 'ttf', 'otf']
        const extension = file.name.split('.').pop().toLowerCase()
        this.btnName = file.name
        const fileSize = file.size / 1024 / 1024
        if (allowedExtensions.indexOf(extension) < 0) {
            this.alert.error('Format type is invalid.')
            return false
        }
        this.selectedFile.forEach((f, i) => {
            if (f.weightIndex === this.fileIndex) {
                this.selectedFile.splice(i, 1)
            }
        })
        this.selectedFile.push(data)
        this.changeBtnName(this.fileIndex, file.name)
    }

    removeFile(i, fileIndex) {
        this.selectedFile.splice(fileIndex, 1)
        this.changeBtnName(i, 'Browse')
    }

    changeBtnName(i, name) {
        document.getElementById('btn' + i).innerHTML = name
    }

    getDocumentList() {
        const params = {
            page: this.page,
            keyword: this.searchKeyword,
            order_by: this.filters.orderBy,
            order: this.filters.order,
            per_page: this.filters.perPage,
            cat_id: this.fontCatId
        }


        const list = this.ds.list(params)
        list.subscribe((resp: any) => {
            if (resp.success === true) {
                this.uploadedFiles = resp.data.data

                this.pagination = resp.data
                this.dataStatus = 'done'
            }
        })
    }
    addFontWeightMissing() {
        this.missingFonts.push(this.fb.group({
            font_id: this.fontId,
            weight: '',
            public: '',
            file_name: '',
            file: '',
            label: ''

        }))
    }
    addFontWeight() {
        this.fontWeights.push(this.fb.group({
            font_id: this.fontId,
            weight: '',
            public: '',
            file_name: '',
            file: '',
            label: ''
        }))
    }
    openFormModal(form, index, id) {
        this.fontWeight = [0]
        while (this.fontWeights.length !== 0) {
            this.fontWeights.removeAt(0)
        }
        this.selectedId = id
        this.selectedFile = []

        this.fontWeight.forEach(w => {
            this.fontWeights.push(this.fb.group({
                font_id: '',
                weight: '',
                public: '',
                file_name: '',
                file: '',
                label: ''
            }))
        })

        if (index > -1) {
            this.formName = 'Update Font'
            this.selectedIndex = index
            this.dataForm.controls.id.setValue(this.uploadedFiles[index].id)
            this.dataForm.controls.name.setValue(this.uploadedFiles[index].name)
            // this.thumbnail = this.api.membershipImageUrl(id)
        }
        this.modalRef = this.ms.show(
            form,
            {
                class: 'modal-lg modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
    }

    openFileModal(form, index, id) {
        this.fontFileStatus = 'fetching'
        this.fontId = id
        const param = {
            font_id: id
        }
        this.ds.fontFileList(param).subscribe(resp => {
            if (resp.success === true) {
                this.fontFileList = resp.data
                this.fontFileList.sort((a, b) => a > b ? true : false)
                this.fontFileStatus = 'done'
            }
            // this.expecting()
        })

        this.modalRef = this.ms.show(
            form,
            {
                class: 'modal-lg modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
    }

    saveForm(data: any, f: any): boolean {
        this.documentLoading = true
        if (data.status === 'INVALID') {
            this.alert.error('Please fill-in valid data and try again.')
            this.documentLoading = true

            return false
        }

        const params = {
            name: this.dataForm.value.name,
            font_category_id: +this.fontCatId,
        }

        this.ds.add(params).subscribe(resp => {
            if (resp.success === true) {
                this.documentLoading = false
                this.fontId = resp.data
                params['id'] = resp.data
                this.modalRef.hide()
                this.uploadedFiles.push(params)

                this.selectedFile.forEach((r, i) => {
                    this.fontWeightData = {
                        label: this.dataForm.value.fontWeights[r.weightIndex].label,
                        font_weight: this.dataForm.value.fontWeights[r.weightIndex].weight,
                        file_name: this.dataForm.value.fontWeights[r.weightIndex].file_name,
                        public: this.dataForm.value.fontWeights[r.weightIndex].public === '' ? 0 : this.dataForm.value.fontWeights[r.weightIndex].public,
                        font_id: this.fontId
                    }
                    const formData: FormData = this.api.jsonToFormData(this.fontWeightData)
                    formData.append('file', r.file)
                    this.sendCall(formData, f)
                })
            } else {
                this.alert.error(resp.errors.general)
                this.documentLoading = false
                this.modalRef.hide()
                f.resetForm()
            }
        })
        // this.submitData = data.value
    }

    sendCall(formData, f: any): void {
        const saveUpdate = this.ds.addFontFile(formData)
        // if (this.dataForm.value.id !== null) {

        //     saveUpdate = this.ds.update(formData)
        // }
        saveUpdate.subscribe((resp: any) => {
            this.documentLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.documentLoading = false
                this.modalRef.hide()
                f.resetForm()
                return false
            } else {
                if (this.dataForm.value.id !== null) {
                    this.alert.success('Changes done successfully!!')
                    this.uploadedFiles[this.selectedIndex].name = this.submitData.name

                } else {
                    this.alert.success('Added successfully!!')

                    // this.uploadedFiles.push(resp.data)
                }
            }
            this.btnName = 'Browse'
            this.formName = 'Add Font '
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
            // per_page: this.filters.perPage
        }
        this.router.navigate([`/user/font`], { queryParams: filtersParam, replaceUrl: true })
    }

    confirmingModal(template: TemplateRef<any>, id: any, i: any) {
        this.selectedId = id
        this.selectedIndex = i
        this.DeleteModalRef = this.ms.show(template, { class: 'modal-sm admin-panel' })
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

    // onDocumentChange(event: any) {
    //     this.uploadFiles(event.target.files)
    // }


    downloadDoc(id, index, name) {
        this.ds.downloadFile(id).subscribe((resp: any) => {
            const binaryData = []
            binaryData.push(resp)
            const downloadLink = document.createElement('a')
            downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, { type: resp.type }))
            if (name != null) {
                downloadLink.setAttribute('download', name)
            }
            else {
                downloadLink.setAttribute('download', 'document')
            }
            document.body.appendChild(downloadLink)
            downloadLink.click()

        })
    }

    get fontWeights() {
        return this.dataForm.get('fontWeights') as FormArray
    }

    newFontWeight(weight) {
        return this.fb.group({
            weight,
            public: '',
            file_name: '',
            file: '',
        })
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
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.DeleteModalRef.hide()
                this.documentLoading = false

                return false
            } else {
                this.uploadedFiles.splice(this.selectedIndex, 1)
                this.ds.driverDoc.next(this.ds.driverDoc.getValue() - 1)
                this.alert.success('Deleted successfully!!')
                this.documentLoading = false
                this.selectedIndex = -1
            }
            this.DeleteModalRef.hide()
        })
    }

    deleteFontFileModal(template: TemplateRef<any>, id: any, i: any) {
        this.selectedId = id
        this.selectedIndex = i
        this.DeleteModalRef = this.ms.show(template, { class: 'modal-sm admin-panel' })
    }

    deleteFontFiles() {
        this.documentLoading = true
        const params = {
            id: this.selectedId
        }
        this.ds.deleteFontFile(params).subscribe(resp => {
            this.documentLoading = false
            const weight = this.fontFileList[this.selectedIndex].font_weight

            const ind = this.fontWeight.findIndex(r => r == weight)

            if (ind < 0) {
                this.fontWeight.push(weight)
            }
            this.fontFileList.splice(this.selectedIndex, 1)
            this.DeleteModalRef.hide()
            this.alert.success('Deleted successfully!!')

            this.selectedIndex = -1

        })
    }

    cancelButton(f: any) {
        f.resetForm()
        this.modalRef.hide()
        this.btnName = 'Browse'
        this.formName = 'Add Font'
    }

    closeFileModal(f: any) {
        this.modalRef.hide()

    }

    closeFontEditModal(d: any) {
        d.resetForm()
        this.EditModalRef.hide()

    }

    openEditFontModal(form, index, id) {
        this.selectedIndex = index
        this.selectedId = id
        if (index > -1) {
            this.formName = 'Update Font'
            this.selectedIndex = index
            this.fontEditForm.controls.id.setValue(this.fontFileList[index].id)
            this.fontEditForm.controls.file_name.setValue(this.fontFileList[index].file_name)
            this.fontEditForm.controls.public.setValue(this.fontFileList[index].public)
            this.fontEditForm.controls.label.setValue(this.fontFileList[index].label)
            // this.thumbnail = this.api.membershipImageUrl(id)
        }
        this.EditModalRef = this.ms.show(
            form,
            {
                class: 'modal-sm modal-dialog-centered admin-panel',
                backdrop: true,
                ignoreBackdropClick: true,
                keyboard: false
            }
        )

    }

    openFile() {

        const element = document.getElementById('fontFile')
        element.click()
        // this.fontWeights[i].controls.document.nativeElement.click()
    }

    onFontFileChange(event: any) {
        const file = event.target.files[0]

        const allowedExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'text', 'ttf', 'otf']
        const extension = file.name.split('.').pop().toLowerCase()
        this.btnName = file.name
        const fileSize = file.size / 1024 / 1024
        if (allowedExtensions.indexOf(extension) < 0) {
            this.alert.error('Format type is invalid.')
            return false
        }
        this.btnName = file.name
        this.selectedFontFIle = file
    }

    updateFontFile(data: any, f: any) {

        this.documentLoading = true
        // if (data.status === 'INVALID') {
        //     this.alert.error('Please fill-in valid data and try again')
        //     return false
        // }
        data.value.public = data.value.public === '' ? 0 : data.value.public
        const formData: FormData = this.api.jsonToFormData(data.value)
        console.log('formData', formData)

        // formData.append('file', this.selectedFontFIle)

        this.ds.updateFontFile(formData).subscribe(resp => {
            this.documentLoading = true
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.EditModalRef.hide()
                this.documentLoading = false
                f.resetForm()
                return false
            } else {

                this.alert.success('Changes done successfully!!')
                this.fontFileList[this.selectedIndex] = resp.data
                this.documentLoading = false
            }
            this.btnName = 'Browse'
            this.formName = 'Add Font '
            this.EditModalRef.hide()
            f.resetForm()


        })
        // this.submitData = data.value


    }


    addNewFonts(form) {
        // this.fontFileList.forEach(e => {
        //     const index = this.fontWeight.findIndex(d => d == e.font_weight)
        //     if (index > -1) {
        //         this.fontWeight.splice(index, 1)
        //     }
        // })

        //this.fontWeight.push(0)
        // if (this.fontWeight.length == 0) {
        //     this.alert.error('There is no any missing font.')
        //     return false
        // } else {
        //     this.fontWeight = this.fontWeight.sort((a, b) => a - b)
        // }

        // this.fontWeight = this.fontWeight.sort((a, b) => a - b)

        // console.log('font-list', this.fontFileList)
        // console.log('font-weight', this.fontWeight)

        this.missingFont = this.fb.group({
            missingFonts: this.fb.array([]),
        })


        this.fontWeight.forEach((w, i) => {

            this.missingFonts.push(this.fb.group({
                font_id: this.fontId,
                weight: '',
                public: false,
                file_name: '',
                file: 0,
                label: '',
            }))
            // console.log('missing font', this.missingFont)
        })

        this.modalRef.hide()
        this.modalRef = this.ms.show(
            form,
            {
                class: 'modal-lg modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
    }

    get missingFonts() {
        return this.missingFont.get('missingFonts') as FormArray
    }

    saveMissingFont(data: any, f: any) {
        this.missingFonts.controls.forEach(e => {
            if (e.value.file != 0) {
                const form: FormData = this.api.jsonToFormData(e.value)
                this.saveMissingFile(form, f)
                // this.missingFontFile.push(form)

            }
        })


    }

    saveMissingFile(data, f) {
        this.documentLoading = true
        this.ds.saveMissingFonts(data).subscribe(resp => {
            if (resp.success) {
                this.alert.success('Added successfully!!')
                this.documentLoading = false
                this.modalRef.hide()
                f.resetForm()
            } else {
                this.alert.error(resp.errors.general)
                this.documentLoading = false
            }
            this.documentLoading = false
        })
    }

    browseMissingFiles(f, i) {
        this.fileIndex = i
        const element = document.getElementById('document' + i)
        element.click()
    }

    onMissingFileChange(event: any) {
        const file = event.target.files[0]
        const allowedExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'text', 'ttf', 'otf']
        const extension = file.name.split('.').pop().toLowerCase()
        this.fileExtension = extension

        this.btnName = file.name
        const fileSize = file.size / 1024 / 1024
        if (allowedExtensions.indexOf(extension) < 0) {
            this.alert.error('Format type is invalid.')
            return false
        }
        this.missingFonts.controls[this.fileIndex].value.file = file
        // console.log('file', file)

        this.changeBtnName(this.fileIndex, file.name)
    }
    removeMissingFile(i) {
        this.missingFonts.controls[i].value.file = 0
        this.changeBtnName(i, 'Browse')

    }

    artworkConfirmingModal(template: TemplateRef<any>, id: any, i: any) {
        this.selectedId = id
        this.selectedIndex = i
        this.artworkModalRef = this.ms.show(template, { class: 'modal-sm admin-panel' })
    }
    addToArtworkGenerator() {
        this.artworkLoading = true
        const param = {
            font_id: this.selectedId
        }
        this.ds.addArtworkFont(param).subscribe(resp => {
            this.artworkLoading = false
            if (resp.success === true) {
                this.alert.success(resp.msg)
            } else {
                this.alert.error(resp.errors.general)
            }
            this.artworkModalRef.hide()
        })
    }

    getColor(fontFileItem: any) {
        if (fontFileItem.uploaded === 0 && fontFileItem.uploaded_error !== null) {
            return 'var(--red)'
        }
        if (fontFileItem.uploaded === 0 && fontFileItem.uploaded_error === null) {
            return 'gray'
        }
        if (fontFileItem.uploaded === 1 && fontFileItem.uploaded_error === null) {
            return 'var(--green)'
        }
    }
}
