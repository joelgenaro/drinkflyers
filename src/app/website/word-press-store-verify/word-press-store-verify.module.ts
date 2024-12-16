import { RouterModule } from '@angular/router'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { WordPressStoreVerifyComponent } from './word-press-store-verify.component'

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([
            { path: '', component: WordPressStoreVerifyComponent }
        ])
    ],
    declarations: [WordPressStoreVerifyComponent]
})
export class WordPressStoreVerifyModule { }
