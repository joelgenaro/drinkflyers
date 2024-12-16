import { TooltipModule } from 'ngx-bootstrap/tooltip'
import { ProductDetailRoutes } from './product-detail.routing'
import { IAlertsModule } from 'src/app/libs/ialert/ialerts.module'
import { UserSharedModule } from '../../user-panel/user-shared/user-shared.module'
import { ModalModule } from 'ngx-bootstrap/modal'
import { FontComponent } from './font/font.component'
import { ArtworkComponent } from './artwork/artwork.component'
import { VariantAndInventoryComponent } from './variant-and-inventory/variant-and-inventory.component'
import { SummaryComponent } from './summary/summary.component'
import { ArtworkAndFontComponent } from './artwork-and-font/artwork-and-font.component'
import { PersonalizedRegionComponent } from './personalized-region/personalized-region.component'
import { PictureComponent } from './picture/picture.component'
import { ProductInfoComponent } from './product-info/product-info.component'
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { SharedModule } from '../../website/shared/shared.module'
import { DataService } from './data.service'
import { NgModule } from '@angular/core'
import { ImageCropperModule } from 'ngx-image-cropper'
import { LazyLoadImageModule } from 'ng-lazyload-image'
import { PopoverModule } from 'ngx-bootstrap/popover'
import { NgSelectModule } from '@ng-select/ng-select'
import { ProductDetailComponent } from './product-detail.component'

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        UserSharedModule,
        IAlertsModule,
        ProductDetailRoutes,
        NgSelectModule,
        FormsModule,
        ReactiveFormsModule,
        ImageCropperModule,
        LazyLoadImageModule,
        TooltipModule.forRoot(),
        ModalModule.forRoot(),
        BsDatepickerModule.forRoot(),
        PopoverModule.forRoot(),
    ],
    declarations: [
        ProductDetailComponent,
        ProductInfoComponent,
        PictureComponent,
        PersonalizedRegionComponent,
        ArtworkComponent,
        FontComponent,
        ArtworkAndFontComponent,
        VariantAndInventoryComponent,
        SummaryComponent
    ],
    providers: [DataService]
})
export class ProductDetailModule { }
