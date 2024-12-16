import { Component, OnInit, Output, Input, EventEmitter, ElementRef } from '@angular/core'

@Component({
    selector: 'irating',
    templateUrl: './irating.component.html',
    styleUrls: ['./irating.component.css']
})
export class IRatingComponent implements OnInit {
    @Input() stars = 5
    @Input() name = 'rating'
    @Input() value = 0
    @Input() readonly = false
    @Input() size = '34'
    @Output() public valueChange = new EventEmitter()

    choices: Array<number> = []
    constructor(private elementRef: ElementRef) {
    }

    ngOnInit() {
        for (let i = this.stars; i > 0; i -= 0.5) {
            this.choices.push(i)
        }
        this.elementRef.nativeElement.style.setProperty('--star-size', this.size + 'px')
    }

    choose(value: any) {
        console.log('choose', value)
        this.valueChange.emit(value)
    }

    roundoff(num: number): number {
        return Math.round(num * 2) / 2
    }
}
