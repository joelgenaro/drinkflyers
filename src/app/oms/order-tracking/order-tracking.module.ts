import { RouterModule } from '@angular/router'
import { DataService } from './data.service'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { OrderTrackingComponent } from './order-tracking.component'
import { FormsModule } from '@angular/forms'
import { IAlertsModule } from 'src/app/libs/ialert/ialerts.module'
import { SharedModule } from 'src/app/website/shared/shared.module'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'
import { AgmCoreModule } from '@agm/core'
import { apis } from 'src/environments/environment'
import { AgmDirectionModule } from 'agm-direction'
@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        UserSharedModule,
        IAlertsModule,
        FormsModule,
        AgmDirectionModule,
        AgmCoreModule.forRoot({
            apiKey: apis.googleApiKey,
            libraries: ['places', 'drawing', 'geometry']
        }),
        RouterModule.forChild([
            { path: '', component: OrderTrackingComponent }
        ])
    ],
    declarations: [OrderTrackingComponent],
    providers: [DataService]
})
export class OrderTrackingModule { }
