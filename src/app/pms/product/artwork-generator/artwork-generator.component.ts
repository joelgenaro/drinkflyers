import { apis } from 'src/environments/environment'
import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { DataService } from '../data.service'
import { isObject } from 'util'
declare var require: any
@Component({
    selector: 'app-artwork-generator',
    templateUrl: './artwork-generator.component.html',
    styleUrls: ['./artwork-generator.component.scss'],
})
export class ArtworkGeneratorComponent implements OnInit, OnDestroy {

    printRatioW = 1
    printRatioH = 1

    loadArtwork = false
    selectedBaseProductId: any
    spinnerSVG = `/assets/images/rolling-gray.svg`
    dataStatus = 'fetching'
    activeElevation = 0
    productImages: Array<any>
    preview: any = 'jpg'
    fileTypes = {
        jpg: '',
        png: '',
        pdf: ''
    }
    constructor(
        public ds: DataService,
        public ui: UIHelpers,
        public alert: IAlertService,
        private route: ActivatedRoute,
    ) {
        ds.activeTab = 'mock-ups'
        this.ds.productId = this.route.snapshot.queryParamMap.get('id')
        this.ds.baseProductId = this.route.snapshot.queryParamMap.get('base_id')
        this.selectedBaseProductId = this.route.snapshot.queryParamMap.get('base_id')
        this.fetchImages()
    }

    ngOnInit() {

    }
    changeElevation(i: any) {
        this.activeElevation = i
    }
    fetchImages() {
        this.dataStatus = 'fetching'
        const param = {
            id: this.ds.productId
        }
        this.ds.imagesList(param).subscribe(resp => {
            if (resp.success === true) {
                this.productImages = resp.data
                this.dataStatus = 'done'
            } else {
                this.alert.error(resp.errors.general)
                this.dataStatus = 'done'
            }
        })
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
                    "width": img.elevation.p_width,
                    "units": "mm",
                    "height": img.elevation.p_height,
                    "backgroundColor": null,
                    "elements": {}
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

        obj.objects.forEach((object, index) => {
            if (index > 0) {

                console.log('object:', object)
                if (object.originalTop && object.originalLeft) {
                    object.left = object.originalLeft
                    object.top = object.originalTop
                }
                if (object.ktype === 'placeholder-text') {

                    const paramsVal = {
                        "type": "text",
                        "width": ((object.width * object.scaleX) * printRatioW), // (object.width object.scaleX)
                        "height": ((object.height * object.scaleY) * printRatioH),
                        // "x": (x * printRatioW),
                        // "y": (y * printRatioH),
                        "x": (object.left * printRatioW),
                        "y": (object.top * printRatioH),
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

                if (object.ktype == 'placeholder-image') {
                    console.log('placeholder-image:', object)
                    const paramsVal = {
                        "type": "image",
                        "width": ((object.width * object.scaleX) * printRatioW), // (object.width object.scaleX)
                        "height": ((object.height * object.scaleY) * printRatioH),
                        "x": (object.left * printRatioW),
                        "y": (object.top * printRatioH),
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
            'reference': 'test',
            'templateID': templateId,
            'withPriority': true,
            'overwrites': {
                elements
            }
        }

        this.ds.artwork(params).subscribe(resp => {
            let pdf, jpg, png
            if (resp.files) {

                if(resp.files.pdf){
                    pdf = resp.files.pdf
                }
                // if(resp.files.jpg){
                //     jpg = resp.files.jpg
                // }
                if(resp.files.png){
                    png = resp.files.png
                }

            } else {

                if(resp.png){ png = resp.png }
                if(resp.pdf){ pdf = resp.pdf }
                // if(resp.jpg){ jpg = resp.jpg }

            }
            const files = {
                'pdf': pdf,
                'png': png
                // 'jpg': jpg
            }

            // this.fileTypes.jpg = jpg
            this.fileTypes.png = png
            this.fileTypes.pdf = pdf

            const params = {
                'template_id': templateId,
                'elevation_id': elevationId,
                'product_id': this.ds.productId,
                'files': JSON.stringify(files)
            }
            if (action == 'add') {
                this.ds.addArtworkTemplate(params).subscribe(resp => {
                    this.loadArtwork = false
                })
            } else {
                this.ds.updateArtworkTemplate(params).subscribe(resp => {
                    this.loadArtwork = false
                })
            }
        })
    }
    download() {
        let fileName
        let fileUrl
        if (this.preview == 'jpg') {
            fileName = 'preview.jpg'
            fileUrl = this.fileTypes.jpg
        } else if (this.preview == 'png') {
            fileName = 'preview.png'
            fileUrl = this.fileTypes.png
        } else if (this.preview == 'pdf') {
            fileName = 'preview.pdf'
            fileUrl = this.fileTypes.pdf
        }

        const FileSaver = require('file-saver')
        const url = fileUrl
        const name = fileName
        FileSaver.saveAs(url, name)
    }
    ngOnDestroy(): void {

    }
}
