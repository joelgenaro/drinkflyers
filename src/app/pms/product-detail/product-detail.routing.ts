import { FontComponent } from './font/font.component'
import { ArtworkComponent } from './artwork/artwork.component'
import { SummaryComponent } from './summary/summary.component'
import { VariantAndInventoryComponent } from './variant-and-inventory/variant-and-inventory.component'
import { ArtworkAndFontComponent } from './artwork-and-font/artwork-and-font.component'
import { PersonalizedRegionComponent } from './personalized-region/personalized-region.component'
import { PictureComponent } from './picture/picture.component'
import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { ProductDetailComponent } from './product-detail.component'
import { ProductInfoComponent } from './product-info/product-info.component'

const routes: Routes = [
    {
        path: '',
        component: ProductDetailComponent,
        children: [
            { path: 'product-info', component: ProductInfoComponent },
            { path: 'picture', component: PictureComponent },
            { path: 'personalized-region', component: PersonalizedRegionComponent },
            { path: 'artwork', component: ArtworkComponent },
            { path: 'font', component: FontComponent },
            { path: 'artwork-and-font', component: ArtworkAndFontComponent },
            { path: 'variants', component: VariantAndInventoryComponent },
            { path: 'summary', component: SummaryComponent }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProductDetailRoutes { }
