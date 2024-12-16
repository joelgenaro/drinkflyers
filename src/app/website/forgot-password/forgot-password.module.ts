import { LazyLoadImageModule } from 'ng-lazyload-image'
import { DataService } from './data.service'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ForgotPasswordComponent } from './forgot-password.component'
import { SharedModule } from '../shared/shared.module'


@NgModule({
    imports: [
        SharedModule,
        FormsModule,
        LazyLoadImageModule,
        RouterModule.forChild([
            { path: '', component: ForgotPasswordComponent }
        ])
    ],
    declarations: [ForgotPasswordComponent],
    providers: [DataService]
})
export class ForgotPasswordModule { }
