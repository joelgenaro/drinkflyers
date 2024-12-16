import { ActivatedRoute } from '@angular/router'
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, NgZone, OnInit, Renderer2, TemplateRef, ViewChild } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { ApiService } from 'src/app/services/api.service'
import { DataService } from '../data.service'
import { fabric } from 'fabric'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import iro from '@jaames/iro'
import { log } from 'fabric/fabric-impl'

@Component({
    selector: 'app-print-areas',
    templateUrl: './print-areas.component.html',
    styleUrls: ['./print-areas.component.scss'],
})
export class PrintAreasComponent implements OnInit, AfterViewInit {
    @ViewChild('canvaswrapper', { static: false })
    canvasWrapper: ElementRef

    @ViewChild('colorpicker', { static: false })
    colorPickerDiv: ElementRef

    dataForm: FormGroup
    DefaultPropsDataForm: FormGroup
    Loading = false;
    colorPicker: any = null;
    colorPickerView = false;
    elevationImgDetail: any = null;
    uploadNewImage = false
    printArea = 0;
    uploadImage: any
    saveLoadingAll = false;

    _canvas?: fabric.Canvas = null;
    canvasData = {
        canvasSize: {
            width: 400,
            height: 400,
        },
        containerSize: {
            width: 400,
            height: 400,
        },
        loadingCanvas: false,
    };
    productImages: Array<any>
    selectedImage: any = null;
    selectedItem: fabric.Object | fabric.Group | any
    aspectratioW: number
    aspectratioH: number

    imageModalRef: BsModalRef
    imageChangedEvent: any
    croppedImage: any
    imageAspectRatio = 1;
    saveLoading = false;
    selectedFile: any
    dataStatus = 'fetching';
    spinnerSVG = `/assets/images/rolling-main.svg`
    thumbnail: any = '/assets/images/upload_default.jpg'

    constructor(
        public ds: DataService,
        public api: ApiService,
        private fb: FormBuilder,
        private alert: IAlertService,
        public ms: BsModalService,
        public ui: UIHelpers,
        private route: ActivatedRoute,
        protected _zone: NgZone,
        private changeDetectorRef: ChangeDetectorRef,
        private modalService: BsModalService,
        private rd: Renderer2
    ) {
        //ds.activeTab = 'print-areas'

        this.ds.productId = this.route.snapshot.queryParamMap.get('id')

        this.dataForm = this.fb.group({
            id: new FormControl(null),
            title: new FormControl(null, [Validators.required]),
            pwidth: new FormControl(null, [Validators.required]),
            pheight: new FormControl(null, [Validators.required]),
            width: new FormControl(null, [Validators.required]),
            height: new FormControl(null, [Validators.required]),
            x: new FormControl(100, [Validators.required]),
            y: new FormControl(100, [Validators.required]),
        })

        if (this.ds.mockupId > -1 && this.ds.elevationId > -1 && this.ds.elevationObg) {

            this.dataForm.controls.title.setValue(this.ds.elevationObg.title)
            this.dataForm.controls.pwidth.setValue(this.ds.elevationObg.p_width)
            this.dataForm.controls.pheight.setValue(this.ds.elevationObg.p_height)
            this.uploadNewImage = false
            this.ds
                .getPrintAreas({
                    mockup_id: this.ds.mockupId,
                    elevation_id: this.ds.elevationId,
                })
                .subscribe((resp) => {

                    if (resp.success === true) {
                        if (resp.data) {
                            this.elevationImgDetail = resp.data
                            this.selectImage(this.elevationImgDetail)
                        } else {
                            this.uploadNewImage = true
                        }
                    }
                })

        } else {
            this.uploadNewImage = true
        }



        this.DefaultPropsDataForm = this.fb.group({
            title: new FormControl(null, [Validators.required]),
            description: new FormControl(null, [Validators.required]),
        })

        this.dataForm.valueChanges.subscribe((data) => {
            this.updateDesignDimensions()
        })

        this.dataForm.get('width').valueChanges.subscribe((x) => {
            if (this.aspectratioW) {
                this.dataForm.controls.height.setValue(
                    this.dataForm.controls.width.value / this.aspectratioW,
                    { emitEvent: false }
                )
            }
        })
        this.dataForm.get('height').valueChanges.subscribe((x) => {
            if (this.aspectratioH) {
                this.dataForm.controls.width.setValue(
                    this.dataForm.controls.height.value / this.aspectratioH,
                    { emitEvent: false }
                )
            }
        })

        this.dataForm.get('pheight').valueChanges.subscribe((x) => {

            this.aspectratioW =
                this.dataForm.controls.pwidth.value /
                this.dataForm.controls.pheight.value

            if (this.aspectratioW) {
                this.dataForm.controls.height.setValue(
                    this.dataForm.controls.width.value / this.aspectratioW,
                    { emitEvent: false }
                )
            }
        })
        this.dataForm.get('pwidth').valueChanges.subscribe((x) => {

            this.aspectratioH =
                this.dataForm.controls.pheight.value /
                this.dataForm.controls.pwidth.value

            if (this.aspectratioH) {
                this.dataForm.controls.width.setValue(
                    this.dataForm.controls.height.value / this.aspectratioH,
                    { emitEvent: false }
                )
            }
        })

    }

