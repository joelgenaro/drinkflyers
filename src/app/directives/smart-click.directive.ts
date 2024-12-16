import { Directive, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core'
import { Subject, Subscription } from 'rxjs'
import { throttleTime } from 'rxjs/operators'

@Directive({
    selector: '[appSmartClick]'
})
export class SmartClickDirective implements OnInit, OnDestroy {
    @Input()
    throttleTime = 1000

    @Output()
    smartClick = new EventEmitter()

    private clicks = new Subject()
    private subscription: Subscription

    constructor() { }

    ngOnInit() {
        this.subscription = this.clicks.pipe(
            throttleTime(this.throttleTime)
        ).subscribe(e => this.emitsmartClick(e))
    }

    emitsmartClick(e) {
        this.smartClick.emit(e)
    }

    ngOnDestroy() {
        this.subscription.unsubscribe()
    }

    @HostListener('click', ['$event'])
    clickEvent(event) {
        event.preventDefault()
        event.stopPropagation()
        this.clicks.next(event)
    }
}