import { SharedModule } from 'src/app/website/shared/shared.module'

import { PermissionsComponent } from './permissions/permissions.component'
import { StepsTemplateComponent } from './steps-template/steps-template.component'

import { StoreListComponent } from './store-list/store-list.component'
import { AddEditComponent } from './add-edit/add-edit.component'
import { RouterModule } from '@angular/router'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SepodStoreComponent } from './sepod-store.component'
import { DataService } from './data.service'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ModalModule } from 'ngx-bootstrap/modal'
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'

@NgModule({
    imports: [
        CommonModule,
        UserSharedModule,
        SharedModule,
        FormsModule,
        ModalModule.forRoot(),
        ReactiveFormsModule,
        BsDatepickerModule.forRoot(),
        RouterModule.forChild([
            {
                path: '',
                component: SepodStoreComponent,
                children: [
                    {
                        path: 'list',
                        component: StoreListComponent
                    },
                    {
                        path: 'store-detail',
                        component: AddEditComponent
                    },
                    {
                        path: 'permissions',
                        component: PermissionsComponent
                    },

                ]
            }
        ])
    ],
    declarations: [
        SepodStoreComponent,
        StoreListComponent,
        AddEditComponent,
        StepsTemplateComponent,
        PermissionsComponent,

    ],
    providers: [DataService],
    exports: [CommonModule]
})
export class SepodStoreModule { }
