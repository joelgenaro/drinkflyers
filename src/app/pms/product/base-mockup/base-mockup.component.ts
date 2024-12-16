import { ActivatedRoute } from '@angular/router'
import { ApiService } from 'src/app/services/api.service'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { Component, OnInit, TemplateRef } from '@angular/core'
import { DataService } from '../data.service'
import { ImageCroppedEvent } from 'ngx-image-cropper'
import { FormBuilder, FormGroup,FormControl,Validator, Validators } from '@angular/forms'
import { UIHelpers } from 'src/app/helpers/ui-helpers'

@Component({
    selector: 'app-base-mockup',
    templateUrl: './base-mockup.component.html',
    styleUrls: ['./base-mockup.component.scss']
})
export class BaseMockupComponent implements OnInit {
    addProductLoading = false
    uploadedFiles = []
    elevations = []
    loading=false
    dataForm:FormGroup
    elevationForm:FormGroup
    modalRef: BsModalRef

    pAModal:BsModalRef
    changeDefaultMockupRef:BsModalRef
    modalTitle
    selectedFile
    elevationTitle
    defaultMockupId
    oldMockupId
    mockups = []
    selectedIndex =-1
    dataList = []
    spinnerSVG = `/assets/images/rolling-gray.svg`
    thumbnail: any = '/assets/images/no_image.jpg'
    fileIndex=-1
    fileId=-1
    elevationId=-1
    fetching = false
    elevationFetch = false
    loaderOptions = {
        rows: 5,
        cols: 5,
        colSpans: {
            0: 1,
        }
    }

    constructor(
        public api: ApiService,
        public ds: DataService,
        private alert: IAlertService,
        public ms: BsModalService,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        public ui: UIHelpers,


    ) {

        this.ds.baseProductId = this.route.snapshot.queryParamMap.get('base_id')

        if(this.ds.baseProductId > 0){
            this.fetching= true
            this.elevationFetch = true
            this.ds.mockupList({id:this.ds.baseProductId}).subscribe(resp => {
                if(resp.success){
                    this.mockups = resp.data
                    // if(resp.data.length > 0){
                    //     this.mockups.unshift({title:''})
                    // }
                        this.loaderOptions.cols = this.mockups.length
                         this.ds.elevationList({id:this.ds.baseProductId}).subscribe(ele => {
                        if(ele.success){
                            this.elevations = ele.data

                        }
                        this.elevationFetch=false
                    })
                }
                this.fetching = false
            })



        }

        this.dataForm = this.fb.group({
            id: new FormControl(null),
            title: new FormControl(null,[Validators.required]),
            description: new FormControl(null),
            default: new FormControl(0)

        })

        this.elevationForm = this.fb.group({
            id: new FormControl(null),
            title: new FormControl(null,[Validators.required]),
            description: new FormControl(null,),

        })
    }

    ngOnInit() {
        const param = {
            id: this.ds.productId
        }
    }

    browseThumbnail(event: any,id,i,elId) {
        this.elevationId = elId
        this.fileIndex = i
        this.fileId = id
        event.preventDefault()
        const element = document.getElementById(elId+'image'+i)
        element.click()
    }

    openModal(formModal, index) {
        this.modalTitle = 'Add New Mockup'
        if (index > -1) {
            if(index == 0){
                return false
            }
            this.selectedIndex = index

            this.dataForm.controls.id.setValue(this.mockups[index].id)
            this.dataForm.patchValue(this.mockups[index])
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



    get g() {
        return this.dataForm.controls
    }

    get m() {
        return this.elevationForm.controls
    }


    cancelButton(f: any) {
        f.resetForm()
        this.modalRef.hide()
        this.selectedIndex = -1
    }

    setDefaultMockup(){


        console.log(this.defaultMockupId);
        const params = {
            product_id:this.ds.productId,
            default_mockup_id:this.defaultMockupId
        }
        this.ds.changeDefaultMockup(params).subscribe(resp=>{
            if(resp.success==true){

                this.alert.success('Default Mockup Changed Successfully')
                this.ds.newMockupId.next(this.ds.defaultMockupId)

            }else{
                this.alert.error(resp.errors.general)
                this.ds.defaultMockupId=this.oldMockupId
            }

        })
        this.changeDefaultMockupRef.hide()

    }

    confirmingDMockupModal(template: TemplateRef<any>,id) {
        this.defaultMockupId = id
        this.oldMockupId = this.ds.defaultMockupId
        this.ds.defaultMockupId = id
        this.changeDefaultMockupRef = this.ms.show(template, { class: 'modal-sm admin-panel' })
    }

    setDefault(){
        this.ds.defaultMockupId = this.oldMockupId
        this.changeDefaultMockupRef.hide()
    }


}
