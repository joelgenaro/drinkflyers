import { apis } from 'src/environments/environment'
import { Injectable } from '@angular/core'
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http'

@Injectable({
    providedIn: 'root'
})

export class ApiInterceptorsService implements HttpInterceptor {

    constructor() {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        const apiToken = localStorage.getItem('token')
        // console.log('asdf', req)
        if (apiToken && req.url.split('/')[2] !== apis.artworkUrl) {
            const clonedReq = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${apiToken}`
                }
            })

            return next.handle(clonedReq)
        } else {
            return next.handle(req)
        }
    }
}