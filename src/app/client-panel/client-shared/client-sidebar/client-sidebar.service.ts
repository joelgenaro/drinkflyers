import { Injectable } from '@angular/core'
// import { DataService } from 'src/app/pms/product/data.service'
import { ApiService } from 'src/app/services/api.service'
import { ConstantsService } from 'src/app/services/constants.service'

@Injectable({
    providedIn: 'root'
})
export class ClientSidebarService {
    toggled = false
    _hasBackgroundImage = true
    completeMenu = []
    userMenu = []
    userId: any

    constructor(
        public api: ApiService,
    ) {
        this.userId = JSON.parse(localStorage.getItem('user')).id
        this.completeMenu = [
            {
                title: 'Dashboard',
                link: 'dashboard',
                icon: 'fa fa-tachometer-alt',
                permissions: ['dashboard'],
                active: true,
                type: 'simple'
            },
            {
                title: 'Product Manager',
                icon: 'fas fa-cubes',
                active: false,
                type: 'dropdown',
                submenus: [
                    {
                        title: 'Blank Products',
                        active: false,
                        icon: 'fas fa-dot-circle',
                        type: 'dropdown',
                        permissions: ['base-product-list'],
                        submenus: [
                            {
                                title: 'Products List',
                                link: 'base-products-list',
                                permissions: ['base-product-list'],
                                active: true,
                                type: 'simple'
                            },
                            {
                                title: 'Add New Product',
                                link: 'base-product/product-detail',
                                queryParams: { id: -1 },
                                icon: 'fas fa-plus-circle',
                                permissions: ['add-base-product'],
                                active: true,
                                type: 'simple'
                            },
                            {
                                title: 'Bulk Upload',
                                link: `product-bulk-upload`,
                                icon: 'fas fa-dot-circle',
                                permissions: ['bulk-upload-base-product'],
                                active: true,
                                type: 'simple'
                            }
                        ]
                    },
                    {
                        title: 'Virtual Products',
                        active: false,
                        icon: 'fas fa-dot-circle',
                        type: 'dropdown',
                        permissions: ['product-list'],
                        submenus: [
                            {
                                title: 'Products List',
                                link: 'products-list',
                                permissions: ['product-list'],
                                active: true,
                                type: 'simple'
                            },
                            {
                                title: 'Add New Product',
                                link: 'product/create-virtual-product',
                                queryParams: { id: -1 },
                                icon: 'fas fa-plus-circle',
                                permissions: ['add-product'],
                                active: true,
                                type: 'simple'
                            }
                        ]
                    },
                    {
                        title: 'Product Categories',
                        link: `category`,
                        permissions: ['category-list'],
                        active: true,
                        type: 'simple'
                    },
                    {
                        title: 'Product Tags',
                        link: `tags`,
                        permissions: ['tag-list'],
                        active: true,
                        type: 'simple'
                    },
                    {
                        title: 'Product Currencies',
                        link: `currency`,
                        permissions: ['currency-list'],
                        active: true,
                        type: 'simple'
                    }
                ]
            },
            {
                title: 'Orders',
                icon: 'fas fa-shopping-cart',
                active: false,
                type: 'dropdown',
                submenus: [
                    {
                        title: 'SEPOD Store Orders',
                        link: 'orders',
                        icon: 'fas fa-dot-circle',
                        permissions: ['all-order-list'],
                        active: true,
                        type: 'simple'
                    },
                    {
                        title: 'Client Store Orders',
                        link: 'my-orders',
                        icon: 'fas fa-dot-circle',
                        permissions: ['my-orders'],
                        active: true,
                        type: 'simple'
                    },
                    {
                        title: 'Outstanding Orders',
                        link: 'outstanding-orders',
                        icon: 'fas fa-dot-circle',
                        permissions: ['invoice-order-list'],
                        active: true,
                        type: 'simple'
                    },
                    // {
                    //     title: 'Orders List',
                    //     link: 'orders-list',
                    //     icon: 'fas fa-dot-circle',
                    //     permissions: ['orders-list'],
                    //     active: true,
                    //     type: 'simple'
                    // },
                ]
            },
            {
                title: 'Invoice',
                link: 'invoice',
                icon: 'fas fa-inbox',
                permissions: ['invoice-list'],
                active: true,
                type: 'simple'
            },
            {
                title: 'Email Templates',
                link: 'email-templates',
                icon: 'fas fa-inbox',
                permissions: ['email-template-list'],
                active: true,
                type: 'simple'
            },
            {
                title: 'My Invoice',
                link: 'my-invoice',
                icon: 'fas fa-inbox',
                permissions: ['my-invoices-list'],
                active: true,
                type: 'simple'
            },
            {
                title: 'Suppliers',
                link: 'suppliers',
                icon: 'fas fa-industry',
                permissions: ['supplier-list'],
                active: true,
                type: 'simple'
            },
            {
                title: 'Client Stores',
                link: 'store',
                icon: 'fas fa-store',
                permissions: ['store-list'],
                active: true,
                type: 'simple'
            },
            {
                title: 'Fulfilments',
                icon: 'far fa-dot-circle',
                active: false,
                type: 'dropdown',
                submenus: [
                    {
                        title: 'Fulfilment Center',
                        link: 'fulfilment',
                        permissions: ['fulfillment-center-list'],
                        type: 'simple',
                        active: true,
                    }
                ]
            },
            {
                title: 'Libraries',
                link: 'user-lib',
                icon: 'fas fa-store',
                permissions: ['store-list'],
                active: true,
                type: 'simple'
            },
            {
                title: 'SEPOD Stores',
                link: 'sepod-stores/list',
                icon: 'fas fa-store',
                permissions: ['sepod-store-list'],
                active: true,
                type: 'simple'
            },
            {
                title: 'PO Requests',
                icon: 'fa fa-product-hunt',
                active: false,
                type: 'dropdown',
                submenus: [
                    {
                        title: 'Add PO',
                        link: 'new-po-request',
                        permissions: ['add-po-request'],
                        type: 'simple',
                        active: true,
                    },
                    {
                        title: 'Pending',
                        link: 'pending-po-request',
                        permissions: ['pending-po-request-list'],
                        type: 'simple',
                        active: true,
                    },
                    {
                        title: 'Rejected',
                        link: 'rejected-po-request',
                        permissions: ['rejected-po-request-list'],
                        type: 'simple',
                        active: true,
                    },
                    {
                        title: 'Approved',
                        link: 'approved-po-request',
                        permissions: ['approved-po-request-list'],
                        type: 'simple',
                        active: true,
                    }
                ]
            },
            {
                title: 'My PO Requests',
                icon: 'fa fa-product-hunt',
                active: false,
                type: 'dropdown',
                submenus: [
                    {
                        title: 'Add PO',
                        link: 'new-po-request',
                        permissions: ['add-po-request'],
                        type: 'simple',
                        active: true,
                    },
                    {
                        title: 'Pending',
                        link: 'my-pending-po-request',
                        permissions: ['my-pending-po-requests'],
                        type: 'simple',
                        active: true,
                    },
                    {
                        title: 'Rejected',
                        link: 'my-rejected-po-request',
                        permissions: ['my-rejected-po-requests'],
                        type: 'simple',
                        active: true,
                    },
                    {
                        title: 'Approved',
                        link: 'my-approved-po-request',
                        permissions: ['my-approved-po-requests'],
                        type: 'simple',
                        active: true,
                    }
                ]
            },
            {
                title: 'Administration',
                icon: 'fas fa-lock',
                active: false,
                type: 'dropdown',
                submenus: [
                    {
                        title: 'Artwork Categories',
                        link: `artwork-category`,
                        icon: 'fas fa-dot-circle',
                        permissions: ['artwork-category-list'],
                        active: true,
                        type: 'simple'
                    },
                    {
                        title: 'Courier Service',
                        link: `courier-service`,
                        icon: 'fas fa-dot-circle',
                        permissions: ['courier-service-list'],
                        active: true,
                        type: 'simple'
                    },
                    {
                        title: 'Font Categories',
                        link: `font-category`,
                        icon: 'fas fa-dot-circle',
                        permissions: ['font-category-list'],
                        active: true,
                        type: 'simple'
                    },
                    {
                        title: 'Order Reason',
                        link: 'order-reason',
                        icon: 'fas fa-dot-circle',
                        permissions: ['reason-list'],
                        active: true,
                        type: 'simple'
                    },
                    {
                        title: 'Sale Report',
                        link: `sale-report`,
                        icon: 'fas fa-dot-circle',
                        permissions: ['sale-report'],
                        active: true,
                        type: 'simple'
                    },
                    {
                        title: 'Setting',
                        link: `setting`,
                        icon: 'fas fa-dot-circle',
                        permissions: ['setting-detail'],
                        active: true,
                        type: 'simple'
                    },
                    {
                        title: 'Units',
                        link: `units`,
                        icon: 'fas fa-dot-circle',
                        permissions: ['unit-list'],
                        active: true,
                        type: 'simple'
                    }
                ]
            },
            {
                title: 'Account',
                icon: 'fas fa-wallet',
                active: false,
                type: 'dropdown',
                submenus: [
                    {
                        title: 'Accounts',
                        link: `accounts`,
                        icon: 'fas fa-dot-circle',
                        permissions: ['account-list'],
                        active: true,
                        type: 'simple'
                    },
                    {
                        title: 'Banks',
                        link: `banks`,
                        icon: 'fas fa-dot-circle',
                        permissions: ['bank-list'],
                        active: true,
                        type: 'simple'
                    },
                    {
                        title: 'Transactions',
                        link: `amount-transfer`,
                        icon: 'fas fa-dot-circle',
                        permissions: ['account-transfer-list'],
                        active: true,
                        type: 'simple'
                    },
                ]
            },
            {
                title: 'HR',
                icon: 'fas fa-users-cog',
                active: false,
                type: 'dropdown',
                submenus: [
                    {
                        title: 'Client',
                        link: 'client/list',
                        icon: 'fas fa-user-friends',
                        permissions: ['client-list'],
                        active: true,
                        type: 'simple'
                    },
                    {
                        title: 'Employees',
                        link: 'employees/list',
                        permissions: ['employee-list'],
                        active: true,
                        type: 'simple'
                    },
                    {
                        title: 'User Roles',
                        link: `roles`,
                        icon: 'fas fa-dot-circle',
                        permissions: ['roles'],
                        active: true,
                        type: 'simple'
                    },


                ]
            },
            {
                title: 'DHL',
                icon: 'fas fa-shopping-cart',
                active: false,
                type: 'dropdown',
                submenus: [
                    // {
                    //     title: 'Rates',
                    //     link: 'dhl-rates',
                    //     icon: 'fas fa-dot-circle',
                    //     permissions: ['dhl-reates'],
                    //     active: true,
                    //     type: 'simple'
                    // },
                    {
                        title: 'Shipments',
                        link: 'shipment-list',
                        icon: 'fas fa-dot-circle',
                        permissions: ['dhl-list'],
                        active: true,
                        type: 'simple'
                    },

                ]
            },
            {
                title: 'Billing',
                icon: 'fas fa-inbox fas',
                active: false,
                type: 'dropdown',
                submenus: [
                    {
                        title: 'Payments',
                        link: 'payments',
                        icon: 'fas fa-dot-circle',
                        permissions: ['my-orders'],
                        active: true,
                        type: 'simple'
                    },
                    {
                        title: 'Billing Methods',
                        link: 'billing-methods',
                        icon: 'fas fa-dot-circle',
                        permissions: ['my-orders'],
                        active: true,
                        type: 'simple'
                    },
                    {
                        title: 'Wallet',
                        link: 'billing-wallet',
                        icon: 'fas fa-dot-circle',
                        permissions: ['my-orders'],
                        active: true,
                        type: 'simple'
                    },
                    {
                        title: 'Legal Info',
                        link: 'legal-info',
                        icon: 'fas fa-dot-circle',
                        permissions: ['my-orders'],
                        active: true,
                        type: 'simple'
                    }
                ]
            },
            {
                title: 'Settings',
                icon: 'fas fa-cog fas',
                active: false,
                type: 'dropdown',
                submenus: [
                    {
                        title: 'My Account',
                        link: 'my-account',
                        icon: 'fas fa-dot-circle',
                        permissions: ['my-orders'],
                        active: true,
                        type: 'simple'
                    },
                    {
                        title: 'Users',
                        link: 'users',
                        icon: 'fas fa-dot-circle',
                        permissions: ['my-orders'],
                        active: true,
                        type: 'simple'
                    },
                    {
                        title: 'Shipping',
                        link: 'shipping',
                        icon: 'fas fa-dot-circle',
                        permissions: ['my-orders'],
                        active: true,
                        type: 'simple'
                    },
                    {
                        title: 'Branding',
                        link: 'branding',
                        icon: 'fas fa-dot-circle',
                        permissions: ['my-orders'],
                        active: true,
                        type: 'simple'
                    },
                    {
                        title: 'Returns',
                        link: 'returns',
                        icon: 'fas fa-dot-circle',
                        permissions: ['my-orders'],
                        active: true,
                        type: 'simple'
                    },
                    {
                        title: 'Notifications',
                        link: 'notifications',
                        icon: 'fas fa-dot-circle',
                        permissions: ['my-orders'],
                        active: true,
                        type: 'simple'
                    }
                ]
            }
        ]

        if (this.api.checkRole()) {
            return
        }
        const permissions = this.api.user.permissions
        console.log('permissions', permissions)
        this.api.user.user_roles.forEach(userRole => {
            userRole.role.permissions.forEach(p => {
                permissions.push(p)
            })
        })

        this.completeMenu.forEach((menuItem: any) => {
            if (menuItem.type === 'simple') {
                const index = permissions.findIndex((item: any) => menuItem.permissions.indexOf(item.name) > -1)
                if (index > -1) {
                    this.userMenu.push(menuItem)
                }
            }
            if (menuItem.type === 'dropdown') {
                const submenu = []
                menuItem.submenus.forEach((subMenuItem: any) => {
                    const index = permissions.findIndex((item: any) => subMenuItem.permissions.indexOf(item.name) > -1)
                    if (index > -1) {
                        submenu.push(subMenuItem)
                    }
                })
                if (submenu.length > 0) {
                    menuItem.submenus = submenu
                    this.userMenu.push(menuItem)
                }
            }
        })
    }

    toggle() {
        this.toggled = !this.toggled
    }

    getSidebarState() {
        return this.toggled
    }

    setSidebarState(state: boolean) {
        this.toggled = state
    }

    getMenuList() {
        if (this.api.user.user_type === ConstantsService.USER_ROLES.ADMIN) {
            return this.completeMenu
        } else {
            return this.userMenu
        }
    }

    get hasBackgroundImage() {
        return this._hasBackgroundImage
    }

    set hasBackgroundImage(hasBackgroundImage) {
        this._hasBackgroundImage = hasBackgroundImage
    }

    checkRoutePermission(route: string): boolean {
        let permissions: any = []
        this.completeMenu.forEach((menuItem: any) => {
            if (menuItem.type === 'dropdown') {
                const index = menuItem.submenus.findIndex((submenuItem: any) => submenuItem.link === route)
                if (index > -1) {
                    permissions = menuItem.submenus[index].permissions
                    return
                }
            } else {
                if (menuItem.link === route) {
                    permissions = menuItem.permissions
                    return
                }
            }
        })

        return this.api.checkPermissions(permissions)
    }
}
