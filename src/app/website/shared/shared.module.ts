import { DragDropSwapDirective } from './../../directives/drag-drop-swap.directive'
import { CommaSeparationPipe } from './../../pipes/commaSeparation.pipe'
import { FileSizeConverterPipe } from './../../pipes/file-size-converter.pipe'
import { SafeHtmlPipe } from './../../pipes/safe-html.pipe'
import { SuffixPipe } from './../../pipes/suffix.pipe'
import { LoaderComponent } from './loader/loader.component'
import { IRatingModule } from 'src/app/libs/irating/irating.module'
import { IAlertsModule } from 'src/app/libs/ialert/ialerts.module'

import { PageNotFoundComponent } from './page-not-found/page-not-found.component'
import { ResponseComponent } from './response/response.component'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SmartClickDirective } from 'src/app/directives/smart-click.directive'
import { ReadMoreComponent } from 'src/app/directives/read-more.component'

import { FilterPipe } from 'src/app/pipes/filter.pipe'

@NgModule({
    imports: [
        CommonModule,
        IAlertsModule,
        IRatingModule,
    ],
    declarations: [
        ResponseComponent,
        PageNotFoundComponent,
        SmartClickDirective,
        ReadMoreComponent,
        FilterPipe,
        SafeHtmlPipe,
        LoaderComponent,
        SuffixPipe,
        CommaSeparationPipe,
        FileSizeConverterPipe,
        DragDropSwapDirective
    ],
    exports: [
        FilterPipe, SafeHtmlPipe, CommonModule, SuffixPipe, LoaderComponent, ResponseComponent,
        PageNotFoundComponent, SmartClickDirective, ReadMoreComponent, IAlertsModule, IRatingModule,
        CommaSeparationPipe, FileSizeConverterPipe, DragDropSwapDirective
    ]
})
export class SharedModule { }
