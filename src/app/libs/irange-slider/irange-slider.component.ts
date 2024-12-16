import { Component, OnInit, AfterViewInit, Output, Input, EventEmitter, ElementRef, Renderer2, ViewChild, HostListener } from '@angular/core'

@Component({
    selector: 'irange-slider',
    templateUrl: './irange-slider.component.html',
    styleUrls: ['./irange-slider.component.css']
})
export class IRangeSliderComponent implements OnInit, AfterViewInit {
    @Input() min = 0
    @Input() max = 100
    @Input() options: IRangeSliderOptions

    @Input() minValue = 30
    @Output() public minValueChange = new EventEmitter()

    @Input() maxValue = 70
    @Output() public maxValueChange = new EventEmitter()

    @ViewChild('bar', { static: false }) barRef: ElementRef
    @ViewChild('selectedBar', { static: false }) selectedBarRef: ElementRef
    @ViewChild('s1', { static: false }) s1Ref: ElementRef
    @ViewChild('s2', { static: false }) s2Ref: ElementRef

    defaultOptions: IRangeSliderOptions = {
        barColor: '#efefef',
        selectedBarColor: 'rgb(250, 122, 122)',
        dotsColor: '#dc3545'
    }
    scale = 1
    prevX1 = 0
    prevX2 = 0
    barWidth = 100
    s1: any = {
        start: false,
    }
    s2: any = {
        start: false,
    }
    values = {
        min: 0,
        max: 100
    }

    constructor(private renderer: Renderer2, private elementRef: ElementRef) {
    }

    ngOnInit() {
        this.values.min = this.minValue
        this.values.max = this.maxValue
    }

    initializeUI() {
        const v = this.elementRef.nativeElement.style
        v.setProperty('--initial-min', ((this.minValue - this.min) / this.scale) + 'px')
        v.setProperty('--initial-max', ((this.maxValue - this.min) / this.scale) + 'px')

        const options = { ...this.defaultOptions, ...this.options }
        Object.keys(options)
            .forEach((option: any) => {
                v.setProperty(this.camelToPascal(option), options[option])
            })
    }

    camelToPascal(myStr: string) {
        return '--' + myStr.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }

    ngAfterViewInit(): void {
        this.barWidth = this.barRef.nativeElement.clientWidth
        this.scale = (this.max - this.min) / this.barWidth
        this.initializeUI()
        this.updateSelectedBar()
        // console.log('this.barWidth', this.barWidth, 'scale', this.scale)
    }

    initS1(e: any) {
        this.s1.start = true
        // e.stopPropagation()

        return false
    }

    endS1(e: any) {
        this.s1.start = false
        this.prevX1 = 0
        // e.stopPropagation()

        return false
    }

    initS2(e: any) {
        this.s2.start = true
        // e.stopPropagation()

        return false
    }

    endS2(e: any) {
        this.s2.start = false
        this.prevX1 = 0
        // e.stopPropagation()

        return false
    }

    killEvent(e: any) {
        e.stopPropagation()
        e.preventDefault()
    }

    sliding1(e: any) {
        if (this.s1.start) {
            if (this.prevX1 === 0) {
                this.prevX1 = e.clientX
            } else {
                const diff = e.clientX - this.prevX1
                const moveTo = this.s1Ref.nativeElement.offsetLeft + diff
                // console.log('Diff', diff, 'Value', moveTo)
                if (
                    moveTo >= 0 &&
                    (moveTo + this.s1Ref.nativeElement.clientWidth) <= this.barWidth &&
                    (moveTo + this.s1Ref.nativeElement.clientWidth) <= this.s2Ref.nativeElement.offsetLeft
                ) {
                    this.renderer.setStyle(
                        this.s1Ref.nativeElement,
                        'left',
                        (this.s1Ref.nativeElement.offsetLeft + diff) + 'px'
                    )
                    this.updateSelectedBar()
                    this.prevX1 = e.clientX
                } else {
                    this.prevX1 = 0
                }
            }
        }
        // e.stopPropagation()

        return false
    }

    sliding2(e: any) {
        // console.log('this.prevX2 e.clientX', this.prevX2, e.clientX)
        if (this.s2.start) {
            if (this.prevX2 === 0) {
                this.prevX2 = e.clientX
            } else {
                const diff = e.clientX - this.prevX2
                const moveTo = this.s2Ref.nativeElement.offsetLeft + diff
                // console.log('Diff', diff, 'Value', moveTo)
                if (
                    moveTo >= 0 &&
                    (moveTo + this.s2Ref.nativeElement.clientWidth) <= this.barWidth &&
                    moveTo >= (this.s1Ref.nativeElement.offsetLeft + this.s1Ref.nativeElement.clientWidth)
                ) {
                    this.renderer.setStyle(
                        this.s2Ref.nativeElement,
                        'left',
                        moveTo + 'px'
                    )
                    this.updateSelectedBar()
                    this.prevX2 = e.clientX
                } else {
                    // this.prevX2 = 0
                }
            }
        }
        // e.stopPropagation()

        return false
    }

    updateSelectedBar() {
        this.renderer.setStyle(
            this.selectedBarRef.nativeElement,
            'left',
            (this.s1Ref.nativeElement.offsetLeft + 10) + 'px'
        )

        this.renderer.setStyle(
            this.selectedBarRef.nativeElement,
            'width',
            (this.s2Ref.nativeElement.offsetLeft - this.s1Ref.nativeElement.offsetLeft) + 'px'
        )
    }

    @HostListener('document:mouseup', ['$event'])
    onMouseUp(event: MouseEvent) {
        // console.log('----------onMouseUp event---------', event)
        this.endS1(event)
        this.endS2(event)
        this.publishValueChanged()
    }

    @HostListener('document:mousemove', ['$event'])
    onMouseMove(event: MouseEvent) {
        this.sliding1(event)
        this.sliding2(event)
        this.updateValues()
    }

    @HostListener('document:touchend', ['$event'])
    onTouchEnd(event: any) {
        // console.log('----------onTouchEnd event---------', event)
        this.endS1(event)
        this.endS2(event)
        this.publishValueChanged()
    }

    @HostListener('document:touchmove', ['$event'])
    onTouchMove(event: any) {
        event = {
            clientX: event.touches[0].screenX,
            clientY: event.touches[0].screenY,
        }
        this.sliding1(event)
        this.sliding2(event)
        this.updateValues()
    }

    publishValueChanged() {
        this.minValueChange.emit(this.values.min)
        this.maxValueChange.emit(this.values.max)
    }

    updateValues() {
        const s1Offset = Number(window.getComputedStyle(this.s1Ref.nativeElement).left.split('px')[0])
        let pixels1 = s1Offset
        if ((s1Offset + this.s1Ref.nativeElement.clientWidth) === this.barWidth) {
            pixels1 = this.barWidth
        }
        const s2Offset = Number(window.getComputedStyle(this.s2Ref.nativeElement).left.split('px')[0])
        let pixels2 = s2Offset
        if ((s2Offset + this.s2Ref.nativeElement.clientWidth) === this.barWidth) {
            pixels2 = this.barWidth
        }

        this.values = {
            min: Math.round((pixels1 * this.scale) + this.min),
            max: Math.round((pixels2 * this.scale) + this.min)
        }
    }
}

export interface IRangeSliderOptions {
    barColor: string,
    selectedBarColor: string,
    dotsColor: string
}
