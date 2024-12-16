import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core'

@Injectable({
    providedIn: 'root'
})
export class WebsiteService {

    private alertData: any = {
        title: 'Success!!',
        type: 'k-alert success',
        message: 'some message here',
        status: false,
        interval: 4000
    }

    public alert = new BehaviorSubject<any>(this.alertData)

    success(msg: string, title?: string) {
        this.alertData.title = title ? title : 'Success!!'
        this.alertData.type = 'k-alert success'
        this.alertData.message = msg
        this.alertData.status = true
        this.alert.next(this.alertData)

        setTimeout(() => {
            this.alertData.status = false
            this.alert.next(this.alertData)
        }, this.alertData.interval)
    }

    error(msg: string, title?: string) {
        this.alertData.title = title ? title : 'Error!!'
        this.alertData.type = 'k-alert error'
        this.alertData.message = msg
        this.alertData.status = true
        this.alert.next(this.alertData)

        setTimeout(() => {
            this.alertData.status = false
            this.alert.next(this.alertData)
        }, this.alertData.interval)
    }
}
