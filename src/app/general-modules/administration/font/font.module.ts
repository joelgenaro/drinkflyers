import { SharedModule } from './../../../website/shared/shared.module';
import { UserSharedModule } from './../../../user-panel/user-shared/user-shared.module';
import { IAlertsModule } from './../../../libs/ialert/ialerts.module';
import { DataService } from './data.service'
import { RouterModule } from '@angular/router'
import { NgModule, Component } from '@angular/core'
import { FontComponent } from './font.component'
import {FormsModule,ReactiveFormsModule } from '@angular/forms'
import { ModalModule } from 'ngx-bootstrap/modal'
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'

@NgModule({
    imports: [
        FormsModule,
        UserSharedModule,
        IAlertsModule,
        SharedModule,
        ReactiveFormsModule,
        ModalModule.forRoot(),
        BsDatepickerModule.forRoot(),
        RouterModule.forChild([
            { path: '', component: FontComponent }
        ])
    ],
    declarations: [FontComponent],
    providers: [DataService]
})
export class FontModule { }
