import { WebsiteService } from './../services/website.service'
import { LayoutModule } from './layout/layout.module'
import { SharedModule } from './shared/shared.module'
import { NgModule } from '@angular/core'
import { WebsiteComponent } from './website.component'
import { WebsiteRoutes } from './website.routing'

@NgModule({
    imports: [
        SharedModule,
        LayoutModule,
        WebsiteRoutes
    ],
    declarations: [WebsiteComponent],
    providers: [
        WebsiteService
    ]
})
export class WebsiteModule {
}
