import { SharedModule } from 'src/app/website/shared/shared.module'
import { RolesComponent } from './roles/roles.component'
import { PermissionsComponent } from './permissions/permissions.component'
import { StepsTemplateComponent } from './steps-template/steps-template.component'
import { UserSharedModule } from '../../../user-panel/user-shared/user-shared.module'
import { EmployeesListComponent } from './employees-list/employees-list.component'
import { PersonalInfoComponent } from './personal-info/personal-info.component'
import { RouterModule } from '@angular/router'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { EmployeesComponent } from './employees.component'
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
        ModalModule.forRoot(),
        ReactiveFormsModule,
        BsDatepickerModule.forRoot(),
        RouterModule.forChild([
            {
                path: '',
                component: EmployeesComponent,
                children: [
                    {
                        path: 'list',
                        component: EmployeesListComponent
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
        EmployeesComponent,
        EmployeesListComponent,
        PersonalInfoComponent,
        StepsTemplateComponent,
        PermissionsComponent,
        RolesComponent,
    ],
    providers: [DataService],
    exports: [CommonModule]
})
export class EmployeesModule { }
