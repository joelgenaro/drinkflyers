import { DataService } from './data.service'
import { RouterModule } from '@angular/router'
import { NgModule, Component } from '@angular/core'
import {FormsModule,ReactiveFormsModule } from '@angular/forms'
import { ModalModule } from 'ngx-bootstrap/modal'
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'
import { ProductBulkUploadDataComponent } from './product-bulk-upload-data.component';
import { IAlertsModule } from 'src/app/libs/ialert/ialerts.module'
import { SharedModule } from 'src/app/website/shared/shared.module'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'
import { NgSelectModule } from '@ng-select/ng-select'

@NgModule({
    imports: [
        FormsModule,
        UserSharedModule,
        IAlertsModule,
        NgSelectModule,
        SharedModule,
        ReactiveFormsModule,
        ModalModule.forRoot(),
        BsDatepickerModule.forRoot(),
        RouterModule.forChild([
            { path: '', component: ProductBulkUploadDataComponent }
        ])
    ],
    declarations: [ProductBulkUploadDataComponent],
    providers: [DataService]
})
export class ProductBulkUploadDataModule { }
