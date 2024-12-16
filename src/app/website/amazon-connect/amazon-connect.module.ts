import { RouterModule } from '@angular/router'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AmazonConnectComponent } from './amazon-connect.component'
import { DataService } from './data.service'

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([
            { path: '', component: AmazonConnectComponent }
        ])
    ],
    declarations: [AmazonConnectComponent],
    providers: [DataService]
})
export class AmazonConnectModule { }
