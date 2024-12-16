import { DataService } from './data.service'
import { ShopifyConnectComponent } from './shopify-connect.component'
import { RouterModule } from '@angular/router'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([
            { path: '', component: ShopifyConnectComponent }
        ])
    ],
    declarations: [ShopifyConnectComponent],
    providers: [ DataService ]
})
export class ShopifyConnectModule { }
