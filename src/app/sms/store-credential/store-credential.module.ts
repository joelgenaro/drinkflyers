import { TooltipModule } from 'ngx-bootstrap/tooltip'
import { DataService } from './data.service'
import { RouterModule } from '@angular/router'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { StoreCredentialComponent } from './store-credential.component'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { IAlertsModule } from 'src/app/libs/ialert/ialerts.module'
import { ModalModule } from 'ngx-bootstrap/modal'
import { SharedModule } from 'src/app/website/shared/shared.module'

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        UserSharedModule,
        IAlertsModule,
        FormsModule,
        ReactiveFormsModule,
        TooltipModule.forRoot(),
        ModalModule.forRoot(),
        RouterModule.forChild([
            { path: '', component: StoreCredentialComponent }
        ])
    ],
    declarations: [StoreCredentialComponent],
    providers: [DataService]
})
export class StoreCredentialModule { }
