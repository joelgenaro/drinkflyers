import { SharedModule } from 'src/app/website/shared/shared.module'
import { DataService } from './data.service'
import { RouterModule } from '@angular/router'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { InvoicePreviewComponent } from './invoice-preview.component'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        UserSharedModule,
        RouterModule.forChild([
            { path: '', component: InvoicePreviewComponent }
        ])
    ],
    declarations: [InvoicePreviewComponent],
    providers: [DataService]
})
export class InvoicePreviewModule { }
