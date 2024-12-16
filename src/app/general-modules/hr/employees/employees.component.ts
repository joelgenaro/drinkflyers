import { DataService } from './data.service'
import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {

  constructor(public ds:DataService) { }

  ngOnInit() {
  }

}
