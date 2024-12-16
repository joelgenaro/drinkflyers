import { SepodStoreProductComponent } from './sepod-store-product.component';
import { SharedModule } from '../../website/shared/shared.module';
import { IAlertsModule } from '../../libs/ialert/ialerts.module';
import { UserSharedModule } from '../../user-panel/user-shared/user-shared.module';
import { DataService } from './data.service'
import { RouterModule } from '@angular/router'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ModalModule } from 'ngx-bootstrap/modal'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { TooltipModule } from 'ngx-bootstrap/tooltip'
@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        IAlertsModule,
        FormsModule,
        ReactiveFormsModule,
        UserSharedModule,
        TooltipModule.forRoot(),
        ModalModule.forRoot(),
        RouterModule.forChild([
            { path: '', component: SepodStoreProductComponent }
        ])
    ],
    declarations: [SepodStoreProductComponent],
    providers: [DataService]
})
export class SepodStoreProductModule { }
