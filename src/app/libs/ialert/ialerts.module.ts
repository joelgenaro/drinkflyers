import { IAlertsComponent } from './ialerts.component'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [IAlertsComponent],
    exports: [IAlertsComponent]
})
export class IAlertsModule { }
