import { RouterModule } from '@angular/router'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { EbayConnectComponent } from './ebay-connect.component'
import { DataService } from './data.service'

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([
            { path: '', component: EbayConnectComponent }
        ])
    ],
    declarations: [EbayConnectComponent],
    providers: [DataService]
})
export class EbayConnectModule { }
