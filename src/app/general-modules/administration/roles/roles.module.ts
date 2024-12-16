import { SharedModule } from 'src/app/website/shared/shared.module'
import { DataService } from './data.service'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { NgModule } from '@angular/core'
import { RolesComponent } from './roles.component'
import { RouterModule } from '@angular/router'
import { ModalModule } from 'ngx-bootstrap/modal'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'

@NgModule({
    imports: [
        UserSharedModule,
        ReactiveFormsModule,
        SharedModule,
        FormsModule,
        ModalModule.forRoot(),
        RouterModule.forChild([
            {
                path: '',
                component: RolesComponent,
            }
        ])
    ],
    declarations: [RolesComponent],
    providers: [DataService]
})
export class RolesModule { }
