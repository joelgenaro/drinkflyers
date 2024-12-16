import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SettingsComponent } from './settings.component'
import { DataService } from './data.service'
import { TimepickerModule } from 'ngx-bootstrap/timepicker'
import { IAlertsModule } from 'src/app/libs/ialert/ialerts.module'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'
import { SharedModule } from 'src/app/website/shared/shared.module'



@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        UserSharedModule,
        IAlertsModule,
        FormsModule,
        ReactiveFormsModule,
        TimepickerModule.forRoot(),
        RouterModule.forChild([
            { path: '', component: SettingsComponent }
        ])
    ],
    declarations: [SettingsComponent],
    providers: [DataService]
})
export class SettingsModule { }
