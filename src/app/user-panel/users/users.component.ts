import { ConstantsService } from 'src/app/services/constants.service'
import { ApiService } from 'src/app/services/api.service'
import { UIHelpers } from '../../helpers/ui-helpers'
import { Component, OnInit, TemplateRef } from '@angular/core'
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms'
import { BsModalRef } from 'ngx-bootstrap/modal'
import { BsModalService } from 'ngx-bootstrap/modal'
import { DataService } from './data.service'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { Router, ActivatedRoute } from '@angular/router'
@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
    dataStatus = 'fetching'
    planList = []
    planForm: FormGroup
    selectedIndex: any
    modalRef: BsModalRef
    selectedId: any
    page = 1
    pagination: any
    name: any = ''
    user: any
    sAdminId: any
    loaderOptions = {
        rows: 5,
        cols: 6,
        colSpans: {
            0: 1,
        }
    }
    waiting = {
        search: false,
        save: false,
        userStatus: []
    }
    constructor(
        private ds: DataService,
        private fb: FormBuilder,
        public ui: UIHelpers,
        private alert: IAlertService,
        public router: Router,
        private route: ActivatedRoute,
        private ms: BsModalService,
        private api: ApiService,
        private superAdminId: ConstantsService
    ) {
        this.user = this.api.user
        this.sAdminId = this.superAdminId.superAdminId
        this.route.queryParams.subscribe(params => {
            if (params.page) {
                this.page = params.page
            }
            if (params.name) {
                this.name = params.name
            }
            if (params) {
                this.search()
            }
        })
        this.planForm = this.fb.group({
            id: new FormControl(null),
            status: new FormControl(null),
            first_name: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
            last_name: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
            email: new FormControl(null, [Validators.required, Validators.email]),
            user_type: new FormControl(null, [Validators.required]),
            contact_1: new FormControl(null, [Validators.required, Validators.maxLength(15)]),
            contact_2: new FormControl(null, [Validators.maxLength(15)]),
            address: new FormControl(null, [Validators.maxLength(255)]),
        })
    }

    setPagination(page: number) {
        let filtersParam: any = {}

        filtersParam = {
            name: this.name,
            page,
        }
        this.router.navigate(['/user/users'], { queryParams: filtersParam, replaceUrl: true })
    }

    search(): void {
        this.waiting.userStatus = []
        this.waiting.search = true
        const params = {
            page: this.page,
            name: this.name,
        }
        this.ds.getList(params).subscribe((resp: any) => {
            this.waiting.search = false
            if (resp.success === true) {
                this.planList = resp.data.data
                this.planList.forEach(element => {
                    this.waiting.userStatus.push(false)
                })
                this.pagination = resp.data
                this.dataStatus = 'done'
                this.router.navigate(['/user/users'], { queryParams: params, replaceUrl: true })
            }
        })

    }

    ngOnInit() {
        // this.ds.getList().subscribe((resp: any) => {
        //     if (resp.success === true) {
        //         this.planList = resp.data
        //         this.dataStatus = 'done'
        //     }
        // })
    }

    get g() {
        return this.planForm.controls
    }

    openModal(modal, index) {
        this.selectedIndex = index
        if (index > -1) {
            const userType = this.planList[index].user_type
            this.planForm.patchValue(this.planList[index][userType])
            this.planForm.patchValue(this.planList[index])
        }
        this.modalRef = this.ms.show(
            modal,
            {
                class: 'modal-md modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
    }

    save(data: any, f: any) {
        this.waiting.save = true
        if (data.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.waiting.save = false

            return false
        }


        let saveUpdate = this.ds.add(data.value)
        if (this.planForm.value.id !== null) {
            saveUpdate = this.ds.update(data.value)
        }
        saveUpdate.subscribe((resp: any) => {
            this.waiting.save = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.modalRef.hide()
                f.resetForm()


                return false
            } else {
                if (this.planForm.value.id !== null) {
                    this.alert.success('Changes done successfully!!')
                    this.planList[this.selectedIndex] = data.value
                    this.planList[this.selectedIndex].status = data.value.status
                    this.planList[this.selectedIndex][data.value.user_type] = data.value
                    this.planForm.controls.id.setValue(null)
                } else {
                    data.value.id = resp.data.id
                    data.value.status = resp.data.status
                    const dataValue = data.value
                    dataValue[data.value.user_type] = data.value
                    this.alert.success('User added successfully!!')
                    this.planList.push(dataValue)
                }
            }
            this.modalRef.hide()
            f.resetForm()
        })
    }

    delete() {
        this.waiting.save = true
        const params = {
            id: this.selectedId
        }
        this.ds.delete(params)
            .subscribe((resp: any) => {
                this.waiting.save = false
                if (resp.success === false) {
                    this.alert.error(resp.errors.general)
                    this.modalRef.hide()

                    return false
                } else {
                    const deletingIndex = this.planList.findIndex((d: any) => {
                        return d.id === this.selectedId
                    })
                    this.planList.splice(deletingIndex, 1)
                    this.modalRef.hide()
                    this.alert.success('User deleted successfully!!')
                }
            })
    }

    activeUser(id, index) {
        this.waiting.userStatus[index] = true
        this.selectedId = id
        this.selectedIndex = index
        const param = { id: this.selectedId }
        this.ds.activeUser(param).subscribe((resp: any) => {
            this.waiting.userStatus[index] = false
            if (resp.success === true) {
                this.alert.success('User active successfully!!')
                this.planList[this.selectedIndex].status = 'active'
            } else {
                this.alert.error('Some error!!')
            }

        })
    }
    inactiveUser(id, index) {
        this.waiting.userStatus[index] = true
        this.selectedId = id
        this.selectedIndex = index
        const param = { id: this.selectedId }
        this.ds.inactiveUser(param).subscribe((resp: any) => {
            this.waiting.userStatus[index] = false
            if (resp.success === true) {
                this.alert.success('User deactive successfully!!')
                this.planList[this.selectedIndex].status = 'inactive'
            } else {
                this.alert.error('Some error!!')
            }

        })
    }

    confirmingModal(template: TemplateRef<any>, id: any, i: any) {
        this.selectedId = id
        this.selectedIndex = i
        this.modalRef = this.ms.show(template, { class: 'modal-sm admin-panel' })
    }

    cancelRegionButton(f: any) {
        f.resetForm()
        this.modalRef.hide()
    }

}
