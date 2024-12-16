import { RouterModule } from '@angular/router'
import { ModalModule } from 'ngx-bootstrap/modal'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { IAlertsModule } from 'src/app/libs/ialert/ialerts.module'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'
import { SharedModule } from 'src/app/website/shared/shared.module'
import { DataService } from './data.service'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FulfilmentComponent } from './fulfilment.component'

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        UserSharedModule,
        IAlertsModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule.forRoot(),
        RouterModule.forChild([{ path: '', component: FulfilmentComponent }])
    ],
    declarations: [FulfilmentComponent],
    providers: [DataService]
})
export class FulfilmentModule { }
