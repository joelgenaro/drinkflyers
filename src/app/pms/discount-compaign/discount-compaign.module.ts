import { SharedModule } from 'src/app/website/shared/shared.module'
import { AddDiscountProductComponent } from './add-discount-product/add-discount-product.component'
import { StepsTemplateComponent } from './steps-template/steps-template.component'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'
import { DiscountCompaignListComponent } from './discount-compaign-list/discount-compaign-list.component'
import { DiscountCompaignInfoComponent } from './discount-compaign-info/discount-compaign-info.component'
import { RouterModule } from '@angular/router'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DiscountCompaignComponent } from './discount-compaign.component'
import { DataService } from './data.service'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ModalModule } from 'ngx-bootstrap/modal'
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'

@NgModule({
    imports: [
        CommonModule,
        UserSharedModule,
        SharedModule,
        FormsModule,
        ModalModule.forRoot(),
        ReactiveFormsModule,
        BsDatepickerModule.forRoot(),
        RouterModule.forChild([
            {
                path: '',
                component: DiscountCompaignComponent,
                children: [
                    {
                        path: 'list',
                        component: DiscountCompaignListComponent
                    },
                    {
                        path: 'discount-compaign-info',
                        component: DiscountCompaignInfoComponent
                    },
                    {
                        path: 'add-discount-product',
                        component: AddDiscountProductComponent
                    }
                ]
            }
        ])
    ],
    declarations: [
        DiscountCompaignComponent,
        DiscountCompaignListComponent,
        DiscountCompaignInfoComponent,
        StepsTemplateComponent,
        AddDiscountProductComponent,
    ],
    providers: [DataService],
    exports: [CommonModule]
})
export class DiscountCompaignModule { }
