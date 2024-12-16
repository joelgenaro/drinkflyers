import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component'
import { WebsiteComponent } from './website.component'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { WebsiteGuard } from '../auth/website-guard'
import { NoAuthGuard } from '../auth/no-auth-guard'

const routes: Routes = [
    {
        path: '',
        component: WebsiteComponent,
        canActivate: [WebsiteGuard],
        children: [
            {
                path: '',
                loadChildren: () => import('./index/index.module')
                    .then(mod => mod.IndexModule)
            },
            {
                path: 'login',
                canActivate: [NoAuthGuard],
                loadChildren: () => import('./login/login.module')
                    .then(mod => mod.LoginModule)
            },
            {
                path: 'sign-up',
                canActivate: [NoAuthGuard],
                loadChildren: () => import('./sign-up/sign-up.module')
                    .then(mod => mod.SignUpModule)
            },
            {
                path: 'forgot-password',
                canActivate: [NoAuthGuard],
                loadChildren: () => import('./forgot-password/forgot-password.module')
                    .then(mod => mod.ForgotPasswordModule)
            },
            {
                path: 'registration',
                loadChildren: () => import('./registration/registration.module')
                    .then(mod => mod.RegistrationModule)
            },
            {
                path: 'verify-email/:code',
                loadChildren: () => import('./verify-email/verify-email.module')
                    .then(mod => mod.VerifyEmailModule)
            },
            {
                path: 'plugin-connect',
                loadChildren: () => import('./word-press-store-verify/word-press-store-verify.module')
                    .then(mod => mod.WordPressStoreVerifyModule)
            },
            {
                path: 'shopify-connect',
                loadChildren: () => import('./shopify-connect/shopify-connect.module')
                    .then(mod => mod.ShopifyConnectModule)
            },
            {
                path: 'ebay-connect',
                loadChildren: () => import('./ebay-connect/ebay-connect.module')
                    .then(mod => mod.EbayConnectModule)
            },
            {
                path: 'amazon-connect',
                loadChildren: () => import('./amazon-connect/amazon-connect.module')
                    .then(mod => mod.AmazonConnectModule)
            },
            {
                path: '**',
                component: PageNotFoundComponent,
                data: { message: 'From Website' }
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class WebsiteRoutes { }
