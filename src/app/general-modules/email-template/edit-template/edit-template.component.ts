import { BsModalService } from 'ngx-bootstrap/modal';
import { DataService } from '../data.service';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { QuillEditorComponent } from 'ngx-quill';
import { UIHelpers } from 'src/app/helpers/ui-helpers';
import { IAlertService } from 'src/app/libs/ialert/ialerts.service';
import { ApiService } from 'src/app/services/api.service';
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
    selector: 'app-edit-template',
    templateUrl: './edit-template.component.html',
    styleUrls: ['./edit-template.component.css']
})
export class EditTemplateComponent implements OnInit, AfterViewInit {

    @ViewChild(QuillEditorComponent, {static: false})
    editor: QuillEditorComponent

    superSeeder = []
    editorConfig = { }
    dataForm: FormGroup
    data: any
    selectedIndex = -1
    loginLoading = false
    LoadingActive = false
    LoadingDeactive = false
    selectedId = -1
    constructor(
        public ds: DataService,
        private fb: FormBuilder,
        public ui: UIHelpers,
        public ms: BsModalService,
        private alert: IAlertService,
        public api: ApiService,
        public cs: ConstantsService
    ) {

    }

    ngOnInit() {
//        this.alert.success('adsfkljf')
        this.dataForm = this.fb.group({
            id: new FormControl(null),
            title: new FormControl(null, [Validators.required]),
            subject: new FormControl(null, [Validators.required]),
            content: new FormControl(null, [Validators.required])
        })

        if(this.data !== null) {
            this.dataForm.patchValue(this.data)
        }

        this.ds.SuperSeeder().subscribe(resp => {
            if(resp.success == true){
                this.superSeeder = resp.data
            }
        })

        this.editorConfig = this.cs.EDITOR_CONFIG
//        console.log('this.editor', this.editor)
    }

    ngAfterViewInit(): void {
        // this.alert.error('akdsjfla sdfjkasldjf')
        // console.log('this.editor 2', this.editor)
    }

    get g() {
        return this.dataForm.controls
    }
    cancelMailModal(f: any) {
        f.resetForm()
       this.ds.modalRef.hide()
    }


    setSuperSeeder(str) {

        this.editor.quillEditor.focus()
        let index = this.editor.quillEditor?.getSelection()?.index // get cursor position
        if (index === undefined) {
            index = 0
        }
        str = ':' + str
        this.editor.quillEditor.insertText(index, str, 'bold', true)
        this.dataForm.controls.content.setValue(this.editor.quillEditor.root.innerHTML)

    }

    save(f: any) {

        this.loginLoading = true
        if (this.dataForm.status === 'INVALID') {
            this.alert.error('Please fill-in valid data in all fields & try again.')
            this.loginLoading = false

            return false
        }

        const params: any = {
            id: this.dataForm.value.id,
            title: this.dataForm.value.title,
            subject: this.dataForm.value.subject,
            content: this.dataForm.value.content
        }


        let saveUpdate = this.ds.add(params)
        if (this.dataForm.value.id !== null) {
            saveUpdate = this.ds.update(params)
            this.selectedId = -1
        }
        saveUpdate.subscribe((resp: any) => {
            this.loginLoading = false
            if (resp.success === false) {
                this.alert.error(resp.errors.general)
                this.loginLoading = false

                return false
            } else {

                if (this.dataForm.value.id !== null) {

                    this.alert.success('Changes done successfully!!')
                    this.ds.dataList[this.selectedIndex] = resp.data
                    this.dataForm.controls.id.setValue(null)
                    // this.dataFormPOC.controls.id.setValue(null)

                } else {

                    this.alert.success('Added successfully!!')
                    this.ds.dataList.push(resp.data)
                }

            }

            this.ds.modalRef.hide()
            f.resetForm()

        })

    }

}
