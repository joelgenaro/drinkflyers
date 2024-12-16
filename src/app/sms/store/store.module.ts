import { DataService } from './data.service'
import { RouterModule } from '@angular/router'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { StoreComponent } from './store.component'
import { SharedModule } from 'src/app/website/shared/shared.module'
import { IAlertsModule } from 'src/app/libs/ialert/ialerts.module'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ModalModule } from 'ngx-bootstrap/modal'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        UserSharedModule,
        FormsModule,
        ReactiveFormsModule,
        IAlertsModule,
        ModalModule.forRoot(),
        RouterModule.forChild([
            { path: '', component: StoreComponent }
        ])
    ],
    declarations: [StoreComponent],
    providers: [DataService]
})
export class StoreModule { }
