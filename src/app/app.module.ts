import { LayoutModule } from './website/layout/layout.module'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { SharedModule } from './website/shared/shared.module'
import { UIHelpers } from './helpers/ui-helpers'
import { HttpErrorsInterceptorService } from './interceptors/http-errors-interceptor.service'
import { ConstantsService } from './services/constants.service'
import { ApiInterceptorsService } from './interceptors/api-interceptors.service'
import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http'
import { QuillModule } from 'ngx-quill'
import { AppComponent } from './app.component'
import { AppRoutes } from './app.routing';

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        QuillModule.forRoot(),
        BrowserAnimationsModule,
        AppRoutes,
        LayoutModule,
        SharedModule,
        HttpClientModule,
    ],
    providers: [
        ConstantsService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ApiInterceptorsService,
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HttpErrorsInterceptorService,
            multi: true
        },
        UIHelpers
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
