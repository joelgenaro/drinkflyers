import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ZoneComponent } from './zone.component'
import { DataService } from './data.service'
import { SharedModule } from 'src/app/website/shared/shared.module'
import { UserSharedModule } from 'src/app/user-panel/user-shared/user-shared.module'
import { IAlertsModule } from 'src/app/libs/ialert/ialerts.module'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ModalModule } from 'ngx-bootstrap/modal'
import { RouterModule } from '@angular/router'
import { StepsTemplateComponent } from './steps-template/steps-template.component'
import { ZoneListComponent } from './zone-list/zone-list.component'
import { DetailComponent } from './detail/detail.component'
import { StatesComponent } from './states/states.component'
import { CountriesComponent } from './countries/countries.component'

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        UserSharedModule,
        IAlertsModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule.forRoot(),
        RouterModule.forChild([
            {
                path: '',
                component: ZoneComponent,
                children: [
                    {
                        path: 'list',
                        component: ZoneListComponent
                    },
                    {
                        path: 'detail',
                        component: DetailComponent
                    },
                    {
                        path: 'states',
                        component: StatesComponent
                    },
                    {
                        path: 'countries',
                        component: CountriesComponent
                    },
                ]
            }
        ])
    ],
    declarations: [
        ZoneComponent,
        StepsTemplateComponent,
        ZoneListComponent,
        DetailComponent,
        StatesComponent,
        CountriesComponent
    ],
    providers: [DataService],
    exports: [CommonModule]
})
export class ZoneModule { }
