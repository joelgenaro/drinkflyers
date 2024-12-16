import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { StateComponent } from './state.component'
import { DataService } from './data.service'
import { SharedModule } from 'src/app/website/shared/shared.module'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'
import { IAlertsModule } from 'src/app/libs/ialert/ialerts.module'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ModalModule } from 'ngx-bootstrap/modal'
import { RouterModule } from '@angular/router'

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        UserSharedModule,
        IAlertsModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule.forRoot(),
        RouterModule.forChild([
            { path: '', component: StateComponent }
        ])
    ],
    declarations: [StateComponent],
    providers: [DataService]
})
export class StateModule { }
