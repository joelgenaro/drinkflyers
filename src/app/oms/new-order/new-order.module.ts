import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewOrderComponent } from './new-order.component';
import { DataService } from './data.service';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { IAlertsModule } from 'src/app/libs/ialert/ialerts.module';
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module';
import { SharedModule } from 'src/app/website/shared/shared.module';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        UserSharedModule,
        IAlertsModule,
        FormsModule,
        MatStepperModule,
        MatIconModule,
        ReactiveFormsModule,
        TimepickerModule.forRoot(),
        RouterModule.forChild([{ path: '', component: NewOrderComponent }]),
    ],
    declarations: [NewOrderComponent],
    providers: [
        {
        provide: STEPPER_GLOBAL_OPTIONS,
        useValue: { displayDefaultIndicatorType: false }
        },DataService
    ],
})
export class NewOrderModule {}
