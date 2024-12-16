import { element } from 'protractor';
import { DataService } from './../data.service'
import { ChangeDetectorRef, Component, OnInit, TemplateRef } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { ApiService } from 'src/app/services/api.service'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { combineLatest, Subscription } from 'rxjs'

@Component({
    selector: 'app-font',
    templateUrl: './font.component.html',
    styleUrls: ['./font.component.css']
})
export class FontComponent implements OnInit {
    Loading = false
    LoadingNext = false
    modalTitle: any = ''
    modalRef: BsModalRef
    fontList: any = []
    productFontList: any = []
    selectedFontIds: any = []
    spinnerSVG = `/assets/images/rolling-main.svg`
    subscriptions: Subscription[] = []
    messages: any
    dataStatus = 'fetching'
    selectedId: any
    selectedIndex = -1
    fontProp = false

    constructor(
        public ds: DataService,
        private route: ActivatedRoute,
        public api: ApiService,
        public modalService: BsModalService,
        private fb: FormBuilder,
        public ui: UIHelpers,
        private alert: IAlertService,
        private changeDetection: ChangeDetectorRef
    ) {
        ds.activeTab = 'font'
        this.ds.productId = this.route.snapshot.queryParamMap.get('id')

        this.getProductFontList()
    }

    ngOnInit() {
        const params = {
            product_id: this.ds.productId
        }
        this.ds.fontList(params).subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)

                return false
            } else {
                this.fontList = resp.data
                this.dataStatus = 'done'
            }
        })
    }

    getProductFontList() {
        this.dataStatus = 'fetching'
        const params = {
            id: this.ds.productId
        }
        this.ds.productFontList(params).subscribe((resp: any) => {
            if (resp.success === true) {
                this.productFontList = resp.data

                this.dataStatus = 'done'
            } else {
                this.alert.error(resp.errors.general)
                this.dataStatus = 'done'
            }
        })
    }

    selectedProductFont(fontId: any, i: any) {
        const selected = this.fontList.find((element) => {
            if (element.id === fontId) {
                return true
            }
        })

        const tempId = this.selectedFontIds.indexOf(selected.id)
        if (tempId >= 0) {
            this.selectedFontIds.splice(tempId, 1)
        } else {
            this.selectedFontIds.push(selected.id)
        }
        this.fontProp = true
    }

    getVehicleCount(id) {
        const currentIndex = this.selectedFontIds.findIndex(x => x.vid == id)
        if (currentIndex == -1) {
            return 0
        } else {
            return this.selectedFontIds[currentIndex].count
        }
    }

    confirmingModal(template: TemplateRef<any>, id: any, i: any) {
        this.selectedId = id
        this.selectedIndex = i
        this.modalRef = this.modalService.show(template, { class: 'modal-sm admin-panel' })
    }

    unsubscribe() {
        this.subscriptions.forEach((subscription: Subscription) => {
            subscription.unsubscribe()
        })
        this.subscriptions = []
    }

    cancelButton() {
        this.modalRef.hide()
    }
}
