import { NgSelectModule } from '@ng-select/ng-select'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DataService } from './data.service'
import { RouterModule } from '@angular/router'
import { ClientOrdersComponent } from './client-orders.component'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'
import { SharedModule } from 'src/app/website/shared/shared.module'
import { IAlertsModule } from 'src/app/libs/ialert/ialerts.module'
import { ModalModule } from 'ngx-bootstrap/modal'
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'
import { TooltipModule } from 'ngx-bootstrap/tooltip'

@NgModule({
    declarations: [
        ClientOrdersComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        UserSharedModule,
        FormsModule,
        ReactiveFormsModule,
        NgSelectModule,
        TooltipModule.forRoot(),
        BsDatepickerModule.forRoot(),
        ModalModule.forRoot(),
        RouterModule.forChild([
            { path: '', component: ClientOrdersComponent }
        ])
    ],
    providers: [DataService]

})
export class ClientOrdersModule { }
