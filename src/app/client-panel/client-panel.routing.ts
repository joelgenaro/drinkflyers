import { ClientPanelComponent } from './client-panel.component'
import { ClientGuard } from './../auth/client-guard'
import { NotAuthorizedComponent } from './client-shared/not-authorized/not-authorized.component'
import { PermissionsGuard } from '../auth/permissions-guard'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

const routes: Routes = [
    {
        path: '',
        component: ClientPanelComponent,
        canActivate: [ClientGuard],
        children: [
            {
                path: 'not-authorized',
                component: NotAuthorizedComponent
            },
            {
                path: 'samples',
                data: { permissions: [''] },
                loadChildren: () => import('../general-modules/documentation/documentation.module')
                    .then(mod => mod.DocumentationModule)
            },
        ]
    },
    {
        path: '',
        component: ClientPanelComponent,
        canActivate: [ClientGuard],
        children: [
            {
                path: 'dashboard',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['dashboard'] },
                loadChildren: () => import('./dashboard/dashboard.module')
                    .then(mod => mod.DashboardModule)
            },
            {
                path: 'not-authorized',
                component: NotAuthorizedComponent
            },
            {
                path: 'change-password',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: [''] },
                loadChildren: () => import('./change-password/change-password.module')
                    .then(mod => mod.ChangePasswordModule)
            },
            {
                path: 'super-password',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: [''] },
                loadChildren: () => import('./super-password/super-password.module')
                    .then(mod => mod.SuperPasswordModule)
            },
            {
                path: 'contact-us-page',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: [''] },
                loadChildren: () => import('./contact-us-page/contact-us-page.module')
                    .then(mod => mod.ContactUsPageModule)
            },
            {
                path: 'employees',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['employee-list'] },
                loadChildren: () => import('../general-modules/hr/employees/employees.module')
                    .then(mod => mod.EmployeesModule)
            },
            {
                path: 'setting',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['setting-detail'] },
                loadChildren: () => import('../general-modules/hr/settings/settings.module')
                    .then(mod => mod.SettingsModule)
            },
            {
                path: 'roles',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['role-list'] },
                loadChildren: () => import('../general-modules/administration/roles/roles.module')
                    .then(mod => mod.RolesModule)
            },
            {
                path: 'tags',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['tag-list'] },
                loadChildren: () => import('../general-modules/administration/tag/tag.module')
                    .then(mod => mod.TagModule)
            },
            {
                path: 'base-products-list',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['base-product-list'] },
                loadChildren: () => import('./../pms/base-products-list/base-products-list.module')
                    .then(mod => mod.BaseProductsListModule)
            },
            {
                path: 'base-product',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['base-product-detail', 'add-base-product', 'update-base-product'] },
                loadChildren: () => import('./../pms/base-product/base-product.module')
                    .then(mod => mod.BaseProductModule)
            },
            {
                path: 'products-list',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['product-list'] },
                loadChildren: () => import('./../pms/product-list/product-list.module')
                    .then(mod => mod.ProductListModule)
            },
            {
                path: 'product',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['product-detail', 'add-product', 'update-product'] },
                loadChildren: () => import('./../pms/product/product.module')
                    .then(mod => mod.ProductModule)
            },
            {
                path: 'products',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['product-detail'] },
                loadChildren: () => import('./../pms/product-detail/product-detail.module')
                    .then(mod => mod.ProductDetailModule)
            },
            {
                path: 'discount-compaign',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['discount-campaign-list'] },
                loadChildren: () => import('./../pms/discount-compaign/discount-compaign.module')
                    .then(mod => mod.DiscountCompaignModule)
            },
            // {
            //     path: 'product',
            //     canActivate: [ClientGuard, PermissionsGuard],
            //     data: { permissions: ['product-list'] },
            //     loadChildren: () => import('./../pms/product-detail/product-detail.module')
            //         .then(mod => mod.ProductDetailModule)
            // },
            {
                path: 'orders',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['all-order-list'] },
                loadChildren: () => import('./../oms/order/order.module')
                    .then(mod => mod.OrderModule)
            },
            {
                path: 'order-detail',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['order-detail'] },
                loadChildren: () => import('./../oms/order-detail/order-detail.module')
                    .then(mod => mod.OrderDetailModule)
            },
            {
                path: 'orders-list',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: [''] },
                loadChildren: () => import('./../oms/order-list/order-list.module')
                    .then(mod => mod.OrderListModule)
            },
            {
                path: 'my-orders',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['my-orders'] },
                loadChildren: () => import('./../oms/client-orders/client-orders.module')
                    .then(mod => mod.ClientOrdersModule)
            },
            {
                path: 'my-order-detail',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['order-detail'] },
                loadChildren: () => import('./../oms/client-order-detail/client-order-detail.module')
                    .then(mod => mod.ClientOrderDetailModule)
            },
            {
                path: 'outstanding-orders',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['invoice-order-list'] },
                loadChildren: () => import('./../oms/outstanding-orders/outstanding-orders.module')
                    .then(mod => mod.OutstandingOrdersModule)
            },
            {
                path: 'sepod-store-order',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['store-order-list'] },
                loadChildren: () => import('./../oms/sepod-store-orders/sepod-store-orders.module')
                    .then(mod => mod.SepodStoreOrdersModule)
            },
            {
                path: 'order-reason',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['reason-list'] },
                loadChildren: () => import('./../oms/order-reasons/order-reasons.module')
                    .then(mod => mod.OrderReasonsModule)
            },
            {
                path: 'invoice',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['invoice-list '] },
                loadChildren: () => import('../oms/invoice/invoice.module')
                    .then(mod => mod.InvoiceModule)
            },
            {
                path: 'invoice-preview',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['view-invoice'] },
                loadChildren: () => import('../oms/invoice-preview/invoice-preview.module')
                    .then(mod => mod.InvoicePreviewModule)
            },
            {
                path: 'invoice-detail',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['detail-invoice'] },
                loadChildren: () => import('../oms/invoice-detail/invoice-detail.module')
                    .then(mod => mod.InvoiceDetailModule)
            },
            {
                path: 'my-invoice',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['my-invoices-list'] },
                loadChildren: () => import('../oms/my-invoice/my-invoice.module')
                    .then(mod => mod.MyInvoiceModule)
            },
            {
                path: 'order-tracking',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['order-track'] },
                loadChildren: () => import('../oms/order-tracking/order-tracking.module')
                    .then(mod => mod.OrderTrackingModule)
            },
            {
                path: 'category',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['category-list'] },
                loadChildren: () => import('../general-modules/administration/category/category.module')
                    .then(mod => mod.CategoryModule)
            },
            {
                path: 'artwork-category',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['artwork-category-list'] },
                loadChildren: () => import('../general-modules/administration/artwork-category/artwork-category.module')
                    .then(mod => mod.ArtworkCategoryModule)
            },
            {
                path: 'artwork',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['artwork-list'] },
                loadChildren: () => import('../general-modules/administration/artwork/artwork.module')
                    .then(mod => mod.ArtworkModule)
            },
            {
                path: 'courier-service',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['courier-service-list'] },
                loadChildren: () => import('../general-modules/administration/courier-service/courier-service.module')
                    .then(mod => mod.CourierServiceModule)
            },
            {
                path: 'font',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['font-list'] },
                loadChildren: () => import('../general-modules/administration/font/font.module')
                    .then(mod => mod.FontModule)
            },
            {
                path: 'client',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['client-list'] },
                loadChildren: () => import('../general-modules/hr/client/client.module')
                    .then(mod => mod.ClientModule)
            },
            {
                path: 'font-category',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['font-category-list'] },
                loadChildren: () => import('../general-modules/administration/font-category/font-category.module')
                    .then(mod => mod.FontCategoryModule)
            },
            {
                path: 'new-po-request',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['add-po-request'] },
                loadChildren: () => import('../pms/new-po-request/new-po-request.module')
                    .then(mod => mod.NewPoRequestModule)
            },
            {
                path: 'pending-po-request',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['pending-po-request'] },
                loadChildren: () => import('../pms/po-requests/pending-po-request/pending-po-request.module')
                    .then(mod => mod.PendingPoRequestModule)

            },
            {
                path: 'rejected-po-request',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['rejected-po-request'] },
                loadChildren: () => import('../pms/po-requests/rejected-po-request/rejected-po-request.module')
                    .then(mod => mod.RejectedPoRequestModule)

            },
            {
                path: 'approved-po-request',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['approved-po-request'] },
                loadChildren: () => import('../pms/po-requests/approved-po-request/approved-po-request.module')
                    .then(mod => mod.ApprovedPoRequestModule)
            },

            {
                path: 'my-pending-po-request',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['my-pending-po-requests'] },
                loadChildren: () => import('../pms/my-po-requests/pending-po-request/pending-po-request.module')
                    .then(mod => mod.PendingPoRequestModule)

            },
            {
                path: 'my-rejected-po-request',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['my-rejected-po-requests'] },
                loadChildren: () => import('../pms/my-po-requests/rejected-po-request/rejected-po-request.module')
                    .then(mod => mod.RejectedPoRequestModule)

            },
            {
                path: 'my-approved-po-request',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['my-approved-po-requests'] },
                loadChildren: () => import('../pms/my-po-requests/approved-po-request/approved-po-request.module')
                    .then(mod => mod.ApprovedPoRequestModule)
            },

            {
                path: 'units',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['unit-list'] },
                loadChildren: () => import('../general-modules/administration/unit/unit.module')
                    .then(mod => mod.UnitModule)
            },
            {
                path: 'banks',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['bank-list'] },
                loadChildren: () => import('../ams/bank/bank.module')
                    .then(mod => mod.BankModule)
            },
            {
                path: 'client-financial-summary',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: [''] },
                loadChildren: () => import('../general-modules/administration/client-financial-summary/client-financial-summary.module')
                    .then(mod => mod.ClientFinancialSummaryModule)
            },
            {
                path: 'sale-report',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: [''] },
                loadChildren: () => import('../general-modules/administration/sale-report/sale-report.module')
                    .then(mod => mod.SaleReportModule)
            },
            {
                path: 'accounts',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['account-list'] },
                loadChildren: () => import('../ams/account/account.module')
                    .then(mod => mod.AccountModule)
            },
            {
                path: 'account-history',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['account-history'] },
                loadChildren: () => import('../ams/account-history/account-history.module')
                    .then(mod => mod.AccountHistoryModule)
            },
            {
                path: 'supplier-account-history',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['supplier-account-history'] },
                loadChildren: () => import('../general-modules/administration/supplier-account-history/supplier-account-history.module')
                    .then(mod => mod.SupplierAccountHistoryModule)
            },
            {
                path: 'edit-po-request',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['edit-po-request'] },
                loadChildren: () => import('../pms/edit-po-request/edit-po-request.module')
                    .then(mod => mod.EditPoRequestModule)
            },
            {
                path: 'po-request-list',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['po-request-list'] },
                loadChildren: () => import('../pms/product-list/product-list.module')
                    .then(mod => mod.ProductListModule)
            },
            {
                path: 'suppliers',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['supplier-list'] },
                loadChildren: () => import('../pms/supplier/supplier.module')
                    .then(mod => mod.SupplierModule)
            },
            {
                path: 'supplier-products',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['supplier-product-list'] },
                loadChildren: () => import('../pms/supplier-product/supplier-product.module')
                    .then(mod => mod.SupplierProductModule)
            },
            {
                path: 'product-bulk-upload',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['bulk-upload-base-product'] },
                loadChildren: () => import('../pms/product-bulk-upload/product-bulk-upload.module')
                    .then(mod => mod.ProductBulkUploadModule)
            },
            {
                path: 'store',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['store-list'] },
                loadChildren: () => import('../sms/store/store.module').then(mod => mod.StoreModule)
            },
            {

                path: 'sepod-stores',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['sepod-store-list'] },
                loadChildren: () => import('../sms/sepod-store/sepod-store.module')
                    .then(mod => mod.SepodStoreModule)
            },
            {
                path: 'store-products',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['store-product-list'] },
                loadChildren: () => import('../sms/store-product/store-product.module').then(mod => mod.StoreProductModule)

            },
            {
                path: 'sepod-store-products',
                canActivate: [ClientGuard],
                data: { permissions: ['store-product-list'] },
                loadChildren: () => import('../sms/sepod-store-product/sepod-store-product.module').then(mod => mod.SepodStoreProductModule)
            },
            {
                path: 'store-credential',
                canActivate: [ClientGuard],
                data: { Permissions: ['store-credenteial-list'], breadCrum: 'store' },
                loadChildren: () => import('../sms/store-credential/store-credential.module')
                    .then(mod => mod.StoreCredentialModule)
            },
            {
                path: 'sepod-store-credential',
                canActivate: [ClientGuard],
                data: { Permissions: ['store-credenteial-list'], breadCrum: 'sepod-store' },
                loadChildren: () => import('../sms/store-credential/store-credential.module')
                    .then(mod => mod.StoreCredentialModule)
            },
            {
                path: 'product-bulk-upload-list',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['bulk-upload-list'] },
                loadChildren: () => import('../pms/product-bulk-upload-list/product-bulk-upload-list.module')
                    .then(mod => mod.ProductBulkUploadListModule)
            },
            {
                path: 'product-bulk-upload-data',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['bulk-upload-data'] },
                loadChildren: () => import('../pms/product-bulk-upload-data/product-bulk-upload-data.module')
                    .then(mod => mod.ProductBulkUploadDataModule)
            },
            {
                path: 'amount-transfer',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['account-transfer-list'] },
                loadChildren: () => import('../ams/amount-transfer/amount-transfer.module')
                    .then(mod => mod.AmountTransferModule)
            },

            {
                path: 'dhl-rates',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['account-list'] },
                loadChildren: () => import('../dhl/rates/rates.module')
                    .then(mod => mod.RatesModule)
            },

            {
                path: 'create-shipment',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['account-list'] },
                loadChildren: () => import('../dhl/shipment/shipment.module')
                    .then(mod => mod.ShipmentModule)
            },
            {
                path: 'shipment-list',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['account-list'] },
                loadChildren: () => import('../dhl/shipment-created/shipment-created.module')
                    .then(mod => mod.ShipmentCreatedModule)
            },
            {
                path: 'user-lib',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['store-credenteial-list'] },
                loadChildren: () => import('../general-modules/administration/user-lib/user-lib.module')
                    .then(mod => mod.UserLibModule)
            },
            {
                path: 'user-lib-file',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['store-credenteial-list'] },
                loadChildren: () => import('../general-modules/administration/user-lib-file/user-lib-file.module')
                    .then(mod => mod.UserLibFileModule)
            },
            {
                path: 'bulk-uploader',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['bulk-upload-base-product'] },
                loadChildren: () => import('../pms/bulk-uploader/bulk-uploader.module')
                    .then(mod => mod.BulkUploaderModule)
            },
            {
                path: 'vp-product-bulk-upload-list',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['bulk-upload-base-product'] },
                loadChildren: () => import('../pms/vp-product-bulk-upload-list/vp-product-bulk-upload-list.module')
                    .then(mod => mod.VpProductBulkUploadListModule)
            },
            {
                path: 'email-templates',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['email-template-list'] },
                loadChildren: () => import('../general-modules/email-template/email-template.module')
                    .then(mod => mod.EmailTemplateModule)
            },
            {
                path: 'fulfilment',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['fulfillment-center-list'] },
                loadChildren: () => import('../general-modules/administration/fulfilment/fulfilment.module')
                    .then(mod => mod.FulfilmentModule)
            },
            {
                path: 'currency',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['currency-list'] },
                loadChildren: () => import('../general-modules/administration/currency/currency.module')
                    .then(mod => mod.CurrencyModule)
            },
            {
                path: 'billing-methods',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['my-orders'] },
                loadChildren: () => import('./../oms/billing-methods/billing-methods.module')
                    .then(mod => mod.BillingMethodsModule)
            },
            {
                path: 'add-billing-methods',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['my-orders'] },
                loadChildren: () => import('./../oms/add-billing-methods/add-billing-methods.module')
                    .then(mod => mod.AddBillingMethodsModule)
            },
            {
                path: 'legal-info',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['my-orders'] },
                loadChildren: () => import('./../oms/legal-info/legal-info.module')
                    .then(mod => mod.LegalInfoModule)
            },
            {
                path: 'billing-wallet',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['my-orders'] },
                loadChildren: () => import('./../oms/billing-wallet/billing-wallet.module')
                    .then(mod => mod.BillingWalletModule)
            },
            {
                path: 'payments',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['my-orders'] },
                loadChildren: () => import('./../oms/payments/payments.module')
                    .then(mod => mod.PaymentsModule)
            },
            {
                path: 'my-account',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['my-orders'] },
                loadChildren: () => import('./../oms/my-account/my-account.module')
                    .then(mod => mod.MyAccountModule)
            },
            {
                path: 'shipping',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['my-orders'] },
                loadChildren: () => import('./../oms/shipping/shipping.module')
                    .then(mod => mod.ShippingModule)
            },
            {
                path: 'returns',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['my-orders'] },
                loadChildren: () => import('./../oms/returns/returns.module')
                    .then(mod => mod.ReturnsModule)
            },
            {
                path: 'branding',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['my-orders'] },
                loadChildren: () => import('./../oms/branding/branding.module')
                    .then(mod => mod.BrandingModule)
            },
            {
                path: 'notifications',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['my-orders'] },
                loadChildren: () => import('./../oms/notifications/notifications.module')
                    .then(mod => mod.NotificationsModule)
            },
            {
                path: 'users',
                canActivate: [ClientGuard, PermissionsGuard],
                data: { permissions: ['my-orders'] },
                loadChildren: () => import('./../oms/users/users.module')
                    .then(mod => mod.UsersModule)
            }
            // {
            //     path: 'create-virtual-products',
            //     canActivate: [ClientGuard, PermissionsGuard],
            //     data: { permissions: ['create-virtual-products'] },
            //     loadChildren: () => import('./../pms/create-virtual-products/create-virtual-products.module')
            //         .then(mod => mod.CreateVirtualProductModule)
            // }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ClientPanelRoutes { }
