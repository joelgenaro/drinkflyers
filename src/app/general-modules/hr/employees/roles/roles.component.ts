import { IAlertService } from './../../../../libs/ialert/ialerts.service'
import { UIHelpers } from './../../../../helpers/ui-helpers'
import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { DataService } from '../data.service'
import { ApiService } from '../../../../services/api.service'

@Component({
    selector: 'app-roles',
    templateUrl: './roles.component.html',
    styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {
    employeeId = -1
    employeeDetails: any
    rolesList = []
    selectedRoles = []
    searchString: any
    // dataForm: FormGroup
    searchSelectedString: any
    dataStatus = false
    loginLoading = false
    dataToSend = {
        user_id: -1,
        roleIds: []
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
        this.ds.step = 'roles'

        this.route.queryParams.subscribe(params => {
            if (params.id) {
                this.employeeId = params.id
                this.dataToSend.user_id = +this.employeeId
            }
        })
        this.ds.getRolesList().subscribe((resp: any) => {
            if (resp.success === true) {
                this.rolesList = resp.data
                this.ds.getEmployee({ id: this.employeeId }).subscribe((resp: any) => {
                    if (resp.success === true) {
                        this.employeeDetails = resp.data
                        //patch permissions to api,s variable
                        this.employeeDetails.user_roles.forEach(element => {
                            this.dataToSend.roleIds.push(element.role_id)
                            this.selectRoles(element.role)
                        })
                        this.dataStatus = true
                    }
                })
            }
        })
    }

    selectRoles(roles: any) {
        const index = this.rolesList.findIndex((p: any) => {
            return p.id == roles.id
        })

        // add to selected
        this.selectedRoles.push(
            this.rolesList[index]
        )
        // remove from all
        this.rolesList.splice(index, 1)
        // add to dataToSend
        if (!this.dataToSend.roleIds.includes(roles.id)) {
            this.dataToSend.roleIds.push(roles.id)
        }
    }

    unselectRoles(roles: any) {
        const index = this.selectedRoles.findIndex((p: any) => {
            return p.id === roles.id
        })
        // add to all
        this.rolesList.push(
            this.selectedRoles[index]
        )
        // remove from selected
        this.selectedRoles.splice(index, 1)
        // remove from dataToSend
        const i = this.dataToSend.roleIds.indexOf(roles.id)
        this.dataToSend.roleIds.splice(i, 1)
    }
    checkIfRoleExist(data: any) {
        const index = this.employeeDetails.user_roles.findIndex(d => d.role_id == data.id)
        if (index > -1) {
            return true
        } else {
            return false
        }
    }
    addRemoveIds(id: any) {
        const index = this.dataToSend.roleIds.findIndex(d => d == +id)
        if (index > -1) {
            this.dataToSend.roleIds.splice(index, 1)
        } else {
            this.dataToSend.roleIds.push(+id)
        }
    }
    assignRoles() {
        this.loginLoading = true
        this.ds.assignRoles(this.dataToSend).subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success == true) {
                this.alert.success('Roles assigned successfully!!')
                this.router.navigate(['/user/employees/list'])
            } else {
                this.alert.error(resp.errors.general)
            }
        })
    }
    ngOnInit() {
    }
    // save(data: any, form: any) {
    // }
}
