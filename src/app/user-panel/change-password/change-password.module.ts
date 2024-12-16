import { DataService } from './data.service'
import { ReactiveFormsModule } from '@angular/forms'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ChangePasswordComponent } from './change-password.component'
import { RouterModule } from '@angular/router'


@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule.forChild([
            { path: '', component: ChangePasswordComponent }
        ])
    ],
    providers: [DataService],
    declarations: [ChangePasswordComponent]
})
export class ChangePasswordModule { }
