import { QuillModule } from 'ngx-quill'
import { DataService } from './data.service'
import { RouterModule } from '@angular/router'
import { ModalModule } from 'ngx-bootstrap/modal'
import { LazyLoadImageModule } from 'ng-lazyload-image'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { IAlertsModule } from 'src/app/libs/ialert/ialerts.module'
import { SharedModule } from 'src/app/website/shared/shared.module'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LoginComponent } from './login.component'
import { AngularEditorModule } from '@kolkov/angular-editor'

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        IAlertsModule,
        FormsModule,
        ReactiveFormsModule,
        UserSharedModule,
        LazyLoadImageModule,
        AngularEditorModule,
        QuillModule.forRoot(),
        ModalModule.forRoot(),
        RouterModule.forChild([
            { path: '', component: LoginComponent }
        ])
    ],
    declarations: [LoginComponent],
    providers: [DataService]
})
export class LoginModule { }
