import { QuillModule } from 'ngx-quill'
import { NgSelectModule } from '@ng-select/ng-select'
import { SharedModule } from 'src/app/website/shared/shared.module'
import { RolesComponent } from './roles/roles.component'
import { PermissionsComponent } from './permissions/permissions.component'
import { StepsTemplateComponent } from './steps-template/steps-template.component'
import { UserSharedModule } from '../../../user-panel/user-shared/user-shared.module'
import { ClientListComponent } from './client-list/client-list.component'
import { PersonalInfoComponent } from './personal-info/personal-info.component'
import { RouterModule } from '@angular/router'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ClientComponent } from './client.component'
import { DataService } from './data.service'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ModalModule } from 'ngx-bootstrap/modal'
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'

@NgModule({
    imports: [
        CommonModule,
        UserSharedModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        NgSelectModule,
        QuillModule.forRoot(),
        ModalModule.forRoot(),
        BsDatepickerModule.forRoot(),
        RouterModule.forChild([
            {
                path: '',
                component: ClientComponent,
                children: [
                    {
                        path: 'list',
                        component: ClientListComponent
                    },
                    {
                        path: 'personal-info',
                        component: PersonalInfoComponent
                    },
                    {
                        path: 'permissions',
                        component: PermissionsComponent
                    },
                    {
                        path: 'roles',
                        component: RolesComponent
                    },
                ]
            }
        ])
    ],
    declarations: [
        ClientComponent,
        ClientListComponent,
        PersonalInfoComponent,
        StepsTemplateComponent,
        PermissionsComponent,
        RolesComponent,
    ],
    providers: [DataService],
    exports: [CommonModule]
})
export class ClientModule { }
