import { EditTemplateComponent } from './edit-template/edit-template.component';
import { DataService } from './data.service'
import { RouterModule } from '@angular/router'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { EmailTemplateComponent } from './email-template.component'
import { SharedModule } from 'src/app/website/shared/shared.module'
import { IAlertsModule } from 'src/app/libs/ialert/ialerts.module'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ModalModule } from 'ngx-bootstrap/modal'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'
import { NgSelectModule } from '@ng-select/ng-select'
import { QuillModule } from 'ngx-quill'

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        IAlertsModule,
        FormsModule,
        ReactiveFormsModule,
        NgSelectModule,
        ModalModule.forRoot(),
        QuillModule.forRoot(),
        UserSharedModule,
        RouterModule.forChild([
            { path: '', component: EmailTemplateComponent }
        ])
    ],
    declarations: [EmailTemplateComponent, EditTemplateComponent],
    providers: [DataService]
})
export class EmailTemplateModule { }
