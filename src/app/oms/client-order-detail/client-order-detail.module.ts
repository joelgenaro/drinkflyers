import { NgSelectModule } from '@ng-select/ng-select'
import { LazyLoadImageModule } from 'ng-lazyload-image'
import { DataService } from './data.service'
import { RouterModule } from '@angular/router'
import { ModalModule } from 'ngx-bootstrap/modal'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'
import { SharedModule } from 'src/app/website/shared/shared.module'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ClientOrderDetailComponent } from './client-order-detail.component'

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        UserSharedModule,
        FormsModule,
        ReactiveFormsModule,
        LazyLoadImageModule,
        NgSelectModule,
        ModalModule.forRoot(),
        RouterModule.forChild([
            { path: '', component: ClientOrderDetailComponent }
        ])
    ],
    declarations: [ClientOrderDetailComponent],
    providers: [DataService]
})
export class ClientOrderDetailModule { }
