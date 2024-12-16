import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'
import { ClientFinancialSummaryComponent } from './client-financial-summary.component'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { ModalModule } from 'ngx-bootstrap/modal'
import { DataService } from './data.service'
import { RouterModule } from '@angular/router'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SharedModule } from 'src/app/website/shared/shared.module'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'
import { IAlertsModule } from 'src/app/libs/ialert/ialerts.module'
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { AccordionModule } from 'ngx-bootstrap/accordion';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        UserSharedModule,
        IAlertsModule,
        FormsModule,
        ReactiveFormsModule,
        BsDatepickerModule.forRoot(),
        ModalModule.forRoot(),
        AccordionModule.forRoot(),
        RouterModule.forChild([
            { path: '', component: ClientFinancialSummaryComponent }
        ])
    ],
    declarations: [ClientFinancialSummaryComponent],
    providers: [DataService]
})
export class ClientFinancialSummaryModule { }
