import { style } from '@angular/animations'
import { CompressImageService } from 'src/app/services/compress-image.service'
import { DataService } from 'src/app/pms/product/data.service'
import { ActivatedRoute, Router } from '@angular/router'
import { ChangeDetectorRef, Component, ElementRef, HostListener, NgZone, OnInit, Renderer2, TemplateRef, ViewChild, OnDestroy, AfterViewInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { ApiService } from 'src/app/services/api.service'
import { fabric } from 'fabric'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import iro from '@jaames/iro'
import { debounceTime, distinctUntilChanged, take, throwIfEmpty } from 'rxjs/operators'
import * as _ from 'lodash'
import { Subject } from 'rxjs'
declare let FontFace: any
import { HttpEvent, HttpEventType } from '@angular/common/http'
import { apis } from 'src/environments/environment'

const TextCurved = fabric.util.createClass(fabric.Object, {
    type: 'text-curved',
    ktype: 'placeholder-curvedtext',
    diameter: 350,
    kerning: 0,
    text: '',
    flipped: false,
    fill: '#000',
    fontFamily: 'Times New Roman',
    fontSize: 24, // in px
    fontWeight: 'normal',
    fontStyle: '', // "normal", "italic" or "oblique".
    textAlign: '', // "left", "center", "right", "justify", "justify-left", "justify-center" or "justify-right".
    cacheProperties: fabric.Object.prototype.cacheProperties.concat('text', 'diameter', 'kerning', 'flipped', 'fill', 'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'strokeStyle', 'strokeWidth', 'textAlign', 'textLimit', 'personalize'),
    strokeStyle: '#f3585f',
    strokeWidth: 0,

    initialize: function (text, options) {
        options || (options = {})
        this.text = text

        this.callSuper('initialize', options)
        this.set('lockUniScaling', true)

        // Draw curved text here initially too, while we need to know the width and height.
        var canvas = this.getCircularText()
        this._trimCanvas(canvas)
        this.set('width', canvas.width)
        this.set('height', canvas.height)
    },

    _getFontDeclaration: function () {
        return [
            // node-canvas needs "weight style", while browsers need "style weight"
            (fabric.isLikelyNode ? this.fontWeight : this.fontStyle),
            (fabric.isLikelyNode ? this.fontStyle : this.fontWeight),
            this.fontSize + 'px',
            (fabric.isLikelyNode ? ('"' + this.fontFamily + '"') : this.fontFamily)
        ].join(' ')
    },

    _trimCanvas: function (canvas) {
        var ctx = canvas.getContext('2d'),
            w = canvas.width,
            h = canvas.height,
            pix = { x: [], y: [] }, n,
            imageData = ctx.getImageData(0, 0, w, h),
            fn = function (a, b) { return a - b }

        for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
                if (imageData.data[((y * w + x) * 4) + 3] > 0) {
                    pix.x.push(x)
                    pix.y.push(y)
                }
            }
        }
        pix.x.sort(fn)
        pix.y.sort(fn)
        n = pix.x.length - 1

        w = pix.x[n] - pix.x[0]
        h = pix.y[n] - pix.y[0]
        var cut = ctx.getImageData(pix.x[0], pix.y[0], w, h)

        canvas.width = w
        canvas.height = h
        ctx.putImageData(cut, 0, 0)
    },

    // Source: http://jsfiddle.net/rbdszxjv/
    getCircularText: function () {
        let text = this.text
        let diameter = this.diameter,
            flipped = this.flipped,
            kerning = this.kerning,
            fill = this.fill,
            strokeStyle = this.strokeStyle,
            strokeWidth = this.strokeWidth,
            inwardFacing = true,
            startAngle = 0,
            canvas = fabric.util.createCanvasElement(),
            ctx = canvas.getContext('2d'),
            cw, // character-width
            x, // iterator
            clockwise = -1 // draw clockwise for aligned right. Else Anticlockwise

        if (flipped) {
            startAngle = 180
            inwardFacing = false
        }

        startAngle *= Math.PI / 180 // convert to radians

        // Calc heigt of text in selected font:
        var d = document.createElement('div')
        d.style.fontFamily = this.fontFamily
        d.style.whiteSpace = 'nowrap'
        d.style.fontSize = this.fontSize + 'px'
        d.style.fontWeight = this.fontWeight
        d.style.fontStyle = this.fontStyle
        // d.style.textAlign = this.textAlign
        d.textContent = text
        document.body.appendChild(d)
        var textHeight = d.offsetHeight
        document.body.removeChild(d)

        canvas.width = canvas.height = diameter
        ctx.font = this._getFontDeclaration()

        // Reverse letters for center inward.
        if (inwardFacing) {
            text = text.split('').reverse().join('')
        };

        // Setup letters and positioning
        ctx.translate(diameter / 2, diameter / 2) // Move to center
        startAngle += (Math.PI * 2) // Rotate 180 if outward
        ctx.textBaseline = 'middle' // Ensure we draw in exact center
        ctx.textAlign = 'center' // Ensure we draw in exact center

        // rotate 50% of total angle for center alignment
        for (x = 0; x < text.length; x++) {
            cw = ctx.measureText(text[x]).width
            startAngle += ((cw + (x == text.length - 1 ? 0 : kerning)) / (diameter / 2 - textHeight)) / 2 * -clockwise
        }

        // Phew... now rotate into final start position
        ctx.rotate(startAngle)

        // Now for the fun bit: draw, rotate, and repeat
        for (x = 0; x < text.length; x++) {
            cw = ctx.measureText(text[x]).width // half letter
            // rotate half letter
            ctx.rotate((cw / 2) / (diameter / 2 - textHeight) * clockwise)
            // draw the character at "top" or "bottom"
            // depending on inward or outward facing

            // Stroke
            if (this.strokeStyle && this.strokeWidth) {
                ctx.strokeStyle = this.strokeStyle
                ctx.lineWidth = this.strokeWidth
                ctx.miterLimit = 2
                ctx.strokeText(text[x], 0, (inwardFacing ? 1 : -1) * (0 - diameter / 2 + textHeight / 2))
            }

            // Actual text
            ctx.fillStyle = fill
            ctx.fillText(text[x], 0, (inwardFacing ? 1 : -1) * (0 - diameter / 2 + textHeight / 2))

            ctx.rotate((cw / 2 + kerning) / (diameter / 2 - textHeight) * clockwise) // rotate half letter
        }
        return canvas
    },

    _set: function (key, value) {
        switch (key) {
            case 'scaleX':
                this.fontSize *= value
                this.diameter *= value
                this.width *= value
                this.scaleX = 1
                if (this.width < 1) { this.width = 1 }
                break

            case 'scaleY':
                this.height *= value
                this.scaleY = 1
                if (this.height < 1) { this.height = 1 }
                break

            default:
                this.callSuper('_set', key, value)
                break
        }
    },

    _render: function (ctx) {
        var canvas = this.getCircularText()
        this._trimCanvas(canvas)

        this.set('width', canvas.width)
        this.set('height', canvas.height)

        ctx.drawImage(canvas, -this.width / 2, -this.height / 2, this.width, this.height)

        this.setCoords()
    },

    toObject: function (propertiesToInclude) {
        return this.callSuper('toObject', ['text', 'diameter', 'kerning', 'flipped', 'fill', 'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'textAlign', 'strokeStyle', 'strokeWidth', 'styles'].concat(propertiesToInclude))
    }
})

TextCurved.fromObject = function (options) {
    return new TextCurved(options)
}


@Component({
    selector: 'app-personalized-region',
    templateUrl: './personalized-region.component.html',
    styleUrls: ['./personalized-region.component.scss']
})
export class PersonalizedRegionComponent implements OnInit, OnDestroy {
    @ViewChild('canvaswrapper', { static: false })
    canvasWrapper: ElementRef

    @ViewChild('productBgImage', { static: false })
    productBgImage: ElementRef

    @ViewChild('imageCropTemplate', { static: false })
    imageCropTemplate: TemplateRef<any>

    @ViewChild('colorpicker', { static: false })
    colorPickerDiv: ElementRef
    resetZoomVal = false
    zoomSize: any = 1
    @ViewChild('fnt', { static: false })
    fnt: ElementRef
    initialZoom = -1
    pixelsPerMM = 96 // 3.7795275591
    printRatioW = 0.5 // milimeter to pixel width ratio
    printRatioH = 0.5
    productBgImageUrl = null
    style
    imgHight
    imgWidth
    selectedPrintArea
    libFileId = null
    dataForm: FormGroup
    textDataForm: FormGroup
    curvedDataForm: FormGroup
    imageDataForm: FormGroup
    newFolderForm: FormGroup
    printAreaMenu = 'hide'
    holdeCanvasObj = []
    lodedFontFamily
    newMockupId
    Loading = false
    showBox: boolean = false
    newFolderLoading = false
    colorPicker: any = null
    colorPickerView = false
    cropedImages = []
    imageFile = null
    fontName
    selectedNewImg
    fontId = null
    fontWeightId = null
    defaultFontSize = 23
    selectedItemMetaData = {
        initialScaledWidth: 0,
        initialScaledHeight: 0,
        initialFontSize: this.defaultFontSize
    }

    _canvas?: fabric.Canvas = null
    _clipboard?: fabric.Object | fabric.Group | any
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
    selectedRect: fabric.Rect
    productImages: Array<any>
    selectedImage: any = null
    selectedItem: fabric.Object | fabric.Group | any
    textProps = {
        text: '',
        fontSize: 10,
        fill: '#000',
        stroke: '#f3585f',
        strokeStyle: '#f3585f',
        strokeWidth: 1,
        fontFamily: 'Times New Roman',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'left',
        underline: false,
        diameter: 250,
        kerning: 0,
        flipped: false,
        textLimit: 0,
        personalize: false
    }
    fontFileId = null

    imageModalRef: BsModalRef
    bpmModal: BsModalRef
    imageChangedEvent: any
    croppedImage: any
    selectedFile: any
    imageAspectRatio = 1
    saveLoading = false
    backLoading = false

    dataStatus = 'fetching'
    spinnerSVG = `/assets/images/rolling-main.svg`
    imgDesc: any
    modalRef: BsModalRef
    libDeleteModalRef: BsModalRef
    folderList: any = []
    folderFileList: any = []
    recentFileList: any = []
    folderId: any = 0
    previousFolderId: any = 0
    parentId: any = 0

    searchKeyword = ''
    searchKeyword$: Subject<string> = new Subject<string>()
    searchKeywordSub: any
    backId = 0
    backIds = []

    productFontList: any = []
    productFontFileList: any = []
    fetchingFontFiles = false
    noArtwork = true
    addDesign = false
    imgDesign = false
    imgPersoalize = false
    activeTab = 'property'
    activeElevation = 0
    userLibList: any = []
    selectedLibFile: any

    selectedId: any
    selectedIndex = -1
    libDeleteLoading = false
    clicked = false
    credentailToken: any
    productDetail: any = []
    fetchProduct = false
    propertyStatus = false
    oldScale = 1
    transformScale = 1
    scalePadding = 0
    progress: number = 0
    imagesResolutionPass: boolean = true
    productVariants = []
    activeColour = -1
    customParams = [
        'ktype', 'background-image', 'parentX', 'parentY',
        'parentWidth', 'parentHight', 'sepod_id', 'sepod_box_id',
        'formFixLength', 'formLabel', 'formRequired', 'formDefaultText',
        'formMaxSize', 'formAllowType', 'lib_file_id', 'fontId', 'pFontId', 'fpersonalize',
        'imgScaleX', 'imgScaleY', 'imgWidth', 'imgHeight', 'textLimit', 'personalize', 'textCurved',
        'originalTop', 'originalLeft',
        'text', 'diameter', 'kerning', 'flipped', 'fill', 'fontFamily', 'fontSize',
        'fontWeight', 'fontStyle', 'strokeStyle', 'strokeWidth', 'textAlign', 'TextCurved', 'resolution', 'fileName'
    ]
    baseUrl: string

    constructor(
        private render: Renderer2,
        public ds: DataService,
        public api: ApiService,
        private fb: FormBuilder,
        private alert: IAlertService,
        public ms: BsModalService,
        public ui: UIHelpers,
        private router: Router,
        private route: ActivatedRoute,
        protected _zone: NgZone,
        private changeDetectorRef: ChangeDetectorRef,
        private modalService: BsModalService,
        private rd: Renderer2,
        private compressImage: CompressImageService,
        private elementRef: ElementRef
    ) {
        this.baseUrl = apis.baseUrl
        this.ds.activeTab = 'personalized-region'
        this.api.isfullScreen = true
        this.ds.productId = this.route.snapshot.queryParamMap.get('id')

        this.dataForm = this.fb.group({
            id: new FormControl(null),
            width: new FormControl(null, [Validators.required]),
            scale_slider: new FormControl(100),
            height: new FormControl(null, [Validators.required]),
            x: new FormControl(null, [Validators.required]),
            y: new FormControl(null, [Validators.required]),
            rotate: new FormControl(null),

        })

        this.textDataForm = this.fb.group({
            required: new FormControl(0),
            fixed_length: new FormControl(90),
            label: new FormControl('sample label'),
            personalize: new FormControl(0)
        })
        this.curvedDataForm = this.fb.group({
            required: new FormControl(0),
            fixed_length: new FormControl(90),
            label: new FormControl('curved label'),
            personalize: new FormControl(0)
        })

        this.imageDataForm = this.fb.group({
            ppi: new FormControl(0),
            ppc: new FormControl(0),
            required: new FormControl(0),
            personalize: new FormControl(0),
        })
        this.newFolderForm = this.fb.group({
            parent_id: new FormControl(null),
            name: new FormControl(null, [Validators.required])
        })

        this.dataForm.valueChanges.subscribe((data) => {
            this.updateDesignDimensions()
        })



        this.textDataForm.valueChanges.subscribe((data) => {
            // console.log(data);
            this.selectedItem.set('formFixLength', this.textDataForm.controls.fixed_length.value)
            this.selectedItem.set('formLabel', this.textDataForm.controls.label.value)
            this.selectedItem.set('formRequired', this.textDataForm.controls.required.value)
            this.selectedItem.set('fpersonalize', this.textDataForm.controls.personalize.value)


        })
        this.curvedDataForm.valueChanges.subscribe((data) => {
            // console.log(data);
            this.selectedItem.set('formFixLength', this.curvedDataForm.controls.fixed_length.value)
            this.selectedItem.set('formLabel', this.curvedDataForm.controls.label.value)
            this.selectedItem.set('formRequired', this.curvedDataForm.controls.required.value)
            this.selectedItem.set('fpersonalize', this.curvedDataForm.controls.personalize.value)

        })

        this.imageDataForm.valueChanges.subscribe((data) => {
            // console.log(data);
            this.selectedItem.set('formRequired', this.imageDataForm.controls.required.value)
            this.selectedItem.set('fpersonalize', this.textDataForm.controls.personalize.value)
            this.selectedItem.set('fpersonalize', this.curvedDataForm.controls.personalize.value)
        })

        this.route.queryParams.subscribe(params => {
            if (params.keyword) {
                this.searchKeyword = params.keyword
            }

            if (params) {
                // this.getfolderList()
                // this.getFolderFileList()
                this.getUserLibList()
            }
        })

        this.searchKeywordSub = this.searchKeyword$.pipe(
            debounceTime(1000), //  wait 1 sec after the last event before emitting last event
            distinctUntilChanged(), //  only emit if value is different from previous value
        ).subscribe(searchKeyword => {
            //  this.page = 1
            // this.getfolderList()
            // this.getFolderFileList()
            this.getUserLibList()
        })

        // const params = {
        //     id: this.ds.productId
        // }


        this.fetchImages()

        this.getUserLibList()
    }

    getFontFiles(id) {
        // this.productFontFileList = []
        // const font = this.productFontList.find(d => d.font_id = id)
        // // console.log('i', font,'fonts', this.productFontList,'fontId',id);
        // if (font !== 'undefined') {
        //     this.productFontFileList = font.font.font_weight

        if (id || this.fontFileId) {
            this.fontFileId = id
        }
        this.loadFont()
        // }
    }

    showAllcolorsBox() {
        this.showBox = !this.showBox

    }

    ngOnDestroy(): void {
        this.api.isfullScreen = true
        this.searchKeywordSub.unsubscribe()
        this.newMockupId.unsubscribe()
        this.api.isfullScreen = true
    }

    changeElevation(i: any) {
        this.activeElevation = i
    }

    getUserLibList() {
        const params = {
            keyword: this.searchKeyword
        }
        this.ds.getUserLibList(params).subscribe((resp: any) => {
            if (resp.success === true) {
                this.userLibList = resp.data
                // this.selectedLibFile = this.userLibList.find(v => v.id === id)
            } else {
                this.alert.error(resp.errors.general)
            }
        })
    }


    addPrintArea(img) {
        const rect: fabric.Rect = new fabric.Rect({
            // left: (this.canvasData.containerSize.width/2),
            // top: (this.canvasData.containerSize.height/2),
            width: this.canvasData.containerSize.width,
            height: this.canvasData.containerSize.height,
            strokeDashArray: [5, 5],
            fill: 'transparent',
            stroke: '#f00',
            strokeWidth: 1,
            ktype: 'print-area',
            originX: 'center',
            originY: 'center',
            selectable: false,
            cornerStyle: 'circle',
            transparentCorners: false,
            // borderColor:'black',
            // cornerColor:'light blue'
            cornerSize: 6
        })
        rect.setControlsVisibility({
            mtr: false
        })

        this._canvas.centerObject(rect)

        this._canvas.add(rect)
        this._canvas.renderAll()
        // this.printArea = 1
        if (img.pa_width != null && img.pa_height) {
            this.selectedItem = rect

            rect.set('width', (img.pa_width / this.selectedItem.scaleX))
            rect.set('height', (img.pa_height / this.selectedItem.scaleY))
            // rect.set('top', ((img.pa_y / this.selectedItem.scaleX) - 1))
            // rect.set('left', ((img.pa_x / this.selectedItem.scaleY) - 1))
            rect.set('top', (img.pa_y / this.selectedItem.scaleY) + (this.selectedItem.height / 2))
            rect.set('left', (img.pa_x / this.selectedItem.scaleX) + (this.selectedItem.width / 2))

        }
        this.selectedPrintArea = rect
        console.log('this.Rect top le::', rect.top, rect.left)
        // this.canvasWrapper.nativeElement.style.top = (img.pa_y / this.selectedItem.scaleX) - 1 + 'px'
        // this.canvasWrapper.nativeElement.style.left = (img.pa_x / this.selectedItem.scaleY) - 1 + 'px'
        this.selectedItem.setCoords()
        this._canvas.renderAll()
    }

    angleChange(e: Event) {
        this.selectedItem = this._canvas.getActiveObject()
        const x = this.selectedItem.left
        const y = this.selectedItem.top
        const ang = +(e.target as HTMLInputElement).value

        //      console.log(this.selectedItem, ang)
        // this.selectedItem.set('angle', ang)
        // this.selectedItem.set('left', 0)
        // this.selectedItem.set('top', y - ang)
        //        console.log(this._canvas.getActiveObject())
        // this.dataForm.controls.x.setValue(x + 1, { emitEvent: false })
        // this.dataForm.controls.y.setValue(y - 1, { emitEvent: false })

        // this.selectedItem.originX='center'
        // this.selectedItem.originY='center'
        this.selectedItem.rotate(ang)
        this.selectedItem.setCoords()
        // this.selectedItem.originX='top'
        // this.selectedItem.originY='left'
        this.selectedItem.setCoords()
        this._canvas.renderAll()

    }

    widthChange(e: Event) {

        const nWidth = +(e.target as HTMLInputElement).value
        const ratio = this.selectedItem.height / this.selectedItem.width
        this.dataForm.controls.height.setValue((nWidth * ratio), { emitEvent: false })
        this.getImageResolution()
    }

    heightChange(e: Event) {
        const nHeight = +(e.target as HTMLInputElement).value
        const ratio = this.selectedItem.width / this.selectedItem.height
        this.dataForm.controls.width.setValue((nHeight * ratio), { emitEvent: false })
        this.getImageResolution()
    }

    searchKeywordChange(value: string) {
        this.searchKeyword$.next(value)
    }

    ngOnInit() {
        this.ds.activeTab = 'personalized-region'
        this.api.isfullScreen = true
        this.getProductDetail()

        this.newMockupId = this.ds.newMockupId.subscribe(res => {
            this.fetchImages()
        })

        this.loadFont()


        this.ds.allFontList().subscribe((resp: any) => {
            if (resp.success === true) {
                this.productFontList = resp.data

                this.productFontList.forEach(font => {


                    const customFont = new FontFace(font.file_name, 'url(' + this.baseUrl + '/public/font/download/' + font.id + ')')
                    customFont.load().then((font) => {
                        document['fonts'].add(font)
                    })
                })
            } else {
                this.alert.error(resp.errors.general)
            }
        })



    }

    get g() {
        return this.dataForm.controls
    }
    get t() {
        return this.textDataForm.controls
    }
    get c() {
        return this.curvedDataForm.controls
    }

    get i() {
        return this.imageDataForm.controls
    }
    get newFold() {
        return this.newFolderForm.controls
    }

    initializeColorPicker() {

        this.colorPicker = iro.ColorPicker('#color-picker', {
            width: 100,
            color: '#66f7ff',
            wheelLightness: false
        })

        this.colorPicker.on('color:change', (color) => {
            this.textProps.fill = color.hexString
            const textItem: fabric.IText = this.selectedItem
            this.selectedItem.set('fill', color.hexString)

            this._canvas.renderAll()
        })
    }

    @HostListener('window:resize', ['$event'])
    onWindowResize(event) {
        this.resizeCanvas()
    }


    fetchImages() {
        this.dataStatus = 'fetching'
        const param = {
            id: this.ds.productId
        }
        this.ds.imagesList(param).subscribe(resp => {
            if (resp.success === true) {
                // this.selectedImage = resp?.data[0]
                this.productImages = resp.data
                if (this.productImages.length > 0) {
                    this.ds.defaultMockupId = this.productImages[0].mockup_id
                    this.selectedNewImg = this.productImages[0]
                    this.selectImage(this.selectedNewImg)
                }
                this.dataStatus = 'done'
            } else {
                this.alert.error(resp.errors.general)
                this.dataStatus = 'done'
            }
        })
    }

    initializeCanvas() {
        fabric.Object.NUM_FRACTION_DIGITS = 10
        //  this._zone.runOutsideAngular( () => {
        this._canvas = new fabric.Canvas('main-canvas', {
            // backgroundColor: '#fff', //  '#ebebef',
            selection: false,
            preserveObjectStacking: true,
        })

        setTimeout(this.resizeCanvas.bind(this), 200)
        this._canvas.on('mouse:down', this.canvasMouseDown.bind(this))
        // this._canvas.on('mouse:move', this.canvasMouseMove.bind(this))
        this._canvas.on('mouse:dblclick', this.canvasMouseClick.bind(this))
        this._canvas.on('mouse:up', this.canvasMouseUp.bind(this))
        this._canvas.on('object:scaling', this.objectScaling.bind(this))
        this._canvas.on('mouse:out', this.getAllImagesResolution.bind(this))
        this._canvas.on('key:down', this.onKeyDown.bind(this))


        // this._canvas.on('after:render', this.boundingBox.bind(this))
        // this._canvas.on('object:modified', this.objectModified.bind(this))

        this._canvas.on('mouse:wheel', this.objectZoom.bind(this))
        // this._canvas.on('object:moving', this.objectMoving.bind(this))
        // })
        // this._zone.run(() => this._canvas.on('mouse:down', this.canvasMouseDown.bind(this)))

        this._canvas.on('object:rotating', this.checkRotating.bind(this))



    }

    onKeyDown(event) {
        const STEP = 1
        event.preventDefault()
        let keyCode = event.keyCode || event.which
        let activeGroup = this._canvas.getActiveObjects()
        if (Array.isArray(activeGroup)) {
            activeGroup.forEach(obj => {
                switch (keyCode) {
                    case 37: // left
                        obj.left = obj.left - STEP
                        break
                    case 38: // up
                        obj.top = obj.top - STEP
                        break
                    case 39: // right
                        obj.left = obj.left + STEP
                        break
                    case 40: // down
                        obj.top = obj.top + STEP
                        break
                }
                obj.setCoords()
            })
        }

    }


    checkRotating(event: fabric.IEvent) {
        const obj: any = event.target
        obj.setCoords()
        var left = obj.oCoords.tl.x,

            top = obj.oCoords.tl.y
        console.log('left:', left, 'top:', top)
    }

    resizeCanvas(width = null, height = null) {

        this.canvasData.containerSize = {
            width: this.canvasWrapper.nativeElement.offsetWidth,
            height: this.canvasWrapper.nativeElement.offsetHeight
        }

        const canvasSize = {
            width: width ? width : this.canvasData.containerSize.width,
            height: height ? height : this.canvasData.containerSize.height
        }

        //  this._canvas.setWidth(canvasSize.width)
        //  this._canvas.setHeight(canvasSize.height)
        this._canvas.setDimensions(canvasSize, { backstoreOnly: true })
        this._canvas.setDimensions({
            width: this.canvasData.containerSize.width + 'px',
            height: this.canvasData.containerSize.height + 'px'
        }, { cssOnly: true })

        //  zoom ratio with respect to canvas container size
        const scaleRatio = Math.min(this.canvasData.containerSize.width / canvasSize.width, this.canvasData.containerSize.height / canvasSize.height)
        //  No need to set it explicitly. Browser will set this automatically
        //  this._canvas.setZoom(scaleRatio)

        /*

        console.log('----------------------------------------------------')
        console.log('Container: ', this.canvasData.containerSize.width + 'x' + this.canvasData.containerSize.height)
        console.log('DB Canvas: ', canvasSize.width + 'x' + canvasSize.height)
        console.log('Zoom Level: ', scaleRatio, this._canvas.getZoom())

        */

    }

    browseImage() {
        // this.selectedPrintArea = this._canvas._objects[2]
        this.imageFile = null
        document.getElementById('image').click()
    }

    save(data: any, f: any) {
        const designContent = this._canvas.toJSON(['ktype', 'background-image'])
    }

    isOurItem(o: any): boolean {
        return o?.ktype === 'placeholder-image' || o?.ktype === 'placeholder-text' || o?.ktype === 'placeholder-curvedtext'
    }

    selectedItemChanged(oldItem) {
        this.resetScalingSlider()
    }

    setTextProps(textItem: fabric.IText) {
        this.textProps.text = textItem.text
        this.textProps.fontSize = textItem.fontSize
        this.textProps.fontFamily = textItem.fontFamily
        this.textProps.fontWeight = textItem.fontWeight.toString()
        this.textProps.fontFamily = textItem.fontFamily
        this.textProps.fontStyle = textItem.fontStyle
        this.textProps.textAlign = textItem.textAlign
        this.textProps.underline = textItem.underline
        this.textProps.fill = textItem.fill.toString()
    }

    objectScaling(event: fabric.IEvent) {
        if (this.selectedItem.ktype === 'placeholder-image') {
            this.selectedItemMetaData.initialScaledWidth = this.selectedItem.getScaledWidth()
            this.selectedItemMetaData.initialScaledHeight = this.selectedItem.getScaledHeight()
            this.dataForm.controls.scale_slider.setValue(100, { emitEvent: false })
        }
        else if (this.selectedItem.ktype === 'placeholder-text') {
            this.selectedItemMetaData.initialScaledWidth = this.selectedItem.getScaledWidth()
            this.selectedItemMetaData.initialScaledHeight = this.selectedItem.getScaledHeight()
            this.dataForm.controls.scale_slider.setValue(100, { emitEvent: false })
            // this.textProps.fontSize = +(this.selectedItem.fontSize * this.selectedItem.scaleX).toFixed(0)
            // this.textPropsChanged()
        }
    }
    objectZoom(opt: any) {
        this.initialZoom = 1
        let delta = opt.e.deltaY
        let zoom = this._canvas.getZoom()
        zoom *= 0.999 ** delta
        if (zoom > 20) zoom = 20
        if (zoom < 0.01) zoom = 0.01
        const zoomPoint = new fabric.Point(opt.e.offsetX, opt.e.offsetY) //  Center point
        this._canvas.zoomToPoint(zoomPoint, zoom)
        opt.e.preventDefault()
        opt.e.stopPropagation()
        // console.log(opt.e.offsetX, opt.e.offsetY)
    }
    objectModified(event: fabric.IEvent) {
        const obj: any = event.target
        if (this.isOurItem(obj)) {
            // if (this.selectedItem.ktype === 'placeholder-text') {
            //     this.textProps.fontSize = +(this.selectedItem.fontSize * this.selectedItem.scaleX).toFixed(0)
            //     this.selectedItem.scaleX = 1
            //     this.selectedItem.scaleY = 1
            //     this.textPropsChanged()
            // }
            const boundingRect = obj.getBoundingRect(true)
            const cW = boundingRect.width
            const cX = boundingRect.left
            const cH = boundingRect.height
            const cY = boundingRect.top

            //  empty width calculation
            const emptyWidth = this.selectedItem.parentWidth - cW
            const moveArea = this.selectedItem.parentX + emptyWidth
            const allowMoveArea = moveArea - cX

            //  empty hight calculation
            const emptyHeight = this.selectedItem.parentHight - cH
            const topMoveArea = this.selectedItem.parentY + emptyHeight
            const allowTopMoveArea = topMoveArea - cY

            //  console.log('cw',cW,'parentWidth', this.selectedItem.parentWidth,'cx',cX,'moveArea', moveArea, 'moveAllow',allowMoveArea)

            if (allowMoveArea <= 0 || cX <= this.selectedItem.parentX
                || allowTopMoveArea <= 0 || cY <= this.selectedItem.parentY
            ) {
                obj.top = obj.parentY
                obj.left = obj.parentX
                obj.setCoords()
            }

            if (cW > this.selectedItem.parentWidth || cH > this.selectedItem.parentHight) {
                //  console.log('wid increas not allow')
                //  console.log('widretu',((this.selectedItem.parentWidth)/this.selectedItem.scaleX) - 1 )
                //  console.log('width', this.selectedItem.width)
                //  console.log('scaleWidth',obj.getScaledWidth())
                this.selectedItem.set('width', ((this.selectedItem.parentWidth - 1) / this.selectedItem.scaleX) - 1)
                this.selectedItem.set('height', ((this.selectedItem.parentHight - 1) / this.selectedItem.scaleY) - 1)

                obj.setCoords()

            }
            this._canvas.renderAll()
        }

        obj.setCoords()
        this._canvas.renderAll()
    }

    canvasMouseMove(event: fabric.IEvent) {
        if (this.selectedItem !== null) {
            this.updateDimensions()
        }
    }

    canvasMouseClick(event: fabric.IEvent) {
        if (event.target.type === 'rect' && event.target.ktype === 'print-area') {
            this.selectedPrintArea = event.target
            //  this.dataForm.reset()
            //  this.imageDataForm.reset()
            //  this.textDataForm.reset()
            this._canvas._objects.forEach(e => {
                if (e.type === 'rect') {
                    e.set('stroke', '#f00')
                }
            })
            this.printAreaMenu = 'show'
            const obj: any = event.target
            obj.set('stroke', '#4287f5')
            obj.setCoords()
            this._canvas.renderAll()
        }
    }

    canvasMouseDown(event: fabric.IEvent) {


        console.log(event.target)


        if (event.target !== null && this.isOurItem(event.target)) {
            if (this.selectedItem !== event.target) {
                this.selectedItemChanged(this.selectedItem)
            }
            this.selectedItem = event.target
            // console.log(this.selectedItem)

            // if(this.selectedItem.ktype === 'placeholder-text') {
            //     const R = this.selectedItem.getCenterPoint()
            //     let x2 = this.selectedItem.left - R.x
            //     let y2 = this.selectedItem.top - R.y
            //     let angle =  (360 - this.selectedItem.angle)
            //     const radian = (angle * Math.PI) / 180
            //     const r = this.selectedItem.getScaledWidth() / 2
            //     angle = radian
            //     let x = (x2 * Math.cos(angle)) - (y2 * Math.sin(angle))
            //     let y = (x2 * Math.sin(angle)) + (y2 * Math.cos(angle))
            //     x = x + R.x
            //     y = y + R.y
            //     console.log('x2', x2, 'y2', y2)
            //     console.log('x', x, 'y', y, 'angle', angle, R.x, R.y)
            //     console.log('x+y', x+y, 'radius', r, Math.PI)
            // }

            this.updateDimensions()

            if (this.selectedItem !== null && this.selectedItem.ktype !== 'placeholder-image') {
                this.getImageResolution()
            }
        }
    }
    setOriginalCoordns() {

        const R = this.selectedItem.getCenterPoint()
        let x2 = this.selectedItem.left - R.x
        let y2 = this.selectedItem.top - R.y
        let angle = (360 - this.selectedItem.angle)
        const radian = (angle * Math.PI) / 180
        const r = this.selectedItem.getScaledWidth() / 2
        angle = radian
        let x = (x2 * Math.cos(angle)) - (y2 * Math.sin(angle))
        let y = (x2 * Math.sin(angle)) + (y2 * Math.cos(angle))
        x = x + R.x
        y = y + R.y
        this.selectedItem.originalTop = y
        this.selectedItem.originalLeft = x
        // console.log('x2', x2, 'y2', y2)
        // console.log('x', x, 'y', y, 'angle', angle, R.x, R.y)
        // console.log('x+y', x+y, 'radius', r, Math.PI)
    }

    updateBackgroundColor(varient) {
        if (varient.color_code && varient.image_exists === 0) {
            this._canvas._objects[0].backgroundColor = varient.color_code
            this._canvas.backgroundColor = ''
        } else if (varient.image_exists === 1) {
            this._canvas.backgroundColor = new fabric.Pattern({ source: this.baseUrl + '/public/product-variant-image/' + varient.id, repeat: 'repeat' })
            this._canvas._objects[0].backgroundColor = '#000'
            this._canvas.requestRenderAll.bind(this)
            this._canvas._objects[0].backgroundColor = ''
        } else {
            this._canvas._objects[0].backgroundColor = ''
            this._canvas.backgroundColor = ''
        }

        setTimeout(this.resizeCanvas.bind(this), 2000)
        this._canvas._objects[0].setCoords()
        this._canvas.renderAll.bind(this)

    }



    canvasMouseUp(event: fabric.IEvent) {
        if (this.selectedItem === null) return

        if (this.selectedItem.ktype === 'placeholder-image' || this.selectedItem.ktype === 'placeholder-curvedtext' || this.selectedItem.ktype === 'placeholder-text') {
            this.activeTab = 'property'
        }
        // this.selectedItem = null
        // this.selectedItem = event.target
        if (this.selectedItem !== null && this.selectedItem.ktype !== 'print-area') {
            this.updateDimensions()
            if (this.selectedItem !== null && this.selectedItem.ktype === 'placeholder-image') {
                this.getImageResolution()
            }
        }
        console.log('canvasMouseUp')
    }

    updateDimensions() {

        console.log('this.selectedItem:', this.selectedItem)

        const w = this.selectedItem.getScaledWidth()
        const h = this.selectedItem.getScaledHeight()

        const x = Math.round(((this.selectedItem.left - ((this.selectedItem.width * this.selectedItem.scaleX) / 2)) - (this.selectedPrintArea.left - (this.selectedPrintArea.width * this.selectedPrintArea.scaleX) / 2)))
        const y = Math.round(((this.selectedItem.top - ((this.selectedItem.height * this.selectedItem.scaleY) / 2)) - (this.selectedPrintArea.top - (this.selectedPrintArea.height * this.selectedPrintArea.scaleY) / 2)))

        if (this.selectedItemMetaData.initialScaledWidth === 0) {
            this.selectedItemMetaData.initialScaledWidth = w
            this.selectedItemMetaData.initialScaledHeight = h
        }

        // console.log('w:', w, 'h:', h, 'x:', x, 'y:', y, 'imgW:', this.selectedItem.imgWidth, 'imgH:', this.selectedItem.imgHeight)

        // this.dataForm.controls.scale_slider.setValue(100, { emitEvent: false })
        this.dataForm.controls.height.setValue(h / this.printRatioH, { emitEvent: false })
        this.dataForm.controls.width.setValue(w / this.printRatioW, { emitEvent: false })

        // this.dataForm.controls.height.setValue(this.selectedItem.imgHeight, { emitEvent: false })
        // this.dataForm.controls.width.setValue(this.selectedItem.imgWidth, { emitEvent: false })



        this.dataForm.controls.x.setValue(x, { emitEvent: false })
        this.dataForm.controls.y.setValue(y, { emitEvent: false })
        this.dataForm.controls.rotate.setValue(this.selectedItem.angle, { emitEvent: false })


        if (this.selectedItem.ktype === 'placeholder-text') {
            this.textProps.text = this.selectedItem.text
            this.textProps.fontWeight = this.selectedItem.fontWeight
            this.textProps.fontSize = this.selectedItem.fontSize
            this.textProps.fontFamily = this.selectedItem.fontFamily
            this.textProps.fontStyle = this.selectedItem.fontStyle
            this.textProps.textAlign = this.selectedItem.textAlign
            this.textProps.fill = this.selectedItem.fill
            this.textProps.stroke = this.selectedItem.stroke
            this.textProps.strokeWidth = this.selectedItem.strokeWidth
            this.textProps.textLimit = this.selectedItem.textLimit
            this.textProps.personalize = this.selectedItem.personalize

            this.textDataForm.controls.fixed_length.setValue(this.selectedItem.formFixLength, { emitEvent: false })
            this.textDataForm.controls.label.setValue(this.selectedItem.formLabel, { emitEvent: false })
            this.textDataForm.controls.required.setValue(this.selectedItem.formRequired, { emitEvent: false })
            this.fontId = +this.selectedItem.pFontId
            this.fontFileId = +this.selectedItem.fontId
            if (this.fontId > 0) {
                // this.getFontFiles(this.fontId)
            }
        } else if (this.selectedItem.ktype === 'placeholder-curvedtext') {
            this.textProps.diameter = this.selectedItem.diameter
            this.textProps.flipped = this.selectedItem.flipped
            this.textProps.kerning = this.selectedItem.kerning
            this.textProps.text = this.selectedItem.text
            this.textProps.fontWeight = this.selectedItem.fontWeight
            this.textProps.fontSize = this.selectedItem.fontSize
            this.textProps.fontFamily = this.selectedItem.fontFamily
            this.textProps.fontStyle = this.selectedItem.fontStyle
            this.textProps.textAlign = this.selectedItem.textAlign
            this.textProps.fill = this.selectedItem.fill
            this.textProps.strokeStyle = this.selectedItem.strokeStyle
            this.textProps.strokeWidth = this.selectedItem.strokeWidth
            this.textProps.textLimit = this.selectedItem.textLimit
            this.textProps.personalize = this.selectedItem.personalize

            this.curvedDataForm.controls.fixed_length.setValue(this.selectedItem.formFixLength, { emitEvent: false })
            this.curvedDataForm.controls.label.setValue(this.selectedItem.formLabel, { emitEvent: false })
            this.curvedDataForm.controls.required.setValue(this.selectedItem.formRequired, { emitEvent: false })
            this.fontId = +this.selectedItem.pFontId
            this.fontFileId = +this.selectedItem.fontId
            if (this.fontId > 0) {
                // this.getFontFiles(+this.selectedItem.fontId)
            }
        }
        else if (this.selectedItem.ktype === 'placeholder-image') {
            this.getImageResolution()
            // this.imageDataForm.patchValue({max_size:this.selectedItem.formMaxSize})
            // this.imageDataForm.patchValue({allowed_type:this.selectedItem.formAllowType})
        }
    }


    updateDesignDimensions() {

        const scale = (this.dataForm.value.width / this.selectedPrintArea.width) * 100

        console.log('scale:', scale)


        if (this.selectedItem.ktype === 'placeholder-image') {
            this.selectedItem.set('scaleX', (this.dataForm.value.width * this.printRatioW) / this.selectedItem.width)
            this.selectedItem.set('scaleY', (this.dataForm.value.height * this.printRatioH) / this.selectedItem.height)
            this.getImageResolution()
        }
        else if (this.selectedItem.ktype === 'placeholder-curvedtext') {
            this.selectedItem.set('scaleX', (this.dataForm.value.width * this.printRatioW) / this.selectedItem.width)
            this.selectedItem.set('scaleY', (this.dataForm.value.height * this.printRatioH) / this.selectedItem.height)
        }
        else if (this.selectedItem.ktype === 'placeholder-text') {
            this.selectedItem.set('scaleX', (this.dataForm.value.width * this.printRatioW) / this.selectedItem.width)
            this.selectedItem.set('scaleY', (this.dataForm.value.height * this.printRatioH) / this.selectedItem.height)
            // this.selectedItem.set('fontSize', this.dataForm.value.fontSize)
            // this.selectedItem.fontSize = this.textProps.fontSize = this.selectedItem.fontSize

        }

        this.selectedItem.set('top', this.selectedPrintArea.top - (this.selectedPrintArea.height / 2) + this.dataForm.controls.y.value + (this.selectedItem.height * this.selectedItem.scaleY) / 2)
        this.selectedItem.set('left', this.selectedPrintArea.left - (this.selectedPrintArea.width / 2) + this.dataForm.controls.x.value + (this.selectedItem.width * this.selectedItem.scaleX) / 2)


        this.selectedItem.setCoords()
        this._canvas.renderAll()
    }

    last() {
        // come on last
        if (this.selectedItem != null) {
            this._canvas.sendToBack(this.selectedItem)
            this._canvas.bringForward(this.selectedItem, true)  // selecte Item come 1 step fraward from bg-img
            this._canvas.bringForward(this.selectedItem, true)  // selecte Item come 1 step again fraward from print-area
            this._canvas.renderAll()
        }
    }

    front() {
        // come on one step  front
        if (this.selectedItem != null) {
            // console.log(this.selectedItem)
            this._canvas.bringForward(this.selectedItem, true)
            this._canvas.renderAll()
        }

    }

    top() {
        // come one front
        if (this.selectedItem != null) {
            // console.log(this.selectedItem)
            // console.log('come on front')
            this._canvas.bringToFront(this.selectedItem)
            this._canvas.renderAll()
        }
    }

    back() {

        // one step back

        if (this.selectedItem != null) {
            // console.log(this.selectedItem)

            this._canvas.sendBackwards(this.selectedItem, true)
            const o = this._canvas._objects[0]
            const obj = this._canvas._objects[1]

            // If Its move to last then come two step forward form bg-imag and print-area
            if (o.ktype !== 'background-image' && o.ktype !== 'print-area') {
                this._canvas.bringForward(this.selectedItem, true)
                this._canvas.bringForward(this.selectedItem, true)

            }

            // If Its move to after the print-area come forward form  print-area
            if (obj.ktype !== 'background-image' && obj.ktype !== 'print-area') {
                this._canvas.bringForward(this.selectedItem, true)

            }

            this._canvas.renderAll()
        }

    }

    sliderChange(e: Event) {
        const p = +(e.target as HTMLInputElement).value / 100

        if (this.selectedItem.ktype === 'placeholder-image') {
            this.dataForm.controls.width.setValue(this.selectedItemMetaData.initialScaledWidth * p, { emitEvent: false })
            this.dataForm.controls.height.setValue(this.selectedItemMetaData.initialScaledHeight * p, { emitEvent: false })
            this.getImageResolution()
        }

        if (this.selectedItem.ktype === 'placeholder-text') {
            // this.textProps.fontSize = this.selectedItemMetaData.initialFontSize * p
            // this.textPropsChanged()
            this.dataForm.controls.width.setValue(this.selectedItemMetaData.initialScaledWidth * p, { emitEvent: false })
            this.dataForm.controls.height.setValue(this.selectedItemMetaData.initialScaledHeight * p, { emitEvent: false })
        }
        if (this.selectedItem.ktype === 'placeholder-curvedtext') {
            // this.textProps.fontSize = this.selectedItemMetaData.initialFontSize * p
            // this.textPropsChanged()
            this.dataForm.controls.width.setValue(this.selectedItemMetaData.initialScaledWidth * p, { emitEvent: false })
            this.dataForm.controls.height.setValue(this.selectedItemMetaData.initialScaledHeight * p, { emitEvent: false })
        }
    }

    resetScalingSlider() {
        this.selectedItemMetaData = {
            initialScaledWidth: 0,
            initialScaledHeight: 0,
            initialFontSize: this.defaultFontSize
        }
        this.dataForm.controls.scale_slider.setValue(100, { emitEvent: false })
    }

    placeFile(id) {
        this.libFileId = id
        // this.selectedPrintArea = this._canvas._objects[2]
        this.selectedLibFile = this.userLibList.find(v => v.id === id)
        console.log(this.selectedLibFile)

        this.cropComplete()


        // this.ds.getFile(id).subscribe(resp => {
        //     this.imageChangedEvent = null
        //     this.imageFile = resp

        //     this.imageModalRef = this.modalService.show(this.imageCropTemplate, {
        //         class: 'modal-l modal-dialog-centered admin-panel'
        //     })

        //     // this.modalRef.hide()

        // })
    }

    openCroppingModal(event, contentRef: TemplateRef<any>) {
        const Actualfile = event.target.files[0]
        console.log('Actualfile', Actualfile)

        this.imgHight = Actualfile.clientHeight
        this.imgWidth = Actualfile.clientWidth
        this.selectedFile = Actualfile

        const allowedExtensions = ['png', 'jpg', 'jpeg']
        const extension = Actualfile.name.split('.').pop().toLowerCase()
        const fileSize = Actualfile.size / 1024 / 1024
        if (fileSize > 100) {
            this.alert.error('File size must not exceed 100MB')
        } else if (allowedExtensions.indexOf(extension) < 0) {
            this.alert.error('Format type is invalid.Required formats are PNG,JPG,JPEG')
        } else {
            // this.imageAspectRatio = this.selectedItem.getScaledWidth() / this.selectedItem.getScaledHeight()
            // this.imageChangedEvent = event
            // this.imageModalRef = this.modalService.show(contentRef, {
            //     class: 'modal-xl modal-dialog-centered admin-panel'
            // })
            const reader = new FileReader()
            reader.readAsDataURL(Actualfile)
            reader.onloadend = (e: any) => {
                this.uploadDocument(reader.result, Actualfile)
            }

        }

        console.log(`Image size before compressed: ${Actualfile.size} bytes.`)

        this.compressImage
            .compress(Actualfile)
            .pipe(take(1))
            .subscribe((compressedImage) => {
                console.log(
                    `Image size after compressed: ${compressedImage.size} bytes.`
                )
                console.log('compressedImage', compressedImage)
                // now you can do upload the compressed image
            })
        // this.modalRef.hide()
    }

    uploadDocument(base64img, file) {

        fetch(base64img).then(res => res.blob()).then(blob => {

            const myFile = new Blob([blob]) // for microsoft edge support
            const formData = new FormData()
            formData.append('name', file.name)
            formData.append('file', myFile)
            formData.append('type', file.name.split('.').pop().toLowerCase())
            this.ds.addFile(formData).subscribe((event: HttpEvent<any>) => {
                switch (event.type) {
                    case HttpEventType.Sent:
                        // console.log('Request has been made!')
                        break
                    case HttpEventType.ResponseHeader:
                        // console.log('Response header has been received!')
                        break
                    case HttpEventType.UploadProgress:
                        this.progress = Math.round(event.loaded / event.total * 100)
                        // console.log(`Uploaded! ${this.progress}%`)
                        break
                    case HttpEventType.Response:
                        // console.log('User successfully created!', event.body)
                        if (event.body.success === true) {
                            this.userLibList.push(event.body.data)
                            this.selectedLibFile = event.body.data
                            console.log('this.selectedLibFile:', this.selectedLibFile)
                            this.alert.success(`${file.name.split('.')[0]} added!`)
                            this.activeTab = 'loader'
                            this.cropComplete()

                        } else {
                            this.alert.error(event.body.errors.general)
                        }
                        setTimeout(() => {
                            this.progress = 0
                        }, 500)
                }
                // if (resp.success === true) {
                //     this.userLibList.push(resp.data)
                //     this.selectedLibFile = resp.data
                //     console.log('this.selectedLibFile:', this.selectedLibFile)
                //     this.alert.success(`${file.name.split('.')[0]} added!`)
                //     this.cropComplete()
                // } else {
                //     this.alert.error(resp.errors.general)
                // }
            })
        })

    }


    duplicateObject() {
        // clone what are you copying since you
        this._canvas.getActiveObject().clone((cloned) => {
            this._clipboard = cloned
            this._clipboard.clone((clonedObj) => {

                this._canvas.discardActiveObject()
                clonedObj.set({
                    left: clonedObj.left + 10,
                    top: clonedObj.top + 10,
                    evented: true,
                })


                this._canvas.add(clonedObj)
                // this._clipboard.top += 10;
                // this._clipboard.left += 10;

                this._canvas.setActiveObject(clonedObj)
                this._canvas.requestRenderAll()
            })

        }, this.customParams)
    }

    selectImage(img: any) {


        this.printRatioH = img.pa_height / img.elevation.p_height
        this.printRatioW = img.pa_width / img.elevation.p_width

        this.selectedImage = img
        this.selectedItem = null

        // const w = img.elevation.p_width //  img.width
        // const h = img.elevation.p_height //  img.height

        // const w = img.pa_width //.p_width //  img.width
        // const h = img.pa_height //.p_height //  img.height

        const w = this.canvasData.canvasSize.width
        const h = this.canvasData.canvasSize.height

        this.canvasWrapper.nativeElement.style.width = w + 'px'
        this.canvasWrapper.nativeElement.style.height = h + 'px'

        console.log('this._canvas', this._canvas)
        if (this._canvas == null) {
            console.log('initializeCanvas() called')
            this.initializeCanvas()
        } else {
            this._canvas.clear()
            this.resizeCanvas(w, h)
        }
        this.resetZoom()
        this.canvasData.loadingCanvas = true
        const imgURL = this.api.elevationImg(img.mockup_id, img.elevation_id)
        this.productBgImageUrl = this.api.baseProductImageUrl(img.id)

        this.ds.getPrintAreas({ elevation_id: img.elevation.id, product_id: this.ds.productId }).subscribe((resp: any) => {

            if (resp.success && resp.data !== null) {
                this.imgDesc = img.elevation.description// resp.data.description

                const design_content = JSON.parse(resp.data.design_content)
                const curveTextObjects = []
                design_content.objects.forEach((object, index) => {
                    if (object.ktype === 'placeholder-curvedtext') {
                        curveTextObjects.push(object)
                        design_content.objects.splice(index, 1)
                    }
                })

                this._canvas.loadFromJSON(design_content, () => {

                    this._canvas.getObjects('group').forEach(g => {
                        g.setControlsVisibility({
                            mt: false,
                            mb: false,
                            ml: false,
                            mr: false,
                            tr: false,
                            tl: false,
                            br: false,
                            bl: false,
                            mtr: false
                        })
                        //  g.set('lockMovementX', true)
                        //  g.set('lockMovementY', true)
                        //  g.set('lockScalingFlip', true)
                        //  g.set('lockMovementX', true)
                        //  g.set('lockMovementY', true)
                        //  g.set('lockRotation', true)
                        g.setCoords()
                    })
                    // this._canvas._objects[0].strokeWidth = 0
                    this.canvasData.loadingCanvas = false
                    this._canvas.renderAll()

                    this._canvas.getObjects().forEach(e => {

                        if (e.ktype == 'print-area') {
                            e.selectable = false
                            this.selectedPrintArea = e
                        }
                        if (e.ktype == 'background-image') {
                            this._canvas.remove(e)
                        }

                        e.setControlsVisibility({
                            mtr: true
                        })
                        e.cornerStyle = 'circle',
                            e.transparentCorners = false,
                            //  borderColor:'black',
                            //  cornerColor:'light blue'
                            e.cornerSize = 6
                    })

                    // this.canvasWrapper.nativeElement.style.top = (img.pa_y / this.selectedPrintArea.scaleX) - 1 + 'px'
                    // this.canvasWrapper.nativeElement.style.left = (img.pa_x / this.selectedPrintArea.scaleY) - 1 + 'px'

                    console.log('imgURL:', imgURL)

                    setTimeout(() => {
                        fabric.Image.fromURL(imgURL, (image: fabric.Image) => {
                            // image.backgroundColor = '#FF0000'
                            // image.fill='#FF0000'
                            // const w = this._canvas.getWidth()*0.75
                            image.ktype = 'background-image'
                            image.scaleToWidth(400)

                            image.scaleToHeight(400)
                            image.selectable = false
                            this._canvas.add(image)
                            this._canvas.centerObject(image)
                            this._canvas.sendToBack(this._canvas._objects[this._canvas.getObjects().length - 1])
                            this._canvas.renderAll()
                        }, { crossOrigin: 'Anonymous' })
                        this.canvasData.loadingCanvas = false
                        this.addDesign = true
                        this.noArtwork = false


                        curveTextObjects.forEach(curveTextObject => {
                            this.addTextCurved(curveTextObject.text)
                            this._canvas.bringToFront(this.selectedItem)
                            this.selectedItem.set("width", curveTextObject.width)
                            this.selectedItem.set("height", curveTextObject.height)

                            this.selectedItem.set("left", curveTextObject.left)
                            this.selectedItem.set("top", curveTextObject.top)
                            this.selectedItem.set("angle", curveTextObject.angle)
                            this.selectedItem.set("flipped", curveTextObject.flipped)
                            this.selectedItem.set("fill", curveTextObject.fill)
                            this.selectedItem.set("strokeWidth", curveTextObject.strokeWidth)
                            this.selectedItem.set("strokeStyle", curveTextObject.strokeStyle)
                            this.selectedItem.set("sepod_id", curveTextObject.sepod_id)
                            this.selectedItem.set("imgHeight", curveTextObject.imgHeight)
                            this.selectedItem.set("imgWidth", curveTextObject.imgWidth)
                            this.selectedItem.set("diameter", curveTextObject.diameter)
                            this.selectedItem.set("kerning", curveTextObject.kerning)


                            this.selectedItem.set("fontFamily", curveTextObject.fontFamily)
                            this.selectedItem.set("fontSize", curveTextObject.fontSize)
                            this.selectedItem.set("fontId", curveTextObject.fontId)
                            this.selectedItem.set("pFontId", curveTextObject.pFontId)
                            this._canvas.renderAll()
                            this.selectedItem.setCoords()

                        })

                    }, 100)
                })

            } else {

                this.imgDesc = img.elevation.description
                const imgURL = this.api.baseProductImageUrl(img.id)

                fabric.Image.fromURL(imgURL, (image: fabric.Image) => {
                    // const w = this._canvas.getWidth()*0.75
                    image.ktype = 'background-image'
                    // image.backgroundColor = '#FF0000'
                    // image.fill='#FF0000'

                    image.scaleToWidth(400)
                    image.scaleToHeight(400)
                    image.selectable = false
                    this._canvas.centerObject(image)
                    image.crossOrigin = 'anonymous'
                    this._canvas.add(image)

                }, { crossOrigin: 'anonymous' })
                this._canvas.renderAll()

                setTimeout(() => {
                    this.addPrintArea(img)
                    if (this._canvas._objects[0].ktype == 'print-area') {
                        this._canvas.bringToFront(this._canvas._objects[0])
                    }
                    this.canvasData.loadingCanvas = false
                    this.addDesign = true
                    this.noArtwork = false
                }, 5000)
            }

        })
    }

    async cropComplete() {

        this.clicked = false
        const rect: fabric.Rect = new fabric.Rect({
            originX: 'center',
            originY: 'center',
            centeredRotation: true,
            left: this.selectedPrintArea.left,
            top: this.selectedPrintArea.top,
            width: this.selectedPrintArea.width,
            height: this.selectedPrintArea.height,
            absolutePositioned: true,
            // strokeDashArray: [5, 5],
            fill: 'transparent',
            // fill:'green',
            stroke: '#f00',
            strokeWidth: 1,
            ktype: 'image-area',
            selectable: false
        })

        console.log('path', rect, rect.top, rect.left)
        rect.setControlsVisibility({
            mtr: false
        })
        // this._canvas.centerObject(rect)
        this.selectedRect = rect

        // rect.set('top', this.selectedPrintArea.top + this.selectedPrintArea.height/2 )
        // rect.set('left', this.selectedPrintArea.left + this.selectedPrintArea.width/2)
        // this._canvas.add(rect)

        // rect.setCoords()
        this.selectedItem = rect
        const cTime = new Date().getTime()
        const res: Response = await fetch(this.croppedImage)
        const blob: Blob = await res.blob()
        const imageFile = new Blob([blob]) //  for microsoft edge support

        // FOR CONVERTING BLOB TO FILE
        const file = new File([blob], 'name', { type: blob.type })
        let compressedFile: File
        // let imageForCanvas: any

        this.compressImage
            .compress(file)
            .pipe(take(1))
            .subscribe((compressedImage) => {
                console.log(
                    `Image size after compressed 1: ${compressedImage.size} bytes.`
                )
                console.log('compressedImage 1', compressedImage)
                compressedFile = compressedImage

                // FOR CONVERTING FILE TO BASE_64
                // const reader = new FileReader()
                // reader.readAsDataURL(compressedFile)
                // reader.onload = () => {
                //     console.log('reader.result', reader.result)
                //     imageForCanvas = reader.result
                // }
                // reader.onerror = (error) => {
                //     console.log('Error: ', error)
                // }
            })

        // const imgData = {
        //     sepod_id: cTime,
        //     file: imageFile,
        // }
        // this.cropedImages.push(imgData)
        let imageUrl = this.croppedImage
        if (!this.croppedImage) {
            imageUrl = this.baseUrl + '/public/user-lib/file/' + this.selectedLibFile?.id
            this.libFileId = this.selectedLibFile?.id
        }

        fabric.Image.fromURL(imageUrl, (img) => {
            const image = img.set({
                // left: this.selectedPrintArea.left + (this.selectedPrintArea.width/2),
                // top: this.selectedPrintArea.top + (this.selectedPrintArea.height/2),
                left: this.selectedPrintArea.left,
                top: this.selectedPrintArea.top,

                ktype: 'placeholder-image',
                originalLeft: 0,
                originalTop: 0,
                originX: 'center',
                originY: 'center',
                centeredRotation: true,
                clipPath: rect,
                cornerStyle: 'circle',
                transparentCorners: false,
                fpersonalize: 0,
                formMaxSize: 1,
                formRequired: 0,
                sepod_id: cTime,
                imgScaleX: null,
                imgScaleY: null,
                imgWidth: null,
                imgHeight: null,
                lib_file_id: this.libFileId,
                fileName: this.selectedLibFile?.name,
                resolution: 0,
                cornerSize: 6
            })

            img.scaleToWidth(this.selectedItem.getScaledWidth())
            img.setControlsVisibility({
                mt: false,
                mb: false,
                ml: false,
                mr: false,
            })

            console.log('img:', img)
            this._canvas.add(image)
            this._canvas.renderAll()

            this._canvas.setActiveObject(this._canvas._objects[this._canvas._objects.length - 1])
            this.selectedItem = this._canvas.getActiveObject()

            this.selectedItem.src = this.selectedItem._element.currentSrc

            this.updateDimensions()
            this.noArtwork = false
            this.activeTab = 'property'
            // this.imageModalRef.hide()
            this._canvas.renderAll()
            this.alignItem('center')
            this.alignItem('middle')
            this.getImageResolution()
        }, { crossOrigin: 'Anonymous' })
    }


    addTextCurved(text) {
        let values = 'Hello Text'
        if (text) { values = text }

        const rect: fabric.Rect = new fabric.Rect({
            width: this.selectedPrintArea.getScaledWidth() - 1,
            height: this.selectedPrintArea.getScaledHeight() - 1,
            strokeDashArray: [5, 5],
            fill: '#f00',
            stroke: '#f00',
            strokeWidth: 1,
            ktype: 'text-area',
            absolutePositioned: true,
            parentWidth: this.selectedPrintArea.getScaledWidth(),
            parentHight: this.selectedPrintArea.getScaledWidth(),
            parentX: this.selectedPrintArea.left,
            parentY: this.selectedPrintArea.top,
            left: this.selectedPrintArea.left - (this.selectedPrintArea.width / 2),
            top: this.selectedPrintArea.top - (this.selectedPrintArea.height / 2),
            sepod_box_id: new Date().getTime(),
        })

        // rect.set('top', this.selectedPrintArea.top)
        // rect.set('left', this.selectedPrintArea.left)

        rect.setControlsVisibility({
            mtr: false
        })

        const arcText = new TextCurved(values, {
            left: rect.left + 1,
            top: rect.top + 1,
            angle: rect.angle,
            centeredRotation: true,
            ktype: 'placeholder-curvedtext',
            fill: '#000',
            strokeStyle: '#f3585f',
            strokeWidth: 0,
            originX: 'center',
            originY: 'center',
            fontFamily: 'Calibri',
            fontSize: 20,
            textAlign: 'left',
            paintFirst: 'stroke',
            parentX: rect.left,
            parentY: rect.top,
            clipPath: rect,
            formFixLength: null,
            fromLabel: 'Sample label',
            fontId: null,
            pFontId: null,
            fpersonalize: 0,
            formRequired: 0,
            formDefaultText: 'Default text',
            sepod_id: new Date().getTime(),
            cornerStyle: 'circle',
            transparentCorners: false,
            cornerSize: 6,
            textLimit: 10,
            personalize: 0,
            width: this.selectedPrintArea.width,
            height: this.selectedPrintArea.height,
            diameter: 350,
            kerning: 0,

        })

        this.selectedItem = arcText
        this.textProps.flipped = arcText.flipped
        this.textProps.diameter = arcText.diameter
        this.textProps.kerning = arcText.kerning
        this.textProps.text = arcText.text
        this.textProps.fontFamily = arcText.fontFamily
        this.textProps.fontSize = arcText.fontSize
        this.textProps.fill = arcText.fill
        this.textProps.strokeStyle = arcText.strokeStyle
        this.textProps.strokeWidth = arcText.strokeWidth
        this.textProps.textLimit = arcText.textLimit
        this.textProps.personalize = arcText.personalize
        this.noArtwork = false
        this._canvas.add(arcText)
        this._canvas.centerObject(this.selectedItem)
        this.alignItem('center')
        this.alignItem('middle')
        this.selectedItem.setCoords()
        this._canvas.renderAll()
    }


    addSampleText() {
        const rect: fabric.Rect = new fabric.Rect({
            width: this.selectedPrintArea.getScaledWidth() - 1,
            height: this.selectedPrintArea.getScaledHeight() - 1,
            strokeDashArray: [5, 5],
            // fill: 'transparent',
            fill: '#000',
            stroke: '#f00',
            strokeWidth: 1,
            ktype: 'text-area',
            absolutePositioned: true,
            parentWidth: this.selectedPrintArea.width,
            parentHight: this.selectedPrintArea.height,
            parentX: this.selectedPrintArea.left,
            parentY: this.selectedPrintArea.top,
            left: this.selectedPrintArea.left - (this.selectedPrintArea.width / 2),
            top: this.selectedPrintArea.top - (this.selectedPrintArea.height / 2),
            sepod_box_id: new Date().getTime(),
        })

        // rect.set('top', this.selectedPrintArea.top/4)
        // rect.set('left', this.selectedPrintArea.left/2)

        rect.setControlsVisibility({
            mtr: false
        })

        const text = new fabric.Text('Sample Text', {
            originX: 'center',
            originY: 'center',
            angle: 0,
            centeredRotation: true,
            ktype: 'placeholder-text',
            originalLeft: 1,
            originalTop: 1,
            fill: '#000',
            stroke: '#f3585f',
            strokeWidth: 0,
            fontFamily: 'Calibri',
            fontSize: 20,
            textAlign: 'Center',
            paintFirst: 'stroke',
            parentX: rect.left,
            parentY: rect.top,
            left: rect.left,
            top: rect.top,
            clipPath: rect,
            formFixLength: null,
            fromLabel: 'Sample label',
            fontId: null,
            pFontId: null,
            fpersonalize: 0,
            formRequired: 0,
            formDefaultText: 'Default text',
            sepod_id: new Date().getTime(),
            cornerStyle: 'circle',
            transparentCorners: false,
            cornerSize: 6,
            width: this.selectedPrintArea.width,
            height: this.selectedPrintArea.height,
            textLimit: 50,
            personalize: false
        })
        this.selectedItem = text
        this.textProps.text = text.text
        this.textProps.fontFamily = text.fontFamily
        this.textProps.fontSize = text.fontSize

        this.noArtwork = false
        this._canvas.add(text)
        // this._canvas.centerObject(this.selectedItem)
        this.alignItem('center')
        this.alignItem('middle')
        this._canvas.renderAll()
    }

    fontSizeChanged() {
        this.textPropsChanged()
        this.updateDimensions()
        this.selectedItemMetaData.initialScaledWidth = this.selectedItem.getScaledWidth()
        this.selectedItemMetaData.initialScaledHeight = this.selectedItem.getScaledHeight()
        this.dataForm.controls.scale_slider.setValue(100, { emitEvent: false })
    }

    textPropsChanged() {
        const textItem: fabric.IText = this.selectedItem
        // const containerItem: fabric.Rect = this.selectedItem.item(0)
        // const textItem: fabric.IText = this.selectedItem.item(1)

        textItem.set('text', this.textProps.text)
        textItem.set('fontSize', this.textProps.fontSize)
        textItem.set('fontFamily', this.textProps.fontFamily)


        while (textItem.width >= textItem.clipPath.width && textItem.fontSize > 0) {
            textItem.set('fontSize', textItem.fontSize - 1)
            setTimeout(() => {
                this.textProps.fontSize = textItem.fontSize
            }, 0)
        }
        while (textItem.width < textItem.clipPath.width && textItem.fontSize > 0) {
            if (textItem.fontSize <= 20) {
                textItem.set('fontSize', textItem.fontSize + 1)
                setTimeout(() => {
                    this.textProps.fontSize = textItem.fontSize
                }, 0)
            } else {
                break
            }
        }

        this.selectedItem.setCoords()
        this._canvas.renderAll()
    }

    setFontWeight() {
        this.textProps.fontWeight = this.selectedItem.fontWeight === 'bold' ? 'normal' : 'bold'
        this.selectedItem.set('fontWeight', this.textProps.fontWeight)
        this._canvas.renderAll()
    }

    setFontStyle() {
        this.textProps.fontStyle = this.selectedItem.fontStyle === 'italic' ? 'normal' : 'italic'
        this.selectedItem.set('fontStyle', this.textProps.fontStyle)
        this._canvas.renderAll()
    }

    setFontUnderline() {
        this.textProps.underline = !this.selectedItem.underline
        this.selectedItem.set('underline', this.textProps.underline)
        this._canvas.renderAll()
    }

    uppercase() {
        let checkText: boolean = this.isUpperCase(this.selectedItem.text)
        this.selectedItem.text = checkText == true ? this.textProps.text : this.textProps.text.toLocaleUpperCase()
        this._canvas.renderAll()
    }
    isUpperCase(str: any) {
        return !/[a-z]/.test(str) && /[A-Z]/.test(str)
    }
    lowercase() {
        let checkText: boolean = this.isLowerCase(this.selectedItem.text)
        this.selectedItem.text = checkText == true ? this.textProps.text : this.textProps.text.toLocaleLowerCase()
        this._canvas.renderAll()
    }
    isLowerCase(str: any) {
        return /[a-z]/.test(str) && !/[A-Z]/.test(str)
    }
    capitalizeCase() {
        let checkText: boolean = this.isCapitalizeCase(this.selectedItem.text)
        this.selectedItem.text = checkText == true ? this.textProps.text : this.textProps.text.replace(/\b\w/g, l => l.toUpperCase())
        this._canvas.renderAll()
    }
    isCapitalizeCase(str: any) {
        if (str.replace(/\b\w/g, l => l.toUpperCase()) == str) {
            return true
        } else {
            return false
        }
    }

    // changeAlign() {
    //     var val = align[Math.floor(Math.random() * align.length)]
    //     text.set('textAlign', val)
    //     el.innerHTML = 'Text Alignment : ' + val
    //     canvas.setActiveObject(text)
    //     canvas.renderAll()
    // }

    setTextAlignLeft() {
        this.textProps.textAlign = 'left'
        this.selectedItem.set('textAlign', this.textProps.textAlign)
        this._canvas.renderAll()
    }
    setTextAlignCenter() {
        this.textProps.textAlign = 'center'
        this.selectedItem.set('textAlign', this.textProps.textAlign)
        this._canvas.renderAll()
    }
    setTextAlignRight() {
        this.textProps.textAlign = 'right'
        this.selectedItem.set('textAlign', this.textProps.textAlign)
        this._canvas.renderAll()
    }

    setCOlorOntext() {
        this.selectedItem.set('fill', this.textProps?.fill)
        this._canvas.renderAll()
    }
    setStrokeOntext() {
        this.selectedItem.set('stroke', this.textProps?.stroke)
        this._canvas.renderAll()
    }
    setStrokeStyleOntext() {
        this.selectedItem.set('strokeStyle', this.textProps?.strokeStyle)
        this._canvas.renderAll()
    }
    setStrokeWidthOntext() {
        this.selectedItem.set('strokeWidth', this.textProps?.strokeWidth)
        this._canvas.renderAll()
    }
    setTextLimit() {
        this.selectedItem.set('textLimit', this.textProps?.textLimit)
        this._canvas.renderAll()
    }
    setPersonalize() {
        this.selectedItem.set('personalize', this.textProps?.personalize)
        this._canvas.renderAll()
    }

    setCurvedText() {
        this.selectedItem.set('text', this.textProps?.text)
        this._canvas.renderAll()
    }
    updateArc() {
        this.selectedItem.set({
            diameter: +this.textProps?.diameter,
            fontSize: this.textProps?.fontSize,
            fontFamily: this.textProps?.fontFamily,
            kerning: this.textProps?.kerning
        })
        this._canvas.renderAll()
    }

    showColorPicker(event) {
        if (this.colorPicker === null || !this.colorPickerExists()) {
            this.initializeColorPicker()
        }

        this.colorPickerView = true
        event.stopPropagation()

        return false
    }

    observeColorPicker() {
        const node = document.querySelector('.IronColorPicker')
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => console.log(mutation))
        })

        observer.observe(node, {
            attributes: true,
            childList: true,
            characterData: true
        })
    }

    colorPickerExists() {
        if (this.colorPickerDiv) {
            const childElements = this.colorPickerDiv.nativeElement.children

            if (childElements.length < 2) {
                return false
            }

            return childElements[1].classList.contains('IroColorPicker') ? true : false
        } else {
            return false
        }
    }



    changeVState(variant, status) {
        this.productDetail.variants.forEach((oject, index) => {

            if (variant.color_code) {
                if (oject.color_code && oject.color_code.toUpperCase() === variant.color_code.toUpperCase()) {
                    this.productDetail.variants[index].publish = status
                }
            } else {


                console.log(oject)


                if (oject.id && oject.id === variant.id) {
                    this.productDetail.variants[index].publish = status
                }
            }


        })
    }

    saveDesign() {
        this.saveLoading = true

        const publishable_variants = []
        this.productDetail.variants.forEach(variant => {

            if (variant.color_code) {
                variant.color_code = variant.color_code.toUpperCase()
            }




            if (this.productVariants.findIndex(d => d.color_code === variant.color_code && variant.publish === 1) > -1) {
                publishable_variants.push(variant.id)
            }

        })

        this._canvas._objects.forEach((object, index) => {

            if (this.isOurItem(this._canvas._objects[index])) {
                this._canvas.setActiveObject(this._canvas._objects[index])
                this.selectedItem = this._canvas.getActiveObject()
                this._canvas.renderAll()
                this.setOriginalCoordns()
            }
            this._canvas.renderAll()
        })



        const designContent = this._canvas.toJSON(this.customParams)

        const data = new FormData()
        data.append('product_id', this.ds.productId)
        if (publishable_variants.length > 0) {
            publishable_variants.forEach(element => {
                data.append('publishable_variants[]', element)
            })
        }

        data.append('elevation_id', this.selectedImage.elevation_id)
        data.append('design_content', JSON.stringify(designContent))
        let can = this._canvas

        // this._canvas.clone(d =>{
        //     d.getObjects().forEach(e => {
        //         if(e.ktype == 'background-image'){
        //             d.remove(e)
        //         }
        //     });
        //     data.append('canvas_image', d.toDataURL())
        // },customParams)

        // this._canvas.getObjects().forEach(e => {
        //     if (e.ktype == 'background-image') {
        //         this._canvas.remove(e)
        //     }
        // })


        this._canvas._objects[1].strokeWidth = 0
        data.append('canvas_image', this._canvas.toDataURL({ format: 'png', multiplier: 4 }))
        this._canvas._objects[1].strokeWidth = 1

        this._canvas = can
        this._canvas.renderAll()

        // this.cropedImages.forEach(r => {
        //     data.append(r.sepod_id, r.file)
        // })

        this.ds.updateVPContent(data).subscribe(resp => {
            this.saveLoading = false
            if (resp.success === true) {
                this.alert.success('Content Save Successfully')

                // this.router.navigate([this.api.checkUser() + '/product/mock-ups'], {
                //     queryParams: {
                //         id: this.ds.productId,
                //         base_id: this.ds.baseProductId,
                //     },
                //     replaceUrl: true,
                // })

            } else {
                this.alert.error(resp.errors.general)
            }
        })
    }

    @HostListener('window:keyup', ['$event'])
    deleteCanvasObject(event: any) {
        const prohabitedObjects = []
        if (event.target.tagName.toUpperCase() !== 'INPUT') {
            if (event.key === 'Delete') {
                this._canvas.getActiveObjects().forEach((obj) => {
                    if (this.selectedItem.ktype == 'placeholder-image' && this.cropedImages.length > 0) {
                        const index = this.cropedImages.findIndex(c => c.sepod_id == this.selectedItem.sepod_id)
                        this.cropedImages.splice(index, 1)
                        console.log('img delete in array')

                    }
                    if (prohabitedObjects.indexOf(obj.ktype) === -1) {
                        this._canvas.remove(obj)
                    }
                })
                this.selectedItem = null
                this._canvas.discardActiveObject().renderAll()
            }
        }
    }

    textForm(f: any) {
        if (this.textDataForm.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in fields & try again.')

            return false
        }
    }

    curvedForm(f: any) {
        if (this.curvedDataForm.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in fields & try again.')

            return false
        }
    }
    imageForm(f: any) {
        if (this.textDataForm.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in fields & try again.')

            return false
        }
    }

    // openModal(formModal) {
    //     this.dataStatus = 'fetching'
    //     this.getfolderList()
    //     this.getFolderFileList()
    //     this.getRecentFileList()
    //     this.modalRef = this.ms.show(
    //         formModal,
    //         {
    //             class: 'modal-lg modal-dialog-centered admin-panel',
    //             backdrop: 'static',
    //             ignoreBackdropClick: true,
    //             keyboard: false
    //         }
    //     )
    // }

    getfolderList() {
        const params = {
            parent_id: this.parentId,
            keyword: this.searchKeyword
        }
        this.ds.getSubFolder(params).subscribe(resp => {
            this.backLoading = false
            if (resp.success === true) {
                this.folderList = resp.data
                this.dataStatus = 'done'
                this.backLoading = false
            } else {
                this.alert.error(resp.errors.general)
                this.dataStatus = 'done'
                this.backLoading = false
            }
        })
    }

    getFolderFileList() {
        const params = {
            id: this.parentId,
            keyword: this.searchKeyword
        }
        this.ds.getFolderFile(params).subscribe(resp => {
            if (resp.success === true) {
                this.folderFileList = resp.data
                this.folderFileList.forEach(e => { e.imgTime = new Date().getTime() })
                this.dataStatus = 'done'
            } else {
                this.alert.error(resp.errors.general)
                this.dataStatus = 'done'
            }
        })
    }

    getRecentFileList() {
        this.ds.getRecentFile().subscribe(resp => {
            if (resp.success === true) {
                this.recentFileList = resp.data
                this.dataStatus = 'done'
            } else {
                this.alert.error(resp.errors.general)
                this.dataStatus = 'done'
            }
        })
    }

    openAddFolderModal(formModal) {
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
    saveNewFolder(f: any) {
        this.newFolderLoading = true
        if (this.dataForm.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in field & try again.')
            this.newFolderLoading = false

            return false
        }
        const params = {
            parent_id: this.parentId,
            name: this.newFolderForm.value.name
        }
        const newlyAddedFolder = {
            parent_id: this.parentId,
            name: this.newFolderForm.value.name,
            user_lib_files_count: 0,
            sub_folders_count: 0
        }

        this.ds.addNewFolder(params).subscribe((resp: any) => {
            this.newFolderLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.newFolderLoading = false

                return false
            } else {
                this.alert.success('Added successfully!!')
                this.folderList.push(newlyAddedFolder)
            }
            this.modalRef.hide()
            f.resetForm()
        })
    }

    getSubFolderList(foId: any, paId: any) {
        this.backId = paId
        const index = this.backIds.findIndex(d => d == paId)
        if (index == -1) {
            this.backIds.push(this.backId)
        }
        this.parentId = foId
        this.getfolderList()
        this.getFolderFileList()
    }

    backFolder() {
        if (this.backIds.length > 0) {
            this.backLoading = true
            this.parentId = this.backIds[this.backIds.length - 1]
            this.backIds.splice((this.backIds.length - 1), 1)

            this.getfolderList()
            this.getFolderFileList()
        }
    }

    loadFont() {

        if (this.fontFileId === null) return

        // const f = this.productFontList.find(f => f.id === this.fontFileId)
        let f: any = {}
        const index = this.productFontList.findIndex(x => x.id == this.fontFileId)
        if (index > -1) {
            f = this.productFontList[index]
        }
        this.fontId = f.font_id

        const customFont = new FontFace(f.file_name, 'url(' + this.baseUrl + '/public/font/download/' + this.fontFileId + ')')
        customFont.load().then((res) => {

            document['fonts'].add(res)

            if (res.status === 'loaded') {

                //  console.log('res::', res)


                // const text = new fabric.Text('IT Hub',{ fontFamily: 'fantasy'})
                this.selectedItem.set('pFontId', this.fontId)
                this.selectedItem.set('fontFamily', res.family)
                this.selectedItem.set('fontStyle', res.style)
                // this.selectedItem.set('textAlign', res.textAlign)
                this.selectedItem.set('fontWeight', res.weight)
                this.selectedItem.set('fontId', this.fontFileId)
                this.render.setStyle(this.fnt.nativeElement, 'font-family', res.family)
                this.lodedFontFamily = res.family
                this.textProps.fontFamily = res.family

                this._canvas.renderAll()
            }

        }).catch((error) => {

        })

        // if(customFont.FontFace.status == 'loaded'){
        //     const text = new fabric.Text('IT Hub',{ fontFamily: 'fantasy'})
        //     console.log('ismail', text);
        // }

    }

    selectFontOption(e: any) {
        this.productFontFileList = []
        this.fetchingFontFiles = true
        if (e.target.value) {
            const params = {
                font_id: this.fontId
            }
            this.ds.productFontFileList(params).subscribe((resp: any) => {
                if (resp.success === true) {
                    this.productFontFileList = resp.data
                    this.fetchingFontFiles = false
                } else {
                    this.alert.error(resp.errors.general)
                    this.fetchingFontFiles = false

                    return false
                }
            })
        } else {
            this.fetchingFontFiles = false
        }
    }

    exportTosvg() {
        const svg = this._canvas.toSVG({ width: 1512, height: 2268 })
        console.log(svg)
    }

    setCurvedFlipped() {
        const xitem = this.selectedItem
        this.selectedItem.set('flipped', this.textProps?.flipped)
        if (this.selectedItem.flipped === "true") {
            this.selectedItem.set('flipped', true)
            this.selectedItem.set('angle', -180)
            // this.selectedItem.set('top', xitem.top + this.selectedItem.getScaledHeight())
            // this.selectedItem.set('left', xitem.left + this.selectedItem.getScaledWidth())
            this._canvas.renderAll()
        } else {
            this.selectedItem.set('angle', 0)
            this.selectedItem.set('flipped', false)
            // this.selectedItem.set('top', xitem.top - this.selectedItem.getScaledHeight())
            // this.selectedItem.set('left', xitem.left - this.selectedItem.getScaledWidth())
            this._canvas.renderAll()
        }

    }

    boundingBox() {

        this._canvas.forEachObject((obj) => {
            if (this.isOurItem(obj)) {
                let bound = obj.getBoundingRect()
                this._canvas.getContext().strokeRect(
                    bound.left,
                    bound.top,
                    bound.width,
                    bound.height
                )
            }
        })
        this._canvas.getContext().strokeStyle = '#555'

    }

    getAllImagesResolution() {

        const ob = this._canvas._objects
        this.imagesResolutionPass = true
        ob.forEach(obj => {

            if (obj.ktype === 'placeholder-image') {
                this.getResolution(obj)
            }

        })

    }

    getResolution(imageObj) {
        // selected mm in our system
        const selectedWmm = (imageObj.width * imageObj.scaleX) / this.printRatioW
        const selectedHmm = (imageObj.height * imageObj.scaleY) / this.printRatioH// w/ratio

        // pixel per mm in our system
        const ppmmW = imageObj.width / selectedWmm
        const ppmmH = imageObj.height / selectedHmm

        let ppmmRes = ppmmW < ppmmH ? ppmmW : ppmmH
        let ppi = ppmmRes * 25.4
        imageObj.resolution = Math.round(ppi)
        if (Math.round(ppi) < 100) {
            this.imagesResolutionPass = false
            // console.log(imageObj)
        }
    }

    getImageResolution() {

        if (this.selectedItem.ktype !== 'placeholder-image') {
            return
        }

        if (this.selectedItem.lib_file_id) {
            this.selectedLibFile = this.userLibList.find(v => v.id === this.selectedItem.lib_file_id)
        }

        const ratio = this.selectedItem.width / this.selectedItem.height

        // selected mm in our system
        const selectedWmm = (this.selectedItem.width * this.selectedItem.scaleX) / this.printRatioW
        const selectedHmm = (this.selectedItem.height * this.selectedItem.scaleY) / this.printRatioH// w/ratio

        // pixel per mm in our system
        const ppmmW = this.selectedItem.width / selectedWmm
        const ppmmH = this.selectedItem.height / selectedHmm

        let ppmmRes = ppmmW < ppmmH ? ppmmW : ppmmH
        // console.log('ow', this.selectedItem.width, 'sw in px', this.selectedItem.getScaledWidth(), 'sw in mm', selectedWmm, 'ppmmW', ppmmW)
        let ppi = ppmmRes * 25.4

        this.selectedItem.set('imgWidth', selectedWmm)
        this.selectedItem.set('imgHeight', selectedHmm)
        this.selectedItem.set('imgScaleX', this.selectedItem.scaleX)
        this.selectedItem.set('imgScaleY', this.selectedItem.scaleY)
        this.imageDataForm.controls.ppc.setValue(Math.round(ppmmRes), { emitEvent: false })
        this.imageDataForm.controls.ppi.setValue(Math.round(ppi), { emitEvent: false })
        this.selectedItem.set('resolution', Math.round(ppi))
        if (Math.round(ppi) < 100) {
            this.imagesResolutionPass = false
        }

        // console.log('dpmm:', dpmm, 'ration:', ratio,'wid:',w,'hig:',h,'ppc:',ppc,'ppi:',ppi,'ppcw:',ppcw,'ppch:',ppch);

        // console.log(this.imgWidth,this.imgHight)
        // console.log('selected', this.selectedItem)


    }

    printAreaModal(bpmModal) {

        this.bpmModal = this.ms.show(
            bpmModal,
            {
                class: 'modal-xl modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
    }

    alignItem(align) {
        // this.resetZoom()

        let bound = this._canvas._objects[1].getBoundingRect()
        const index = this._canvas._objects.findIndex(d => d.ktype === 'print-area')
        if (index > -1) {
            bound = this._canvas._objects[index].getBoundingRect()
        }
        console.log('bound:', bound)

        if (this.selectedItem != null) {
            const sItm = this.selectedItem.getBoundingRect()
            console.log('sItmbound:', sItm)
            switch (align) {
                case 'top':
                    this.selectedItem.set('top', bound.top + (this.selectedItem.top - sItm.top))
                    break
                case 'bottom':
                    this.selectedItem.set('top', bound.top + bound.height - (sItm.height - (this.selectedItem.top - sItm.top)))
                    break
                case 'left':
                    this.selectedItem.set('left', bound.left + (this.selectedItem.left - sItm.left))
                    break
                case 'right':
                    this.selectedItem.set('left', bound.left + bound.width - (sItm.width - (this.selectedItem.left - sItm.left)))
                    break
                case 'center':
                    this.selectedItem.set('left', bound.left + (sItm.width / 2) + (bound.width / 2) - (sItm.width - (this.selectedItem.left - sItm.left)))
                    break
                case 'middle':
                    this.selectedItem.set('top', bound.top + (sItm.height / 2) + (bound.height / 2) - (sItm.height - (this.selectedItem.top - sItm.top)))
                    break
            }
            this.updateDimensions()
            this.selectedItem.setCoords()
            this._canvas.renderAll()
        }

    }

    deleteDesign() {
        const prohabitedObjects = []
        console.log('this._canvas.getActiveObjects()', this._canvas.getActiveObjects())
        this._canvas.getActiveObjects().forEach((obj) => {
            if (prohabitedObjects.indexOf(obj.ktype) === -1) {
                this._canvas.remove(obj)
            }
        })
        this._canvas.discardActiveObject().renderAll()
        this.dataForm.reset()
        this.selectedItem = null
    }

    libraryItemDeleteModal(template: TemplateRef<any>, id: any, i: any) {
        this.selectedId = id
        this.selectedIndex = i
        this.libDeleteModalRef = this.ms.show(template, { class: 'modal-sm admin-panel' })
    }
    libDelete() {
        this.libDeleteLoading = true
        const params = {
            id: this.selectedId
        }
        this.ds.deleteUserLib(params).subscribe((resp: any) => {
            this.libDeleteLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.libDeleteModalRef.hide()
                this.libDeleteLoading = false

                return false
            } else {
                const deletingIndex = this.userLibList.findIndex((d: any) => {
                    return d.id === this.selectedId
                })
                this.userLibList.splice(deletingIndex, 1)
                this.libDeleteModalRef.hide()
                this.alert.success('Deleted successfully!!')
                this.selectedIndex = -1
            }
        })
    }

    copyInputText(inputElement: ElementRef) {
        inputElement.nativeElement.select()
        document.execCommand('copy')
        inputElement.nativeElement.setSelectionRange(0, 0)
        this.alert.success('Text is copied!!')
    }


    getvarientLength(productVariants, status) {
        if (status === -1) {
            return productVariants.length
        }
        return productVariants.filter(item => item.publish === status).length
    }
    getIfActiveVarient() {
        return this.productVariants.some(item => item.publish === 1)
    }

    getProductDetail() {
        const params = {
            id: this.ds.productId,
        }
        this.ds.productDetail(params).subscribe((resp: any) => {

            if (resp.success === true) {
                this.productDetail = resp.data
                this.fetchProduct = true

                console.log('this.productDetail.variants::', this.productDetail.variants)

                this.productDetail.variants.forEach(variant => {
                    console.log(variant.options)
                    const idx = variant.options.findIndex(e => e.id === 2)
                    if (idx > -1) {
                        const id = variant.options[idx].product_option_value.id
                        if (this.productVariants.findIndex(w => w.attr_id === id) === -1) {
                            variant.attr_id = id
                            this.productVariants.push(variant)
                        }
                    }

                })

                console.log('this.productVariants:', this.productVariants)
            }

            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                return false
            }
        })
    }

    toggleProperties(index, ob) {

        // if(this._canvas.getActiveObject().sepod_id===ob.sepod_id){
        //     this._canvas.discardActiveObject()
        //     this.selectedItem = null
        //     return
        // }

        // this.propertyStatus = !this.propertyStatus
        // console.log(this._canvas._objects[index].sepod_id, '---', ob.sepod_id);
        this._canvas.setActiveObject(this._canvas._objects[index])
        this.selectedItem = this._canvas._objects[index]
        this.updateDimensions()
        if (this.selectedItem !== null && this.selectedItem.ktype !== 'placeholder-image') {
            this.getImageResolution()
        }
        this.selectedItem.setCoords()
        this._canvas.renderAll()
    }

    zoomIn() {
        this.resetZoomVal = true
        if (this.initialZoom == 1) {
            this.resetZoom()
        }
        if (this._canvas.getZoom() < 1.57) {

            this._canvas.zoomToPoint(new fabric.Point(400, 400), this._canvas.getZoom() * 1.05)
            this._canvas.setZoom(this._canvas.getZoom() * 1.05)
            this.zoomSize = this._canvas.getZoom()
        }
    }
    zoomOut() {
        this.resetZoomVal = true
        if (this.initialZoom == 1) {
            this.resetZoom()
        }
        if (this._canvas.getZoom() > 0.6) {

            this._canvas.zoomToPoint(new fabric.Point(400, 400), this._canvas.getZoom() / 1.05)
            this._canvas.setZoom(this._canvas.getZoom() / 1.05)
            this.zoomSize = this._canvas.getZoom()
        }
    }
    resetZoom() {
        this._canvas.setViewportTransform([1, 0, 0, 1, 0, 0])
        this._canvas.setZoom(1)
        this.zoomSize = 1
        this.resetZoomVal = false
    }
    changeZoom() {

    }
    getTextLimit(e) {
        if (this.textProps.textLimit === e.target.value.length) {
            this.alert.error('You have reached to maximum character length.')
        }
    }

    zIn() {
        this.resetZoomVal = true
        if (this.transformScale < 1.9) {
            this.transformScale = this.transformScale + .1
            this.scalePadding = this.scalePadding + 12
        }
        console.log(this.scalePadding, this.transformScale)
    }
    zOut() {
        this.resetZoomVal = true
        if (this.transformScale > .5) {
            this.transformScale = this.transformScale - .1
            if (this.scalePadding > 0) {
                this.scalePadding = this.scalePadding - 12
            }
        }
        console.log(this.scalePadding, this.transformScale)
    }

    zMinus() {

        console.log(this._canvas.getZoom() / 1.1)
        // if (this.transformScale > 1) {
        this._canvas.zoomToPoint(new fabric.Point(this._canvas.width / 2, this._canvas.height / 2), this._canvas.getZoom() / 1.1)
        //}
        // this._canvas.setZoom(this._canvas.getZoom() / 1.1 );
    }
    zPlus() {
        console.log(this._canvas.getZoom() * 1.1)
        //if (this.transformScale < 2) {
        this._canvas.zoomToPoint(new fabric.Point(this._canvas.width / 2, this._canvas.height / 2), this._canvas.getZoom() * 1.1)
        //}

    }
    checkZoom(e) {

        this._canvas.zoomToPoint(new fabric.Point(this._canvas.width / 2, this._canvas.height / 2), e)
        // console.log(this.transformScale, this.oldScale)
        // if (this.transformScale > this.oldScale) {
        //     this.scalePadding = this.scalePadding + 5
        //     this.oldScale = this.transformScale
        // } else if (this.transformScale < this.oldScale) {
        //     this.scalePadding = this.scalePadding - 5
        //     this.oldScale = this.transformScale
        // } else {
        //     this.oldScale = 1
        // }
    }


    returnUpdatedUserLibList(data) {
        console.log('userLibListData', data)
        this.userLibList = data
    }

    returnUpdatedCanvasList(data) {
        console.log('data', data)
        this._canvas._objects = data
        this._canvas.getActiveObject().setCoords()
        this._canvas.renderAll()
        this._canvas.requestRenderAll()
    }
}
