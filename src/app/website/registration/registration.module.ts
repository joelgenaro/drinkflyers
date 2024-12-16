import { NgModule, Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RegistrationComponent } from './registration.component'
import { RouterModule } from '@angular/router'
import { DataService } from './data.service'
import { SharedModule } from '../shared/shared.module'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'
import { ModalModule } from 'ngx-bootstrap/modal'

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild([
            { path: '', component: RegistrationComponent }
        ])
    ],
    declarations: [RegistrationComponent],
    providers: [DataService]

})
export class RegistrationModule { }
