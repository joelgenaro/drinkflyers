import { ActivatedRoute } from '@angular/router'
import { ApiService } from 'src/app/services/api.service'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { DataService } from '../data.service'
import { FormBuilder, FormGroup,FormControl,Validator, Validators } from '@angular/forms'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { fabric } from 'fabric'
import { constants } from 'os'


@Component({
    selector: 'app-mockup',
    templateUrl: './mockup.component.html',
    styleUrls: ['./mockup.component.scss']
})
export class MockupComponent implements OnInit {
    @ViewChild('canvaswrapper', { static: false })
    canvasWrapper: ElementRef

    _canvas?: fabric.Canvas = null
    canvases:{}
    canvasData = {
        canvasSize: {
            width: 400,
            height: 400
        },
        containerSize: {
            width: 400,
            height: 400
        },
        loadingCanvas: false
    }

    addProductLoading = false

    elevations = []
    loading=false
    dataForm:FormGroup
    elevationForm:FormGroup
    modalRef: BsModalRef
    elevationModal:BsModalRef
    pAModal:BsModalRef
    modalTitle
    selectedFile
    elevationTitle
    activeBtnId
    mockups = []

    selectedIndex =-1
    dataList = []
    spinnerSVG = `/assets/images/rolling-gray.svg`
    thumbnail: any = '/assets/images/no_image.jpg'
    fileIndex=-1
    fileId=-1
    elevationId=-1
    elevationImages = []
    fetching = false
    elevationFetch = false
    vpDesigneContent = []
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
        ds.activeTab = 'mockups'
        this.ds.productId = this.route.snapshot.queryParamMap.get('id')
        this.ds.baseProductId = this.route.snapshot.queryParamMap.get('base_id')


        if(this.ds.productId > 0){
            this.fetching = true
            this.elevationFetch = true
            this.ds.elevationList({id:this.ds.baseProductId}).subscribe(ele => {
                if(ele.success === true){
                    this.elevations = ele.data
                    if(this.elevations.length > 0){
                        const params = {
                            elevation_id:this.elevations[0].id,
                            product_id:this.ds.productId
                        }
                        this.ds.productImages(params).subscribe(res=>{
                            if(res.success === true){
                                this.elevationImages = res.data
                                this.fetching=false
                            }
                        })
                    }
                }
                this.elevationFetch=false
            })

            // this.ds.mockupList({id:this.ds.baseProductId}).subscribe(resp => {
            //     if(resp.success== true){


            //         this.mockups = resp.data
            //         if(resp.data.length > 0){
            //             this.mockups.unshift({title:'Elevation'})
            //         }
            //         this.loaderOptions.cols = this.mockups.length
            //         this.ds.elevationList({id:this.ds.baseProductId}).subscribe(ele => {
            //             if(ele.success== true){
            //                 this.elevations = ele.data
            //             }
            //             this.elevationFetch=false
            //         })
            //     }
            //     this.fetching = false
            // })



        }


    }

    ngOnInit() {
        // setTimeout(() => {
        //     this.elevationImages.forEach((e,i)=>{
        //         this.getImg(e,i)
        //     })
        // }, 3000)
    }

    mockList(id){
        this.activeBtnId = id
        this.fetching= true
        this.elevationImages = []

        this.ds.productImages({elevation_id:id,product_id:this.ds.productId}).subscribe(res=>{
            if(res.success==true){
                this.elevationImages = res.data
                this.fetching=false

                // setTimeout(() => {
                //     this.elevationImages.forEach((e,i)=>{
                //         this.getImg(e,i)
                //     })
                // }, 3000)
            }
        })

    }

    // getImg(ele, i){
    //     this.activeBtnId = ele.elevation_id
    //     this.elevationImages[i].canvasLoading = true
    //     const canvas  = new fabric.Canvas(ele.id+'img-src'+i, {
    //         backgroundColor: '#fff', //  '#ebebef',
    //         selection: false,
    //         preserveObjectStacking: true,
    //         width:400,
    //         height:400
    //     })

    //     const imgUrl = this.api.mockImage(ele.id)
    //     this.ds.getVpDesigneContent({id:this.ds.productId,elevation_id:ele.elevation_id}).subscribe(resp=>{
    //         if(resp.success === true){
    //             if(resp.data != null) {
    //                 canvas.loadFromJSON(resp.data.design_content, () => {
    //                     const can = canvas._objects
    //                     can.forEach( e => {
    //                         if(e.ktype === 'background-image' ){
    //                             canvas.remove(e)
    //                         }

    //                         e.setControlsVisibility({
    //                             mtr: false
    //                         })

    //                         e.selectable = false
    //                         canvas.renderAll()
    //                     })

    //                     fabric.Image.fromURL(imgUrl, (image: fabric.Image) => {
    //                         image.ktype = 'background-image'
    //                         image.scaleToWidth(400)
    //                         image.scaleToHeight(400)
    //                         image.selectable = false
    //                         canvas.add(image);
    //                         canvas.centerObject(image)

    //                         canvas.sendToBack(canvas._objects[canvas._objects.length -1])
    //                         canvas.renderAll()
    //                     })

    //                     setTimeout(() => {
    //                         canvas.remove(canvas._objects[1])
    //                         canvas.renderAll()
    //                         this.elevationImages[i].canvasLoading = false
    //                     })
    //                 })
    //             } else{
    //                   fabric.Image.fromURL(imgUrl, (image: fabric.Image) => {
    //                     image.ktype = 'background-image'
    //                     image.scaleToWidth(400)
    //                     image.scaleToHeight(400)
    //                     image.selectable = false
    //                     canvas.add(image)
    //                 })
    //                 canvas.renderAll()
    //             }
    //         }
    //     })
    // }




}
