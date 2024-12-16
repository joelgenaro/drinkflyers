import { IAlertsModule } from './../../../libs/ialert/ialerts.module'
import { UserSharedModule } from './../../../user-panel/user-shared/user-shared.module'
import { SharedModule } from './../../../website/shared/shared.module'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ModalModule } from 'ngx-bootstrap/modal'
import { RouterModule } from '@angular/router'
import { DataService } from './data.service'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TagComponent } from './tag.component'

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
            { path: '', component: TagComponent }
        ])
    ],
    declarations: [TagComponent],
    providers: [DataService]
})
export class TagModule { }
