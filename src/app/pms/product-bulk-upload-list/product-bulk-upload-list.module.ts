
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ModalModule } from 'ngx-bootstrap/modal'
import { RouterModule } from '@angular/router'
import { DataService } from './data.service'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ProductBulkUploadListComponent } from './product-bulk-upload-list.component'
import { SharedModule } from 'src/app/website/shared/shared.module';
import { IAlertsModule } from 'src/app/libs/ialert/ialerts.module';
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        IAlertsModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule.forRoot(),
        UserSharedModule,
        RouterModule.forChild([
            { path: '', component: ProductBulkUploadListComponent }
        ])
    ],
    declarations: [ProductBulkUploadListComponent],
    providers: [DataService]
})
export class ProductBulkUploadListModule { }
