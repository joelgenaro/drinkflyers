import { Component, OnInit, TemplateRef } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ApiService } from 'src/app/services/api.service'
import { ConstantsService } from 'src/app/services/constants.service'
import { DataService } from './data.service'

@Component({
    selector: 'app-shipping-zone-rate',
    templateUrl: './shipping-zone-rate.component.html',
    styleUrls: ['./shipping-zone-rate.component.scss']
})
export class ShippingZoneRateComponent implements OnInit {
    zoneStatus = 'fetching'
    shippingMethodStatus = 'fetching'
    shippingMethodRateStatus = 'fetching'
    zoneCountryStatus = false
    zoneDataForm: FormGroup
    zoneModalRef: BsModalRef
    rateDataForm: FormGroup
    rateModalRef: BsModalRef
    modalRef: BsModalRef
    selectedIndex = -1
    selectedId: any
    modalTitle: any = ''
    zoneList: Array<any> = []
    zoneCountryList: Array<any> = []
    shippingMethodList: Array<any> = []
    shippingMethodRateList: Array<any> = []
    shippingMethodRateNames: Array<any> = []
    shippingMethodZoneCountryNames: Array<any> = []

    shippingMethodDetail: any
    searchCountryString: any
    saveLoading = false
    deleteLoading = false
    allSelector: boolean = false
    selectedDataList: Array<any> = []
    breadCrum = [
        {
            link: '',
            value: 'Shipping zones and rates'
        }
    ]

    constructor(
        private ms: BsModalService,
        private fb: FormBuilder,
        private alert: IAlertService,
        private ds: DataService,
        public ui: UIHelpers,
        public apis: ApiService,
        public cs: ConstantsService,
        public api: ApiService
    ) {
        this.zoneDataForm = this.fb.group({
            id: new FormControl(null),
            name: new FormControl(null, [Validators.required])
        })
        this.rateDataForm = this.fb.group({
            id: new FormControl(null),
            method_id: new FormControl(null),
            name: new FormControl(null, [Validators.required]),
            price: new FormControl('0.00'),
            rate_type: new FormControl('item_weight', [Validators.required]),
            min_weight: new FormControl(null),
            max_weight: new FormControl(null)
        })

        this.ds.getZoneList().subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)

