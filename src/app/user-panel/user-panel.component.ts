import { Router, NavigationEnd } from '@angular/router';
import { ApiService } from 'src/app/services/api.service'
import { Component, OnInit, HostListener } from '@angular/core'
import { UserSidebarService } from './user-shared/user-sidebar/user-sidebar.service'

@Component({
    selector: 'app-user-panel',
    templateUrl: './user-panel.component.html',
    styleUrls: ['./user-panel.component.css']
})
export class UserPanelComponent implements OnInit {
    firstName: any
    lastName: any
    displayNotifications = false
    displayUser = false
    constructor(
        public sidebarservice: UserSidebarService,
        public api: ApiService,
        public router: Router
    ) {
    }
    @HostListener('document:click', ['$event.target'])
    onDocClick(element: HTMLElement) {
        // console.log('element', element.classList.contains('show-class'))
        if (element.closest('.show-class') == null) {
            this.displayNotifications = false
            this.displayUser = false
        }
    }
    ngOnInit() {
        this.router.events.subscribe(
            (event: any) => {
                if (event instanceof NavigationEnd) {
                    if (this.router.url.includes('personalized-region')) {
                        this.api.isfullScreen = true
                    } else {
                        this.api.isfullScreen = false
                    }
                }
            }
        )
        this.firstName = this.api.user.first_name
        this.lastName = this.api.user.last_name
        if (this.api.isfullScreen === true) {
            this.hideSidebar()
        }
    }

    toggleSidebar() {
        this.sidebarservice.setSidebarState(!this.sidebarservice.getSidebarState())
    }
    toggleBackgroundImage() {
        this.sidebarservice.hasBackgroundImage = !this.sidebarservice.hasBackgroundImage
    }
    getSideBarState() {
        return this.sidebarservice.getSidebarState()
    }

    hideSidebar() {
        this.sidebarservice.setSidebarState(true)
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
}
