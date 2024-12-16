import { PageNotFoundComponent } from './website/shared/page-not-found/page-not-found.component'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

const routes: Routes = [
    {
        path: 'user',
        loadChildren: () => import('./user-panel/user-panel.module')
            .then(mod => mod.UserPanelModule)
    },
    {
        path: 'client',
        loadChildren: () => import('./client-panel/client-panel.module')
            .then(mod => mod.ClientPanelModule)
    },
    {
        path: '',
        loadChildren: () => import('./website/website.module')
            .then(mod => mod.WebsiteModule)
    },
    {
        path: '**',
        component: PageNotFoundComponent,
        data: { message: 'From ROOT' }
    }
]

@NgModule({
    imports: [
        RouterModule.forRoot(routes),
    ],
    exports: [RouterModule]
})
export class AppRoutes { }
