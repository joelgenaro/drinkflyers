import { LazyLoadImageModule } from 'ng-lazyload-image'
import { IAlertsModule } from '../../../libs/ialert/ialerts.module'
import { UserSharedModule } from '../../../user-panel/user-shared/user-shared.module'
import { SharedModule } from '../../../website/shared/shared.module'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ModalModule } from 'ngx-bootstrap/modal'
import { RouterModule } from '@angular/router'
import { DataService } from './data.service'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CourierServiceComponent } from './courier-service.component'

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        IAlertsModule,
        FormsModule,
        ReactiveFormsModule,
        UserSharedModule,
        LazyLoadImageModule,
        ModalModule.forRoot(),
        RouterModule.forChild([
            { path: '', component: CourierServiceComponent }
        ])
    ],
    declarations: [CourierServiceComponent],
    providers: [DataService]
})
export class CourierServiceModule { }
