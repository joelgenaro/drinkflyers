import { DataService } from './data.service'
import { ActivatedRoute } from '@angular/router'
import { Component, OnInit } from '@angular/core'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ConstantsService } from 'src/app/services/constants.service'
import * as moment from 'moment'

@Component({
    selector: 'app-order-tracking',
    templateUrl: './order-tracking.component.html',
    styleUrls: ['./order-tracking.component.css']
})
export class OrderTrackingComponent implements OnInit {
    orderTrackingData: any = []
    orderId: any = ''
    moment = moment
    dataStatus = 'fetching'
    orderObj: any
    breadCrum = [
        {
            link: '/user/orders',
            value: 'Orders',
            params: { id: this.orderId }
        }
    ]

    currentLat = 33.5515769
    currentLng = 73.12303899999999
    // currentLat: any = null
    // currentLng: any = null

    location: Location
    origin: any
    destination: any

    constructor(
        private route: ActivatedRoute,
        private ds: DataService,
        private alert: IAlertService,
        public cs: ConstantsService

    ) {
        this.orderId = this.route.snapshot.queryParamMap.get('id')

        this.getLocation()

        this.breadCrum.push({
            link: '/user/order-tracking',
            params: { id: this.orderId },
            value: 'Order Tracking'
        })

        const param = { id: this.orderId }
        this.ds.orderTracking(param).subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
            } else {
                this.dataStatus = 'done'
                this.orderTrackingData = resp.data
                this.orderObj = Object.keys(this.orderTrackingData).length
            }
        })
    }

    ngOnInit() {
        // this.setCurrentLocation()
        this.location = {
            latitude: 33.5515788,
            longitude: 73.12305649999999,
            zoom: 18,
            marker: {
                lat: 33.5515788,
                lng: 73.12305649999999
            }
        }

        this.origin = {
            // lat: 33.5515788,
            // lng: 73.12305649999999
            lat: this.currentLat,
            lng: this.currentLng
        }
        this.destination = {
            lat: 33.61097123866546,
            lng: 73.10365991846699
        }
    }

    getStatusFormat(status: string) {
        const statusFormat = {
            received: 'Received',
            in_factory: 'In Factory',
            in_packing: 'In Packing',
            dispatched: 'Dispatched',
            delivered: 'Delivered',
            rejected: 'Rejected',
            returned: 'Returned',
            returned_received: 'Returned Received',
        }

        return statusFormat[status]
    }

    getLocation(): void {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                this.currentLat = position.coords.latitude
                this.currentLng = position.coords.longitude
                console.log('Lat', this.currentLat, 'Lng', this.currentLng)
            })
        } else {
            this.alert.error('Unable to get current location')
        }
    }
}

interface Marker {
    lat: number
    lng: number
}

interface Location {
    latitude: number
    longitude: number
    zoom?: number
    marker?: Marker
}