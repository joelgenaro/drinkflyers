import { UserSharedModule } from './../user-shared/user-shared.module'
import { NgModule } from '@angular/core'
import { UsersComponent } from './users.component'
import { RouterModule } from '@angular/router'
import { ModalModule } from 'ngx-bootstrap/modal'
import { FormsModule } from '@angular/forms'
import { ReactiveFormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { DataService } from './data.service'

@NgModule({
    imports: [
        UserSharedModule,
        CommonModule,
        FormsModule,
        ModalModule.forRoot(),
        ReactiveFormsModule,
        RouterModule.forChild([
            { path: '', component: UsersComponent }
        ])
    ],
    declarations: [UsersComponent],
    providers: [DataService]

})
export class UsersModule { }
