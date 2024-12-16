import { IAlertsModule } from './../../../libs/ialert/ialerts.module'
import { UserSharedModule } from './../../../user-panel/user-shared/user-shared.module'
import { SharedModule } from './../../../website/shared/shared.module'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ModalModule } from 'ngx-bootstrap/modal'
import { RouterModule } from '@angular/router'
import { DataService } from './data.service'
import { NgModule } from '@angular/core'
import { UnitComponent } from './unit.component'

@NgModule({
    imports: [
        SharedModule,
        UserSharedModule,
        IAlertsModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule.forRoot(),
        RouterModule.forChild([
            { path: '', component: UnitComponent }
        ])
    ],
    declarations: [UnitComponent],
    providers: [DataService]
})
export class UnitModule { }
