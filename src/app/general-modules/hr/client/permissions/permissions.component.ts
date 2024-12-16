import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
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
    employeeId = -1
    employeeDetails: any
    dataForm: FormGroup
    permissionsList = []
    selectedPermissions = []
    rolesList = []
    dataStatus = false
    loginLoading = false
    searchString: any
    searchSelectedString: any
    dataToSend = {
        user_id: -1,
        permissionIds: [],
    }
    constructor(
        private ds: DataService,
        private fb: FormBuilder,
        public ui: UIHelpers,
        private alert: IAlertService,
        private route: ActivatedRoute,
        public router: Router,
        public api: ApiService
    ) {
        this.ds.step = 'salery-details'
        this.route.queryParams.subscribe((params) => {
            if (params.id) {
                this.employeeId = params.id
                this.dataToSend.user_id = +this.employeeId
            }
        })

        this.ds.getPermissionsList().subscribe((resp: any) => {
            if (resp.success === true) {
                this.permissionsList = resp.data
                this.ds.getEmployee({ id: this.employeeId }).subscribe((resp: any) => {
                    if (resp.success === true) {
                        this.dataStatus = true
                        this.employeeDetails = resp.data
                        this.employeeDetails.user_permissions.forEach((element: any) => {
                            this.dataToSend.permissionIds.push(
                                element.permission_id

                            )
                            this.selectPermission(element.permission)
                        })
                    }
                })
            }
        })
    }

    selectPermission(permission: any) {
        const index = this.permissionsList.findIndex((p: any) => {
            return p.id === permission.id
        })
        // add to selected
        this.selectedPermissions.push(
            this.permissionsList[index]
        )
        // remove from all
        this.permissionsList.splice(index, 1)
        // add to dataToSend
        if (!this.dataToSend.permissionIds.includes(permission.id)) {
            this.dataToSend.permissionIds.push(permission.id)
        }


    }

    unselectPermission(permission: any) {
        const index = this.selectedPermissions.findIndex((p: any) => {
            return p.id === permission.id
        })
        // add to all
        this.permissionsList.push(
            this.selectedPermissions[index]
        )
        // remove from selected
        this.selectedPermissions.splice(index, 1)
        // remove from dataToSend
        const i = this.dataToSend.permissionIds.indexOf(permission.id)
        this.dataToSend.permissionIds.splice(i, 1)
    }

    assignPermissions() {
        this.loginLoading = true
        this.ds.assignPermissions(this.dataToSend).subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === true) {
                this.alert.success('Permissions assigned successfully!!')
                if (this.api.checkPermission('roles')) {
                    this.router.navigate(['/user/client/roles'], {
                        queryParams: { id: this.employeeId },
                        replaceUrl: true,
                    })
                }
            } else {
                this.alert.error(resp.errors.general)
            }
        })
    }

    ngOnInit() {
    }

    save(data: any, form: any) {
    }
}
