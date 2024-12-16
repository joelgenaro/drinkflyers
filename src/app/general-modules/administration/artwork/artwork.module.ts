import {  ImageCropperModule } from 'ngx-image-cropper';
import { IAlertsModule } from './../../../libs/ialert/ialerts.module'
import { SharedModule } from './../../../website/shared/shared.module'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'
import { DataService } from './data.service'



import { RouterModule } from '@angular/router'
import { NgModule, Component } from '@angular/core'
import { ArtworkComponent } from './artwork.component'
import {FormsModule,ReactiveFormsModule } from '@angular/forms'
import { ModalModule } from 'ngx-bootstrap/modal'
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'

@NgModule({
    imports: [
        FormsModule,
        UserSharedModule,
        IAlertsModule,
        ImageCropperModule,
        SharedModule,
        ReactiveFormsModule,
        ModalModule.forChild(),
        BsDatepickerModule.forRoot(),
        RouterModule.forChild([
            { path: '', component: ArtworkComponent }
        ])
    ],
    declarations: [ArtworkComponent],
    providers: [DataService]
})
export class ArtworkModule { }
