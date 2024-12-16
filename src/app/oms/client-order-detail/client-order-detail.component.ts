import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal'
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms'
import { ApiService } from 'src/app/services/api.service'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { DataService } from './data.service'
import { ActivatedRoute } from '@angular/router'
import { ConstantsService } from 'src/app/services/constants.service'
import { Component, ElementRef, OnInit } from '@angular/core'
import * as _ from 'lodash'

@Component({
    selector: 'app-client-order-detail',
    templateUrl: './client-order-detail.component.html',
    styleUrls: ['./client-order-detail.component.scss']
})
export class ClientOrderDetailComponent implements OnInit {
    activeTab = 'order-summary'
    spinnerSVG = `/assets/images/rolling-main.svg`
    dataStatus = 'fetching'
    orderId: any
    orderData: any
    totalOrder: any
    totalAmount: any
    shipmentData: any
    countriesList: any

    contactDataForm: FormGroup
    contactModalRef: BsModalRef
    emailLoading = false
    addressDataForm: FormGroup
    addressModalRef: BsModalRef
    shippingLoading = false

    tagList: any = []
    tagStatus = 'fetching'
    tagModalRef: BsModalRef
    tagLoading = false
    searchTagString: any
    selectedTagLoading = false
    modalTagList: Array<any> = []

    constructor(
        public cs: ConstantsService,
        private route: ActivatedRoute,
        private ds: DataService,
        private alert: IAlertService,
        public api: ApiService,
        private fb: FormBuilder,
        public ms: BsModalService,
        public ui: UIHelpers
    ) {
        this.orderId = this.route.snapshot.queryParamMap.get('id')

        this.contactDataForm = this.fb.group({
            id: new FormControl(null),
            email: new FormControl(null, [Validators.required, Validators.email]),
            phone: new FormControl(null)
        })
        this.addressDataForm = this.fb.group({
            id: new FormControl(null),
            country: new FormControl(null),
            full_name: new FormControl(null),
            last_name: new FormControl(null),
            company: new FormControl(null),
            shipping_address: new FormControl(null, [Validators.required]),
            address2: new FormControl(null),
            city_name: new FormControl(null),
            postal_code: new FormControl(null),
            phone: new FormControl(null)
        })

        const params = {
            id: this.orderId
        }
        this.ds.orderDetail(params).subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)

