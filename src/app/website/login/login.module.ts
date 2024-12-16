import { LazyLoadImageModule } from 'ng-lazyload-image'
import { SharedModule } from './../shared/shared.module'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LoginComponent } from './login.component'
import { Routes, RouterModule } from '@angular/router'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

const routes: Routes = [
    { path: '', component: LoginComponent }
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
    declarations: [LoginComponent],
    exports: [RouterModule]
})
export class LoginModule { }
