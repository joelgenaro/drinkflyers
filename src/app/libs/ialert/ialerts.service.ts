import { Injectable } from '@angular/core'
import { IAlert, defaultOptions } from './ialert'
import { Subject, interval } from 'rxjs'

@Injectable({
    providedIn: 'root'
})
export class IAlertService {
    private alertsSource: Array<IAlert> = []
    public alerts = new Subject<any>()

    constructor() { }

    showAlert(type: string, msg: string, title?: string, options?: any): void {
        const alert = { ...defaultOptions }
        alert.id = this.generateId()
        alert.title = title ? title : type.concat('!!')
        alert.type = `i-alert ${type}`
        alert.message = msg
        if (options) {
            alert.interval = options.interval ? options.interval : defaultOptions.interval
        }
        this.alertsSource.push(alert)
        this.alerts.next(this.alertsSource)
        setTimeout(_ => this.hideAlert(alert.id), alert.interval)
    }

    success(msg: string, title?: string, options?: any) {
        title = title ? title : 'Success'
        this.showAlert('success', msg, title, options)
    }

    error(msg: string, title?: string, options?: any) {
        title = title ? title : 'Error'
        this.showAlert('error', msg, title, options)
    }

    warning(msg: string, title?: string, options?: any) {
        title = title ? title : 'Warning'
        this.showAlert('warning', msg, title, options)
    }

    info(msg: string, title?: string, options?: any) {
        title = title ? title : 'Info'
        this.showAlert('info', msg, title, options)
    }

    hideAlert(id: string) {
        const index = this.alertsSource.findIndex((item: any) => item.id === id)
        this.alertsSource[index].status = false
        this.alertsSource.splice(index, 1)
        this.alerts.next(this.alertsSource)
    }

    generateId() {
        const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
        const ID_LENGTH = 8
        let rtn = ''

        for (let i = 0; i < ID_LENGTH; i++) {
            rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length))
        }

        return rtn
    }
}
