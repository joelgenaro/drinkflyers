import { LazyLoadImageModule } from 'ng-lazyload-image'
import { DataService } from './data.service'
import { SharedModule } from '../shared/shared.module'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SignUpComponent } from './sign-up.component'
import { Routes, RouterModule } from '@angular/router'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

const routes: Routes = [
    { path: '', component: SignUpComponent }
]

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        LazyLoadImageModule,
        RouterModule.forChild(routes)
    ],
    declarations: [SignUpComponent],
    exports: [RouterModule],
    providers: [DataService]
})
export class SignUpModule { }
