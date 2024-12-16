import { PreviewComponent } from './preview/preview.component'
import { ArtworkGeneratorComponent } from './artwork-generator/artwork-generator.component'
import { MockupsComponent } from './mockups/mockups.component'
import { CreateVirtualProductComponent } from './create-virtual-product/create-virtual-product.component'
import { TooltipModule } from 'ngx-bootstrap/tooltip'
import { IAlertsModule } from 'src/app/libs/ialert/ialerts.module'
import { UserSharedModule } from './../../user-panel/user-shared/user-shared.module'
import { ModalModule } from 'ngx-bootstrap/modal'
import { FontComponent } from './font/font.component'
import { ArtworkComponent } from './artwork/artwork.component'
import { VariantAndInventoryComponent } from './variant-and-inventory/variant-and-inventory.component'
import { MockupComponent } from './mockup/mockup.component'
import { BaseMockupComponent } from './base-mockup/base-mockup.component'
import { ArtworkAndFontComponent } from './artwork-and-font/artwork-and-font.component'
import { PersonalizedRegionComponent } from './personalized-region/personalized-region.component'
import { ProductDetailComponent } from './product-detail/product-detail.component'
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { SharedModule } from './../../website/shared/shared.module'
import { ProductRoutes } from './product.routing'
import { DataService } from './data.service'
import { NgModule } from '@angular/core'
import { ProductComponent } from './product.component'
import { ImageCropperModule } from 'ngx-image-cropper'
import { LazyLoadImageModule } from 'ng-lazyload-image'
import { PopoverModule } from 'ngx-bootstrap/popover'
import { NgSelectModule } from '@ng-select/ng-select'
import { PricesComponent } from './prices/prices.component'
import { NgxColorsModule } from 'ngx-colors';
import { AngularEditorModule } from '@kolkov/angular-editor'

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        NgxColorsModule,
        UserSharedModule,
        IAlertsModule,
        ProductRoutes,
        NgSelectModule,
        AngularEditorModule,
        FormsModule,
        ReactiveFormsModule,
        ImageCropperModule,
        LazyLoadImageModule,
        TooltipModule.forRoot(),
        ModalModule.forRoot(),
        BsDatepickerModule.forRoot(),
        PopoverModule.forRoot()
    ],
    declarations: [
        CreateVirtualProductComponent,
        ProductComponent,
        ProductDetailComponent,
        PersonalizedRegionComponent,
        ArtworkComponent,
        FontComponent,
        ArtworkAndFontComponent,
        VariantAndInventoryComponent,
        MockupComponent,
        BaseMockupComponent,
        MockupsComponent,
        PricesComponent,
        ArtworkGeneratorComponent,
        PreviewComponent
    ],
    providers: [DataService]
})
export class ProductModule { }
