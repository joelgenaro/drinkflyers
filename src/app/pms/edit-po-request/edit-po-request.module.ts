import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'
import { DataService } from './data.service'
import { RouterModule } from '@angular/router'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { EditPoRequestComponent } from './edit-po-request.component'
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'
import { ModalModule } from 'ngx-bootstrap/modal'
import { TooltipModule } from 'ngx-bootstrap/tooltip'

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        UserSharedModule,
        TooltipModule.forRoot(),
        ModalModule.forRoot(),
        BsDatepickerModule.forRoot(),
        RouterModule.forChild([
            { path: '', component: EditPoRequestComponent }
        ])
    ],
    declarations: [EditPoRequestComponent],
    providers: [DataService]
})
export class EditPoRequestModule { }
