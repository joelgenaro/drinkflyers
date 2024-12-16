import { ProductDataComponent } from './product-data/product-data.component';
import { BaseProductComponent } from './base-product.component'
import { FontComponent } from './font/font.component'
import { ArtworkComponent } from './artwork/artwork.component'
import { SummaryComponent } from './summary/summary.component'
import { PrintAreasComponent } from './print-areas/print-areas.component'
import { MockupComponent } from './mockup/mockup.component'
import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { ProductDetailComponent } from './product-detail/product-detail.component'
import { VariantAndInventoryComponent } from './variant-and-inventory/variant-and-inventory.component'

const routes: Routes = [
    {
        path: '',
        component: BaseProductComponent,
        children: [
            { path: 'product-detail', component: ProductDetailComponent },
            { path: 'mockup', component: MockupComponent },
            { path: 'print-areas', component: PrintAreasComponent },
            { path: 'artwork', component: ArtworkComponent },
            { path: 'font', component: FontComponent },
            { path: 'variants', component: VariantAndInventoryComponent },
            { path: 'summary', component: SummaryComponent },
            { path: 'product-data', component: ProductDataComponent },

        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BaseProductRoutes { }
