import { ActivatedRoute } from '@angular/router'
import { ApiService } from 'src/app/services/api.service'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { Component, OnInit, TemplateRef } from '@angular/core'
import { DataService } from '../data.service'
import { ImageCroppedEvent } from 'ngx-image-cropper'
import { FormBuilder, FormGroup, FormControl, Validator, Validators } from '@angular/forms'
import { UIHelpers } from 'src/app/helpers/ui-helpers'

@Component({
    selector: 'app-mockup',
    templateUrl: './mockup.component.html',
    styleUrls: ['./mockup.component.scss']
})
export class MockupComponent implements OnInit {
    addProductLoading = false
    uploadedFiles = []
    loading = false
    dataForm: FormGroup
    elevationForm: FormGroup
    modalRef: BsModalRef
    elevationModal: BsModalRef
    pAModal: BsModalRef
    modalTitle
    selectedFile
    elevationTitle
    elv: any = []
    selectedIndex = -1
    dataList = []
    spinnerSVG = `/assets/images/rolling-gray.svg`
    thumbnail: any = '/assets/images/no_image.jpg'
    fileIndex = -1
    fileId = -1
    elevationId = -1
    fetching = false
    elevationFetch = false
    loaderOptions = {
        rows: 5,
        cols: 5,
        colSpans: {
            0: 1,
        }
    }
    productDetail: any = []
    fetchProduct = false
    constructor(
        public api: ApiService,
        public ds: DataService,
        private alert: IAlertService,
        public ms: BsModalService,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        public ui: UIHelpers,


    ) {
        ds.activeTab = 'mockup'
        this.ds.productId = this.route.snapshot.queryParamMap.get('id')
        this.getTotalMockups()
        // this.getMockupDetails()
    }
    getTotalMockups() {
        if (this.ds.productId > 0) {
            this.ds.mockupList({ id: this.ds.productId }).subscribe(resp => {
                if (resp.success) {
                    if (resp.data.length === 0) {

                        const params = {
                            title: 'default',
                            description: 'default',
                            base_product_id: this.ds.productId,
                            id: null,
                            default: 1

                        }
                        this.ds.addMockup(params).subscribe(resp => {
                            if (resp.success === true) {
                                this.getMockupDetails()
                            }
                        })
                    } else {
                        this.getMockupDetails()
                    }
                }
            })

        }
    }
    getMockupDetails() {
        if (this.ds.productId > 0) {
            this.fetching = true
            this.getProductDetail()
            this.elevationFetch = true
            this.ds.mockupList({ id: this.ds.productId }).subscribe(resp => {
                if (resp.success) {
                    this.ds.mockups = resp.data
                    // console.log('resp.data:', resp.data)
                    if (resp.data.length > 0) {
                        this.ds.mockupId = this.ds.mockups[0]?.id
                        // this.mockups.unshift({ title: '' })
                    }
                    this.loaderOptions.cols = this.ds.mockups.length
                    this.ds.elevationList({ id: this.ds.productId }).subscribe(ele => {
                        if (ele.success) {
                            this.ds.elevations = ele.data
                        }
                        this.elevationFetch = false
                    })
                }
                this.fetching = false
            })
        }

        this.dataForm = this.fb.group({
            id: new FormControl(null),
            title: new FormControl(null, [Validators.required]),
            description: new FormControl(null),
            default: new FormControl(0)

        })

        this.elevationForm = this.fb.group({
            id: new FormControl(null),
            title: new FormControl(null, [Validators.required]),
            p_width: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]+(.[0-9]{0,6})?$')]),
            p_height: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]+(.[0-9]{0,6})?$')]),
            description: new FormControl(null)
        })
    }

    getProductDetail() {
        const params = {
            id: this.ds.productId,
        }
        this.ds.productDetail(params).subscribe((resp: any) => {

            if (resp.success === true) {
                this.productDetail = resp.data
                this.fetchProduct = true
                // console.log('this.productDetail', this.productDetail)
                this.ds.productDetails = this.productDetail
            }

            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                return false
            }
        })
    }

    ngOnInit() {
        const param = {
            id: this.ds.productId
        }
    }

    browseThumbnail(event: any, id, i, elId) {
        this.elevationId = elId
        this.fileIndex = i
        this.fileId = id
        event.preventDefault()
        const element = document.getElementById(elId + 'image' + i)
        element.click()
    }

    onThumbnailChange(event: any) {
        const file = event.target.files[0]
        this.selectedFile = file
        // console.log('File', this.selectedFile)
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
                (document.getElementById(this.elevationId + 'img-src' + this.fileIndex) as HTMLImageElement).src = this.thumbnail
                // const element = document.getElementById(this.fileId+'img-src'+this.fileIndex)as HTMLImageElement.src = this.thumbnail
                // console.log('ele',element);
                // element.src= reader.result as string
            }
            reader.readAsDataURL(file)

            const params = {
                mockup_id: this.fileId,
                elevation_id: this.elevationId,
                base_product_id: this.ds.productId,
                name: file.name

            }
            const form = this.api.jsonToFormData(params)
            form.append('image', this.selectedFile)

            this.ds.addElevationImage(form).subscribe(res => {
                if (res.success === true) {
                    this.alert.success('image save successfully')
                }
            })
        }
    }

    checkImg(e) {
        console.log('img-e', e)
    }

    openModal(formModal, index) {
        this.modalTitle = 'Add New Mockup'

        if (index > -1) {
            if (index === 0) {
                return false
            }
            this.selectedIndex = index
            this.dataForm.controls.default.setValue(0)
            this.dataForm.controls.id.setValue(this.ds.mockups[index].id)
            this.dataForm.patchValue(this.ds.mockups[index])
            this.modalTitle = 'Edit Mockup'
        }
        this.modalRef = this.ms.show(
            formModal,
            {
                class: 'modal-md modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
    }


    elevationDeleteModal(formModal, index) {
        this.selectedIndex = index
        this.elevationModal = this.ms.show(
            formModal,
            {
                class: 'modal-sm admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )

    }



    delete() {
        this.loading = true
        const params = {
            id: this.ds.elevations[this.selectedIndex].id
        }
        this.ds.deleteElevation(params).subscribe((resp: any) => {
            this.loading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.modalRef.hide()
                return false
            } else {
                this.ds.elevations.splice(this.selectedIndex, 1)
                this.elevationModal.hide()
                this.alert.success('Deleted successfully!!')
                this.selectedIndex = -1
            }
        })
    }


    elevationOpenModal(formModal, index) {
        this.elevationTitle = 'Add Print Area'
        if (index > -1) {
            this.selectedIndex = index
            this.elevationForm.controls.id.setValue(this.ds.elevations[index].id)
            this.elevationForm.patchValue(this.ds.elevations[index])
            this.elevationTitle = 'Edit Print Area'
        }
        this.elevationModal = this.ms.show(
            formModal,
            {
                class: 'modal-md modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
    }

    save(data) {
        this.loading = true
        if (this.dataForm.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.loading = false

            return false
        }
        const params = {
            title: data.value.title,
            description: data.value.description,
            base_product_id: this.ds.productId,
            id: null,
            default: data.value.default

        }
        // console.log(params)
        return
        if (data.value.id != null) {
            params.id = data.value.id
            this.ds.updateMockup(params).subscribe(resp => {
                // console.log('mockup-response', resp)
                if (resp.success === true) {
                    this.ds.mockups[this.selectedIndex] = params
                    this.dataForm.reset()
                    this.modalRef.hide()
                    this.loading = false
                    this.selectedIndex = -1
                    this.getMockupDetails()
                } else {
                    this.alert.error(resp.errors.general)
                }
            })


        } else {
            this.ds.addMockup(params).subscribe(resp => {
                // console.log('mockup-response', resp)

                if (resp.success === true) {
                    if (this.ds.mockups.length === 0) {
                        this.ds.mockups.unshift({ title: '' })
                    }
                    this.ds.mockups.push(resp.data)
                    this.dataForm.reset()
                    this.modalRef.hide()
                    this.loading = false
                    this.getMockupDetails()
                }
            })
        }

    }

    saveElevation(data) {
        this.loading = true
        if (this.elevationForm.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.loading = false

            return false
        }

        const params = {
            title: data.value.title,
            p_width: data.value.p_width,
            p_height: data.value.p_height,
            description: data.value.description,
            base_product_id: this.ds.productId,
            default: data.value.default,
            id: null
        }
        if (data.value.id != null) {

            params.id = data.value.id

            this.ds.updateElevation(params).subscribe(resp => {
                if (resp.success === true) {
                    this.ds.elevations[this.selectedIndex] = params
                    this.elevationModal.hide()
                    this.loading = false
                    this.selectedIndex = -1
                    this.elevationForm.reset()
                }
            })


        } else {

            this.ds.addElevation(params).subscribe(resp => {
                if (resp.success === true) {
                    this.ds.elevations.push(resp.data)
                    this.elevationForm.reset()
                    this.elevationModal.hide()
                    this.loading = false
                }
            })
        }

    }

    get g() {
        return this.dataForm.controls
    }

    get m() {
        return this.elevationForm.controls
    }
    saveElevationOnChange(el) {
        const params = el
        this.ds.updateElevation(params).subscribe(resp => {
            if (resp.success === true) {
                this.alert.success('Changes updated!')
                return
            }
            this.alert.error(resp.errors.general)
        })
    }

    duplicatePrintArea(mocId, elevId) {
        this.loading = true
        this.fetching = true

        this.ds.makeDuplicatePrintArea({ mockup_id: mocId, elevation_id: elevId }).subscribe(resp => {
            this.loading = false
            this.fetching = false

            if (resp.success === true) {
                this.ds.elevations.push(resp.data)
                this.alert.success('Print Area successfully Duplicated!')
            }
            else {
                this.alert.error(resp.errors.general)
            }

        })

    }

    printAreaModal(paModal, mocId, elev) {
        this.ds.mockupId = mocId
        this.ds.elevationId = -1
        if (elev) {
            this.ds.elevationId = elev.id
        }

        this.ds.elevationObg = elev

        // console.log('this.ds.mockupId:', this.ds.mockupId)
        // this.ds.checkImage(mocId, elev.id).subscribe(resp => {
        // if (resp.success === true) {
        this.ds.pAModal = this.ms.show(
            paModal,
            {
                class: 'modal-xl modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
        // } else {
        //     this.alert.error(resp.errors.general)
        // }
        // })
    }

    cancelButton(f: any) {
        f.resetForm()
        this.modalRef.hide()
        this.selectedIndex = -1
    }

    cancelElevation(f: any) {
        f.resetForm()
        this.elevationModal.hide()
        this.selectedIndex = -1
    }
}
