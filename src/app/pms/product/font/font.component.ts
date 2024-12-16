import { element } from 'protractor'
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
    baseProductFontList: any = []
    selectedBaseProductFontIds: any = []

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
        this.ds.baseProductId = this.route.snapshot.queryParamMap.get('base_id')

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

        if (this.ds.baseProductId > -1) {
            const param = { id: this.ds.baseProductId }
            this.ds.baseProductFontList(param).subscribe((resp: any) => {
                if (resp.success === false) {
                    this.alert.error(resp.errors.general)

                    return false
                } else {
                    this.baseProductFontList = resp.data
                }
            })
        }
    }

    getProductFontList() {
        this.dataStatus = 'fetching'
        const params = {
            id: this.ds.productId
        }
        if (this.ds.productId == -1) {
            this.dataStatus = 'done'

            return false
        } else {
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

    selectedBaseProductFont(bFontId: any, i: any) {
        const fontId = this.baseProductFontList[i].font_id
        const index = this.selectedBaseProductFontIds.findIndex(e => e == fontId)
        if (index > -1) {
            this.selectedBaseProductFontIds.splice(index, 1)
            this.fontProp = false
        } else {
            this.selectedBaseProductFontIds.push(fontId)
            this.fontProp = true
        }
    }

    confirmingModal(template: TemplateRef<any>, id: any, i: any) {
        this.selectedId = id
        this.selectedIndex = i
        this.modalRef = this.modalService.show(template, { class: 'modal-sm admin-panel' })
    }

    openModal(formModal) {
        this.modalTitle = 'Select Font'

        this.selectedFontIds = []
        this.productFontList.forEach(element => {
            this.selectedFontIds.push(element.font_id)
        })
        this.modalRef = this.modalService.show(
            formModal,
            {
                class: 'modal-lg modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
    }

    openBaseProductModal(formModal) {
        // this.selectedBaseProductFontIds = []
        // this.baseProductFontList.forEach(element => {
        //     this.selectedBaseProductFontIds.push(element.font_id)
        // })

        this.modalRef = this.modalService.show(
            formModal,
            {
                class: 'modal-lg modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
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

    save() {
        this.Loading = true
        const params = {
            product_id: +this.ds.productId,
            font_ids: this.selectedFontIds
        }
        this.ds.productFontAdd(params).subscribe((resp: any) => {
            this.Loading = false
            if (resp.success === true) {
                this.productFontList = resp.data
            } else {
                this.alert.error(resp.errors.general)
                this.Loading = false
            }
            this.modalRef.hide()
        })
    }

    saveBaseProductFont() {
        this.Loading = true
        const params = {
            product_id: +this.ds.productId,
            font_ids: this.selectedBaseProductFontIds
        }
        this.ds.productFontAdd(params).subscribe((resp: any) => {
            this.Loading = false
            if (resp.success === true) {
                this.productFontList = resp.data
            } else {
                this.alert.error(resp.errors.general)
                this.Loading = false
            }
            this.modalRef.hide()
        })
    }

    delete() {
        this.Loading = true
        const params = {
            id: this.selectedId
        }
        this.ds.productFontDelete(params).subscribe((resp: any) => {
            this.Loading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.modalRef.hide()
                this.Loading = false

                return false
            } else {
                const deletingIndex = this.productFontList.findIndex((d: any) => {
                    return d.id === this.selectedId
                })
                this.productFontList.splice(deletingIndex, 1)
                this.modalRef.hide()
                this.alert.success('Deleted successfully!!')
                this.selectedIndex = -1
            }
        })
    }
}
