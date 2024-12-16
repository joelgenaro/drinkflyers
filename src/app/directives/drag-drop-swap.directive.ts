import {
    Directive,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    Output,
} from '@angular/core'

@Directive({
    selector: '[appDragDropSwap]',
})
export class DragDropSwapDirective {
    constructor() { }

    @HostBinding('attr.draggable') draggable = true
    @Input('elemPosition') elemPosition: number
    @Input('list') list: any
    @Output('returnUpdatedList') returnUpdatedList = new EventEmitter<any>()

    @HostListener('dragstart', ['$event'])
    onDragStart(e) {
        console.log('e.sdjfk', e.target)
        e.dataTransfer.setData('text', this.elemPosition)
    }

    @HostListener('drop', ['$event'])
    onDrop(e) {
        e.preventDefault()
        let sourceElementIndex = e.dataTransfer.getData('text')
        let destElementIndex = this.elemPosition
        let clonedList = [...this.list]
        if (sourceElementIndex !== destElementIndex) {
            clonedList.splice(destElementIndex, 1, this.list[sourceElementIndex])
            clonedList.splice(sourceElementIndex, 1, this.list[destElementIndex])
            this.returnUpdatedList.emit(clonedList)
        }
    }

    @HostListener('dragover', ['$event'])
    onDragOver(e) {
        e.preventDefault()
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(e) {
        if (e.target.classList.value.includes('draggable-handler')) {
           this.draggable = true
        } else {
            this.draggable = false
        }
    }
}
