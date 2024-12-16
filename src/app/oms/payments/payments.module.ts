import { PaymentsComponent } from './payments.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DataService } from './data.service'
import { RouterModule } from '@angular/router'

import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'
import { SharedModule } from 'src/app/website/shared/shared.module'
import { IAlertsModule } from 'src/app/libs/ialert/ialerts.module'
import { ModalModule } from 'ngx-bootstrap/modal'
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgSelectModule } from '@ng-select/ng-select';



@NgModule({
    declarations: [
        PaymentsComponent
    ],
    imports: [
        CommonModule,
        UserSharedModule,
        FormsModule,
        ReactiveFormsModule,
        NgSelectModule,
        BsDatepickerModule.forRoot(),
        ModalModule.forRoot(),
        TooltipModule.forRoot(),
        RouterModule.forChild([
            { path: '', component: PaymentsComponent }
        ])
    ],
    providers: [DataService]

})
export class PaymentsModule { }
