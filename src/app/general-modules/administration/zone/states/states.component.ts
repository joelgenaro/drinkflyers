import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { DataService } from '../data.service'

@Component({
    selector: 'app-states',
    templateUrl: './states.component.html',
    styleUrls: ['./states.component.css']
})
export class StatesComponent implements OnInit {
    zoneId = -1
    zoneDetails: any
    statesList = []
    selectedStates = []
    dataStatus = false
    loginLoading = false
    searchString: any
    searchSelectedString: any
    dataToSend = {
        zone_id: -1,
        region_ids: [],
        region_type: 'state'
    }
    constructor(
        private ds: DataService,
        private alert: IAlertService,
        private route: ActivatedRoute,
        public router: Router
    ) {
        this.ds.step = 'states'
        this.route.queryParams.subscribe((params) => {
            if (params.id) {
                this.zoneId = params.id
                this.dataToSend.zone_id = +this.zoneId
            }
        })

        this.ds.getStateList().subscribe((resp: any) => {
            if (resp.success === true) {
                this.statesList = resp.data
                this.ds.zoneRegionlist({ zone_id: this.zoneId, region_type: 'State' }).subscribe((resp: any) => {
                    if (resp.success === true) {
                        this.dataStatus = true
                        this.zoneDetails = resp.data
                        this.zoneDetails.forEach((element: any) => {
                            this.dataToSend.region_ids.push(
                                element.state.id
                            )
                            this.selectState(element.state)
                        })
                    }
                })
            }
        })
    }

    selectState(state: any) {
        const index = this.statesList.findIndex((p: any) => {
            return p.id === state.id
        })
        // add to selected
        this.selectedStates.push(
            this.statesList[index]
        )
        // remove from all
        this.statesList.splice(index, 1)
        // add to dataToSend
        if (!this.dataToSend.region_ids.includes(state.id)) {
            this.dataToSend.region_ids.push(state.id)
        }
    }

    unselectState(state: any) {
        const index = this.selectedStates.findIndex((p: any) => {
            return p.id === state.id
        })
        // add to all
        this.statesList.push(
            this.selectedStates[index]
        )
        // remove from selected
        this.selectedStates.splice(index, 1)
        // remove from dataToSend
        const i = this.dataToSend.region_ids.indexOf(state.id)
        this.dataToSend.region_ids.splice(i, 1)
    }

    assignStates() {
        this.loginLoading = true
        this.ds.zoneRegionAddUpdate(this.dataToSend).subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === true) {
                this.alert.success('States assigned successfully!!')
                this.router.navigate(['/user/zone/countries'], {
                    queryParams: { id: this.zoneId },
                    replaceUrl: true,
                })
            } else {
                this.alert.error(resp.errors.general)
            }
        })
    }

    ngOnInit() {
    }
}
