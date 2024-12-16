import { AngularEditorModule } from '@kolkov/angular-editor'
import { VariantAndInventoryComponent } from './variant-and-inventory/variant-and-inventory.component'
import { BaseProductComponent } from './base-product.component'
import { IAlertsModule } from 'src/app/libs/ialert/ialerts.module'
import { UserSharedModule } from './../../user-panel/user-shared/user-shared.module'
import { ModalModule } from 'ngx-bootstrap/modal'
import { FontComponent } from './font/font.component'
import { ArtworkComponent } from './artwork/artwork.component'
import { SummaryComponent } from './summary/summary.component'
import { PrintAreasComponent } from './print-areas/print-areas.component'
import { ProductDetailComponent } from './product-detail/product-detail.component'
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { SharedModule } from './../../website/shared/shared.module'
import { BaseProductRoutes } from './base-product.routing'
import { DataService } from './data.service'
import { NgModule } from '@angular/core'
import { ImageCropperModule } from 'ngx-image-cropper'
import { LazyLoadImageModule } from 'ng-lazyload-image'
import { PopoverModule } from 'ngx-bootstrap/popover'
import { NgSelectModule } from '@ng-select/ng-select'
import { TooltipModule } from 'ngx-bootstrap/tooltip'
import { MockupComponent } from './mockup/mockup.component'
import { QuillModule } from 'ngx-quill'
import { ProductDataComponent } from './product-data/product-data.component';
import { NgxColorsModule } from 'ngx-colors';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        UserSharedModule,
        IAlertsModule,
        BaseProductRoutes,
        NgSelectModule,
        FormsModule,
        ReactiveFormsModule,
        ImageCropperModule,
        LazyLoadImageModule,
        AngularEditorModule,
        QuillModule.forRoot(),
        TooltipModule.forRoot(),
        ModalModule.forRoot(),
        BsDatepickerModule.forRoot(),
        PopoverModule.forRoot(),
        NgxColorsModule
    ],
    declarations: [
        BaseProductComponent,
        MockupComponent,
        ProductDetailComponent,
        ProductDataComponent,
        PrintAreasComponent,
        ArtworkComponent,
        FontComponent,
        VariantAndInventoryComponent,
        SummaryComponent
    ],
    providers: [DataService]
})
export class BaseProductModule { }
