import { ClientPanelComponent } from './client-panel.component'
import { ClientSharedModule } from './client-shared/client-shared.module'
import { SharedModule } from '../website/shared/shared.module'
import { NgModule } from '@angular/core'
import { ClientPanelRoutes } from './client-panel.routing'

@NgModule({
    imports: [
        ClientSharedModule,
        SharedModule,
        ClientPanelRoutes
    ],
    declarations: [ClientPanelComponent]
})
export class ClientPanelModule { }
