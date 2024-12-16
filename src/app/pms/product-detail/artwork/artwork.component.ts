import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { ActivatedRoute } from '@angular/router'
import { DataService } from './../data.service'
import { ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { ApiService } from 'src/app/services/api.service'
import { combineLatest, Subscription } from 'rxjs'

@Component({
    selector: 'app-artwork',
    templateUrl: './artwork.component.html',
    styleUrls: ['./artwork.component.css']
})
export class ArtworkComponent implements OnInit {
    Loading = false
    modalTitle: any = ''
    modalRef: BsModalRef
    dataForm: FormGroup
    artworkCategoryList: any = []
    artworkList: any = []
    productArtworkList: any = []
    selectedArtworkIds: any = []
    spinnerSVG = `/assets/images/rolling-main.svg`
    // modalSubscription: any
    subscriptions: Subscription[] = []
    messages: any
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

        this.dataForm = this.fb.group({
            artwork_cat: new FormControl(null, [Validators.required])
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
    }

    get g() {
        return this.dataForm.controls
    }

    getPRoductArtworkList() {
        this.artworkLoading = true
        const params = {
            id: this.ds.productId
        }
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

    selectCategory(e: any) {
        const params = {
            cat_id: e.target.value,
            product_id: this.ds.productId
        }
        this.ds.artworkList(params).subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)

                return false
            } else {
                this.artworkList = resp.data
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

    unsubscribe() {
        this.subscriptions.forEach((subscription: Subscription) => {
            subscription.unsubscribe()
        })
        this.subscriptions = []
    }

    cancelButton(f: any) {
        f.resetForm()
        this.modalRef.hide()
    }

}
