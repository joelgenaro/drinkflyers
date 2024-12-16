import { UserSharedModule } from './user-shared/user-shared.module'
import { SharedModule } from '../website/shared/shared.module'
import { NgModule } from '@angular/core'
import { UserPanelRoutes } from './user-panel.routing'
import { UserPanelComponent } from './user-panel.component'

@NgModule({
    imports: [
        UserSharedModule,
        SharedModule,
        UserPanelRoutes
    ],
    declarations: [UserPanelComponent]
})
export class UserPanelModule { }
