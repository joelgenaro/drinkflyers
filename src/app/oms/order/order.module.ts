import { RouterModule } from '@angular/router'
import { DataService } from './data.service'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { OrderComponent } from './order.component'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'
import { ModalModule } from 'ngx-bootstrap/modal'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'
import { NgSelectModule } from '@ng-select/ng-select'
import { TooltipModule } from 'ngx-bootstrap/tooltip'

@NgModule({
    imports: [
        UserSharedModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        BsDatepickerModule.forRoot(),
        ModalModule.forRoot(),
        TooltipModule.forRoot(),
        NgSelectModule,
        RouterModule.forChild([
            { path: '', component: OrderComponent }
        ])
    ],
    declarations: [OrderComponent],
    providers: [DataService]

})
export class OrderModule { }
