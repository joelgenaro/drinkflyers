import { ClientSidebarService } from './client-sidebar.service'
import { Component, OnInit } from '@angular/core'
import { trigger, state, style, transition, animate } from '@angular/animations'
import { ApiService } from 'src/app/services/api.service'

@Component({
    selector: 'app-client-sidebar',
    templateUrl: './client-sidebar.component.html',
    styleUrls: ['./client-sidebar.component.css'],
    animations: [
        trigger('slide', [
            state('up', style({ height: 0 })),
            state('down', style({ height: '*' })),
            transition('up <=> down', animate(200))
        ])
    ]
})
export class ClientSidebarComponent implements OnInit {
    menus = []
    user: any
    menuState = 'Dashboard'
    subMenuState = ''
    constructor(
        public sidebarservice: ClientSidebarService,
        private api: ApiService
    ) {
        this.user = this.api.user
        this.menus = sidebarservice.getMenuList()
    }

    ngOnInit() {
    }

    getSideBarState() {
        return this.sidebarservice.getSidebarState()
    }

    toggle(currentMenu) {
        if (currentMenu.type === 'dropdown') {
            this.menus.forEach(element => {
                if (element === currentMenu) {
                    currentMenu.active = !currentMenu.active
                } else {
                    element.active = false
                }
            })
        }
    }

    getState(currentMenu) {
        // console.log('currentMenu', currentMenu)
        if (currentMenu.active) {
            return 'down'
        } else {
            return 'up'
        }
    }

    hasBackgroundImage() {
        return this.sidebarservice.hasBackgroundImage
    }

    logOut(): void {
        this.api.logOutSession().subscribe((resp: any) => {
            const check = this.api.logOut()
            if (check) {
                // location.reload()
                window.location.href = '/login'
            }
        })
    }

    setStateAsActive(menu: any) {
        this.subMenuState = ''
        this.menuState = menu
        this.closeAllMenus()
    }

    setStateAsActiveSubmenu(link: any) {
        this.menuState = ''
        this.subMenuState = link
    }

    closeAllMenus() {
        this.menus.forEach((element) => {
            element.active = false
        })
    }

    toggleSubMenu(parentMenu: any, subMenu: any) {
        if (subMenu.type === 'dropdown') {
            parentMenu.submenus?.forEach((element) => {
                if (element === subMenu) {
                    subMenu.active = !subMenu.active
                } else {
                    element.active = false
                }
            })
        }
    }
}
