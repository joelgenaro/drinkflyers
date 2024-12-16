import { SharedModule } from 'src/app/website/shared/shared.module'
import { DataService } from './data.service'
import { RouterModule } from '@angular/router'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'
import { InvoiceDetailComponent } from './invoice-detail.component'

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        UserSharedModule,
        RouterModule.forChild([
            { path: '', component: InvoiceDetailComponent }
        ])
    ],
    declarations: [InvoiceDetailComponent],
    providers: [DataService]
})
export class InvoiceDetailModule { }
