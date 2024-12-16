import { RouterModule } from '@angular/router'
import { NgModule } from '@angular/core'
import { DocumentationComponent } from './documentation.component'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'

@NgModule({
    imports: [
        UserSharedModule,
        RouterModule.forChild([
            { path: '', component: DocumentationComponent }
        ])
    ],
    declarations: [DocumentationComponent],

})
export class DocumentationModule { }
