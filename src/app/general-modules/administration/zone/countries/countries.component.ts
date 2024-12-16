import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ApiService } from 'src/app/services/api.service'
import { DataService } from '../data.service'

@Component({
    selector: 'app-countries',
    templateUrl: './countries.component.html',
    styleUrls: ['./countries.component.css']
})
export class CountriesComponent implements OnInit {
    zoneId = -1
    zoneDetails: any
    countriesList = []
    selectedCountries = []
    selectedZoneCountries = []
    dataStatus = false
    loginLoading = false
    searchString: any
    searchSelectedString: any
    dataToSend = {
        zone_id: -1,
        region_ids: [],
        region_type: 'country'
    }
    constructor(
        private ds: DataService,
        private alert: IAlertService,
        private route: ActivatedRoute,
        public router: Router,
        public apis: ApiService
    ) {
        this.ds.step = 'countries'
        this.route.queryParams.subscribe((params) => {
            if (params.id) {
                this.zoneId = params.id
                this.dataToSend.zone_id = +this.zoneId
            }
        })

        this.ds.getCountryList().subscribe((resp: any) => {
            if (resp.success === true) {
                this.countriesList = resp.data
                this.ds.zoneRegionlist({ zone_id: this.zoneId, region_type: 'Country' }).subscribe((resp: any) => {
                    if (resp.success === true) {
                        this.dataStatus = true
                        this.zoneDetails = resp.data
                        this.zoneDetails.forEach((element: any) => {
                            this.dataToSend.region_ids.push(
                                element.country.id
                            )
                            this.selectCountry(element.country)
                        })
                    }
                })
            }
        })

        this.ds.getSelectedCountryList().subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)

                return false
            } else {
                this.selectedZoneCountries = resp.data

            }
        })
    }

    checkZoneCountry(id: any) {
        let index = this.selectedZoneCountries.findIndex(e => e == id)
        if (index > -1) {
            return true
        }
    }

    selectCountry(country: any) {
        const index = this.countriesList.findIndex((p: any) => {
            return p.id === country.id
        })
        // add to selected
        this.selectedCountries.push(
            this.countriesList[index]
        )
        // remove from all
        this.countriesList.splice(index, 1)
        // add to dataToSend
        if (!this.dataToSend.region_ids.includes(country.id)) {
            this.dataToSend.region_ids.push(country.id)
        }


    }

    unselectCountry(country: any) {
        const index = this.selectedCountries.findIndex((p: any) => {
            return p.id === country.id
        })
        // add to all
        this.countriesList.push(
            this.selectedCountries[index]
        )
        // remove from selected
        this.selectedCountries.splice(index, 1)
        // remove from dataToSend
        const i = this.dataToSend.region_ids.indexOf(country.id)
        this.dataToSend.region_ids.splice(i, 1)

        let cIndex = this.selectedZoneCountries.findIndex(e => e == country.id)
        if (cIndex > -1) {
            this.selectedZoneCountries.splice(cIndex, 1)
        }
    }

    assignCountries() {
        this.loginLoading = true
        this.ds.zoneRegionAddUpdate(this.dataToSend).subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === true) {
                this.alert.success('Countries assigned successfully!!')
                this.router.navigate(['/user/zone/list'])
            } else {
                this.alert.error('Please select at least one country to continue.')
            }
        })
    }

    ngOnInit() {
    }
}
