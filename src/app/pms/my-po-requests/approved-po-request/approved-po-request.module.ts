import { TooltipModule } from 'ngx-bootstrap/tooltip'
import { DataService } from './data.service'
import { RouterModule } from '@angular/router'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ApprovedPoRequestComponent } from './approved-po-request.component'
import { ModalModule } from 'ngx-bootstrap/modal'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { IAlertsModule } from 'src/app/libs/ialert/ialerts.module'
import { SharedModule } from 'src/app/website/shared/shared.module'
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'
@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        IAlertsModule,
        FormsModule,
        ReactiveFormsModule,
        UserSharedModule,
        TooltipModule.forRoot(),
        ModalModule.forRoot(),
        BsDatepickerModule.forRoot(),
        RouterModule.forChild([
            { path: '', component: ApprovedPoRequestComponent }
        ])
    ],
    declarations: [ApprovedPoRequestComponent],
    providers: [DataService]
})
export class ApprovedPoRequestModule { }