                return false
            } else {
                this.zoneList = resp.data
                this.zoneStatus = 'done'
            }
        })

        this.ds.list().subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)

                return false
            } else {
                this.shippingMethodList = resp.data
                this.shippingMethodStatus = 'done'

                this.shippingMethodList.forEach((e: any, i: any) => {
                    let zoneCountries: any = []
                    e.shipping_method_zones.forEach((f: any, j: any) => {
                        zoneCountries.push(' ' + f.country.name)
                    })
                    this.shippingMethodList[i].country_name = zoneCountries.toString()
                })
            }
        })

        this.ds.rateNames().subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)

                return false
            } else {
                resp.data.forEach((n: any) => {
                    this.shippingMethodRateNames.push({ name: n })
                })
            }
        })
    }

    ngOnInit() {
    }

    get g() {
        return this.zoneDataForm.controls
    }
    get h() {
        return this.rateDataForm.controls
    }

    // SHIPPING ZONE CRUD START
    openZoneModal(formModal, id: any, index) {
        this.modalTitle = 'Create zone'
        this.zoneCountryStatus = true
        this.zoneList.forEach(z => {
            if (z.hasOwnProperty('selected') == true) {
                delete z.selected
            }
            z.zone_regions.forEach(e => {
                if (e.hasOwnProperty('selected') == true) {
                    delete e.selected
                }
            })
        })
        this.zoneModalRef = this.ms.show(
            formModal,
            {
                class: 'modal-md modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
        setTimeout(() => {
            this.ds.getZoneCountryList().subscribe((resp: any) => {
                if (resp.success === false) {
                    this.alert.error(resp.errors.general)

                    return false
                } else {
                    this.zoneCountryList = resp.data
                    if (index == -1) {
                        this.zoneList.forEach(z => {
                            z.zone_regions.forEach(e => {
                                let ind = this.zoneCountryList.findIndex(c => c == e.region_id)
                                if (ind > -1) {
                                    z.selected = true
                                    e.selected = true
                                } else {
                                    e.selected = false
                                }
                            })
                        })
                    }
                }
            })
            if (index > -1) {
                this.selectedId = id
                this.selectedIndex = index
                this.zoneDataForm.controls.id.setValue(this.shippingMethodList[index].id)
                this.zoneDataForm.patchValue(this.shippingMethodList[index])
                this.modalTitle = 'Edit zone'
                const params = {
                    id: this.selectedId
                }
                this.ds.detail(params).subscribe((resp: any) => {
                    if (resp.success === false) {
                        this.alert.error(resp.errors.general)

                        return false
                    } else {
                        resp.data.shipping_method_zones.forEach((e: any) => {
                            let cId = this.zoneCountryList.findIndex(c => c == e.country_id)
                            if (cId > -1) {
                                this.zoneCountryList.splice(cId, 1)
                            }
                            let index = this.selectedDataList.findIndex((zone: any) => zone.zoneId === e.zone_id)
                            if (index > -1) {
                                this.selectedDataList[index].countries.push(e.country_id)
                            } else {
                                this.selectedDataList.push({ zoneId: e.zone_id, countries: [e.country_id] })
                            }
                        })
                        this.zoneList.forEach(z => {
                            z.zone_regions.forEach(e => {
                                let ind = this.zoneCountryList.findIndex(c => c == e.region_id)
                                if (ind > -1) {
                                    z.selected = true
                                    e.selected = true
                                } else {
                                    // z.selected = false
                                    e.selected = false
                                }
                            })
                        })
                    }
                })
            }
            this.zoneCountryStatus = false
        }, 1000)

    }
    cancelZoneButton(f: any) {
        f.resetForm()
        this.selectedDataList = []
        this.zoneModalRef.hide()
        this.selectedIndex = -1
    }
    saveZone(f: any) {
        this.saveLoading = true
        if (this.zoneDataForm.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.saveLoading = false

            return false
        }
        if (this.selectedDataList.length === 0) {
            this.alert.error('Select at least 1 country')
            this.saveLoading = false

            return false
        }

        const params = {
            id: this.zoneDataForm.value.id,
            name: this.zoneDataForm.value.name,
            shipping_zones: this.selectedDataList
        }

        let saveUpdate = this.ds.add(params)
        if (this.zoneDataForm.value.id !== null) {
            saveUpdate = this.ds.update(params)
            this.selectedId = -1
        }
        saveUpdate.subscribe((resp: any) => {
            this.saveLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.saveLoading = false

                return false
            } else {
                if (this.zoneDataForm.value.id !== null) {
                    this.alert.success('Changes done successfully!!')

                    let zoneCountries: any = []
                    resp.data.shipping_method_zones.forEach((e: any) => {
                        zoneCountries.push(' ' + e.country.name)
                    })
                    resp.data.country_name = zoneCountries.toString()
                    this.shippingMethodList[this.selectedIndex] = resp.data

                    this.zoneDataForm.controls.id.setValue(null)
                    this.selectedDataList = []
                } else {
                    params.id = resp.data.id
                    this.alert.success('Added successfully!!')

                    let zoneCountries: any = []
                    resp.data.shipping_method_zones.forEach((e: any) => {
                        zoneCountries.push(' ' + e.country.name)
                    })
                    resp.data.country_name = zoneCountries.toString()
                    this.shippingMethodList.push(resp.data)
                }
            }
            this.zoneModalRef.hide()
            this.selectedDataList = []
            f.resetForm()
        })
    }
    zoneDeleteModal(template: TemplateRef<any>, id: any, i: any) {
        this.selectedId = id
        this.selectedIndex = i
        this.modalRef = this.ms.show(template, { class: 'modal-sm admin-panel' })
    }
    zoneDelete() {
        this.deleteLoading = true
        const params = {
            id: this.selectedId
        }
        this.ds.delete(params).subscribe((resp: any) => {
            this.deleteLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.modalRef.hide()
                this.deleteLoading = false

                return false
            } else {
                const deletingIndex = this.shippingMethodList.findIndex((d: any) => {
                    return d.id === this.selectedId
                })
                this.shippingMethodList.splice(deletingIndex, 1)
                this.modalRef.hide()
                this.alert.success('Deleted successfully!!')
                this.selectedIndex = -1
            }
        })
    }
    // SHIPPING ZONE CRUD END

    // SHIPPING RATE CRUD START
    openRateModal(formModal: TemplateRef<any>, id: any, index: any) {
        this.modalTitle = 'Add rate'
        this.selectedId = id
        this.selectedIndex = index

        if (index > -1) {
            let selectedObject = this.shippingMethodList[this.selectedIndex].shipping_method_rates.find((d: any) => {
                return d.id === this.selectedId
            })

            this.rateDataForm.controls.id.setValue(selectedObject.id)
            this.rateDataForm.patchValue(selectedObject)
            this.modalTitle = 'Edit rate'
        } else {
            let smIndex = this.shippingMethodList.findIndex(e => e.id == this.selectedId)
            if (smIndex > -1) {
                this.selectedIndex = smIndex
                this.rateDataForm.controls.method_id.setValue(this.selectedId)
            }
        }
        this.rateModalRef = this.ms.show(
            formModal,
            {
                class: 'modal-md modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
    }
    cancelRateButton(f: any) {
        f.resetForm()
        this.rateDataForm.controls.rate_type.setValue('item_weight')
        this.rateDataForm.controls.price.setValue('0.00')
        this.rateDataForm.controls.min_weight.setValue(null)
        this.rateDataForm.controls.max_weight.setValue(null)

        this.rateModalRef.hide()
        this.selectedIndex = -1
    }
    saveRate(f: any) {
        this.saveLoading = true
        if (this.rateDataForm.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.saveLoading = false

            return false
        }

        const params = {
            id: this.rateDataForm.value.id,
            method_id: this.rateDataForm.value.method_id,
            name: this.rateDataForm.value.name,
            price: this.rateDataForm.value.price,
            rate_type: this.rateDataForm.value.rate_type,
            min_weight: this.rateDataForm.value.min_weight,
            max_weight: this.rateDataForm.value.max_weight
        }

        let saveUpdate = this.ds.rateAdd(params)
        if (this.rateDataForm.value.id !== null) {
            saveUpdate = this.ds.rateUpdate(params)
        }
        saveUpdate.subscribe((resp: any) => {
            this.saveLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.saveLoading = false

                return false
            } else {
                if (this.rateDataForm.value.id !== null) {
                    this.alert.success('Changes done successfully!!')
                    let rIndex = this.shippingMethodList[this.selectedIndex].shipping_method_rates.findIndex((d: any) => {
                        return d.id === this.selectedId
                    })
                    this.shippingMethodList[this.selectedIndex].shipping_method_rates[rIndex] = resp.data
                    this.rateDataForm.controls.id.setValue(null)
                } else {
                    params.id = resp.data.id
                    this.alert.success('Added successfully!!')
                    this.shippingMethodList[this.selectedIndex].shipping_method_rates.push(resp.data)
                }
            }
            this.rateModalRef.hide()
            f.resetForm()
            this.rateDataForm.controls.rate_type.setValue('item_weight')
            this.rateDataForm.controls.price.setValue('0.00')
            this.rateDataForm.controls.min_weight.setValue(null)
            this.rateDataForm.controls.max_weight.setValue(null)
            this.selectedIndex = -1
        })
    }
    rateDeleteModal(template: TemplateRef<any>, id: any, i: any) {
        this.selectedId = id
        this.selectedIndex = i
        this.rateModalRef = this.ms.show(template, { class: 'modal-sm admin-panel' })
    }
    rateDelete() {
        this.deleteLoading = true
        const params = {
            id: this.selectedId
        }
        this.ds.rateDelete(params).subscribe((resp: any) => {
            this.deleteLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.rateModalRef.hide()
                this.deleteLoading = false

                return false
            } else {
                const deletingIndex = this.shippingMethodList[this.selectedIndex].shipping_method_rates.findIndex((d: any) => {
                    return d.id === this.selectedId
                })
                this.shippingMethodList[this.selectedIndex].shipping_method_rates.splice(deletingIndex, 1)
                this.rateModalRef.hide()
                this.alert.success('Deleted successfully!!')
                this.selectedIndex = -1
            }
        })
    }
    flatValue() {
        if (this.rateDataForm.controls.rate_type.value == 'flat') {
            this.rateDataForm.controls.min_weight.setValue(null)
            this.rateDataForm.controls.max_weight.setValue(null)
        }
    }
    getTextLimit(e) {
        if (e.target.value.length == 10) {
            this.alert.error('You have reached to maximum character length.')
        }
    }
    // SHIPPING RATE CRUD END

    // SELECT AND CHECK ZONE COUNTRIES
    selectZoneCountries(zoneID: any, index) {
        let fInde = this.selectedDataList.findIndex(i => i.zoneId == zoneID)
        if (fInde === -1) {
            let countries = []
            this.zoneList[index].zone_regions.forEach(e => {
                countries.push(e.region_id)
            })
            let obj = {
                zoneId: zoneID,
                countries: countries
            }
            this.selectedDataList.push(obj)
        } else {
            let zind = this.selectedDataList.findIndex(z => z.zoneId == zoneID)
            if (this.zoneList[index].zone_regions.length == this.selectedDataList[zind].countries.length) {
                this.selectedDataList.splice(fInde, 1)
            } else {
                this.zoneList[index].zone_regions.forEach(e => {
                    let cInd = this.selectedDataList[zind].countries.findIndex(c => c == e.region_id)
                    if (cInd == -1) {
                        this.selectedDataList[zind].countries.push(e.region_id)
                    }
                })
            }
        }
    }
    checkZoneCountries(zoneID: any, ind): any {
        if (this.selectedDataList.length > 0) {
            let zInd = this.selectedDataList.findIndex(x => x.zoneId === zoneID)
            if (zInd > -1) {
                if (this.zoneList[ind].zone_regions.length == this.selectedDataList[zInd].countries.length) {
                    return true
                }
            }
        }
    }
    selectCountry(id: any, ind: any, zoneID) {
        let zInd = this.selectedDataList.findIndex(e => e.zoneId == zoneID)
        if (zInd > -1) {
            let cInd = this.selectedDataList[zInd].countries.findIndex(c => c == id)
            if (cInd > -1) {
                this.selectedDataList[zInd].countries.splice(cInd, 1)
                if (this.selectedDataList[zInd].countries.length == 0) {
                    this.selectedDataList.splice(zInd, 1)
                }
            } else {
                this.selectedDataList[zInd].countries.push(id)
            }
        } else {
            let countries = []
            countries.push(id)
            let obj = {
                zoneId: zoneID,
                countries: countries
            }
            this.selectedDataList.push(obj)
        }
    }
    checkCountry(id: any, zoneId): any {
        if (this.selectedDataList.length > 0) {
            let zInd = this.selectedDataList.findIndex(x => x.zoneId === zoneId)
            if (zInd > -1) {
                let cInd = this.selectedDataList[zInd].countries.findIndex(c => c == id)
                if (cInd > -1) {
                    return true
                }
            }
        }
    }
}
