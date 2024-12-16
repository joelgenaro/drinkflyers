import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { IRatingComponent } from './irating.component'
import { FormsModule } from '@angular/forms'

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
    ],
    declarations: [IRatingComponent],
    exports: [IRatingComponent]
})
export class IRatingModule { }
