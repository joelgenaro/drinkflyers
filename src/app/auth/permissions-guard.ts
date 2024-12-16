import { Observable } from 'rxjs'
import { ApiService } from '../services/api.service'
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, ActivatedRoute } from '@angular/router'
import { Injectable } from '@angular/core'
import { ConstantsService } from '../services/constants.service'
import { UserSidebarService } from '../user-panel/user-shared/user-sidebar/user-sidebar.service'

@Injectable({
    providedIn: 'root'
})
export class PermissionsGuard implements CanActivate {

    constructor(
        private api: ApiService,
        private router: Router,
        private userService: UserSidebarService) {
    }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | boolean {
        const routeExceptions = ['not-authorized', 'change-password']
        let route: any
        if (this.api.checkRole() === true) {
            route = state.url.split('?')[0].split('user/').pop().split('/')[0]
        } else {
            route = state.url.split('?')[0].split('client/').pop().split('/')[0]
        }
        const reqPermissions = next.data?.permissions

        if (this.api.user.user_type === ConstantsService.USER_ROLES.ADMIN) {
            return true
        }

        if (routeExceptions.indexOf(state.url.split('/').pop()) > -1) {
            return true
        }
        console.log('Route', state.url)
        console.log('segment', state.url.split('/').pop())

        if (this.userService.checkRoutePermission(route) || this.api.checkPermissions(reqPermissions)) {
            return true
        } else {
            console.log('redirect to /user/not-authorized by PermissionsGuard')
            this.router.navigateByUrl('/user/not-authorized')

            return false
        }
    }
}
