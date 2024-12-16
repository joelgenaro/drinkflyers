import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'
import { InvoiceComponent } from './invoice.component'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { ModalModule } from 'ngx-bootstrap/modal'
import { DataService } from './data.service'
import { RouterModule } from '@angular/router'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SharedModule } from 'src/app/website/shared/shared.module'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'
import { IAlertsModule } from 'src/app/libs/ialert/ialerts.module'
import { QuillModule } from 'ngx-quill'

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        UserSharedModule,
        IAlertsModule,
        FormsModule,
        ReactiveFormsModule,
        QuillModule.forRoot(),
        BsDatepickerModule.forRoot(),
        ModalModule.forRoot(),
        RouterModule.forChild([
            { path: '', component: InvoiceComponent }
        ])
    ],
    declarations: [InvoiceComponent],
    providers: [DataService]
})
export class InvoiceModule { }
