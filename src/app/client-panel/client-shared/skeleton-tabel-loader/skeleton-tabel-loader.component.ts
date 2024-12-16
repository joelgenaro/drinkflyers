import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: '[appSkeletonTabelLoader]',
    templateUrl: './skeleton-tabel-loader.component.html',
    styleUrls: ['./skeleton-tabel-loader.component.css']
})
export class SkeletonTabelLoaderComponent implements OnInit {
    @Input()
    appSkeletonTabelLoader: Options
    rows = []
    cols = []
    constructor() {
    }

    ngOnInit() {
        for (let i = 0; i < this.appSkeletonTabelLoader.rows; i++) {
            this.rows.push(i)
        }

        for (let i = 0; i < this.appSkeletonTabelLoader.cols; i++) {
            if (this.appSkeletonTabelLoader.colSpans[i]) {
                this.cols.push(this.appSkeletonTabelLoader.colSpans[i])
                i = i + this.appSkeletonTabelLoader.colSpans[i] - 1
            } else {
                this.cols.push(1)
            }
        }

    }

}

export class Options {
    cols = 1
    rows = 1
    colSpans = {}
}
