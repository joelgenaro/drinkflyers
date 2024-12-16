import { DataService } from './data.service'
import { RouterModule } from '@angular/router'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BulkUploaderComponent } from './bulk-uploader.component'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ModalModule } from 'ngx-bootstrap/modal'
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'
import { NgSelectModule } from '@ng-select/ng-select'
import { SharedModule } from 'src/app/website/shared/shared.module'
import { IAlertsModule } from 'src/app/libs/ialert/ialerts.module'

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        UserSharedModule,
        NgSelectModule,
        FormsModule,
        ReactiveFormsModule,
        IAlertsModule,
        BsDatepickerModule.forRoot(),
        ModalModule.forRoot(),
        RouterModule.forChild([
            { path: '', component: BulkUploaderComponent }
        ])
    ],
    declarations: [BulkUploaderComponent],
    providers: [DataService]
})
export class BulkUploaderModule { }
