import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { ApiService } from 'src/app/services/api.service'
import { DataService } from '../data.service'

@Component({
    selector: 'app-permissions',
    templateUrl: './permissions.component.html',
    styleUrls: ['./permissions.component.css'],
})
export class PermissionsComponent implements OnInit {
    selectedUsers = []
    unselectedUser = []
    storeId = -1
    pIndex = -1
    innerIndex = -1
    employeeDetails: any
    modalRef: BsModalRef
    dataForm: FormGroup
    selectedEmployeeList = []
    permissonUsers: any = []
    permissionsList = []
    selectedPermissions = []
    allStoreUserPermissions = []
    pId
    deleteParams
    selectedIndex
    modalPagination: any = []
    employeeList: any = []
    modalDataStatus = 'fetching'
    page = 1
    modalPage = 1
    dataStatus = 'fetching'
    loginLoading = false
    searchString: any
    searchKeyword = ''
    searchKeyword$: Subject<string> = new Subject<string>()
    modalSearchKeyword = ''
    modalSearchKeyword$: Subject<string> = new Subject<string>()
    searchKeywordSub: any
    modalSearchKeywordSub: any
    Loading = false
    loaderOptions = {
        rows: 5,
        cols: 4,
        colSpans: {
            0: 1,
        }
    }
    modalFilters = {
        perPage: 5,
        supplierId: 0,
    }

    dataToSend = {
        user_id: -1,
        permissionIds: [],
    }
    constructor(
        private ds: DataService,
        public ms: BsModalService,
        private fb: FormBuilder,
        public ui: UIHelpers,
        private alert: IAlertService,
        private route: ActivatedRoute,
        public router: Router,
        public api: ApiService
    ) {
        //this.ds.step = 'permission-details'
        this.route.queryParams.subscribe((params) => {
            if (params.id) {
                this.storeId = params.id
                this.dataToSend.user_id = +this.storeId
            }
        })

        this.ds.getPermissionsList({ store_id: this.storeId }).subscribe((resp: any) => {
            console.log(resp)

            if (resp.success === true) {
                this.permissionsList = resp.data
                this.dataStatus = 'done'

            }
        })

        // Modal Search
        this.modalSearchKeywordSub = this.modalSearchKeyword$
            .pipe(
                debounceTime(1000), // wait 1 sec after the last event before emitting last event
                distinctUntilChanged() // only emit if value is different from previous value
            )
            .subscribe((searchKeyword) => {
                this.modalPage = 1
                this.getModalList()
            })

        this.getModalList()
    }

    ngOnInit() { }



    modalSearchKeywordChange(value: string) {
        this.modalSearchKeyword$.next(value)
    }

    modalSelectPerPage(e: any) {
        this.modalFilters.perPage = e.target.value
        this.modalPage = 1
        this.getModalList()
    }

    setModalPagination(page: number) {
        this.modalPage = page
        this.getModalList()
    }

    getModalList() {
        const param = {
            page: this.modalPage,
            per_page: this.modalFilters.perPage,
            keyword: this.modalSearchKeyword,
        }
        this.ds.employeeList(param).subscribe((resp) => {
            if (resp.success === true) {
                this.employeeList = resp.data.data
                this.modalPagination = resp.data
            }
        })
    }

    addEmployee(eModal, pId, pIndex) {
        this.selectedUsers = []
        this.unselectedUser = []
        this.pIndex = pIndex
        this.pId = pId
        const params = {
            permission_id: this.pId,
            store_id: this.storeId
        }

        this.ds.permissionUser(params).subscribe(resp => {
            if (resp.success == true)
                this.permissonUsers = resp.data

            this.selectedEmployeeList = resp.data

            this.modalDataStatus = 'done'

            //this.getModalList()
        })

        this.selectedEmployeeList = []
        this.modalRef = this.ms.show(eModal, {
            class: 'modal-lg modal-dialog-centered admin-panel',
            backdrop: 'static',
            ignoreBackdropClick: true,
            keyboard: false,
        })
    }

    checkPermission(uId) {

        const findInd = this.permissonUsers.findIndex(e => e == uId)
        if (findInd > -1) {
            return true
        }

    }
    selectEmployee(uId, i, user) {
        const findUserIndex = this.selectedEmployeeList.findIndex(e => e == uId)
        if (findUserIndex < 0) {
            this.selectedEmployeeList.push(uId)
            const permission = {
                id: -1,
                store_id: this.storeId,
                permission_id: this.pId,
                user_id: uId,
                user: user,
            }
            this.selectedUsers.push(permission)

            const checkIndex = this.unselectedUser.findIndex(c => c == uId)
            console.log("pre", this.unselectedUser)

            if (checkIndex > -1) {
                this.unselectedUser.splice(checkIndex, 1)
                console.log('after', this.unselectedUser)

            }


        } else {
            this.selectedEmployeeList.splice(findUserIndex, 1)
            const checkIndex = this.unselectedUser.findIndex(c => c == uId)
            console.log("pre", this.unselectedUser)

            if (checkIndex < 0) {
                this.unselectedUser.push(uId)
                console.log('after', this.unselectedUser)

            }
            const uIndex = this.selectedUsers.findIndex(u => u.id == user.id)
            if (uIndex > -1) {
                this.selectedUsers.splice(uIndex, 1)

            }
        }

    }

    save() {
        this.Loading = true
        const params = {
            userIds: this.selectedEmployeeList,
            store_id: +this.storeId,
            permission_id: this.pId
        }


        this.ds.save(params).subscribe(resp => {
            if (resp.success == true) {
                this.alert.success('Added permisssion successfully!!')
                console.log(this.selectedUsers)
                this.selectedUsers.forEach(r => {
                    this.permissionsList[this.pIndex].user_store_permissions.push(r)
                })

                // this.selectedEmployeeList.forEach(d=>{
                //     const indexfind = this.permissionsList[this.pIndex].user_store_permissions.findIndex(d)
                // })
                console.log('listbef', this.permissionsList[this.pIndex].user_store_permissions)

                this.unselectedUser.forEach(u => {
                    const removeIndex = this.permissionsList[this.pIndex].user_store_permissions.findIndex(n => n.user_id == u)
                    console.log('removeINdex', removeIndex)

                    this.permissionsList[this.pIndex].user_store_permissions.splice(removeIndex, 1)
                })

                console.log(this.permissionsList)
                console.log('listafter', this.permissionsList[this.pIndex].user_store_permissions)

            } else {
                this.alert.error(resp.errors.general)

            }
            this.Loading = false
            this.modalRef.hide()
        })

    }

    confirmingModal(template, user: any, rowIndex, uIndex) {
        this.deleteParams = {
            user_id: user.user_id,
            permission_id: user.permission_id,
            store_id: this.storeId,
        }

        this.selectedIndex = rowIndex
        this.innerIndex = uIndex
        this.modalRef = this.ms.show(template, { class: 'modal-sm admin-panel' })
    }

    deleteUserPermission() {
        this.loginLoading = true
        this.ds.deleteUserPermission(this.deleteParams).subscribe(resp => {

            if (resp.success == true) {
                this.alert.success('Delete user against this permission successfully!!')
                this.permissionsList[this.selectedIndex].user_store_permissions.splice(this.innerIndex, 1)
            } else {
                this.alert.error(resp.errors.general)
            }
            this.loginLoading = false
            this.modalRef.hide()
        })
    }
}
