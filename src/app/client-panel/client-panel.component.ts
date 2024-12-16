import { ApiService } from 'src/app/services/api.service'
import { Component, OnInit, HostListener } from '@angular/core'
import { ClientSidebarService } from './client-shared/client-sidebar/client-sidebar.service'
import { Router, ActivatedRoute, UrlSegment, NavigationEnd } from '@angular/router'

@Component({
    selector: 'app-client-panel',
    templateUrl: './client-panel.component.html',
    styleUrls: ['./client-panel.component.css']
})
export class ClientPanelComponent implements OnInit {
    firstName: any
    lastName: any
    displayUser = false
    displayNotifications = false
    constructor(
        public sidebarservice: ClientSidebarService,
        public api: ApiService,
        public route: Router
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

        this.route.events.subscribe(
            (event: any) => {
                if (event instanceof NavigationEnd) {
                    if (this.route.url.includes('personalized-region')) {
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
