import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ShippingZoneRateComponent } from './shipping-zone-rate.component'
import { DataService } from './data.service'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { IAlertsModule } from 'src/app/libs/ialert/ialerts.module'
import { RouterModule } from '@angular/router'
import { ModalModule } from 'ngx-bootstrap/modal'
import { SharedModule } from 'src/app/website/shared/shared.module'
import { NgSelectModule } from '@ng-select/ng-select'

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        UserSharedModule,
        IAlertsModule,
        FormsModule,
        ReactiveFormsModule,
        NgSelectModule,
        ModalModule.forRoot(),
        RouterModule.forChild([
            { path: '', component: ShippingZoneRateComponent }
        ])
    ],
    declarations: [ShippingZoneRateComponent],
    providers: [DataService]
})
export class ShippingZoneRateModule { }
