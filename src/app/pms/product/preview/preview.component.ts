import { Component, OnInit, ElementRef, ViewChild, Renderer2 } from '@angular/core'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { DataService } from 'src/app/pms/product/data.service'
import { ApiService } from 'src/app/services/api.service'
import { apis } from 'src/environments/environment'
import { fabric } from 'fabric'
declare let FontFace: any
const TextCurved2 = fabric.util.createClass(fabric.Object, {
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

TextCurved2.fromObject = function (options) {
    return new TextCurved2(options)
}
@Component({
    selector: 'app-preview',
    templateUrl: './preview.component.html',
    styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit {
    @ViewChild('canvaswrapper2', { static: false })
    canvasWrapper2: ElementRef
    @ViewChild('productBgImage', { static: false })
    productBgImage: ElementRef
    @ViewChild('fnt', { static: false })
    fnt: ElementRef
    dataStatus = 'fetching'
    spinnerSVG = `/assets/images/rolling-main.svg`
    imgDesc: any
    productBgImageUrl = null
    productImages: Array<any>
    selectedNewImg: any
    selectedNewImgTitle: any
    printRatioW = 0.5 // milimeter to pixel width ratio
    printRatioH = 0.5
    selectedImage: any = null
    selectedItem: fabric.Object | fabric.Group | any
    _canvs2?: fabric.Canvas = null
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
    selectedPrintArea
    activeElevation = 0
    fontId = null
    fontWeightId = null
    defaultFontSize = 23
    productFontList: any = []
    fontFileId = null
    selectedItemMetaData = {
        initialScaledWidth: 0,
        initialScaledHeight: 0,
        initialFontSize: this.defaultFontSize
    }
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
        angle: 0,
        flipped: false,
        textLimit: 0,
        personalize: false
    }
    selectedLibFile: any

    preview: any = 'jpg'
    fileTypes = {
        jpg: '',
        png: '',
        pdf: ''
    }
    loadArtwork = false
    baseUrl: string

    constructor(
        private alert: IAlertService,
        public ds: DataService,
        public api: ApiService,
        private render: Renderer2
    ) {
        this.baseUrl = apis.baseUrl
    }

    ngOnInit() {
        this.fetchImages()
    }

    fetchImages() {
        this.dataStatus = 'fetching'
        const param = {
            id: this.ds.productId
        }
        this.ds.imagesList(param).subscribe(resp => {
            if (resp.success === true) {
                this.productImages = resp.data
                if (this.productImages.length > 0) {
                    this.ds.defaultMockupId = this.productImages[0].mockup_id
                    this.selectedNewImg = this.productImages[0]
                    this.selectedNewImgTitle = this.productImages[0].elevation.title
                    this.selectImage(this.selectedNewImg)
                }
                this.dataStatus = 'done'
            } else {
                this.alert.error(resp.errors.general)
                this.dataStatus = 'done'
            }
        })
    }



    selectImage(img: any) {
        this.selectedNewImg = img
        this.selectedNewImgTitle = img.elevation.title
        this.printRatioW = img.pa_height / img.elevation.p_height
        this.printRatioH = img.pa_width / img.elevation.p_width

        this.selectedImage = img
        this.selectedItem = null

        // const w = img.pa_width // .p_width //  img.width
        // const h = img.pa_height // .p_height //  img.height

        const w = this.canvasData.canvasSize.width
        const h = this.canvasData.canvasSize.height

        this.canvasWrapper2.nativeElement.style.width = w + 'px'
        this.canvasWrapper2.nativeElement.style.height = h + 'px'

        if (this._canvs2 == null) {
            this.initializeCanvas()
        } else {
            this._canvs2.clear()
            this.resizeCanvas(w, h)
        }
        this.canvasData.loadingCanvas = true
        const imgURL = this.api.elevationImg(img.mockup_id, img.elevation_id)
        this.productBgImageUrl = this.api.baseProductImageUrl(img.id)

        const params = { elevation_id: img.elevation.id, product_id: this.ds.productId }

        this.fileTypes.jpg = ''
        this.fileTypes.png = ''
        this.fileTypes.pdf = ''

        this.ds.getPrintAreas({ elevation_id: img.elevation.id, product_id: this.ds.productId }).subscribe((resp: any) => {
            if (resp.success === true && resp.data !== null) {


                const design_content = JSON.parse(resp.data.design_content)
                const curveTextObjects = []
                design_content.objects.forEach((object, index) => {
                    if (object.ktype === 'placeholder-curvedtext') {
                        curveTextObjects.push(object)
                        design_content.objects.splice(index, 1)
                    }
                })



                this._canvs2.loadFromJSON(design_content, () => {
                    this._canvs2.getObjects('group').forEach(g => {
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
                        g.setCoords()
                    })

                    this._canvs2.getObjects().forEach(e => {
                        e.selectable = false
                        if (e.ktype == 'print-area') {
                            e.selectable = false
                            this.selectedPrintArea = e
                        }
                        if (e.ktype == 'placeholder-image') {
                            e.selectable = false
                        }
                        if (e.ktype == 'placeholder-text') {
                            e.selectable = false
                        }
                        if (e.ktype == 'background-image') {
                            // this._canvs2.remove(e)
                        }
                        e.setControlsVisibility({
                            mtr: false
                        })
                        e.cornerStyle = 'circle',
                            e.transparentCorners = false,
                            //  borderColor:'black',
                            //  cornerColor:'light blue'
                            e.cornerSize = 6
                    })

                    // this.canvasWrapper2.nativeElement.style.top = (img.pa_y / this.selectedPrintArea.scaleX) - 1 + 'px'
                    // this.canvasWrapper2.nativeElement.style.left = (img.pa_x / this.selectedPrintArea.scaleY) - 1 + 'px'

                    setTimeout(() => {
                        this.canvasData.loadingCanvas = false

                        curveTextObjects.forEach(curveTextObject => {
                            this.addTextCurved(curveTextObject.text)
                            this._canvs2.bringToFront(this.selectedItem)
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
                            this._canvs2.renderAll()
                            this.selectedItem.setCoords()

                        })


                    }, 1000)
                })
            } else {

                // setTimeout(() => {
                //     this.addPrintArea(img)
                //     if (this._canvs2._objects[0].ktype === 'print-area') {
                //         this._canvs2.bringToFront(this._canvs2._objects[0])
                //     }
                //     this.canvasData.loadingCanvas = false
                // }, 500)


            }
        })
    }

    addTextCurved(text) {
        let values = 'Hello Text'
        if (text) { values = text }

        const rect: fabric.Rect = new fabric.Rect({
            width: this.selectedPrintArea.getScaledWidth() - 1,
            height: this.selectedPrintArea.getScaledHeight() - 1,
            strokeDashArray: [5, 5],
            fill: 'transparent',
            // fill: '#000',
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

        // rect.set('top', this.selectedPrintArea.top)
        // rect.set('left', this.selectedPrintArea.left)

        rect.setControlsVisibility({
            mtr: false
        })

        const arcText = new TextCurved2(values, {
            originX: 'center',
            originY: 'center',
            angle: 0,
            centeredRotation: true,
            ktype: 'placeholder-curvedtext',
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
            personalize: false,
            diameter: 350,
            kerning: 0,
        })

        this.selectedItem = arcText
        this.textProps.flipped = arcText.flipped
        this.textProps.diameter = arcText.diameter
        this.textProps.kerning = arcText.kerning
        this.textProps.text = arcText.text
        this.textProps.angle = arcText.angle
        this.textProps.fontFamily = arcText.fontFamily
        this.textProps.fontSize = arcText.fontSize
        this.textProps.fill = arcText.fill
        this.textProps.strokeStyle = arcText.strokeStyle
        this.textProps.strokeWidth = arcText.strokeWidth
        this.textProps.textLimit = arcText.textLimit
        this.textProps.personalize = arcText.personalize

        this._canvs2.add(arcText)
        this.selectedItem.setCoords()
        this._canvs2.renderAll()
    }


    getElevation(img) {
        this.fileTypes.jpg = ''
        this.fileTypes.png = ''
        this.fileTypes.pdf = ''
        this.loadArtwork = true
        this.ds.getPrintAreas({ elevation_id: img.elevation.id, product_id: this.ds.productId }).subscribe((resp: any) => {
            if (resp.success && resp.data !== null) {
                const design_content = JSON.parse(resp.data.design_content)

                const templateParams = {
                    width: img.elevation.p_width,
                    units: 'mm',
                    height: img.elevation.p_height,
                    backgroundColor: null,
                    elements: {}
                }

                if (resp.data.artwork_template === null) {
                    this.ds.createArtworkTemplate(templateParams).subscribe((resp: any) => {
                        if (resp.data.id > 0) {
                            this.generateArtwork(img.pa_width, img.pa_height, img.elevation.p_width, img.elevation.p_height, design_content, resp.data.id, img.elevation.id, 'add')
                        }
                    })
                } else {
                    this.generateArtwork(img.pa_width, img.pa_height, img.elevation.p_width, img.elevation.p_height, design_content, resp.data.artwork_template.template_id, img.elevation.id, 'update')
                }
            }
        })
    }

    generateArtwork(pa_width, pa_height, p_width, p_height, design_content, templateId, elevationId, action) {
        const obj: any = design_content
        let elements = {}
        let textCount = 1
        let imageCount = 1
        let printRatioW, printRatioH

        printRatioH = p_height / pa_height
        printRatioW = p_width / pa_width


        let selectedPrintArea: any = []

        if (obj.objects[1].ktype === 'print-area') {
            selectedPrintArea = obj.objects[1]
        }
        let leftArea = selectedPrintArea.left - (selectedPrintArea.width / 2)
        let topArea = selectedPrintArea.top - (selectedPrintArea.height / 2)

        console.log('width:', selectedPrintArea.width, 'height:', selectedPrintArea.height, 'left:', selectedPrintArea.left, 'top:', selectedPrintArea.top, 'leftArea:', leftArea, 'topArea:', topArea)

        obj.objects.forEach((object, index) => {

            if (index > 1) {
                // if (object.ktype == 'placeholder-image') {

                if (object.originalTop && object.originalLeft) {
                    object.left = object.originalLeft
                    object.top = object.originalTop
                }

                console.log('width:', object.width, 'mm:', (object.width * object.scaleX) * printRatioW)
                console.log('height:', object.height, 'mm:', (object.height * object.scaleY) * printRatioH)
                console.log('left:', object.left)
                console.log('top:', object.top)
                console.log('printRatioW:', printRatioW)
                console.log('printRatioH:', printRatioW)


                if (object.ktype === 'placeholder-text') {
                    const paramsVal = {
                        "type": "text",
                        "width": ((object.width * object.scaleX) * printRatioW), // (object.width object.scaleX)
                        "height": ((object.height * object.scaleY) * printRatioH),
                        "x": ((object.left - ((object.width * object.scaleX) / 2) - leftArea) * printRatioW),
                        "y": ((object.top - ((object.height * object.scaleY) / 2) - topArea) * printRatioH),
                        "zIndex": 0,
                        "text": object.text,
                        // "fill": "red",
                        "fontColor": object.fill,
                        "fontSize": ((object.fontSize * object.scaleX) * printRatioW) * 3.7,
                        // "fontType": 'CalibriRegular',
                        "fontType": object.fontFamily,
                        // "backgroundColor": "#000",
                        "hAlign": "C",
                        "vAlign": "M",
                        'textFitToBox': true,
                        "stickToBox": true,
                        "rotation": (360 - object.angle),
                        "strokeColor": object.stroke,
                        "strokeWidth": ((object.strokeWidth * object.scaleX) * printRatioW)
                        // "borderWidth": 1,
                        // "underline": object.underline
                    }
                    elements['text' + textCount] = paramsVal
                    textCount++
                }

                if (object.ktype === 'placeholder-curvedtext') {

                    console.log('object:::', object)

                    const paramsVal = {
                        "type": "text",
                        "width": ((object.width * object.scaleX) * printRatioW), // (object.width object.scaleX)
                        "height": ((object.height * object.scaleY) * printRatioH),
                        "x": ((object.left - ((object.width * object.scaleX) / 2) - leftArea) * printRatioW),
                        "y": ((object.top - ((object.height * object.scaleY) / 2) - topArea) * printRatioH),
                        "zIndex": 0,
                        "text": object.text,
                        "fontColor": object.fill,
                        "fontSize": ((object.fontSize * object.scaleX) * printRatioW) * 3.7,
                        "fontType": object.fontFamily,
                        // "backgroundColor": "#555555",
                        "hAlign": "C",
                        "vAlign": "M",
                        'textFitToBox': true,
                        "stickToBox": true,
                        "rotation": (360 - (object.flipped ? 0 : object.angle)),
                        // "image_rotation": (360 - object.angle),
                        "strokeColor": object.strokeStyle,
                        "arcRadius": (object.diameter / 2) * printRatioH,
                        // "arcKerning": object.kerning,
                        "flipArc": object.flipped,
                        "strokeWidth": ((object.strokeWidth * object.scaleX) * printRatioW)
                        // "underline": object.underline
                    }

                    elements['text' + textCount] = paramsVal
                    textCount++
                }

                if (object.ktype == 'placeholder-image') {
                    console.log('placeholder-image:', object)
                    const paramsVal = {
                        "type": "image",
                        "width": ((object.width * object.scaleX) * printRatioW), // (object.width object.scaleX)
                        "height": ((object.height * object.scaleY) * printRatioH),
                        "x": ((object.left - ((object.width * object.scaleX) / 2) - leftArea) * printRatioW),
                        "y": ((object.top - ((object.height * object.scaleY) / 2) - topArea) * printRatioH),
                        "zIndex": 0,
                        "url": object.src,
                        "fit": "cover",
                        "rotation": -(object.angle - 360),
                    }

                    // elements.push(paramsVal)
                    elements['image' + imageCount] = paramsVal
                    imageCount++
                }
            }
        })

        console.log("elements:", elements)

        const params = {
            'callback': `${apis.artworkUrl}/artwork-callback`,
            'reference': "test_" + new Date().getTime(),
            'templateID': templateId,
            'withPriority': true,
            'overwrites': {
                elements
            }
        }

        this.ds.artwork(params).subscribe(resp => {
            let pdf, jpg, png
            if (resp.files) {
                pdf = resp.files.pdf
                jpg = resp.files.jpg
                png = resp.files.png
            } else {
                pdf = resp.pdf
                jpg = resp.jpg
                png = resp.png
            }
            const files = {
                'pdf': pdf,
                'png': png,
                'jpg': jpg
            }
            this.fileTypes.jpg = jpg
            this.fileTypes.png = png
            this.fileTypes.pdf = pdf
            const params2 = {
                'template_id': templateId,
                'elevation_id': elevationId,
                'artwork_payload': params,
                'product_id': this.ds.productId,
                'files': JSON.stringify(files)
            }
            if (action == 'add') {
                this.ds.addArtworkTemplate(params2).subscribe(resp => {
                    this.loadArtwork = false
                })
            } else {
                this.ds.updateArtworkTemplate(params2).subscribe(resp => {
                    this.loadArtwork = false
                })
            }
        })
    }

    download() {
        let fileName
        let fileUrl
        if (this.preview === 'jpg') {
            fileName = 'preview.jpg'
            fileUrl = this.fileTypes.jpg
        } else if (this.preview === 'png') {
            fileName = 'preview.png'
            fileUrl = this.fileTypes.png
        } else if (this.preview === 'pdf') {
            fileName = 'preview.pdf'
            fileUrl = this.fileTypes.pdf
        }

        const FileSaver = require('file-saver')
        const url = fileUrl
        const name = fileName
        FileSaver.saveAs(url, name)
    }

    initializeCanvas() {
        fabric.Object.NUM_FRACTION_DIGITS = 10
        this._canvs2 = new fabric.Canvas('main-canvas2', {
            //backgroundColor: '#fff', //  '#ebebef',
            selection: false,
            preserveObjectStacking: true,
        })

        setTimeout(this.resizeCanvas.bind(this), 200)
        // this._canvs2.on('mouse:down', this.canvasMouseDown.bind(this))
        // this._canvs2.on('mouse:move', this.canvasMouseMove.bind(this))
        // this._canvs2.on('mouse:dblclick', this.canvasMouseClick.bind(this))
        // this._canvs2.on('mouse:up', this.canvasMouseUp.bind(this))
        // this._canvs2.on('object:scaling', this.objectScaling.bind(this))
        // this._canvs2.on('object:modified', this.objectModified.bind(this))
        // this._canvs2.on('mouse:wheel', this.objectZoom.bind(this))
        // this._canvs2.on('object:moving', this.objectMoving.bind(this))
        // this._zone.run(() => this._canvs2.on('mouse:down', this.canvasMouseDown.bind(this)))
    }

    resizeCanvas(width = null, height = null) {
        this.canvasData.containerSize = {
            width: this.canvasWrapper2.nativeElement.offsetWidth,
            height: this.canvasWrapper2.nativeElement.offsetHeight
        }

        const canvasSize = {
            width: width ? width : this.canvasData.containerSize.width,
            height: height ? height : this.canvasData.containerSize.height
        }

        //  this._canvs2.setWidth(canvasSize.width)
        //  this._canvs2.setHeight(canvasSize.height)
        this._canvs2.setDimensions(canvasSize, { backstoreOnly: true })
        this._canvs2.setDimensions({
            width: this.canvasData.containerSize.width + 'px',
            height: this.canvasData.containerSize.height + 'px'
        }, { cssOnly: true })

        //  zoom ratio with respect to canvas container size
        const scaleRatio = Math.min(this.canvasData.containerSize.width / canvasSize.width, this.canvasData.containerSize.height / canvasSize.height)
        //  No need to set it explicitly. Browser will set this automatically
        //  this._canvs2.setZoom(scaleRatio)
        console.log('----------------------------------------------------')
        console.log('Container: ', this.canvasData.containerSize.width + 'x' + this.canvasData.containerSize.height)
        console.log('DB Canvas: ', canvasSize.width + 'x' + canvasSize.height)
        console.log('Zoom Level: ', scaleRatio, this._canvs2.getZoom())
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

        this._canvs2?.centerObject(rect)

        this._canvs2?.add(rect)
        this._canvs2?.renderAll()
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
        this._canvs2?.renderAll()
    }

    canvasMouseDown(event: fabric.IEvent) {
        if (event.target !== null && this.isOurItem(event.target)) {
            if (this.selectedItem !== event.target) {
                this.selectedItemChanged(this.selectedItem)
            }
            this.selectedItem = event.target

            this.updateDimensions()
            if (this.selectedItem !== null && this.selectedItem.ktype !== 'placeholder-image') {
                this.getImageResolution()
            }
        }
    }

    isOurItem(o: any): boolean {
        return o?.ktype === 'placeholder-image' || o?.ktype === 'placeholder-text' || o?.ktype === 'placeholder-curvedtext'
    }
    selectedItemChanged(oldItem) {
        this.resetScalingSlider()
    }
    updateDimensions() {
        const w = this.selectedItem.getScaledWidth()
        const h = this.selectedItem.getScaledHeight()
        const x = this.selectedItem.left
        const y = this.selectedItem.top

        if (this.selectedItemMetaData.initialScaledWidth === 0) {
            this.selectedItemMetaData.initialScaledWidth = w
            this.selectedItemMetaData.initialScaledHeight = h
        }

        // console.log('w:', w, 'h:', h, 'x:', x, 'y:', y, 'imgW:', this.selectedItem.imgWidth, 'imgH:', this.selectedItem.imgHeight)

        // this.dataForm.controls.scale_slider.setValue(100, { emitEvent: false })
        // this.dataForm.controls.height.setValue(h / this.printRatioH, { emitEvent: false })
        // this.dataForm.controls.width.setValue(w / this.printRatioW, { emitEvent: false })

        // this.dataForm.controls.height.setValue(this.selectedItem.imgHeight, { emitEvent: false })
        // this.dataForm.controls.width.setValue(this.selectedItem.imgWidth, { emitEvent: false })



        // this.dataForm.controls.x.setValue(x, { emitEvent: false })
        // this.dataForm.controls.y.setValue(y, { emitEvent: false })
        // this.dataForm.controls.rotate.setValue(this.selectedItem.angle, { emitEvent: false })


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

            // this.textDataForm.controls.fixed_length.setValue(this.selectedItem.formFixLength, { emitEvent: false })
            // this.textDataForm.controls.label.setValue(this.selectedItem.formLabel, { emitEvent: false })
            // this.textDataForm.controls.required.setValue(this.selectedItem.formRequired, { emitEvent: false })
            this.fontId = +this.selectedItem.pFontId
            this.fontFileId = +this.selectedItem.fontId
            if (this.fontId > 0) {
                this.getFontFiles(this.fontId)
            }
        } else if (this.selectedItem.ktype === 'placeholder-curvedtext') {
            this.textProps.diameter = this.selectedItem.diameter
            this.textProps.flipped = this.selectedItem.flipped
            this.textProps.kerning = this.selectedItem.kerning
            this.textProps.angle = this.selectedItem.angle
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

            this.fontId = +this.selectedItem.pFontId
            this.fontFileId = +this.selectedItem.fontId
            if (this.fontId > 0) {
                this.getFontFiles(this.fontId)
            }
        }
        else if (this.selectedItem.ktype === 'placeholder-image') {
            this.getImageResolution()
            // this.imageDataForm.patchValue({max_size:this.selectedItem.formMaxSize})
            // this.imageDataForm.patchValue({allowed_type:this.selectedItem.formAllowType})
        }
    }
    getImageResolution() {

        // if (this.selectedItem.lib_file_id) {
        //     this.selectedLibFile = this.userLibList.find(v => v.id === this.selectedItem.lib_file_id)
        // }

        const ratio = this.selectedItem.width / this.selectedItem.height

        // selected mm in our system
        const selectedWmm = this.selectedItem.getScaledWidth() / this.printRatioW
        const selectedHmm = this.selectedItem.getScaledHeight() / this.printRatioH// w/ratio

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
        // this.imageDataForm.controls.ppc.setValue(Math.round(ppmmRes), { emitEvent: false })
        // this.imageDataForm.controls.ppi.setValue(Math.round(ppi), { emitEvent: false })
        // console.log('dpmm:', dpmm, 'ration:', ratio,'wid:',w,'hig:',h,'ppc:',ppc,'ppi:',ppi,'ppcw:',ppcw,'ppch:',ppch);

        // console.log(this.imgWidth,this.imgHight)
        // console.log('selected', this.selectedItem)
    }
    resetScalingSlider() {
        this.selectedItemMetaData = {
            initialScaledWidth: 0,
            initialScaledHeight: 0,
            initialFontSize: this.defaultFontSize
        }
        // this.dataForm.controls.scale_slider.setValue(100, { emitEvent: false })
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
                // const text = new fabric.Text('IT Hub',{ fontFamily: 'fantasy'})
                this.selectedItem.set('pFontId', this.fontId)
                this.selectedItem.set('fontFamily', res.family)
                this.selectedItem.set('fontStyle', res.style)
                // this.selectedItem.set('textAlign', res.textAlign)
                this.selectedItem.set('fontWeight', res.weight)
                this.selectedItem.set('fontId', this.fontFileId)
                this.render.setStyle(this.fnt.nativeElement, 'font-family', res.family)
                // this.lodedFontFamily = res.family
                this.textProps.fontFamily = res.family

                this._canvs2.renderAll()
            }

        }).catch((error) => {

        })

        // if(customFont.FontFace.status == 'loaded'){
        //     const text = new fabric.Text('IT Hub',{ fontFamily: 'fantasy'})
        //     console.log('ismail', text);
        // }

    }
    getFontFiles(id) {
        if (id) {
            this.fontFileId = id
        } else {
            console.log('In getFontFiles function parameter is: ', id)
        }
        this.loadFont()
    }

    changeElevation(i: any) {
        this.activeElevation = i
    }

    getMaxChar(e) {
        if (e.target.value.length === e.target.maxLength) {
            this.alert.error(`Only ${e.target.value.length} characters allowed.`)
        }
    }
}
