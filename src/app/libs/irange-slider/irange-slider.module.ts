import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { IRangeSliderComponent } from './irange-slider.component'

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
    ],
    declarations: [IRangeSliderComponent],
    exports: [IRangeSliderComponent]
})
export class IRangeSliderModule { }
