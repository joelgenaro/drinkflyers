import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DataService } from './data.service'
import { RouterModule } from '@angular/router'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RejectedPoRequestComponent } from './rejected-po-request.component'
import { ModalModule } from 'ngx-bootstrap/modal'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { IAlertsModule } from 'src/app/libs/ialert/ialerts.module'
import { SharedModule } from 'src/app/website/shared/shared.module'
@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        IAlertsModule,
        FormsModule,
        ReactiveFormsModule,
        TooltipModule.forRoot(),
        UserSharedModule,
        ModalModule.forRoot(),
        RouterModule.forChild([
            { path: '', component: RejectedPoRequestComponent }
        ])
    ],
    declarations: [RejectedPoRequestComponent],
    providers: [DataService]
})
export class RejectedPoRequestModule { }
