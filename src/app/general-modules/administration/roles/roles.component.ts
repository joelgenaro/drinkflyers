import { ApiService } from 'src/app/services/api.service'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { DataService } from './data.service'
import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'

@Component({
    selector: 'app-roles',
    templateUrl: './roles.component.html',
    styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit, OnDestroy {
    readablePermissionsList = []
    permissionsList = []
    rolesList = []
    dataStatus = false
    dataForm: FormGroup
    selectedIndex = -1
    modalRef: BsModalRef
    selectedId: any
    searchString = ''
    selectedPermissions = []
    loginLoading = false
    isChecked = false
    pagination: any = []
    page = 1
    searchKeyword: string = ''
    searchKeyword$: Subject<string> = new Subject<string>()
    searchKeywordSub: any
    loaderOptions = {
        rows: 5,
        cols: 3,
        colSpans: {
            0: 1,
        }
    }
    filters = {
        orderBy: '',
        order: '',
        perPage: 15
    }
    breadCrum = [
        {
            link: '',
            value: 'Roles'
        }
    ]

    constructor(
        private ds: DataService,
        private fb: FormBuilder,
        public ui: UIHelpers,
        private alert: IAlertService,
        public ms: BsModalService,
        public api: ApiService,
        private router: Router,
        public route: ActivatedRoute
    ) {
        this.dataForm = this.fb.group({
            id: new FormControl(null),
            name: new FormControl(null, [Validators.required]),
        })

        this.route.queryParams.subscribe(params => {
            if (params.page) {
                this.page = params.page
            }
            if (params.keyword) {
                this.searchKeyword = params.keyword
            }
            if (params.order_by) {
                this.filters.orderBy = params.order_by
            }
            if (params.order) {
                this.filters.order = params.order
            }
            if (params.per_page) {
                this.filters.perPage = params.per_page
            }
            if (params) {
                this.getRoleList()
            }
        })

        this.searchKeywordSub = this.searchKeyword$.pipe(
            debounceTime(1000), // wait 1 sec after the last event before emitting last event
            distinctUntilChanged(), // only emit if value is different from previous value
        ).subscribe(searchKeyword => {
            this.page = 1
            this.getRoleList()
        })
    }
    ngOnDestroy(): void {
        this.searchKeywordSub.unsubscribe()
    }

    ngOnInit() {
    }

    checkIfPermissionExist(data: any) {
        // const index = this.employeeDetails.user_permissions.findIndex(d => d.permission_id == data.id)
        // if (index > -1) {
        //     return true
        // } else {
        //     return false
        // }
    }
    addRemovePermission(d: any) {
        const index = this.permissionsList.findIndex(data => data.id === d.id)
        const indexSelectedPermissions = this.selectedPermissions.findIndex(data => data.id === d.id)
        if (index > -1) {
            this.selectedPermissions.push(this.permissionsList[index])
            this.permissionsList.splice(index, 1)
        }
        if (indexSelectedPermissions > -1) {
            this.permissionsList.push(this.selectedPermissions[indexSelectedPermissions])
            this.selectedPermissions.splice(indexSelectedPermissions, 1)

        }
    }
    get g() {
        return this.dataForm.controls
    }

    getArrowClass(fieldName, order) {
        const className = 'arrow ' + order
        if (this.filters.orderBy === fieldName && this.filters.order === order) {

            return className + ' active'
        }
        return className
    }

    doSort(e: any, order) {
        this.filters.orderBy = e.target.value
        this.filters.order = order

        this.getRoleList()
    }

    selectPerPage(e: any) {
        this.filters.perPage = e.target.value
        this.page = 1

        this.getRoleList()
    }

    getRoleList() {
        const params = {
            page: this.page,
            keyword: this.searchKeyword,
            order_by: this.filters.orderBy,
            order: this.filters.order,
            per_page: this.filters.perPage
        }

        const list = this.ds.getPermissionsList()
        list.subscribe((resp: any) => {
            if (resp.success === true) {
                this.permissionsList = resp.data
                this.readablePermissionsList = resp.data
            }
        })

        this.ds.rolesList(params).subscribe((resp: any) => {
            if (resp.success === true) {
                this.rolesList = resp.data.data
                this.pagination = resp.data
                this.dataStatus = true
            }
        })
    }

    setPagination(page: number) {
        let filtersParam: any = {}

        filtersParam = {
            page,
            keyword: this.searchKeyword,
            order_by: this.filters.orderBy,
            order: this.filters.order,
            per_page: this.filters.perPage
        }
        this.router.navigate(['/user/roles'], { queryParams: filtersParam, replaceUrl: true })
    }

    openModal(amenityModal, index) {
        this.selectedIndex = index
        if (index > -1) {
            this.dataForm.patchValue(this.rolesList[index])
            this.selectedPermissions = this.rolesList[index].permissions
            this.selectedPermissions.forEach((d: any) => {
                const indexPermissionList = this.permissionsList.findIndex(data => data.id == d.id)
                if (index > -1) {
                    this.permissionsList.splice(indexPermissionList, 1)
                }
            })
        }
        this.modalRef = this.ms.show(
            amenityModal,
            {
                class: 'modal-xl modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
    }

    save(data: any, f: any) {
        this.loginLoading = true
        if (data.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.loginLoading = false

            return false
        }
        if (this.selectedPermissions.length == 0) {
            this.alert.error('Please Select atleast one permission')
            this.loginLoading = false

            return false
        }
        data.value.permissionIds = []
        this.selectedPermissions.forEach((d: any) => {
            data.value.permissionIds.push(d.id)
        })
        let saveUpdate = this.ds.addRole(data.value)
        if (this.dataForm.value.id !== null) {
            saveUpdate = this.ds.updateRole(data.value)
            this.selectedId = -1
        }
        saveUpdate.subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.loginLoading = false

                return false
            } else {
                if (this.selectedIndex > -1) {
                    this.alert.success('Changes done successfully!!')
                    this.rolesList[this.selectedIndex] = resp.data
                } else {
                    this.alert.success('Added successfully!!')
                    this.rolesList.push(resp.data)
                }
            }
            this.permissionsList = [...this.readablePermissionsList]
            this.selectedPermissions = []
            if (!this.isChecked) {
                this.modalRef.hide()
            }
            f.resetForm()
        })
    }

    delete() {
        this.loginLoading = true
        const params = {
            id: this.selectedId
        }
        this.ds.deleteRole(params)
            .subscribe((resp: any) => {
                this.loginLoading = false
                if (resp.success === false) {
                    this.alert.error(resp.errors.general)
                    this.modalRef.hide()
                    this.loginLoading = false

                    return false
                } else {
                    this.rolesList.splice(this.selectedIndex, 1)
                    this.alert.success('Deleted successfully!!')
                    this.modalRef.hide()
                }
            })
    }

    confirmingModal(template: TemplateRef<any>, id: any, i: any) {
        this.selectedId = id
        this.selectedIndex = i
        this.modalRef = this.ms.show(template, { class: 'modal-sm admin-panel' })
    }

    cancelButton(f: any) {
        f.resetForm()
        this.modalRef.hide()
        this.permissionsList = [...this.readablePermissionsList]
        this.selectedPermissions = []
        this.searchString = ''
    }

    searchKeywordChange(value: string) {
        this.searchKeyword$.next(value)
    }

    getSerialNumber(i: number) {
        return ((this.pagination.current_page - 1) * this.pagination.per_page) + i + 1
    }
}
