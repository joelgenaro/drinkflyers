
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SharedModule } from 'src/app/website/shared/shared.module'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'
import { IAlertsModule } from 'src/app/libs/ialert/ialerts.module'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ModalModule } from 'ngx-bootstrap/modal'
import { RouterModule } from '@angular/router'
import { ZoneRegionsComponent } from './zone-regions.component'
import { DataService } from './data.service'
import { NgSelectModule } from '@ng-select/ng-select'

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    UserSharedModule,
    IAlertsModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    ModalModule.forRoot(),
    RouterModule.forChild([
      { path: '', component: ZoneRegionsComponent }
    ])
  ],
  declarations: [ZoneRegionsComponent],
  providers: [DataService]
})
export class ZoneRegionsModule { }
