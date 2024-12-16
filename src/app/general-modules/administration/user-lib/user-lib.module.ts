import { RouterModule } from '@angular/router'
import { ModalModule } from 'ngx-bootstrap/modal'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { DataService } from './data.service'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { UserLibComponent } from './user-lib.component'
import { SharedModule } from 'src/app/website/shared/shared.module'
import { IAlertsModule } from 'src/app/libs/ialert/ialerts.module'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        IAlertsModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule.forRoot(),
        UserSharedModule,
        RouterModule.forChild([
            { path: '', component: UserLibComponent }
        ])
    ],
    declarations: [UserLibComponent],
    providers: [DataService]
})
export class UserLibModule { }
