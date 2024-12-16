import { LazyLoadImageModule } from 'ng-lazyload-image'
import { UserSharedModule } from './../user-shared/user-shared.module'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { SharedModule } from 'src/app/website/shared/shared.module'
import { DataService } from './data.service'
import { RouterModule } from '@angular/router'
import { NgModule } from '@angular/core'
import { DashboardComponent } from './dashboard.component'
import { NgApexchartsModule } from 'ng-apexcharts'
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'

@NgModule({
    imports: [
        SharedModule,
        UserSharedModule,
        ReactiveFormsModule,
        FormsModule,
        NgApexchartsModule,
        LazyLoadImageModule,
        BsDatepickerModule.forRoot(), 
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
