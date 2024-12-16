import { CommonModule } from '@angular/common'
import { LazyLoadImageModule } from 'ng-lazyload-image'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { SharedModule } from 'src/app/website/shared/shared.module'
import { DataService } from './data.service'
import { RouterModule } from '@angular/router'
import { NgModule } from '@angular/core'
import { DashboardComponent } from './dashboard.component'
import { IAlertsModule } from 'src/app/libs/ialert/ialerts.module'
import { ClientSharedModule } from '../client-shared/client-shared.module'

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        ClientSharedModule,
        FormsModule,
        ReactiveFormsModule,
        LazyLoadImageModule,
        IAlertsModule,
        RouterModule.forChild([
            {
                path: '',
                component: DashboardComponent
            }
        ])
    ],
    declarations: [DashboardComponent],
    providers: [DataService]
})
export class DashboardModule { }
