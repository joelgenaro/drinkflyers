import { style } from '@angular/animations'
import { Component, Input, ElementRef, OnChanges } from '@angular/core'

@Component({
    selector: 'app-read-more',
    template: `
        <span [innerHTML]="currentText"></span>
        <span (click)="toggleView()">
            <a [class.hidden]="hideToggle" class="read-more" *ngIf="currentText?.length > maxLength"> Show {{isCollapsed? 'All' : ' less'}}</a>
        </span>
    `,
    styles: [`
        .read-more {
            /* color: #000;
            font-weight: bold;
            cursor: default; */
            cursor: pointer;
            color: #2c6ecb;
        }
        .read-more:hover {
            color: #1f5199;
            text-decoration: underline;
        }
    `]
})

export class ReadMoreComponent implements OnChanges {
    @Input() text: string
    @Input() maxLength = 100
    currentText: string
    hideToggle = true
    public isCollapsed = true

    constructor(private elementRef: ElementRef) {

    }
    toggleView() {
        this.isCollapsed = !this.isCollapsed
        this.determineView()
    }
    determineView() {
        if (!this.text || this.text.length <= this.maxLength) {
            this.currentText = this.text
            this.isCollapsed = false
            this.hideToggle = true

            return false
        }

        this.hideToggle = false
        if (this.isCollapsed == true) {
            this.currentText = this.text.substring(0, this.maxLength) + '...'
        } else if (this.isCollapsed == false) {
            this.currentText = this.text
        }

    }
    ngOnChanges() {
        this.determineView()
    }
}
