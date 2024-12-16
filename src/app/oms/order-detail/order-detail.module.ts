import { DataService } from './data.service'
import { RouterModule } from '@angular/router'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { OrderDetailComponent } from './order-detail.component'
import { SharedModule } from 'src/app/website/shared/shared.module'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'
import { IAlertsModule } from 'src/app/libs/ialert/ialerts.module'

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        UserSharedModule,
        RouterModule.forChild([
            { path: '', component: OrderDetailComponent }
        ])
    ],
    declarations: [OrderDetailComponent],
    providers: [DataService]
})
export class OrderDetailModule { }
