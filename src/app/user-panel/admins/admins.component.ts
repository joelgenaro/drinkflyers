import { Component, OnInit, TemplateRef } from '@angular/core'
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms'
import { BsModalRef } from 'ngx-bootstrap/modal'
import { BsModalService } from 'ngx-bootstrap/modal'
import { UIHelpers } from 'src/app/helpers/ui-helpers'
import { IAlertService } from 'src/app/libs/ialert/ialerts.service'
import { DataService } from './data.service'

@Component({
    selector: 'app-admins',
    templateUrl: './admins.component.html',
    styleUrls: ['./admins.component.css']
})
export class AdminsComponent implements OnInit {

    dataStatus = 'fetching'
    dataList = []
    dataForm: FormGroup
    selectedIndex = -1
    modalRef: BsModalRef
    selectedId: anyx
    constructor(
        private adminApi: DataService,
        private fb: FormBuilder,
        public ui: UIHelpers,
        private alert: IAlertService,
        private ms: BsModalService,
    ) {
        this.dataForm = this.fb.group({
            id: new FormControl(null),
            first_name: new FormControl(null, [Validators.required]),
            last_name: new FormControl(null, [Validators.required]),
            email: new FormControl(null, [Validators.required]),
            password: new FormControl(null, [Validators.required]),
        })

    }

    ngOnInit() {
        this.adminApi.list().subscribe((resp: any) => {
            if (resp.success === true) {
                this.dataList = resp.data
                this.dataStatus = 'done'
            }
        })
    }

    get g() {
        return this.dataForm.controls
    }

    openModal(amenityModal, index) {
        if (index > -1) {
            this.selectedIndex = index
            this.dataForm.controls.id.setValue(this.dataList[index].id)
            this.dataForm.controls.password.setValue(12345678)
            this.dataForm.patchValue(this.dataList[index])
        }
        this.modalRef = this.ms.show(
            amenityModal,
            {
                class: 'modal-md modal-dialog-centered admin-panel',
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
            }
        )
    }

    save(data: any, f: any) {

        if (data.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')

            return false
        }
        const params = {
            id: this.dataForm.value.id,
            first_name: data.value.first_name,
            last_name: data.value.last_name,
            email: data.value.email,
            password: data.value.password,
        }

        let saveUpdate = this.adminApi.save(params)
        if (this.dataForm.value.id !== null) {
            saveUpdate = this.adminApi.update(params)
            this.selectedId = -1
        }
        saveUpdate.subscribe((resp: any) => {
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                //this.modalRef.hide()
                //f.resetForm()


                return false
            } else {
                if (this.dataForm.value.id !== null) {
                    this.alert.success('Changes done successfully!!')
                    this.dataList[this.selectedIndex] = params
                    this.dataForm.controls.id.setValue(null)
                    this.selectedIndex = -1
                } else {
                    params.id = resp.data
                    this.alert.success('Added successfully!!')
                    this.dataList.push(params)
                }
            }
            this.modalRef.hide()
            f.resetForm()
        })
    }

    delete() {
        const params = {
            id: this.selectedId
        }
        this.adminApi.delete(params)
            .subscribe((resp: any) => {
                if (resp.success === false) {
                    this.alert.error(resp.errors.general)
                    this.modalRef.hide()

                    return false
                } else {
                    const deletingIndex = this.dataList.findIndex((d: any) => {
                        return d.id === this.selectedId
                    })
                    this.dataList.splice(deletingIndex, 1)
                    this.modalRef.hide()
                    this.alert.success('Deleted successfully!!')
                    this.selectedIndex = -1
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
        this.selectedIndex = -1
    }

    resetIndex() {
        this.selectedIndex = -1
    }



}