                return false
            } else {
                this.orderData = resp.data.order_detail
                this.totalOrder = resp.data.total_user_order
                this.totalAmount = (+resp.data.order_detail.total_items_amount) + (+resp.data.order_detail.delivery_charges) + (+resp.data.order_detail.tax_amount)
                this.shipmentData = resp.data.order_detail.shipment
                this.dataStatus = 'done'
            }
        })
        this.ds.countryList().subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)

                return false
            } else {
                this.countriesList = resp.data
            }
        })
        this.ds.tagList({ order_id: this.orderId }).subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)

                return false
            } else {
                this.tagList = resp.data
                this.tagStatus = 'done'
            }
        })
    }

    get g() {
        return this.contactDataForm.controls
    }
    get h() {
        return this.addressDataForm.controls
    }

    ngOnInit() { }

    copyToClipboard(str: any) {
        const selBox = document.createElement('textarea')
        selBox.style.position = 'fixed'
        selBox.style.left = '0'
        selBox.style.top = '0'
        selBox.style.opacity = '0'
        if (str === 'email') {
            selBox.value = this.orderData.shipment != null ? this.orderData.shipment.email : ' '
        } else if (str === 'shippingAddress') {
            selBox.value = this.orderData.shipment != null ? this.orderData.shipment.shipping_address : ' '
        }
        document.body.appendChild(selBox)
        selBox.focus()
        selBox.select()
        document.execCommand('copy')
        document.body.removeChild(selBox)
        if (str === 'email') {
            this.alert.success('Email is copied!!')
        } else if (str === 'shippingAddress') {
            this.alert.success('Shipping address is copied!!')
        }
    }

    openContactModal(formModal) {
        this.contactDataForm.controls.id.setValue(this.orderData.shipment.id)
        this.contactDataForm.controls.email.setValue(this.orderData.shipment.email)
        this.contactDataForm.controls.phone.setValue(this.orderData.shipment.phone)
        this.contactModalRef = this.ms.show(
            formModal,
            {
                class: 'modal-md modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
    }
    cancelButtonContact(f: any) {
        f.resetForm()
        this.contactModalRef.hide()
    }
    saveContactInformation(f: any) {
        this.emailLoading = true
        if (this.contactDataForm.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.emailLoading = false

            return false
        }
        const params = {
            id: this.contactDataForm.value.id,
            email: this.contactDataForm.value.email,
            phone: this.contactDataForm.value.phone
        }
        this.ds.updateEmail(params).subscribe((resp: any) => {
            this.emailLoading = false
            if (resp.success === true) {
                this.orderData.shipment.email = params.email
                this.orderData.shipment.phone = params.phone
                this.alert.success('Email change successfully!!')
                this.contactDataForm.controls.id.setValue(null)
            } else {
                this.alert.error(resp.errors.general)
                this.emailLoading = false

                return false
            }
            this.contactModalRef.hide()
            f.resetForm()
        })
    }

    openAddressModal(formModal) {
        // this.addressDataForm.controls.id.setValue(this.orderData.shipment.id)
        // this.addressDataForm.controls.shipping_address.setValue(this.orderData.shipment.shipping_address)
        // this.addressDataForm.controls.phone.setValue(this.orderData.shipment.phone)
        this.addressDataForm.patchValue(this.orderData.shipment)
        this.addressModalRef = this.ms.show(
            formModal,
            {
                class: 'modal-md modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
    }
    cancelButtonAddress(fa: any) {
        fa.resetForm()
        this.addressModalRef.hide()
    }
    saveShippingAddress(fa: any) {
        this.shippingLoading = true
        if (this.addressDataForm.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.shippingLoading = false

            return false
        }
        const params = {
            id: this.addressDataForm.value.id,
            shipping_address: this.addressDataForm.value.shipping_address,
            address2: this.addressDataForm.value.address2,
            phone: this.addressDataForm.value.phone,
            country: this.addressDataForm.value.country,
            full_name: this.addressDataForm.value.full_name,
            last_name: this.addressDataForm.value.last_name,
            company: this.addressDataForm.value.company,
            city_name: this.addressDataForm.value.city_name,
            postal_code: this.addressDataForm.value.postal_code
        }
        this.ds.updateShippingAddress(params).subscribe((resp: any) => {
            this.shippingLoading = false
            if (resp.success === true) {
                // this.orderData.shipment.shipping_address = params.shipping_address
                // this.orderData.shipment.address2 = params.address2
                // this.orderData.shipment.phone = params.phone
                // this.orderData.shipment.country = params.country
                // this.orderData.shipment.full_name = params.full_name
                // this.orderData.shipment.last_name = params.last_name
                // this.orderData.shipment.company = params.company
                // this.orderData.shipment.city_name = params.city_name
                // this.orderData.shipment.postal_code = params.postal_code
                for (const key in this.orderData.shipment) {
                    if (this.orderData.shipment.hasOwnProperty(key) === params.hasOwnProperty(key)) {
                        this.orderData.shipment[key] = params[key]
                    }
                }
                // Object.assign(this.orderData.shipment, params)

                this.alert.success('Shipping address change successfully!!')
                this.addressDataForm.controls.id.setValue(null)
            } else {
                this.alert.error(resp.errors.general)
                this.shippingLoading = false

                return false
            }
            this.addressModalRef.hide()
            fa.resetForm()
        })
    }

    saveTag(event: any) {
        this.tagLoading = true
        const params = {
            id: null,
            order_id: this.orderId,
            title: event.target.value
        }
        this.ds.saveTag(params).subscribe((resp: any) => {
            this.tagLoading = false
            if (resp.success === true) {
                params.id = resp.data.id
                params['selected'] = 1
                this.alert.success('Added successfully!!')
                this.tagList.unshift(params)
            } else {
                this.alert.error(resp.errors.general)
                this.tagLoading = false

                return false
            }
        })
    }
    deleteTag(tagId: any) {
        this.tagLoading = true
        const params = {
            id: tagId
        }
        this.ds.deleteTag(params).subscribe((resp: any) => {
            this.tagLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.tagLoading = false

                return false
            } else {
                const deletingIndex = this.tagList.findIndex((d: any) => {
                    return d.id === tagId
                })
                this.tagList.splice(deletingIndex, 1)
                this.alert.success('Deleted successfully!!')
            }
        })
    }
    openTagModal(formModal) {
        this.modalTagList = _.cloneDeep(this.tagList)

        if (this.tagList.length == 0) {
            this.alert.error('Please add atleast one tag.')

            return false
        }

        this.tagModalRef = this.ms.show(
            formModal,
            {
                class: 'modal-md modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
    }
    cancelTagButton() {
        this.modalTagList = []
        this.tagModalRef.hide()
    }
    saveSelectedTag() {
        this.selectedTagLoading = true
        const params = {
            order_id: this.orderId,
            tag_ids: []
        }
        this.modalTagList.forEach(e => {
            if (e.selected == 1) {
                params.tag_ids.push(e.id)
            }
        })

        if (params.tag_ids.length == 0) {
            this.alert.error('Please select atleast one tag.')
            this.selectedTagLoading = false

            return false
        }

        this.ds.updateTag(params).subscribe((resp: any) => {
            this.selectedTagLoading = false
            if (resp.success === true) {
                this.tagList = resp.data
                this.alert.success('Updated successfully!!')
            } else {
                this.alert.error(resp.errors.general)
                this.selectedTagLoading = false

                return false
            }
            this.tagModalRef.hide()
            this.modalTagList = []
        })
    }
    selectTags(id: any) {
        let sInd = this.modalTagList.findIndex(e => e.id == id)

        if (sInd > -1) {
            if (this.modalTagList[sInd].selected == 1) {
                this.modalTagList[sInd].selected = 0
            } else {
                this.modalTagList[sInd].selected = 1
            }
        }
    }
    checkTags(tagID: any) {
        if (this.modalTagList.length > 0) {
            let zInd = this.modalTagList.findIndex(x => x.id === tagID)
            if (zInd > -1) {
                if (this.modalTagList[zInd].selected == 1) {
                    return true
                }
            } else {
                return false
            }
        }
    }
}
