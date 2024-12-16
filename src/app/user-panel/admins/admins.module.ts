import { SharedModule } from './../../website/shared/shared.module'
import { UserSharedModule } from './../user-shared/user-shared.module'
import { DataService } from './data.service'
import { RouterModule } from '@angular/router'
import { ReactiveFormsModule } from '@angular/forms'
import { ModalModule } from 'ngx-bootstrap/modal'

import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AdminsComponent } from './admins.component'
@NgModule({
    imports: [
        CommonModule,
        UserSharedModule,
        SharedModule,
        ModalModule.forRoot(),
        ReactiveFormsModule,
        RouterModule.forChild([
            { path: '', component: AdminsComponent }
        ]),
        CommonModule
    ],
    declarations: [AdminsComponent],
    providers: [DataService]
})
export class AdminsModule { }
