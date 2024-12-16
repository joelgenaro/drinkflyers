import { BreadcrumsComponent } from './breadcrums/breadcrums.component'
import { NotAuthorizedComponent } from './not-authorized/not-authorized.component'
import { SkeletonTabelLoaderComponent } from './skeleton-tabel-loader/skeleton-tabel-loader.component'
import { NoDataComponent } from './no-data/no-data.component'
import { LoaderComponent } from './loader/loader.component'
import { BsDropdownModule } from 'ngx-bootstrap/dropdown'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { NgxMaskModule, IConfig } from 'ngx-mask'
import { ClientSidebarComponent } from './client-sidebar/client-sidebar.component'
import { IAlertsModule } from 'src/app/libs/ialert/ialerts.module'
import { NgScrollbarModule, NG_SCROLLBAR_OPTIONS } from 'ngx-scrollbar'


@NgModule({
    imports: [
        IAlertsModule,
        BsDropdownModule.forRoot(),
        CommonModule, FormsModule, RouterModule,
        NgxMaskModule.forRoot()
    ],
    declarations: [
        ClientSidebarComponent,
        SkeletonTabelLoaderComponent,
        LoaderComponent,
        NoDataComponent,
        NotAuthorizedComponent,
        BreadcrumsComponent
    ],
    providers: [
    ],
    exports: [
        ClientSidebarComponent, LoaderComponent, NoDataComponent,
        IAlertsModule, BsDropdownModule, SkeletonTabelLoaderComponent, BreadcrumsComponent,
        CommonModule, FormsModule, RouterModule, NgxMaskModule, NgScrollbarModule
    ]
})
export class ClientSharedModule { }
