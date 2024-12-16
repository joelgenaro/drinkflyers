import { ClientSharedModule } from './../client-shared/client-shared.module'
import { NgModule } from '@angular/core'
import { ClientsComponent } from './clients.component'
import { RouterModule } from '@angular/router'
import { ModalModule } from 'ngx-bootstrap/modal'
import { FormsModule } from '@angular/forms'
import { ReactiveFormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { DataService } from './data.service'

@NgModule({
    imports: [
        ClientSharedModule,
        CommonModule,
        FormsModule,
        ModalModule.forRoot(),
        ReactiveFormsModule,
        RouterModule.forChild([
            { path: '', component: ClientsComponent }
        ])
    ],
    declarations: [ClientsComponent],
    providers: [DataService]

})
export class ClientsModule { }
