import { RouterModule } from '@angular/router'
import { DataService } from './data.service'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { EtsyConnectComponent } from './etsy-connect.component'

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([
            { path: '', component: EtsyConnectComponent }
        ])
    ],
    declarations: [EtsyConnectComponent],
    providers: [DataService]
})
export class EtsyConnectModule { }
