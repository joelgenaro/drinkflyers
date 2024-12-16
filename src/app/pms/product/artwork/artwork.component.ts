import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { ActivatedRoute } from '@angular/router'
import { DataService } from './../data.service'
import { ChangeDetectorRef, Component, OnInit } from '@angular/core'
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms'
import { ApiService } from 'src/app/services/api.service'
import { combineLatest, Subscription } from 'rxjs'

@Component({
    selector: 'app-artwork',
    templateUrl: './artwork.component.html',
    styleUrls: ['./artwork.component.css'],
})
export class ArtworkComponent implements OnInit {
    Loading = false
    loadingInner = false
    modalTitle: any = ''
    modalRef: BsModalRef
    dataForm: FormGroup
    artworkCategoryList: any = []
    artworkList: any = []
    artworkStatus: any = 'fetching'
    productArtworkList: any = []
    selectedArtworkIds: any = []
    spinnerSVG = `/assets/images/rolling-main.svg`
    // modalSubscription: any
    subscriptions: Subscription[] = []
    messages: any
    baseProduct = false
    baseProductartworkList: any = []
    selectedBaseProductArtworkIds: any = []
    artworkLoading: boolean = false

    constructor(
        public ds: DataService,
        private route: ActivatedRoute,
        public modalService: BsModalService,
        private fb: FormBuilder,
        public ui: UIHelpers,
        private alert: IAlertService,
        public api: ApiService,
        private changeDetection: ChangeDetectorRef
    ) {
        ds.activeTab = 'artwork'
        this.ds.productId = this.route.snapshot.queryParamMap.get('id')
        this.ds.baseProductId =
            this.route.snapshot.queryParamMap.get('base_id')

        this.dataForm = this.fb.group({
            artwork_cat: new FormControl(null, [Validators.required]),
        })
        this.getPRoductArtworkList()
    }

    ngOnInit() {
        this.ds.artworkCategoryList().subscribe((resp: any) => {
            if (resp.success === true) {
                this.artworkCategoryList = resp.data
            } else {
                this.alert.error(resp.errors.general)
            }
        })

        if (this.ds.baseProductId > -1) {
            const params = { id: this.ds.baseProductId }
            this.ds.baseProductArtworkList(params).subscribe((resp: any) => {
                if (resp.success === false) {
                    this.alert.error(resp.errors.general)

                    return false
                } else {
                    this.baseProductartworkList = resp.data
                }
            })
        }
    }

    get g() {
        return this.dataForm.controls
    }

    getPRoductArtworkList() {
        this.artworkLoading = true
        const params = {
            id: this.ds.productId,
        }
        if (this.ds.productId == -1) {
            this.artworkLoading = false
            return false
        } else {
            this.ds.productArtworkList(params).subscribe((resp: any) => {
                if (resp.success === true) {
                    this.productArtworkList = resp.data
                    this.artworkLoading = false
                } else {
                    this.alert.error(resp.errors.general)
                    this.artworkLoading = false
                }
            })
        }
    }

    selectCategory(e: any) {
        const params = {
            cat_id: e.target.value,
            product_id: this.ds.productId,
        }
        this.ds.artworkList(params).subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)

                return false
            } else {
                this.artworkList = resp.data
                this.artworkStatus = 'done'
            }
        })
    }

    selectedProductArtwork(artId: any, i: any) {
        this.selectedArtworkIds.push(artId)

        const deletingIndex = this.artworkList.findIndex((d: any) => {
            return d.id === artId
        })
        this.artworkList.splice(deletingIndex, 1)
    }

    selectedBaseProductArtwork(baseArtId: any, j: any) {
        this.selectedBaseProductArtworkIds.push(baseArtId)

        const deletingIndex = this.baseProductartworkList.findIndex(
            (d: any) => {
                return d.id === baseArtId
            }
        )
        this.baseProductartworkList.splice(deletingIndex, 1)
    }

    openModal(formModal) {
        this.modalTitle = 'Select Artwork'

        this.modalRef = this.modalService.show(formModal, {
            class: 'modal-lg modal-dialog-centered admin-panel',
            backdrop: 'static',
            ignoreBackdropClick: true,
            keyboard: false,
        })
    }

    openBaseProductModal(formModal) {
        this.baseProduct = true
        this.modalRef = this.modalService.show(formModal, {
            class: 'modal-lg modal-dialog-centered admin-panel',
            backdrop: 'static',
            ignoreBackdropClick: true,
            keyboard: false,
        })
    }

    unsubscribe() {
        this.subscriptions.forEach((subscription: Subscription) => {
            subscription.unsubscribe()
        })
        this.subscriptions = []
    }

    cancelButton(f: any) {
        f.resetForm()
        this.modalRef.hide()
        this.artworkList = []
    }

    save(data: any, f: any) {
        this.loadingInner = true
        if (this.dataForm.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in field & try again.')
            this.loadingInner = false

            return false
        }

        const params = {
            product_id: +this.ds.productId,
            artwork_ids: this.selectedArtworkIds,
        }
        this.ds.productArtworkAdd(params).subscribe((resp: any) => {
            this.loadingInner = false
            if (resp.success === true) {
                this.productArtworkList = resp.data
                this.alert.success('Artwork added successfully!!')
                this.artworkList = []
            } else {
                this.alert.error(resp.errors.general)
                this.loadingInner = false
            }
            this.modalRef.hide()
            f.resetForm()
        })
    }
    saveBaseProduct() {
        console.log('this.baseProduct', this.baseProduct)
        console.log(
            'this.selectedBaseProductArtworkIds',
            this.selectedBaseProductArtworkIds
        )
        this.loadingInner = true

        const params = {
            product_id: +this.ds.productId,
            artwork_ids: this.selectedBaseProductArtworkIds,
        }
        this.ds.productArtworkAdd(params).subscribe((resp: any) => {
            this.loadingInner = false
            if (resp.success === true) {
                this.productArtworkList = resp.data
                this.alert.success('Artwork added successfully!!')
            } else {
                this.alert.error(resp.errors.general)
                this.loadingInner = false
            }
            this.modalRef.hide()
        })
    }
}
