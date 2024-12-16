import { RouterModule } from '@angular/router'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { OrderListComponent } from './order-list.component'

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([
            { path: '', component: OrderListComponent }
        ])
    ],
    declarations: [OrderListComponent]
})
export class OrderListModule { }
