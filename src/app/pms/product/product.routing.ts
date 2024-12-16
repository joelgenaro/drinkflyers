import { ArtworkGeneratorComponent } from './artwork-generator/artwork-generator.component';
import { PricesComponent } from './prices/prices.component';
import { MockupsComponent } from './mockups/mockups.component';
import { CreateVirtualProductComponent } from './create-virtual-product/create-virtual-product.component'
import { FontComponent } from './font/font.component'
import { ArtworkComponent } from './artwork/artwork.component'
import { MockupComponent } from './mockup/mockup.component'
import { VariantAndInventoryComponent } from './variant-and-inventory/variant-and-inventory.component'
import { ArtworkAndFontComponent } from './artwork-and-font/artwork-and-font.component'
import { PersonalizedRegionComponent } from './personalized-region/personalized-region.component'
import { ProductComponent } from './product.component'
import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { ProductDetailComponent } from './product-detail/product-detail.component'

const routes: Routes = [
    {
        path: '',
        component: ProductComponent,
        children: [
            { path: 'create-virtual-product', component: CreateVirtualProductComponent },
            { path: 'product-detail', component: ProductDetailComponent },
            { path: 'personalized-region', component: PersonalizedRegionComponent },
            { path: 'artwork', component: ArtworkComponent },
            { path: 'font', component: FontComponent },
            { path: 'artwork-and-font', component: ArtworkAndFontComponent },
            { path: 'variants', component: VariantAndInventoryComponent },
            { path: 'mockups', component: MockupComponent },
            { path: 'mock-ups', component: MockupsComponent },
            { path: 'prices', component: PricesComponent },
            { path: 'artwork-generator', component: ArtworkGeneratorComponent },
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProductRoutes { }
