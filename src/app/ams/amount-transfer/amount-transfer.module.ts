import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'
import { RouterModule } from '@angular/router'
import { DataService } from './data.service'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AmountTransferComponent } from './amount-transfer.component'
import { SharedModule } from 'src/app/website/shared/shared.module'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'
import { IAlertsModule } from 'src/app/libs/ialert/ialerts.module'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ModalModule } from 'ngx-bootstrap/modal'

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        UserSharedModule,
        IAlertsModule,
        FormsModule,
        ReactiveFormsModule,
        BsDatepickerModule.forRoot(),
        ModalModule.forRoot(),
        RouterModule.forChild([
            { path: '', component: AmountTransferComponent }
        ])
    ],
    declarations: [AmountTransferComponent],
    providers: [DataService]
})
export class AmountTransferModule { }