    ngOnInit() { }


    browseThumbnail() {
        const element = document.getElementById('elevation_image')
        element.click()
    }


    saveAndGetDetailsElevImage(form) {

        if (!form) {
            this.alert.error('Please Fillout the form and continue!.')
        }

        this.ds.addElevationImage(form).subscribe(res => {
            if (res.success === true) {
                this.alert.success('Image uploaded successfully!')
                this.saveLoading = false
                this.selectedFile = null
                this.ds
                    .getPrintAreas({
                        mockup_id: this.ds.mockupId,
                        elevation_id: this.ds.elevationId,
                    })
                    .subscribe((resp) => {
                        if (resp.success === true) {
                            this.uploadNewImage = false
                            this.elevationImgDetail = resp.data
                            console.log('elevationImgDetail:', this.elevationImgDetail)
                            this.selectImage(resp.data)
                        }
                    })


            }

        })

    }

    onThumbnailChange(event: any, contentRef:TemplateRef<any>) {

        if (event.target.files.length > 0) {

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

                // this.imageChangedEvent = event
                // this.imageModalRef = this.modalService.show(contentRef, {
                //     class: 'modal-xl modal-dialog-centered admin-panel'
                // })


                // this.thumbnail = file
                const reader = new FileReader()
                reader.onload = () => {
                    this.thumbnail = reader.result as string
                    (document.getElementById('elevation_image_src') as HTMLImageElement).src = this.thumbnail
                }
                reader.readAsDataURL(file)

                const params = {
                    mockup_id: this.ds.mockupId,
                    elevation_id: this.ds.elevationId,
                    base_product_id: this.ds.productId,
                    name: file.name

                }
                const form = this.api.jsonToFormData(params)
                form.append('image', this.selectedFile)
                this.uploadNewImage = false
                setTimeout(() => {

                    this.selectImage(null)

                }, 1000)


                // if(this.ds.elevationId>0){
                //     form.set('elevation_id', this.ds.elevationId)
                //     this.saveAndGetDetailsElevImage(form)
                // }else{
                //     const printAreaSaveButton = document.getElementById('printAreaSaveButton')
                //     printAreaSaveButton.click();
                // }
            }

        }

    }

    get t() {
        return this.DefaultPropsDataForm.controls
    }

    get g() {
        return this.dataForm.controls
    }

    ngAfterViewInit() { }

    @HostListener('window:resize', ['$event'])
    onWindowResize(event) {
        this.resizeCanvas()
    }

    initializeCanvas() {
        // this._zone.runOutsideAngular( () => {
        this._canvas = new fabric.Canvas('main-canvas', {
            backgroundColor: '#fff', // '#ebebef',
            selection: false,
            preserveObjectStacking: true,
        })

        setTimeout(this.resizeCanvas.bind(this), 200)
        this._canvas.on('mouse:down', this.canvasMouseDown.bind(this))
        this._canvas.on('mouse:move', this.canvasMouseMove.bind(this))
        this._canvas.on('mouse:up', this.canvasMouseUp.bind(this))
        // this._canvas.on('object:scaling', this.objectScaling.bind(this))

        this._canvas.on('object:modified', this.objectModified.bind(this))
        // if(this.elevationImgDetail!==null){
        this.addNewImage()
        // }

        // })
        // this._zone.run(() => this._canvas.on('mouse:down', this.canvasMouseDown.bind(this)))
    }

    resizeCanvas(width = null, height = null) {
        this.canvasData.containerSize = {
            width: this.canvasWrapper.nativeElement.offsetWidth,
            height: this.canvasWrapper.nativeElement.offsetHeight,
        }

        const canvasSize = {
            width: width ? width : this.canvasData.containerSize.width,
            height: height ? height : this.canvasData.containerSize.height,
        }

        if (!this._canvas) return

        // this._canvas.setWidth(canvasSize.width)
        // this._canvas.setHeight(canvasSize.height)
        this._canvas.setDimensions(canvasSize, { backstoreOnly: true })
        this._canvas.setDimensions(
            {
                width: this.canvasData.containerSize.width + 'px',
                height: this.canvasData.containerSize.height + 'px',
            },
            { cssOnly: true }
        )

        // zoom ratio with respect to canvas container size
        const scaleRatio = Math.min(
            this.canvasData.containerSize.width / canvasSize.width,
            this.canvasData.containerSize.height / canvasSize.height
        )
        // No need to set it explicitly. Browser will set this automatically
        // this._canvas.setZoom(scaleRatio)
        console.log('----------------------------------------------------')
        console.log(
            'Container: ',
            this.canvasData.containerSize.width +
            'x' +
            this.canvasData.containerSize.height
        )
        console.log('DB Canvas: ', canvasSize.width + 'x' + canvasSize.height)
        console.log('Zoom Level: ', scaleRatio, this._canvas.getZoom())
    }

    deleteDesign() {
        const prohabitedObjects = []
        this._canvas.getActiveObjects().forEach((obj) => {
            if (prohabitedObjects.indexOf(obj.ktype) === -1) {
                this._canvas.remove(obj)
            }
        })

        this._canvas.discardActiveObject().renderAll()
        this.dataForm.reset()
        this.printArea = 0
    }

    addPrintArea() {
        const rect: fabric.Rect = new fabric.Rect({
            width: this.canvasData.containerSize.width / 4,
            height: this.canvasData.containerSize.height / 4,
            strokeDashArray: [5, 5],
            fill: 'transparent',
            stroke: '#f00',
            strokeWidth: 1,
            ktype: 'print-area',
            cornerStyle: 'circle',
            transparentCorners: false,
            // borderColor:'black',
            // cornerColor:'light blue'
            cornerSize: 6,
        })
        rect.setControlsVisibility({
            mtr: false,
            mt: false,
            mb: false,
            mr: false,
            ml: false
        })

        // this._canvas.centerObject(rect);
        this._canvas.add(rect)
        this._canvas.renderAll().setActiveObject(rect)
        this.printArea = 1
        if (
            this.elevationImgDetail.pa_width != null &&
            this.elevationImgDetail.pa_height
        ) {
            this.selectedItem = rect

            rect.set(
                'width',
                this.elevationImgDetail.pa_width / this.selectedItem.scaleX
            )
            rect.set(
                'height',
                this.elevationImgDetail.pa_height / this.selectedItem.scaleY
            )
            rect.set(
                'top',
                this.elevationImgDetail.pa_y / this.selectedItem.scaleX
            )
            rect.set(
                'left',
                this.elevationImgDetail.pa_x / this.selectedItem.scaleY
            )

            this._canvas.renderAll()
            this.dataForm.controls.width.setValue(
                this.elevationImgDetail.pa_width,
                { emitEvent: false }
            )
            this.dataForm.controls.height.setValue(
                this.elevationImgDetail.pa_height,
                { emitEvent: false }
            )

            // this.dataForm.controls.pwidth.setValue(
            //     this.elevationImgDetail.p_width,
            //     { emitEvent: false }
            // );

            // this.dataForm.controls.pheight.setValue(
            //     this.elevationImgDetail.p_height,
            //     { emitEvent: false }
            // );


            this.dataForm.controls.x.setValue(this.elevationImgDetail.pa_x, {
                emitEvent: false,
            })
            this.dataForm.controls.y.setValue(this.elevationImgDetail.pa_y, {
                emitEvent: false,
            })
        }


        this._canvas.forEachObject((element) => {
            this.selectedItem = element
            this.updateDimensions(this.selectedItem)
        })



    }

    addDefaultArea() {

        let width = this.dataForm.controls.width.value
        let height = this.dataForm.controls.height.value

        console.log('width:', width, 'height:', height)

        if (!width) {
            width = this.canvasData.containerSize.width / 4
        }
        if (!height) {
            height = this.canvasData.containerSize.height / 4
        }

        const rect: fabric.Rect = new fabric.Rect({
            width: width,
            height: height,
            strokeDashArray: [5, 5],
            fill: 'transparent',
            stroke: '#f00',
            strokeWidth: 1,
            ktype: 'print-area',
            cornerStyle: 'circle',
            transparentCorners: false,
            // borderColor:'black',
            // cornerColor:'light blue'
            cornerSize: 10,
        })

        console.log('rect:', rect)

        rect.setControlsVisibility({
            mtr: false,
            mt: false,
            mb: false,
            mr: false,
            ml: false
        })

        this._canvas.centerObject(rect)
        this._canvas.add(rect)
        this._canvas.renderAll().setActiveObject(rect)
        this.printArea = 1
        this.selectedItem = rect
        //console.log('sdfsdfsdfsdf', this.elevationImgDetail)
        if (this.elevationImgDetail && this.elevationImgDetail.pa_width != null && this.elevationImgDetail.pa_height) {
            this.selectedItem = rect

            rect.set(
                'width',
                this.elevationImgDetail.pa_width / this.selectedItem.scaleX
            )
            rect.set(
                'height',
                this.elevationImgDetail.pa_height / this.selectedItem.scaleY
            )
            rect.set(
                'top',
                this.elevationImgDetail.pa_y / this.selectedItem.scaleX
            )
            rect.set(
                'left',
                this.elevationImgDetail.pa_x / this.selectedItem.scaleY
            )

            this.dataForm.controls.width.setValue(
                this.elevationImgDetail.pa_width,
                { emitEvent: false }
            )
            this.dataForm.controls.height.setValue(
                this.elevationImgDetail.pa_height,
                { emitEvent: false }
            )
            this.dataForm.controls.x.setValue(this.elevationImgDetail.pa_x, {
                emitEvent: false,
            })
            this.dataForm.controls.y.setValue(this.elevationImgDetail.pa_y, {
                emitEvent: false,
            })
        }
        this._canvas.renderAll()

        this._canvas.forEachObject((element) => {
            this.selectedItem = element
            this.updateDimensions(this.selectedItem)
        })

        console.log('this.selectedItem--:', this.selectedItem)

    }

    get randomNumber() {
        return Math.floor(Math.random() * 9999999999 + 1)
    }

    save(data: any, f: any) { }

    isOurItem(o: any): boolean {
        // console.log('o?.ktype:', o)
        return (
            o?.ktype === 'print-area' ||
            o?.ktype === 'image-group' ||
            o?.ktype === 'text-area' ||
            o?.ktype === 'text-group'
        )
    }

    canvasMouseDown(event: fabric.IEvent) {
        console.log('event:', event)

        if (event.target !== null) {
            if (this.isOurItem(event.target)) {
                this.selectedItem = event.target
                console.log('canvasMouseDown:', this.selectedItem)
                //this.updateProperties()
                this.updateDimensions(this.selectedItem)
            }
        }
    }

    objectModified(event: fabric.IEvent) {
        const obj: any = event.target

        console.log('obj:', obj)


        if (this.isOurItem(obj)) {
            if (obj.ktype === 'image-group') {
                let ob = obj.item(0) // container
                ob.set('width', ob.width * ob.scaleX)
                ob.set('height', ob.height * ob.scaleY)
                ob.set('scaleX', 1)
                ob.set('scaleY', 1)
                ob.setCoords()
                console.log('objectModified:', obj.item(0))
                ob = obj.item(1) // image
                ob.scaleToWidth(obj.item(0).width - 3)
                ob.scaleToHeight(obj.item(0).height - 3)
                ob.setCoords()
            } else {
                obj.set('width', obj.getScaledWidth() - 1)
                obj.set('height', obj.getScaledHeight() - 1)
                obj.set('scaleX', 1)
                obj.set('scaleY', 1)
                obj.setCoords()
                this._canvas.renderAll()
            }
        }

        obj.setCoords()
        this._canvas.renderAll()
    }

    canvasMouseMove(event: fabric.IEvent) {
        if (this.selectedItem !== null) {
            this.updateDimensions(this.selectedItem)
        }
    }

    canvasMouseUp(event: fabric.IEvent) {
        if (this.selectedItem !== null) {
            this.updateDimensions(this.selectedItem)
        }
    }

    updateDimensions(o: fabric.Object) {
        console.log('updateDimensions:', this.selectedItem.getScaledWidth())
        this.dataForm.controls.width.setValue(
            this.selectedItem.getScaledWidth() - 1,
            { emitEvent: false }
        )
        this.dataForm.controls.height.setValue(
            this.selectedItem.getScaledHeight() - 1,
            { emitEvent: false }
        )
        this.dataForm.controls.x.setValue(this.selectedItem.left, {
            emitEvent: false,
        })
        this.dataForm.controls.y.setValue(this.selectedItem.top, {
            emitEvent: false,
        })
    }

    updateDesignDimensions() {

        if (
            this.dataForm.controls.pwidth.value &&
            this.dataForm.controls.pheight.value
        ) {
            this.aspectratioW =
                this.dataForm.controls.pwidth.value /
                this.dataForm.controls.pheight.value
            this.aspectratioH =
                this.dataForm.controls.pheight.value /
                this.dataForm.controls.pwidth.value
        }

        if (this.selectedItem === null || typeof this.selectedItem === 'undefined') return

        if (this.selectedItem.ktype === 'print-area' || this.selectedItem.ktype === 'text-area') {

            console.log('updateDesignDimensions:', this.dataForm.controls.width.value)

            this.selectedItem.set('width', this.dataForm.controls.width.value / this.selectedItem.scaleX)
            this.selectedItem.set('height', this.dataForm.controls.height.value / this.selectedItem.scaleY)
        }

        this.selectedItem.set('left', this.dataForm.controls.x.value)
        this.selectedItem.set('top', this.dataForm.controls.y.value)

        this.selectedItem.setCoords()
        if (this._canvas) {
            this._canvas.renderAll()
        }
    }

    selectImage(img) {

        this.selectedImage = img
        this.selectedItem = null
        const w = 400 // img.width
        const h = 400 // img.width
        this.canvasWrapper.nativeElement.style.width = w + 'px'
        this.canvasWrapper.nativeElement.style.height = h + 'px'
        console.log('this.canvasWrapper:', this.canvasWrapper)

        // if (this._canvas == null) {
        //     this.initializeCanvas()
        // } else {
        //     this._canvas.clear()
        //     this.resizeCanvas(w, h)
        // }

        this.initializeCanvas()
    }

    addNewImage() {
        this.uploadNewImage = false
        this.canvasData.loadingCanvas = true

        let imgURL = null
        if (this.elevationImgDetail) {
            imgURL = this.api.getElevationImage(this.elevationImgDetail.id)
        }
        if (this.selectedFile) {
            imgURL = this.thumbnail
        }

        //  fabric.Image.fromURL(imgURL)
        fabric.Image.fromURL(imgURL, (image: fabric.Image) => {
            image.ktype = 'background-image'


            if (image.width > image.height) {
                image.scaleToHeight(400)
                image.scaleToWidth(400)
            } else {
                image.scaleToWidth(400)
                image.scaleToHeight(400)
            }

            image.selectable = false
            image.objectCaching = false
            this._canvas.add(image).renderAll()
            this._canvas.centerObject(image)
            image.crossOrigin = 'anonymous'
            if (this.elevationImgDetail && this.elevationImgDetail.pa_width != null && this.elevationImgDetail.pa_height != null) {
                this.addPrintArea()

            } else {
                this.addDefaultArea()
            }
            this._canvas.renderAll()
            this.canvasData.loadingCanvas = false
        },
            { crossOrigin: 'anonymous' }
        )
    }



    addElevationDesign(type, form) {
        if (this.dataForm.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.saveLoading = false
            return false
        }

        if (type === 'single') {
            this.saveLoading = true
        }

        const params = {
            title: this.dataForm.controls.title.value,
            p_width: this.dataForm.controls.pwidth.value,
            p_height: this.dataForm.controls.pheight.value,
            description: '',
            base_product_id: this.ds.productId
        }


        this.ds.addElevation(params).subscribe(resp => {
            if (resp.success === true) {
                this.ds.elevationObg = resp.data
                form.set('elevation_id', resp.data.id)
                this.ds.addElevationImage(form).subscribe(res => {
                    if (res.success === true) {
                        this.alert.success('Print Area Added successfully!')
                        this.ds.elevations.push(resp.data)
                        this.ds.elevationId = this.ds.elevationObg.id
                        this.uploadNewImage = false
                        this.saveLoading = false
                        this.selectedFile = null
                        // this.elevationImgDetail = res

                        const data = {
                            pa_width: this.dataForm.controls.width.value,
                            pa_height: this.dataForm.controls.height.value,
                            pa_x: this.dataForm.controls.x.value,
                            pa_y: this.dataForm.controls.y.value,
                            type: null,
                            mockup_id: this.ds.mockupId,
                            elevation_id: this.ds.elevationId,
                        }

                        this.ds.updatePrintAreas(data).subscribe((resp: any) => {
                            this.ds.getPrintAreas({
                                mockup_id: this.ds.mockupId,
                                elevation_id: this.ds.elevationId,
                            }).subscribe((resp) => {
                                if (resp.success === true) {
                                    this.elevationImgDetail = resp.data
                                    console.log('elevationImgDetail:', this.elevationImgDetail)
                                    this.selectImage(resp.data)
                                }
                            })
                        })
                    }
                })
            } else {
                this.saveLoading = false
                this.alert.error('save failed something went wrong.')
            }
        })
    }

    saveDesign(type) {
        if (this.dataForm.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.saveLoading = false
            return false
        }

        if (this._canvas && this._canvas._objects.length != 2) {
            this.alert.error('please select Print Area')
            return false
        }

        if (this.elevationImgDetail === null) {
            if (this.selectedFile) {
                const params = {
                    mockup_id: this.ds.mockupId,
                    elevation_id: this.ds.elevationId,
                    base_product_id: this.ds.productId,
                    name: this.selectedFile.name
                }
                const form = this.api.jsonToFormData(params)
                form.append('image', this.selectedFile)
                this.addElevationDesign('single', form)
                return
            } else {
                this.alert.error('Please select an image & try again.')
                return false
            }
        }

        console.log(this.elevationImgDetail)

        if (type === 'single') {
            this.saveLoading = true
        }

        const data = {
            pa_width: this._canvas._objects[1].width,
            pa_height: this._canvas._objects[1].height,
            pa_x: this._canvas._objects[1].left,
            pa_y: this._canvas._objects[1].top,
            type: null,
            mockup_id: this.ds.mockupId,
            elevation_id: this.ds.elevationId,
        }

        if (type === 'all') {
            this.saveLoadingAll === true
            data.type = 'all'
        }


        this.ds.updatePrintAreas(data).subscribe((resp: any) => {
            this.saveLoading = false
            if (resp.success) {

                this.ds.elevationObg.title = this.dataForm.controls.title.value
                this.ds.elevationObg.p_width = this.dataForm.controls.pwidth.value
                this.ds.elevationObg.p_height = this.dataForm.controls.pheight.value

                this.ds.updateElevation(this.ds.elevationObg).subscribe((resp: any) => {
                    console.log('this.ds.elevationObg:', this.ds.elevationObg)
                })

                this.alert.success('Print areas saved successfully')
                this._canvas.renderAll()
                this.ds.pAModal.hide()
            } else {
                this.alert.error(resp.errors.general)
                this.saveLoading = false
                this.saveLoadingAll = false
            }
        })
    }

    @HostListener('window:keyup', ['$event'])
    deleteCanvasObject(event: KeyboardEvent) {
        const prohabitedObjects = []
        console.log('event', event.key)
        if (event.key === 'Delete') {
            this._canvas.getActiveObjects().forEach((obj) => {
                if (prohabitedObjects.indexOf(obj.ktype) === -1) {
                    this._canvas.remove(obj)
                }
            })
            this.printArea = 0
            this._canvas.discardActiveObject().renderAll()
        }
    }

    DefaultPropsForm(f: any) {
        this.saveLoading = true
        if (this.DefaultPropsDataForm.status === 'INVALID') {
            this.alert.error(
                'Please fill-in valid data in fields & try again.'
            )
            this.saveLoading = false

            return false
        }

        const params = {
            id: this.selectedImage.id,
            title: this.DefaultPropsDataForm.value.title,
            description: this.DefaultPropsDataForm.value.description,
        }

        this.ds.addImgTitle(params).subscribe((resp: any) => {
            this.saveLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.saveLoading = false

                return false
            } else {
                this.alert.success('Added successfully!!')
                const index = this.productImages.findIndex(
                    (e) => e.id === this.selectedImage.id
                )
                console.log('index', index)
                if (index > -1) {
                    this.productImages[index].title = params.title
                    this.productImages[index].description = params.description
                }
            }
        })
    }
}
