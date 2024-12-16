import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ModalModule } from 'ngx-bootstrap/modal'
import { RouterModule } from '@angular/router'
import { DataService } from './data.service'
import { NgModule } from '@angular/core'
import { ShipmentComponent } from './shipment.component'
import { SharedModule } from 'src/app/website/shared/shared.module'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'
import { IAlertsModule } from 'src/app/libs/ialert/ialerts.module'
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'
import { TimepickerModule } from 'ngx-bootstrap/timepicker'

@NgModule({
    imports: [
        SharedModule,
        UserSharedModule,
        IAlertsModule,
        BsDatepickerModule.forRoot(),
        TimepickerModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
        ModalModule.forRoot(),
        RouterModule.forChild([
            { path: '', component: ShipmentComponent }
        ])
    ],
    declarations: [ShipmentComponent],
    providers: [DataService]
})
export class ShipmentModule { }
