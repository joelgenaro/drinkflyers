import { DataService } from './data.service'
import { ReactiveFormsModule } from '@angular/forms'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ContactUsPageComponent } from './contact-us-page.component'
import { RouterModule } from '@angular/router'


@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule.forChild([
            { path: '', component: ContactUsPageComponent }
        ])
    ],
    providers: [DataService],
    declarations: [ContactUsPageComponent]
})
export class ContactUsPageModule { }
