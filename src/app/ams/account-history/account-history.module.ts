import { RouterModule } from '@angular/router'
import { DataService } from './data.service'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AccountHistoryComponent } from './account-history.component'
import { SharedModule } from 'src/app/website/shared/shared.module'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'
import { IAlertsModule } from 'src/app/libs/ialert/ialerts.module'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        UserSharedModule,
        IAlertsModule,
        FormsModule,
        BsDatepickerModule.forRoot(),
        RouterModule.forChild([
            { path: '', component: AccountHistoryComponent }
        ])
    ],
    declarations: [AccountHistoryComponent],
    providers: [DataService]
})
export class AccountHistoryModule { }
