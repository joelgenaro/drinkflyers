import { RouterModule } from '@angular/router'
import { DataService } from './data.service'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { OutstandingOrdersComponent } from './outstanding-orders.component'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'
import { ModalModule } from 'ngx-bootstrap/modal'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'

@NgModule({
    imports: [
        UserSharedModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        BsDatepickerModule.forRoot(),
        ModalModule.forRoot(),
        RouterModule.forChild([
            { path: '', component: OutstandingOrdersComponent }
        ])
    ],
    declarations: [OutstandingOrdersComponent],
    providers: [DataService]

})
export class OutstandingOrdersModule { }
